import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

type MatchMediaMock = ReturnType<typeof vi.fn>;
type ListenerSpy = ReturnType<typeof vi.fn>;

describe('useIsMobile', () => {
  let matchMediaSpy: MatchMediaMock;
  let addEventListenerSpy: ListenerSpy;
  let removeEventListenerSpy: ListenerSpy;

  beforeEach(() => {
    addEventListenerSpy = vi.fn();
    removeEventListenerSpy = vi.fn();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      })),
    });
    matchMediaSpy = window.matchMedia as unknown as MatchMediaMock;

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true if initial window width is <= MOBILE_BREAKPOINT', () => {
    window.innerWidth = 500;
    matchMediaSpy.mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false if initial window width is > MOBILE_BREAKPOINT', () => {
    window.innerWidth = 1024;
    matchMediaSpy.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should unregister event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());
    const onChangeCallback = addEventListenerSpy.mock.calls[0][1];
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', onChangeCallback);
  });
});
