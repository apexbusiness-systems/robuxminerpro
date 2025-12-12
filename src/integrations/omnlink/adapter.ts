import { getOmniLinkConfig } from './config';
import type { OmniLinkAdapter, OmniLinkEvent } from './types';

async function postEvent(event: OmniLinkEvent) {
  const config = getOmniLinkConfig();
  if (!config.enabled || config.status !== 'enabled' || !config.baseUrl || !config.tenantId) {
    return;
  }

  const url = new URL(`/tenants/${config.tenantId}/events`, config.baseUrl);
  await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    }),
  }).catch((err) => {
    console.warn('[OmniLink] Failed to send event', err);
  });
}

export const omniLinkAdapter: OmniLinkAdapter = {
  isEnabled() {
    const config = getOmniLinkConfig();
    return config.status === 'enabled' && config.enabled;
  },
  getConfig() {
    return getOmniLinkConfig();
  },
  async sendEvent(event: OmniLinkEvent) {
    // Silently no-op when disabled or misconfigured.
    await postEvent(event);
  },
};

