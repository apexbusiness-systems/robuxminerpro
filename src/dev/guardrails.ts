import type { GuardrailHit } from '@/types';

// Canonical bans (precise; avoid hitting brand strings like "RobuxMinerPro")
const FORBIDDEN = [
  /\bfree\s+robux\b/i,
  /\brobux(?:\W+|_)?generator\b/i,
  /\brobux(?:\W+|_)?min(?:e|ing)\b/i,
  /\boff(?:[-\s])?platform\b.*\b(trade|payout|cash|casino|gambl\w*)\b/i,
];

function isVisible(el: Element) {
  const style = (el as HTMLElement).ownerDocument.defaultView!.getComputedStyle(el as HTMLElement);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  // skip aria-hidden containers
  if ((el as HTMLElement).closest('[aria-hidden="true"]')) return false;
  return (el as HTMLElement).offsetParent !== null || (el as HTMLElement).matches('body,html');
}

function sanitizeTextNode(node: Text, hits: GuardrailHit[]) {
  const parent = node.parentElement as Element | null;
  if (!parent || !isVisible(parent)) return;
  const t = (node.textContent || '').trim();
  if (!t) return;

  let replaced = t;
  let changed = false;
  for (const rx of FORBIDDEN) {
    if (rx.test(replaced)) {
      changed = true;
      replaced = replaced.replace(rx, 'We only teach official ways to get Robux. Learn more at help.roblox.com.');
    }
  }
  if (changed) {
    hits.push({ node: parent, from: t, to: replaced });
    node.textContent = replaced;
  }
}

function walk(node: Node, hits: GuardrailHit[]) {
  // skip non-content containers
  if (node instanceof Element && node.matches('script,style,noscript,template')) return;
  if (node.nodeType === Node.TEXT_NODE) {
    sanitizeTextNode(node as Text, hits);
  } else node.childNodes.forEach((n) => walk(n, hits));
}

function assertAssets() {
  const okLogo = /\/assets\/official_logo(?:-[a-z0-9]+)?\.svg$/i;
  const okIcon = /\/assets\/app_icon(?:-[a-z0-9]+)?\.svg$/i;

  const badImgs = Array.from(document.querySelectorAll('img')).filter((img) => {
    const s = (img.getAttribute('src') || '').toLowerCase();
    return /(logo|icon)/.test(s) && !(okLogo.test(s) || okIcon.test(s));
  });

  if (badImgs.length) {
    console.error('Non-canonical logo/icon detected:', badImgs.map((i) => i.getAttribute('src')));
  }

  const badLinks = Array.from(
    document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]')
  ).filter((l) => {
    const href = (l.getAttribute('href') || '').toLowerCase();
    return !(okLogo.test(href) || okIcon.test(href));
  });
  if (badLinks.length) {
    console.warn('Non-canonical favicons detected:', badLinks.map((l) => l.getAttribute('href')));
  }
}

export function runGuardrails() {
  const hits: GuardrailHit[] = [];
  try {
    // Remove legacy SSR fallback hero if present
    const ssr = document.getElementById('hero-ssr');
    if (ssr) {
      ssr.remove();
      console.warn('Removed legacy SSR hero fallback.');
    }
    // Ensure skip link target exists
    const skip = document.querySelector('a.skip-link[href="#main"]');
    if (skip && !document.getElementById('main')) {
      const mainEl = document.querySelector('main');
      if (mainEl) (mainEl as HTMLElement).id = 'main';
    }

    walk(document.body, hits);
    if (hits.length) {
      console.warn('Guardrails sanitized content at runtime:', hits.slice(0, 10));
    }
    assertAssets();
  } catch (e) {
    console.warn('Guardrails encountered an issue but did not block rendering:', e);
  }
}
