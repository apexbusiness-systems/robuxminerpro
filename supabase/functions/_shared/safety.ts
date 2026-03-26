export function detectPII(text: string): { hasPII: boolean; redacted: string } {
  // Regex patterns for basic PII blocks
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const phoneRegex = /(\+?\d{1,2}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/g;
  
  let redacted = text.replace(emailRegex, '[EMAIL_REDACTED]');
  redacted = redacted.replace(phoneRegex, '[PHONE_REDACTED]');
  
  return {
    hasPII: text !== redacted,
    redacted
  };
}

export function detectPromptInjection(text: string): boolean {
  const injectionKeywords = [
    "ignore previous instructions",
    "forget all instructions",
    "you are now",
    "system prompt",
    "bypass safety",
    "do what i say",
    "jailbreak"
  ];
  
  const lowerText = text.toLowerCase();
  return injectionKeywords.some(kw => lowerText.includes(kw));
}

export function scanInputSafety(text: string): { safe: boolean; flags: string[]; redactedText: string } {
  const flags: string[] = [];
  
  // 1. PII Scan
  const piiResult = detectPII(text);
  if (piiResult.hasPII) {
    flags.push("pii_detected");
  }

  // 2. Prompt Injection Scan
  if (detectPromptInjection(text)) {
    flags.push("prompt_injection");
  }

  // 3. Simple blacklist (Basic block for scam phrases or explicit content)
  const blocklist = ['generator', 'free robux site', 'robux glitch', 'account hack'];
  if (blocklist.some(word => text.toLowerCase().includes(word))) {
    flags.push("tos_violation_risk");
  }

  return {
    safe: flags.length === 0,
    flags,
    redactedText: piiResult.redacted
  };
}

export function scanOutputSafety(text: string): { safe: boolean; flags: string[]; safeAlternative: string | null } {
  const flags: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Guard against AI hallucinating scam vectors
  if (lowerText.includes("generator") || lowerText.includes("glitch") || lowerText.includes("give me your password")) {
    flags.push("harmful_content");
  }

  if (flags.length > 0) {
    return {
      safe: false,
      flags,
      safeAlternative: "I can't provide that information as it may violate Roblox Terms of Service or community safety guidelines. Can we talk about legitimate creator strategies instead?"
    };
  }

  return { safe: true, flags: [], safeAlternative: null };
}
