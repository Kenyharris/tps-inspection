export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/analyse' && request.method === 'POST') {
      if (!env.ANTHROPIC_API_KEY) {
        return new Response(JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY is not configured in Cloudflare environment variables.' } }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        const body = await request.json();

        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(body),
        });

        const data = await resp.json();

        return new Response(JSON.stringify(data), {
          status: resp.status,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: { message: 'Worker error: ' + err.message } }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // All other requests → serve static files
    return env.ASSETS.fetch(request);
  },
};
