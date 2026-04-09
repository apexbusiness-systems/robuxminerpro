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
  root.textContent = '';

  const main = document.createElement('main');
  main.style.fontFamily = 'Inter, system-ui, sans-serif';
  main.style.padding = '2rem';
  main.style.lineHeight = '1.5';

  // Apply a basic theme that defaults to dark if preferred
  main.style.backgroundColor = 'var(--background, #ffffff)';
  main.style.color = 'var(--foreground, #000000)';

  const h1 = document.createElement('h1');
  h1.style.fontSize = '1.5rem';
  h1.style.marginBottom = '0.5rem';
  h1.textContent = 'RobuxMinerPro';

  const p = document.createElement('p');
  p.style.margin = '0';
  p.style.color = 'var(--muted-foreground, #374151)';
  p.textContent = 'Application boot issue detected. Refresh the page or contact support if the problem persists.';

  main.appendChild(h1);
  main.appendChild(p);
  root.appendChild(main);

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
