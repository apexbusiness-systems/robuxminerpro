import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

describe('useIsMobile', () => {
  let addEventListenerSpy: Mock;
  let removeEventListenerSpy: Mock;

  beforeEach(() => {
    addEventListenerSpy = vi.fn();
    removeEventListenerSpy = vi.fn();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true when window.innerWidth is less than 768', () => {
    window.innerWidth = 500;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false when window.innerWidth is exactly 768', () => {
    window.innerWidth = 768;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return false when window.innerWidth is greater than 768', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should update value on resize event', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Get the registered callback
    const onChangeCallback = addEventListenerSpy.mock.calls[0][1];

    act(() => {
      window.innerWidth = 500;
      onChangeCallback();
    });

    expect(result.current).toBe(true);

    act(() => {
      window.innerWidth = 1024;
      onChangeCallback();
    });

    expect(result.current).toBe(false);
  });

  it('should unregister event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());

    const onChangeCallback = addEventListenerSpy.mock.calls[0][1];

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', onChangeCallback);
  });
});
