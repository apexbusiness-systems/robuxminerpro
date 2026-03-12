import { expect, test, describe } from 'vitest';
import { 
  getRequiredXpForNextLevel, 
  calculateLevelFromXp, 
  determineTier, 
  calculateDynamicMultiplier, 
  awardBaseXp,
  PlayerStats 
} from '../src/lib/algo-forge';

describe('Algo-Forge Engine', () => {

  test('Calculates XP requirements correctly', () => {
    expect(getRequiredXpForNextLevel(1)).toBe(1000);
    expect(getRequiredXpForNextLevel(2)).toBe(1250); // 1000 * 1.25
    expect(getRequiredXpForNextLevel(3)).toBe(1562); // 1250 * 1.25 floored
  });

  test('Determines level from total XP accurately', () => {
    // Level 1: < 1000
    // Level 2: 1000 to 2249 (1000 + 1250)
    // Level 3: 2250 to 3811
    expect(calculateLevelFromXp(500)).toBe(1);
    expect(calculateLevelFromXp(1000)).toBe(2);
    expect(calculateLevelFromXp(2250)).toBe(3);
    expect(calculateLevelFromXp(10000)).toBe(6);
  });

  test('Assigns correct Tier thresholds', () => {
    expect(determineTier(1)).toBe('BRONZE');
    expect(determineTier(5)).toBe('SILVER');
    expect(determineTier(14)).toBe('SILVER');
    expect(determineTier(15)).toBe('GOLD');
    expect(determineTier(30)).toBe('PLATINUM');
    expect(determineTier(50)).toBe('DIAMOND');
    expect(determineTier(100)).toBe('APEX');
  });

  test('Dynamic Multiplier applies streaks and tiers', () => {
    // 0 day streak, Bronze => 1.0 * 1.0 = 1.0
    expect(calculateDynamicMultiplier(0, 'BRONZE')).toBe(1.0);
    
    // 5 day streak (1.5x), Silver (1.1x) => 1.65
    expect(calculateDynamicMultiplier(5, 'SILVER')).toBeCloseTo(1.65);

    // 20 day streak (cap 2.5x), APEX (3.0x) => 7.5x
    expect(calculateDynamicMultiplier(20, 'APEX')).toBe(7.5);
  });

  test('awardBaseXp returns expected growth object', () => {
    const baseline: PlayerStats = {
      xp: 0,
      level: 1,
      tier: 'BRONZE',
      currentStreak: 2, // 1.2x streak
      highestStreak: 2,
      totalMined: 0,
      lastActive: new Date().toISOString()
    };

    // Base XP: 100 * 1.2 = 120 awarded
    const result = awardBaseXp(100, baseline);
    
    expect(result.awardedXp).toBe(120);
    expect(result.newTotal).toBe(120);
    expect(result.leveledUp).toBe(false);
    expect(result.newLevel).toBe(1);
    expect(result.newTier).toBe('BRONZE');

    // Massive jump to trigger level up
    const bigJump = awardBaseXp(2000, baseline);
    // 2000 * 1.2 = 2400 XP. 
    // total 2400 means level 3 (starts at 2250)
    expect(bigJump.awardedXp).toBe(2400);
    expect(bigJump.leveledUp).toBe(true);
    expect(bigJump.newLevel).toBe(3);
    
  });
});
