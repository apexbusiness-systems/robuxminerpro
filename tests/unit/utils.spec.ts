import { test, expect } from "@playwright/test";
import { cn } from "../../src/lib/utils";

test.describe("cn utility", () => {
  test("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  test("handles conditional classes", () => {
    expect(cn("a", true && "b", false && "c")).toBe("a b");
  });

  test("handles falsy values", () => {
    expect(cn("a", null, undefined, false, "")).toBe("a");
  });

  test("handles objects", () => {
    expect(cn({ a: true, b: false, c: true }, "d")).toBe("a c d");
  });

  test("handles arrays", () => {
    expect(cn(["a", "b"], ["c", "d"])).toBe("a b c d");
  });

  test("handles nested arrays and objects", () => {
    expect(cn(["a", { b: true, c: false }], "d")).toBe("a b d");
  });

  test("handles tailwind conflicts with tailwind-merge", () => {
    // Basic conflict: last one wins
    expect(cn("p-4", "p-8")).toBe("p-8");

    // Complex conflict: color overrides
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");

    // Conflicting layouts
    expect(cn("flex", "grid")).toBe("grid");

    // Multiple overrides
    expect(cn("px-2 py-1 bg-red-500", "p-4 bg-blue-500")).toBe("p-4 bg-blue-500");
  });

  test("handles zero as a number (edge case)", () => {
    // In clsx, 0 is falsy and should be ignored
    // @ts-ignore - testing runtime behavior
    expect(cn("a", 0)).toBe("a");
  });
});
