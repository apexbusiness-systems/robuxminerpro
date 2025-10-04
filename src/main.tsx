import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/tokens.css";
import App from "./App";

// Runtime guardrails (always-on)
import('./dev/guardrails').then(m => m.runGuardrails());

createRoot(document.getElementById("root")!).render(<App />);
