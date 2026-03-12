import React, { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PipAgentProps {
  children: ReactNode;
  width?: number;
  height?: number;
}

/**
 * A persistent Picture-in-Picture window using the Document Picture-in-Picture API.
 * This allows arbitrary React components to live in a floating, always-on-top window.
 */
export const PipAgent: React.FC<PipAgentProps> = ({ children, width = 300, height = 400 }) => {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  useEffect(() => {
    // Only available in supported browsers (Chromium 116+)
    if (!('documentPictureInPicture' in globalThis)) {
      console.warn('Document Picture-in-Picture API not supported.');
      return;
    }

    let isMounted = true;
    let newWindow: Window | null = null;

    const copyStylesToPip = (docs: Document, targetWindow: Window) => {
      [...docs.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules]
            .map((rule) => rule.cssText)
            .join('');
          const style = docs.createElement('style');
          style.textContent = cssRules;
          targetWindow.document.head.appendChild(style);
        } catch (e) {
          // Cross-origin stylesheet access might be blocked, fallback to cloning link tags
          if (styleSheet.href) {
            const link = docs.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet.href;
            targetWindow.document.head.appendChild(link);
          } else {
             console.warn('Could not copy stylesheet to PiP window.', e);
          }
        }
      });
    };

    const openPip = async () => {
      try {
        // @ts-expect-error - documentPictureInPicture is a recent API, types may not be fully synced
        newWindow = await globalThis.documentPictureInPicture.requestWindow({
          width,
          height,
        });

        if (!isMounted) {
          newWindow?.close();
          return;
        }

        // Copy styles from the main document to the PiP window so Tailwind works
        if (newWindow) {
           copyStylesToPip(document, newWindow);
        }

        setPipWindow(newWindow);

        newWindow?.addEventListener('pagehide', () => {
          if (isMounted) {
            setPipWindow(null);
          }
        });

      } catch (error) {
        console.error('Failed to open PiP window:', error);
      }
    };

    openPip();

    return () => {
      isMounted = false;
      newWindow?.close();
    };
  }, [width, height]);

  if (!pipWindow) return null;

  // Render children into the PiP window's body
  return createPortal(children, pipWindow.document.body);
};
