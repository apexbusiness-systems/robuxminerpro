import { z } from 'zod';

// Zod schemas for validation to ensure robust API structures
export const TierSchema = z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'APEX']);
export type Tier = z.infer<typeof TierSchema>;

export interface PlayerStats {
  xp: number;
  level: number;
  tier: Tier;
  currentStreak: number;
  highestStreak: number;
  totalMined: number;
  lastActive: string; // ISO date string
}

const XP_BASE_REQUIREMENT = 1000;
const XP_GROWTH_FACTOR = 1.25;

export const XP_MULTIPLIERS = {
  STREAK_BONUS_MAX: 2.5,  // Up to 2.5x multiplier for long streaks
  TIER_BONUS: {
    BRONZE: 1.0,
    SILVER: 1.1,
    GOLD: 1.25,
    PLATINUM: 1.5,
    DIAMOND: 2.0,
    APEX: 3.0,
  }
};

/**
 * Algo-Forge Adaptive XP Engine
 * Calculates the exact XP required to advance from the current level to the next.
 */
export function getRequiredXpForNextLevel(currentLevel: number): number {
  if (currentLevel < 1) return XP_BASE_REQUIREMENT;
  return Math.floor(XP_BASE_REQUIREMENT * Math.pow(XP_GROWTH_FACTOR, currentLevel - 1));
}

/**
 * Determines a player's exact level based on their total absolute XP.
 */
export function calculateLevelFromXp(totalXp: number): number {
  let level = 1;
  let xpNeeded = getRequiredXpForNextLevel(level);
  let accumulatedXp = 0;

  while (totalXp >= accumulatedXp + xpNeeded) {
    accumulatedXp += xpNeeded;
    level++;
    xpNeeded = getRequiredXpForNextLevel(level);
  }

  return level;
}

/**
 * Determines Tier based on the calculated level.
 */
export function determineTier(level: number): Tier {
  if (level >= 100) return 'APEX';
  if (level >= 50) return 'DIAMOND';
  if (level >= 30) return 'PLATINUM';
  if (level >= 15) return 'GOLD';
  if (level >= 5) return 'SILVER';
  return 'BRONZE';
}

/**
 * Calculates a dynamic multiplier based on current streak and tier.
 * This is the core retention hook: don't break the streak!
 */
export function calculateDynamicMultiplier(streakDays: number, tier: Tier): number {
  // Base streak multiplier: 1.0 + 0.1 for every day, capping at STREAK_BONUS_MAX
  const streakMultiplier = Math.min(1.0 + (streakDays * 0.1), XP_MULTIPLIERS.STREAK_BONUS_MAX);
  const tierMultiplier = XP_MULTIPLIERS.TIER_BONUS[tier];
  
  return Number((streakMultiplier * tierMultiplier).toFixed(2));
}

/**
 * Simulates an XP gain event, applying all active Algo-Forge multipliers.
 */
export function awardBaseXp(baseAmount: number, currentStats: PlayerStats): { 
  awardedXp: number, 
  newTotal: number, 
  leveledUp: boolean, 
  newLevel: number,
  newTier: Tier
} {
  const multiplier = calculateDynamicMultiplier(currentStats.currentStreak, currentStats.tier);
  const awardedXp = Math.floor(baseAmount * multiplier);
  
  const newTotal = currentStats.xp + awardedXp;
  const newLevel = calculateLevelFromXp(newTotal);
  const leveledUp = newLevel > currentStats.level;
  const newTier = determineTier(newLevel);

  return {
    awardedXp,
    newTotal,
    leveledUp,
    newLevel,
    newTier
  };
}
