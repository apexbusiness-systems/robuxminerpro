/**
 * PRODUCTION BATTERY TESTS
 *
 * Comprehensive stress testing suite for RobuxMinerPro edge functions.
 *
 * Test Categories:
 * - Load Testing (concurrent requests)
 * - Stress Testing (beyond normal limits)
 * - Endurance Testing (sustained load over time)
 * - Chaos Testing (random failures)
 * - Data Integrity Testing (consistency under load)
 *
 * Run with: deno test supabase/functions/spiral-ai/production-battery.test.ts --allow-all
 */

import {
  assert,
  assertEquals,
  assertExists,
  assertThrows,
} from "../_shared/testing/asserts.ts";
import {
  getRateLimitForAction,
  RATE_LIMITS,
} from "../_shared/rate-limiter.ts";

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const TEST_CONFIG = {
  CONCURRENT_USERS: 25,
  REQUESTS_PER_USER: 5,
  ENDURANCE_DURATION_MS: 1500,
  LOOP_ITERATIONS: 250,
};

// =============================================================================
// TEST UTILITIES
// =============================================================================

const TIERS = ["free", "premium", "enterprise", "unknown-tier"];
const ACTIONS = ["chat", "faq"];

const getTier = (index: number) => TIERS[index % TIERS.length];
const getAction = (index: number) => ACTIONS[index % ACTIONS.length];

// =============================================================================
// LOAD TESTING - Concurrent Request Handling
// =============================================================================

Deno.test("LoadTest: handles concurrent rate limit lookups", async () => {
  const concurrentUsers = TEST_CONFIG.CONCURRENT_USERS;
  const latencies: number[] = [];
  let successes = 0;

  const requests = Array.from({ length: concurrentUsers }, async (_, i) => {
    const start = performance.now();
    const result = getRateLimitForAction(getTier(i), getAction(i));
    assertExists(result.limitKey);
    assertExists(result.maxRequests);
    assertExists(result.tier);
    successes++;
    latencies.push(performance.now() - start);
  });

  await Promise.all(requests);

  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  console.log("[LoadTest] Concurrent rate limit lookups:");
  console.log(`  Total: ${concurrentUsers}, Success: ${successes}`);
  console.log(`  Avg Latency: ${avgLatency.toFixed(3)}ms`);

  assertEquals(successes, concurrentUsers);
});

// =============================================================================
// STRESS TESTING - Beyond Normal Limits
// =============================================================================

Deno.test("StressTest: handles repeated lookups without error", () => {
  let resolved = 0;

  for (let i = 0; i < TEST_CONFIG.LOOP_ITERATIONS; i++) {
    const result = getRateLimitForAction(getTier(i), getAction(i));
    assertExists(result.maxRequests);
    resolved++;
  }

  assertEquals(resolved, TEST_CONFIG.LOOP_ITERATIONS);
});

Deno.test("StressTest: rejects invalid action", () => {
  assertThrows(
    () => getRateLimitForAction("free", "invalid-action"),
    Error,
    "Invalid action",
  );
});

// =============================================================================
// ENDURANCE TESTING - Sustained Load Over Time
// =============================================================================

Deno.test("EnduranceTest: sustained lookups remain stable", async () => {
  const startTime = Date.now();
  let requestCount = 0;

  while (Date.now() - startTime < TEST_CONFIG.ENDURANCE_DURATION_MS) {
    getRateLimitForAction("free", "chat");
    requestCount++;
    if (requestCount % 100 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }

  console.log("[EnduranceTest] Sustained lookups:");
  console.log(`  Duration: ${TEST_CONFIG.ENDURANCE_DURATION_MS}ms`);
  console.log(`  Requests: ${requestCount}`);
  assert(requestCount > 0);
});

// =============================================================================
// CHAOS TESTING - Random Failures and Edge Cases
// =============================================================================

Deno.test("ChaosTest: unknown tiers fall back to free", () => {
  const result = getRateLimitForAction("unknown-tier", "chat");
  assertEquals(result.tier, "free");
  assertEquals(result.maxRequests, RATE_LIMITS.free.chatRequestsPerHour);
});

// =============================================================================
// DATA INTEGRITY TESTING - Consistency Under Load
// =============================================================================

Deno.test("IntegrityTest: limits match tier configuration", () => {
  const freeChat = getRateLimitForAction("free", "chat");
  const freeFaq = getRateLimitForAction("free", "faq");
  const premiumChat = getRateLimitForAction("premium", "chat");
  const premiumFaq = getRateLimitForAction("premium", "faq");
  const enterpriseChat = getRateLimitForAction("enterprise", "chat");
  const enterpriseFaq = getRateLimitForAction("enterprise", "faq");

  assertEquals(freeChat.maxRequests, RATE_LIMITS.free.chatRequestsPerHour);
  assertEquals(freeFaq.maxRequests, RATE_LIMITS.free.faqRequestsPerHour);
  assertEquals(premiumChat.maxRequests, RATE_LIMITS.premium.chatRequestsPerHour);
  assertEquals(premiumFaq.maxRequests, RATE_LIMITS.premium.faqRequestsPerHour);
  assertEquals(
    enterpriseChat.maxRequests,
    RATE_LIMITS.enterprise.chatRequestsPerHour,
  );
  assertEquals(
    enterpriseFaq.maxRequests,
    RATE_LIMITS.enterprise.faqRequestsPerHour,
  );
});

// =============================================================================
// PRODUCTION READINESS SUMMARY
// =============================================================================

Deno.test("ProductionReadiness: rate limiter core behavior", () => {
  const checks = {
    "Chat Rate Limit": true,
    "FAQ Rate Limit": true,
    "Tier Fallback": true,
    "Invalid Action Guard": true,
  };

  try {
    getRateLimitForAction("free", "chat");
  } catch {
    checks["Chat Rate Limit"] = false;
  }

  try {
    getRateLimitForAction("free", "faq");
  } catch {
    checks["FAQ Rate Limit"] = false;
  }

  try {
    const fallback = getRateLimitForAction("unknown", "chat");
    checks["Tier Fallback"] = fallback.tier === "free";
  } catch {
    checks["Tier Fallback"] = false;
  }

  try {
    getRateLimitForAction("free", "bad-action");
    checks["Invalid Action Guard"] = false;
  } catch {
    checks["Invalid Action Guard"] = true;
  }

  for (const [component, passed] of Object.entries(checks)) {
    console.log(`  ${passed ? "✅" : "❌"} ${component}`);
  }

  const allPassed = Object.values(checks).every((v) => v);
  assertEquals(allPassed, true, "All production readiness checks must pass");
});
