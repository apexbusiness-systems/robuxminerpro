import fs from 'fs';

let mentorContent = fs.readFileSync('src/pages/Mentor.tsx', 'utf-8');

mentorContent = mentorContent.replace(
  /const handleSafety = \(message: string\): string \| null => {[\s\S]*?return null;\n  };/,
  `const handleSafety = (message: string): string | null => {
    const lowerMsg = message.toLowerCase();
    const forbidden = [
      /\\bfree\\s+robux\\b/i,
      /\\brobux[\\W_]*generator\\b/i,
      /\\brobux[\\W_]*min(e|ing)\\b/i,
      /\\bfree\\s+membership\\b/i,
      /\\bhack/i,
      /\\bcheat/i,
      /\\bobby\\s+for\\s+robux\\b/i,
      /\\btrading\\s+platform\\b/i,
      /\\bsomeone\\s+will\\s+give\\s+robux\\b/i,
      /\\broblox\\s+gift\\s+card\\s+code\\b/i,
      /\\benter\\s+your\\s+password\\b/i,
      /\\bpassword\\b/i,
      /\\baccount\\s+sharing\\b/i,
      /\\bexploit\\b/i,
      /\\bbotting\\b/i
    ];

    if (forbidden.some(pattern => pattern.test(lowerMsg))) {
      return t("mentor.safetyWarning");
    }
    return null;
  };`
);

mentorContent = mentorContent.replace(
  /import { useNavigate } from 'react-router-dom';/,
  `import { useNavigate } from 'react-router-dom';\nimport { useI18n } from '@/i18n/I18nProvider';`
);

mentorContent = mentorContent.replace(
  /export default function Mentor\(\) {/,
  `export default function Mentor() {\n  const { t } = useI18n();`
);

mentorContent = mentorContent.replace(
  /Ask me about legitimate strategies for RobuxMinerPro!/g,
  `{t("mentor.welcome")}`
);

mentorContent = mentorContent.replace(
  /Ask about strategies, tips, or optimization\.\.\./g,
  `{t("mentor.placeholder")}`
);

fs.writeFileSync('src/pages/Mentor.tsx', mentorContent);

let chatDockContent = fs.readFileSync('src/shared/ChatDock.tsx', 'utf-8');

chatDockContent = chatDockContent.replace(
  /import { useEffect, useRef, lazy, Suspense } from "react";/,
  `import { useEffect, useRef, lazy, Suspense } from "react";\nimport { useI18n } from "@/i18n/I18nProvider";`
);

chatDockContent = chatDockContent.replace(
  /export default function ChatDock\(\{open,onClose\}:\{open:boolean;onClose:\(\)=>void\}\)\{/,
  `export default function ChatDock({open,onClose}:{open:boolean;onClose:()=>void}){\n  const { t } = useI18n();`
);

chatDockContent = chatDockContent.replace(
  /Official links only; we refuse "free Robux" requests for safety\./g,
  `{t("mentor.dockWarning")}`
);

fs.writeFileSync('src/shared/ChatDock.tsx', chatDockContent);

let chatContent = fs.readFileSync('supabase/functions/chat/index.ts', 'utf-8');

chatContent = chatContent.replace(
  /console\.log\('Received chat request with', messages\.length, 'messages from user', user\.id\);/g,
  `console.log('llm.request.start', { duration: 0, model: 'google/gemini-2.5-flash', messagesCount: messages.length });`
);

chatContent = chatContent.replace(
  /content: 'You are a helpful learning assistant for RobuxMinerPro[^']*'/g,
  "content: 'You are RBP-Agent, an elite Roblox monetization advisor for players and creators aged 13+. Your mission: Help users earn Robux through 100% legitimate, Roblox Terms-of-Service-compliant methods only. CORE IDENTITY: You are knowledgeable about Roblox creator tools, DevEx, game monetization, and the UGC marketplace. You are a safety guardian: you proactively warn about scams, exploits, and ToS violations. You are a coach: you break down complex creator workflows into simple, actionable steps. You are current-aware: you acknowledge when data (rates, thresholds) may have changed and direct users to official sources. ABSOLUTE RULES — NON-NEGOTIABLE: NEVER suggest: Robux generators, exploit tools, bots, account sharing, third-party trading platforms, or any method that violates Roblox ToS. NEVER promise specific earnings. Always frame as estimates with clear variance disclosure. NEVER advise purchasing Robux to exchange via DevEx — only EARNED Robux qualify. ALWAYS disclose Roblox\\'s ~30% marketplace fee when discussing earnings. ALWAYS remind users to verify DevEx rates and thresholds at official Roblox documentation (roblox.com/devex, create.roblox.com/docs). ALWAYS raise a safety warning if the user\\'s question suggests they may have encountered a scam. RESPONSE STRUCTURE: 1. Identify goal 2. Route to correct path 3. Provide step-by-step guidance 4. Add safety note 5. Verify rates at official sources. EARNING PATHS: PATH A - Premium Stipend. PATH B - Game Pass (Creator). PATH C - Developer Products. PATH D - Private Servers. PATH E - UGC Marketplace. PATH F - Group Games. PATH G - DevEx (Cash Out). PATH H - Clothing Sales. Use everyday words, short sentences, and a clear, friendly tone.'"
);

fs.writeFileSync('supabase/functions/chat/index.ts', chatContent);

let i18nContent = fs.readFileSync('src/i18n/translations.ts', 'utf-8');

i18nContent = i18nContent.replace(
  /"language\.spanish": "Español",\n  },/g,
  `"language.spanish": "Español",
    "mentor.safetyWarning": "⚠️ SAFETY FLAG: What you're describing sounds like a common Roblox scam.\\n\\nLegitimate Robux earning NEVER requires:\\n- Entering your password on a third-party website\\n- Downloading external software\\n- Completing \\"tasks\\" on unofficial sites\\n- Sharing your account with anyone\\n\\nIf you've already shared credentials:\\n1. Change your Roblox password immediately\\n2. Enable 2-Step Verification at roblox.com/my/account\\n3. Report to Roblox Support: roblox.com/support\\n4. Check and revoke unfamiliar authorized apps",
    "mentor.welcome": "Ask me about legitimate strategies to earn Robux! I can help you with Game Passes, Developer Products, the UGC Marketplace, and more.",
    "mentor.placeholder": "Ask about Creator tools, DevEx, or game monetization...",
    "mentor.dockWarning": "Official links only; we refuse \\"free Robux\\", generators, and credential requests for your safety.",
  },`
);

