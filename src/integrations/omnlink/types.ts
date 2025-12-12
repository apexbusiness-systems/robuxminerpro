export type OmniLinkStatus = 'disabled' | 'enabled' | 'misconfigured';

export type OmniLinkConfig = {
  enabled: boolean;
  status: OmniLinkStatus;
  baseUrl: string | null;
  tenantId: string | null;
  baseUrlConfigured: boolean;
  tenantConfigured: boolean;
};

export type OmniLinkEvent = {
  type: string;
  payload?: Record<string, unknown>;
  timestamp?: string;
};

export interface OmniLinkAdapter {
  isEnabled(): boolean;
  sendEvent(event: OmniLinkEvent): Promise<void>;
  getConfig(): OmniLinkConfig;
}

