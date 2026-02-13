import { describe, it, expect } from "vitest";
import { cn } from "../../src/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    expect(cn("a", true && "b", false && "c")).toBe("a b");
  });

  it("handles falsy values", () => {
    expect(cn("a", null, undefined, false, "")).toBe("a");
  });

  it("handles objects", () => {
    expect(cn({ a: true, b: false, c: true }, "d")).toBe("a c d");
  });

  it("handles arrays", () => {
    expect(cn(["a", "b"], ["c", "d"])).toBe("a b c d");
  });

  it("handles nested arrays and objects", () => {
    expect(cn(["a", { b: true, c: false }], "d")).toBe("a b d");
  });

  it("handles tailwind conflicts with tailwind-merge", () => {
    // Basic conflict: last one wins
    expect(cn("p-4", "p-8")).toBe("p-8");

    // Complex conflict: color overrides
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");

    // Conflicting layouts
    expect(cn("flex", "grid")).toBe("grid");

    // Multiple overrides
    expect(cn("px-2 py-1 bg-red-500", "p-4 bg-blue-500")).toBe("p-4 bg-blue-500");
  });

  it("handles zero as a number (edge case)", () => {
    // In clsx, 0 is falsy and should be ignored
    // @ts-ignore - testing runtime behavior
    expect(cn("a", 0)).toBe("a");
  });
});
