# Premium Tiers & Monetization

## Tier Structure

### Free Tier
- **Price**: $0/month
- **Chat Requests**: 20/hour
- **FAQ Requests**: 10/hour
- **Features**: Basic learning, achievements, squads (view only)

### Premium Tier
- **Price**: $9.99/month
- **Chat Requests**: 200/hour (10× free)
- **FAQ Requests**: 100/hour (10× free)
- **Features**: 
  - Advanced AI mentor responses
  - Squad collaboration (active participation)
  - Priority support
  - Exclusive learning paths

### Enterprise Tier
- **Price**: $49.99/month
- **Chat Requests**: 1,000/hour (50× free)
- **FAQ Requests**: 500/hour (50× free)
- **Features**:
  - Everything in Premium
  - Custom learning paths
  - Team analytics
  - Dedicated account manager
  - API access

## Rate Limiting Backend

### Implementation
Rate limits are enforced via the `rate-limiter` edge function, which:
1. Checks user's `premium_tier` in profiles table
2. Queries `rate_limit_log` for requests in past hour
3. Compares against tier limits
4. Logs successful requests
5. Returns 429 if limit exceeded

### Database Schema Required

```sql
-- Add premium_tier to profiles
ALTER TABLE profiles ADD COLUMN premium_tier TEXT DEFAULT 'free';

-- Create rate_limit_log table
CREATE TABLE rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_rate_limit_user_action_time 
  ON rate_limit_log(user_id, action_type, created_at);
```

### Squads Schema Required

```sql
-- Create squads table
CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  max_members INTEGER DEFAULT 10
);

-- Create squad_members table
CREATE TABLE squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(squad_id, user_id)
);

-- Create squad_messages table
CREATE TABLE squad_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Integration Points

### Chat Function
Add rate limit check before processing:
```typescript
const rateLimitCheck = await supabase.functions.invoke('rate-limiter', {
  body: { userId, action: 'chat' }
});

if (!rateLimitCheck.data.allowed) {
  return new Response(JSON.stringify({ error: rateLimitCheck.data.message }), {
    status: 429,
    headers: corsHeaders
  });
}
```

### FAQ Helper Function
Same pattern as chat:
```typescript
const rateLimitCheck = await supabase.functions.invoke('rate-limiter', {
  body: { userId, action: 'faq' }
});
```

## Upgrade Flow (Future)
1. User clicks "Upgrade to Premium" in UI
2. Redirect to Stripe checkout
3. Webhook updates `profiles.premium_tier`
4. Rate limits automatically apply

## Revenue Model
- Target: 1,000 free users → 100 premium ($999/mo) → 10 enterprise ($499/mo)
- **MRR**: $1,498/month
- **ARR**: ~$18,000/year
