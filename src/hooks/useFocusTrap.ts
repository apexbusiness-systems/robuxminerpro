import { useEffect, useRef, useCallback } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input[type="text"]:not([disabled])',
      'input[type="radio"]:not([disabled])',
      'input[type="checkbox"]:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || e.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [isActive, getFocusableElements]);

  useEffect(() => {
    if (isActive) {
      // Store current focus
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus first element in trap
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
      
      // Add event listener
      document.addEventListener('keydown', handleKeyDown);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore previous focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      
      // Remove event listener
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isActive, handleKeyDown, getFocusableElements]);

  return containerRef;
}