i18nContent = i18nContent.replace(
  /"language\.spanish": "Español",\n  },\n} as const;/g,
  `"language.spanish": "Español",
    "mentor.safetyWarning": "⚠️ ALERTA DE SEGURIDAD: Lo que describes parece una estafa común de Roblox.\\n\\nGanar Robux de forma legítima NUNCA requiere:\\n- Ingresar tu contraseña en un sitio web de terceros\\n- Descargar software externo\\n- Completar \\"tareas\\" en sitios no oficiales\\n- Compartir tu cuenta con nadie\\n\\nSi ya has compartido tus credenciales:\\n1. Cambia tu contraseña de Roblox de inmediato\\n2. Habilita la verificación en 2 pasos en roblox.com/my/account\\n3. Repórtalo al Soporte de Roblox: roblox.com/support\\n4. Revisa y revoca aplicaciones autorizadas desconocidas",
    "mentor.welcome": "¡Pregúntame sobre estrategias legítimas para ganar Robux! Puedo ayudarte con Game Passes, Developer Products, el UGC Marketplace y más.",
    "mentor.placeholder": "Pregunta sobre herramientas de creador, DevEx o monetización de juegos...",
    "mentor.dockWarning": "Solo enlaces oficiales; rechazamos solicitudes de \\"Robux gratis\\", generadores y credenciales por tu seguridad.",
  },
} as const;`
);

fs.writeFileSync('src/i18n/translations.ts', i18nContent);

let llmContent = fs.readFileSync('AI/LLM_READINESS.md', 'utf-8');

llmContent = llmContent.replace(
  /We only teach official ways to get Robux. Learn more at help.roblox.com./,
  `⚠️ SAFETY FLAG: What you're describing sounds like a common Roblox scam...`
);

llmContent = llmContent.replace(
  /Auto-rejection regex \(case-insensitive\):\n- `\\bfree\\s\+robux\\b`\n- `\\brobux\(\?:\\W\+\|_\)\?generator\\b`\n- `\\brobux\(\?:\\W\+\|_\)\?min\(\?:e\|ing\)\\b`/,
  `Auto-rejection regex (case-insensitive):
- \`\\bfree\\s+robux\\b\`
- \`\\brobux[\\W_]*generator\\b\`
- \`\\brobux[\\W_]*min(e|ing)\\b\`
- \`\\bfree\\s+membership\\b\`
- \`\\bhack\`
- \`\\bcheat\`
- \`\\bobby\\s+for\\s+robux\\b\`
- \`\\btrading\\s+platform\\b\`
- \`\\bsomeone\\s+will\\s+give\\s+robux\\b\`
- \`\\broblox\\s+gift\\s+card\\s+code\\b\`
- \`\\benter\\s+your\\s+password\\b\`
- \`\\bpassword\\b\`
- \`\\baccount\\s+sharing\\b\`
- \`\\bexploit\\b\`
- \`\\bbotting\\b\``
);

fs.writeFileSync('AI/LLM_READINESS.md', llmContent);
