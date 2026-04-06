import { Page, Route } from '@playwright/test';

/**
 * Mocks the Supabase session so that supabase.auth.getSession() works.
 */
export async function mockSupabaseSession(page: Page) {
  await page.addInitScript(() => {
    // We override local storage so that any fetch for the token will find a valid session
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key: string) {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        return JSON.stringify({
          access_token: 'fake-jwt-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: 'fake-refresh-token',
          user: {
            id: 'apex-mock-user-id',
            aud: 'authenticated',
            role: 'authenticated',
            email: 'apex@example.com',
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        });
      }
      return originalGetItem.call(this, key);
    };
  });
}

/**
 * Intercepts the chat edge function request and returns a deterministic streamed response.
 */
export async function mockMentorChatStream(page: Page, responseText: string) {
  // We want to intercept the actual fetch in Mentor.tsx
  // It calls `${supabaseUrl}/functions/v1/chat`
  await page.route('**/functions/v1/chat', async (route: Route) => {
    // We mock a Server-Sent Events stream as parsed by Mentor.tsx
    // The decoder looks for "data: " lines.
    const jsonStr = JSON.stringify({ choices: [{ delta: { content: responseText } }] });
    const chunk1 = `data: ${jsonStr}\n\n`;
    const chunk2 = `data: [DONE]\n\n`;

    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: chunk1 + chunk2,
    });
  });
}
