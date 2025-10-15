# Load Testing Guide

## Overview
RobuxMinerPro includes a load testing edge function to stress-test rate limits and concurrent user handling.

## Endpoint
`POST /functions/v1/load-test`

## Parameters
```json
{
  "targetFunction": "chat",
  "concurrentUsers": 100,
  "messagesPerUser": 5
}
```

## Example Usage

### Test Chat Function with 100 Concurrent Users
```bash
curl -X POST https://huaxdvjartkzlgjlzwzg.supabase.co/functions/v1/load-test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "targetFunction": "chat",
    "concurrentUsers": 100,
    "messagesPerUser": 5
  }'
```

### Test FAQ Helper
```bash
curl -X POST https://huaxdvjartkzlgjlzwzg.supabase.co/functions/v1/load-test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "targetFunction": "faq-helper",
    "concurrentUsers": 50,
    "messagesPerUser": 3
  }'
```

## Response Metrics
- **totalRequests**: Total requests sent
- **successful**: Requests that succeeded (200-299)
- **failed**: Requests that failed (500+)
- **rateLimited**: Requests blocked by rate limits (429)
- **avgResponseTime**: Average response time in ms
- **maxResponseTime**: Maximum response time in ms
- **minResponseTime**: Minimum response time in ms
- **requestsPerSecond**: Throughput
- **successRate**: Percentage of successful requests
- **rateLimitRate**: Percentage of rate-limited requests

## Expected Results (Free Tier)
- 20 chat requests/hour/user
- 10 FAQ requests/hour/user
- Rate limiting should kick in around concurrent request 20-30

## Expected Results (Premium Tier)
- 200 chat requests/hour/user
- 100 FAQ requests/hour/user
- Rate limiting should kick in around concurrent request 200+

## Notes
- Load tests are logged to console
- Use responsibly; excessive testing may consume Lovable AI credits
- Results help inform infrastructure scaling decisions
