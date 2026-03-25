export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  // Strip the /api/engine/alpha prefix and proxy to Groq OpenAI-compatible API
  const path = url.pathname.replace(/^\/api\/engine\/alpha/, '');
  const targetUrl = `https://api.groq.com/openai${path}${url.search}`;

  const request = new Request(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
    redirect: 'follow',
  });

  return fetch(request);
};
