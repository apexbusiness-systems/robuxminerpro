import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/tokens.css";
import App from "./App";

// Runtime guardrails (always-on)
import('./dev/guardrails').then(m => m.runGuardrails());

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('PWA registered successfully:', registration.scope);

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.warn('PWA registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
