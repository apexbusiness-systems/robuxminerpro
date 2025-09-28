-- Create enum types for the application
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE public.task_type AS ENUM ('daily_login', 'watch_ad', 'complete_survey', 'referral', 'social_share', 'game_play');
CREATE TYPE public.transaction_type AS ENUM ('mining_reward', 'task_completion', 'referral_bonus', 'withdrawal', 'purchase');

-- Create user profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    total_robux INTEGER NOT NULL DEFAULT 0,
    mining_power INTEGER NOT NULL DEFAULT 1,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(user_id),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mining sessions table
CREATE TABLE public.mining_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    end_time TIMESTAMP WITH TIME ZONE,
    robux_earned INTEGER NOT NULL DEFAULT 0,
    mining_power_used INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    task_type public.task_type NOT NULL,
    robux_reward INTEGER NOT NULL DEFAULT 0,
    requirements JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    daily_limit INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user task completions table
CREATE TABLE public.user_task_completions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    status public.task_status NOT NULL DEFAULT 'pending',
    robux_earned INTEGER NOT NULL DEFAULT 0,
    completion_data JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type public.transaction_type NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    reference_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table
CREATE TABLE public.referrals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bonus_earned INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(referrer_id, referred_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for mining sessions
CREATE POLICY "Users can view their own mining sessions" ON public.mining_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mining sessions" ON public.mining_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mining sessions" ON public.mining_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for tasks (publicly readable)
CREATE POLICY "Anyone can view active tasks" ON public.tasks
    FOR SELECT USING (is_active = true);

-- Create RLS policies for user task completions
CREATE POLICY "Users can view their own task completions" ON public.user_task_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task completions" ON public.user_task_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task completions" ON public.user_task_completions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for referrals
CREATE POLICY "Users can view referrals they made" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" ON public.referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username, display_name, referral_code)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'username',
        NEW.raw_user_meta_data ->> 'display_name',
        UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Insert some default tasks
INSERT INTO public.tasks (title, description, task_type, robux_reward, daily_limit) VALUES
    ('Daily Login Bonus', 'Login to the app daily to earn Robux', 'daily_login', 10, 1),
    ('Watch Advertisement', 'Watch a 30-second ad to earn Robux', 'watch_ad', 5, 10),
    ('Complete Survey', 'Complete a short survey about gaming preferences', 'complete_survey', 25, 3),
    ('Share on Social Media', 'Share RobuxMinerPro on your social media', 'social_share', 15, 1),
    ('Play Featured Game', 'Play a featured game for 5 minutes', 'game_play', 20, 5);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_mining_sessions_user_id ON public.mining_sessions(user_id);
CREATE INDEX idx_mining_sessions_active ON public.mining_sessions(is_active);
CREATE INDEX idx_user_task_completions_user_id ON public.user_task_completions(user_id);
CREATE INDEX idx_user_task_completions_task_id ON public.user_task_completions(task_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_id);