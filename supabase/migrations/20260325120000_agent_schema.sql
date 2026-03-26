-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- 1. agent_profiles
-- We use a separate table so it doesn't conflict with the existing `profiles` table
CREATE TABLE public.agent_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    age_bracket TEXT NOT NULL CHECK (age_bracket IN ('13-15', '16-17', '18+')),
    preferences JSONB DEFAULT '{}'::jsonb,
    gamification JSONB DEFAULT '{"xp":0,"level":"Noob","streak_days":0,"streak_last_date":null,"badges":[]}'::jsonb,
    parental_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. conversations
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.agent_profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Chat',
    game_context JSONB DEFAULT '{}'::jsonb,
    model_used TEXT,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    model TEXT,
    token_count INTEGER DEFAULT 0,
    latency_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. agent_memories
CREATE TABLE public.agent_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.agent_profiles(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL CHECK (memory_type IN ('fact', 'preference', 'game_event', 'skill_assessment')),
    content TEXT NOT NULL,
    embedding vector(768),
    importance REAL DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
    source_conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    last_accessed TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. knowledge_base
CREATE TABLE public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('roblox_api', 'game_strategy', 'patch_notes', 'monetization', 'safety', 'luau_code', 'trading', 'community_tips')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),
    source_url TEXT,
    version TEXT,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. safety_logs
CREATE TABLE public.safety_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.agent_profiles(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('pii_detected', 'harmful_content', 'tos_violation', 'prompt_injection', 'scam_attempt', 'crisis_redirect')),
    input_hash TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_memories_user ON public.agent_memories(user_id, memory_type);
CREATE INDEX idx_memories_embedding ON public.agent_memories USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX idx_knowledge_embedding ON public.knowledge_base USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX idx_knowledge_category ON public.knowledge_base(category, is_current);
CREATE INDEX idx_conversations_user ON public.conversations(user_id, updated_at DESC);
CREATE INDEX idx_safety_logs_user ON public.safety_logs(user_id, created_at DESC);

-- RLS Enforcement
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_logs ENABLE ROW LEVEL SECURITY;

-- agent_profiles RLS
CREATE POLICY "Users can read own agent profile" ON public.agent_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own agent profile" ON public.agent_profiles
    FOR UPDATE USING (auth.uid() = id);

-- conversations RLS
CREATE POLICY "Users can CRUD own conversations" ON public.conversations
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- messages RLS
CREATE POLICY "Users can read own messages via conversation" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_id AND c.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can create own messages" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_id AND c.user_id = auth.uid()
        )
    );

-- agent_memories RLS
CREATE POLICY "Users can read own memories" ON public.agent_memories
    FOR SELECT USING (auth.uid() = user_id);

-- knowledge_base RLS
CREATE POLICY "All authenticated users can read knowledge" ON public.knowledge_base
    FOR SELECT USING (auth.role() = 'authenticated');
-- (Service role inserts/updates)

-- safety_logs RLS: Service role only (implicit bypass), no user access policies

-- Functions
CREATE OR REPLACE FUNCTION match_memories(query_embedding vector(768), match_user_id uuid, match_count int, match_threshold float)
RETURNS TABLE (id uuid, content text, memory_type text, importance real, similarity float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    am.id,
    am.content,
    am.memory_type,
    am.importance,
    1 - (am.embedding <=> query_embedding) AS similarity
  FROM agent_memories am
  WHERE am.user_id = match_user_id
  AND 1 - (am.embedding <=> query_embedding) > match_threshold
  ORDER BY am.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION match_knowledge(query_embedding vector(768), match_category text, match_count int, match_threshold float)
RETURNS TABLE (id uuid, title text, content text, category text, source_url text, similarity float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    kb.source_url,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE kb.is_current = true
  AND (match_category IS NULL OR kb.category = match_category)
  AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Triggers for conversations message count
CREATE OR REPLACE FUNCTION increment_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET message_count = message_count + 1, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_inserted
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION increment_message_count();
