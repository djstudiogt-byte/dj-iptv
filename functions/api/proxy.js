/**
 * DJ-IPTV · Función de Cloudflare Pages → /api/proxy
 * Reenvía las peticiones al servidor IPTV del usuario con cabeceras CORS,
 * soportando Range para que el vídeo pueda pausarse y adelantarse.
 * Gratuita en el plan gratuito de Cloudflare (100.000 peticiones/día).
 */
export async function onRequest(context) {
  const { request } = context;

  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(request.url);
  const target = url.searchParams.get('url');
  if (!target || !/^https?:\/\//i.test(target)) {
    return new Response('Falta ?url= o no es válida', { status: 400, headers: CORS });
  }

  const range = request.headers.get('range');
  let upstream;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers: {
        Accept: '*/*',
        ...(range ? { Range: range } : {}),
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      redirect: 'follow',
      cf: { cacheTtl: 0, cacheEverything: false },
    });
  } catch (e) {
    return new Response('El servidor IPTV no respondió: ' + (e && e.message || e), {
      status: 502,
      headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const headers = new Headers(CORS);
  for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control']) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  if (!upstream.headers.get('accept-ranges')) headers.set('Accept-Ranges', 'bytes');
  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}
