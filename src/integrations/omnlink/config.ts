import type { OmniLinkConfig } from './types';

const rawEnabled = import.meta.env.OMNILINK_ENABLED;
const rawBaseUrl = import.meta.env.OMNILINK_BASE_URL;
const rawTenantId = import.meta.env.OMNILINK_TENANT_ID;

export function getOmniLinkConfig(): OmniLinkConfig {
  const enabledFlag = (rawEnabled ?? '').toString().toLowerCase() === 'true';
  const baseUrl = rawBaseUrl?.trim() || null;
  const tenantId = rawTenantId?.trim() || null;

  if (!enabledFlag) {
    return {
      enabled: false,
      status: 'disabled',
      baseUrl: null,
      tenantId: null,
      baseUrlConfigured: false,
      tenantConfigured: false,
    };
  }

  const baseUrlConfigured = Boolean(baseUrl);
  const tenantConfigured = Boolean(tenantId);
  const isMisconfigured = !baseUrlConfigured || !tenantConfigured;

  return {
    enabled: enabledFlag && !isMisconfigured,
    status: isMisconfigured ? 'misconfigured' : 'enabled',
    baseUrl,
    tenantId,
    baseUrlConfigured,
    tenantConfigured,
  };
}

