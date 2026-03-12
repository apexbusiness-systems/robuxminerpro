import { test, expect } from "@playwright/test";
import { getRandomInt } from "../../src/lib/utils";

test.describe("getRandomInt utility", () => {
  test("should return values within the specified range", () => {
    const min = 50;
    const max = 89;
    for (let i = 0; i < 100; i++) {
      const result = getRandomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    }
  });

  test("should handle min and max being equal", () => {
    const min = 10;
    const max = 10;
    const result = getRandomInt(min, max);
    expect(result).toBe(10);
  });

  test("should handle a range of 1", () => {
    const min = 0;
    const max = 1;
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      results.add(getRandomInt(min, max));
    }
    expect(results.has(0)).toBe(true);
    expect(results.has(1)).toBe(true);
    expect(results.size).toBe(2);
  });
});
