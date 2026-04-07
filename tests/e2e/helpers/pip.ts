import { Page } from '@playwright/test';

/**
 * Mocks the Document Picture-in-Picture API which might not be supported in headless Chromium.
 * By mocking it, we allow React's createPortal to render into a detached DOM tree successfully,
 * letting the PipAgent logic execute without throwing "API not supported".
 */
export async function mockDocumentPictureInPicture(page: Page) {
  await page.addInitScript(() => {
    // We create a fake window with enough DOM structure for PiP and React portal
    const fakeWindow = {
      document: {
        head: {
          appendChild: () => {},
        },
        body: document.createElement('div'), // Where React will portal into
        createElement: (tag: string) => document.createElement(tag),
      },
      addEventListener: (event: string, callback: EventListener) => {},
      close: () => {},
    };

    // @ts-expect-error Mocking global property
    globalThis.documentPictureInPicture = {
      requestWindow: async () => fakeWindow,
    };
  });
}
