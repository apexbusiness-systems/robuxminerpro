import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/tokens.css';
import App from './App';

const ROOT_ID = 'root';

function ensureRootElement(): HTMLElement {
  const existingRoot = document.getElementById(ROOT_ID);
  if (existingRoot instanceof HTMLElement) {
    return existingRoot;
  }

  const createdRoot = document.createElement('div');
  createdRoot.id = ROOT_ID;
  document.body.appendChild(createdRoot);
  return createdRoot;
}

/// <reference types="vite-plugin-pwa/client" />
import { registerSW } from 'virtual:pwa-register';
import { Capacitor } from '@capacitor/core';

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') {
    return;
  }

  // Skip web service worker registration if running natively in Capacitor
  if (Capacitor.isNativePlatform()) {
    console.log('[bootstrap] Skipping PWA registration within native container.');
    return;
  }

  window.addEventListener('load', () => {
    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW(swUrl: string, r: ServiceWorkerRegistration | undefined) {
        if (!r) return;
        
        r.update();
        console.log('PWA registered successfully:', swUrl);
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      },
      onRegisterError(error: unknown) {
        console.warn('PWA registration failed:', error);
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        updateSW(true);
      }
    });
  });
}

function renderBootstrapFallback(root: HTMLElement, error: unknown): void {
  root.innerHTML = `
    <main style="font-family: Inter, system-ui, sans-serif; padding: 2rem; line-height: 1.5;">
      <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">RobuxMinerPro</h1>
      <p style="margin: 0; color: #374151;">Application boot issue detected. Refresh the page or contact support if the problem persists.</p>
    </main>
  `;
  console.error('[bootstrap] Application failed to initialize.', error);
}

function bootstrap(): void {
  const rootElement = ensureRootElement();

  try {
    import('./dev/guardrails')
      .then((module) => module.runGuardrails())
      .catch((error: unknown) => {
        console.warn('[bootstrap] Guardrails failed to execute.', error);
      });

    registerServiceWorker();
    createRoot(rootElement).render(<App />);
  } catch (error: unknown) {
    renderBootstrapFallback(rootElement, error);
  }
}

bootstrap();
