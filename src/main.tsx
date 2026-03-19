import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/tokens.css';
import App from './App';
import { Capacitor } from '@capacitor/core';
import { registerSW } from 'virtual:pwa-register';

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
function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) {
    return;
  }

  // Skip web service worker registration if running natively in Capacitor
  if (Capacitor.isNativePlatform()) {
    console.log('[bootstrap] Skipping PWA registration within native container.');
    return;
  }

  let hasReloadedForUpdate = false;
  const serviceWorkerControl: {
    update?: (reloadPage?: boolean) => Promise<void>;
  } = {};

  serviceWorkerControl.update = registerSW({
    immediate: true,
    onRegisteredSW(swUrl: string, registration: ServiceWorkerRegistration | undefined) {
      if (!registration) return;

      console.log('[bootstrap] PWA registered:', swUrl);
      void registration.update();
      globalThis.window.setInterval(() => {
        void registration.update();
      }, 5 * 60 * 1000);
    },
    onNeedRefresh() {
      void serviceWorkerControl.update?.(true);
    },
    onRegisterError(error: unknown) {
      console.warn('[bootstrap] PWA registration failed:', error);
    },
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloadedForUpdate) return;
    hasReloadedForUpdate = true;
    globalThis.window.location.reload();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void serviceWorkerControl.update?.();
    }
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
