export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  // Strip the /api/engine/beta prefix and proxy to Google Generative Language API
  const path = url.pathname.replace(/^\/api\/engine\/beta/, '');
  const targetUrl = `https://generativelanguage.googleapis.com${path}${url.search}`;

  const request = new Request(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
    redirect: 'follow',
  });

  return fetch(request);
};
