# Backend Implementation Notes

## Stripe Integration

### Security Requirements
- **Secret keys**: Must be stored server-side only
- **Client usage**: Use publishable key + Payment Intents from server
- **Never expose**: Secret keys, webhook endpoints, or customer data client-side

### Implementation Pattern
```javascript
// Server-side: Create Payment Intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 999, // $9.99 in cents
  currency: 'usd',
  customer: customerId
});

// Client-side: Use publishable key only
const stripe = Stripe('pk_live_...');
const { error } = await stripe.confirmCardPayment(clientSecret);
```

**Reference**: [Stripe Key Hygiene Guide](https://stripe.com/docs/keys)

## Neon Postgres

### Connection Pooling
- **Use pooled connection**: Add `-pooler` to connection string
- **Serverless driver**: Use `@neondatabase/serverless` for edge functions
- **Max connections**: Avoid hitting Neon's connection limits

### Example Configuration
```javascript
// Pooled connection
const connectionString = "postgresql://user:pass@host-pooler.region.neon.tech/db";

// Serverless driver (recommended)
import { neon } from '@neondatabase/serverless';
const sql = neon(connectionString);
```

**Reference**: [Neon Pooling Documentation](https://neon.tech/docs/connect/connection-pooling)

## API Endpoints (42 total)

### Read Operations (Safe for client)
- `/api/earnings/session/active` - Current mining session
- `/api/earnings/streak` - Daily login streak
- `/api/earnings/milestones` - Achievement milestones
- `/api/ai/recommendations` - Strategy suggestions
- `/api/squads/list` - Available squads
- `/api/achievements/list` - Achievement catalog
- `/api/achievements/progress` - User progress
- `/api/learning-paths/list` - Available learning paths
- `/api/learning-paths/progress` - User progress
- `/api/events/live` - Active events
- `/api/events/leaderboards` - Current rankings
- `/api/analytics/dashboard` - Dashboard metrics
- `/api/analytics/performance` - Performance stats

### Write Operations (Require server validation)
- `/api/squads/join` - Join squad
- `/api/squads/leave` - Leave squad
- `/api/learning-paths/complete` - Mark module complete
- `/api/events/participate` - Join event
- `/api/checkout/create` - Create payment intent
- `/api/checkout/verify` - Verify payment
- `/api/earnings/session/start` - Start mining session
- `/api/earnings/session/end` - End mining session
- `/api/achievements/claim` - Claim achievement
- `/api/ai/feedback` - Submit strategy feedback
- `/api/user/profile/update` - Update profile
- `/api/user/settings/update` - Update settings
- `/api/referrals/create` - Create referral
- `/api/tasks/complete` - Complete task
- `/api/transactions/create` - Record transaction

### Admin Operations (Server-only)
- `/api/admin/users/list` - List all users
- `/api/admin/users/ban` - Ban user
- `/api/admin/events/create` - Create event
- `/api/admin/tasks/create` - Create task
- `/api/admin/analytics/export` - Export analytics
- `/api/admin/payments/refund` - Process refund

## Security Checklist
- [ ] All write operations validate user authentication
- [ ] Payment operations use server-side validation only
- [ ] No secret keys in client-side code
- [ ] Rate limiting on all endpoints
- [ ] Input validation and sanitization
- [ ] CORS properly configured
- [ ] Database queries use parameterized statements