export const RATE_LIMITS = {
  free: {
    chatRequestsPerHour: 20,
    faqRequestsPerHour: 10,
  },
  premium: {
    chatRequestsPerHour: 200,
    faqRequestsPerHour: 100,
  },
  enterprise: {
    chatRequestsPerHour: 1000,
    faqRequestsPerHour: 500,
  },
} as const;

export type Tier = keyof typeof RATE_LIMITS;
export type RateLimitAction = "chat" | "faq";

const isTier = (tier?: string): tier is Tier =>
  typeof tier === "string" && tier in RATE_LIMITS;

const isAction = (action: string): action is RateLimitAction =>
  action === "chat" || action === "faq";

export const getRateLimitForAction = (tier: string | undefined, action: string) => {
  if (!isAction(action)) {
    throw new Error("Invalid action");
  }

  const resolvedTier: Tier = isTier(tier) ? tier : "free";
  const limits = RATE_LIMITS[resolvedTier];
  const maxRequests =
    action === "chat" ? limits.chatRequestsPerHour : limits.faqRequestsPerHour;

  return {
    tier: resolvedTier,
    limitKey: action,
    maxRequests,
  };
};
