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

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('PWA registered successfully:', registration.scope);

        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error: unknown) => {
        console.warn('PWA registration failed:', error);
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
