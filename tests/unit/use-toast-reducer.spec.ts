import { test, expect } from "@playwright/test";
import { reducer } from "../../src/hooks/use-toast";

test.describe("use-toast reducer", () => {
  const toast1 = { id: "1", title: "Toast 1", open: true };
  const toast2 = { id: "2", title: "Toast 2", open: true };

  test("ADD_TOAST adds a toast and respects TOAST_LIMIT (1)", () => {
    const initialState = { toasts: [] };

    // Add first toast
    const state1 = reducer(initialState, {
      type: "ADD_TOAST",
      toast: toast1,
    });

    expect(state1.toasts).toHaveLength(1);
    expect(state1.toasts[0]).toEqual(toast1);

    // Add second toast, should push out the first one due to limit 1
    const state2 = reducer(state1, {
      type: "ADD_TOAST",
      toast: toast2,
    });

    expect(state2.toasts).toHaveLength(1);
    expect(state2.toasts[0]).toEqual(toast2);
  });

  test("UPDATE_TOAST updates an existing toast", () => {
    const initialState = { toasts: [toast1] };

    const state = reducer(initialState, {
      type: "UPDATE_TOAST",
      toast: { id: "1", title: "Updated Toast 1" },
    });

    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0]).toEqual({ id: "1", title: "Updated Toast 1", open: true });
  });

  test("UPDATE_TOAST does nothing if toast id is not found", () => {
    const initialState = { toasts: [toast1] };

    const state = reducer(initialState, {
      type: "UPDATE_TOAST",
      toast: { id: "2", title: "Updated Toast 2" },
    });

    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0]).toEqual(toast1);
  });

  test("DISMISS_TOAST sets open to false for a specific toast", () => {
    // We add a dummy second toast to ensure only the targeted one is dismissed
    // (Note: in reality limit is 1, but reducer processes whatever array it receives)
    const initialState = { toasts: [toast1, toast2] };

    const state = reducer(initialState, {
      type: "DISMISS_TOAST",
      toastId: "1",
    });

    expect(state.toasts[0].open).toBe(false);
    expect(state.toasts[1].open).toBe(true);
  });

  test("DISMISS_TOAST sets open to false for all toasts if no toastId is provided", () => {
    const initialState = { toasts: [toast1, toast2] };

    const state = reducer(initialState, {
      type: "DISMISS_TOAST",
    });

    expect(state.toasts[0].open).toBe(false);
    expect(state.toasts[1].open).toBe(false);
  });

  test("REMOVE_TOAST removes a specific toast", () => {
    const initialState = { toasts: [toast1, toast2] };

    const state = reducer(initialState, {
      type: "REMOVE_TOAST",
      toastId: "1",
    });

    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0]).toEqual(toast2);
  });

  test("REMOVE_TOAST clears all toasts if no toastId is provided", () => {
    const initialState = { toasts: [toast1, toast2] };

    const state = reducer(initialState, {
      type: "REMOVE_TOAST",
    });

    expect(state.toasts).toHaveLength(0);
  });
});
