import { Page } from '@playwright/test';

type PipWindowLike = {
  document: {
    head: { appendChild: () => void };
    body: HTMLDivElement;
    createElement: (tag: string) => HTMLElement;
  };
  addEventListener: (event: string, callback: EventListenerOrEventListenerObject) => void;
  close: () => void;
};

/**
 * Mocks the Document Picture-in-Picture API which might not be supported in headless Chromium.
 */
export async function mockDocumentPictureInPicture(page: Page) {
  await page.addInitScript(() => {
    const fakeWindow: PipWindowLike = {
      document: {
        head: { appendChild: () => {} },
        body: document.createElement('div'),
        createElement: (tag: string) => document.createElement(tag),
      },
      addEventListener: () => {},
      close: () => {},
    };

    // @ts-expect-error Mocking non-standard global property
    globalThis.documentPictureInPicture = {
      requestWindow: async () => fakeWindow,
    };
  });
}
