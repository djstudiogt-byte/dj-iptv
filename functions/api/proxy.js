/**
 * DJ-IPTV · Función de Cloudflare Pages → /api/proxy
 * Reenvía las peticiones al servidor IPTV del usuario con cabeceras CORS.
 * Soporta Range de dos formas:
 *  1) Si el origen honra el Range (206), lo deja pasar tal cual.
 *  2) Si el origen lo IGNORA (responde 200 con el archivo completo), recorta aquí
 *     el trozo pedido y devuelve un 206 correcto: así el navegador puede pausar
 *     y adelantar sin que el vídeo regrese al principio.
 * Gratuita en el plan gratuito de Cloudflare (100.000 peticiones/día).
 */

/** Interpreta «bytes=a-b», «bytes=a-» o «bytes=-n» contra un tamaño total conocido. */
function parseRange(header, total) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(header || '').trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start, end;
  if (m[1] === '') {                       // bytes=-n → últimos n bytes
    const n = Number(m[2]);
    if (!n) return null;
    start = Math.max(0, total - n);
    end = total - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? total - 1 : Math.min(Number(m[2]), total - 1);
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return { start, end };
}

/** Flujo que entrega solo el trozo [start..end] del cuerpo del origen, sin almacenarlo. */
function sliceStream(body, start, end) {
  const reader = body.getReader();
  let pos = 0;        // byte siguiente del origen
  let sent = 0;       // bytes ya enviados del recorte
  const len = end - start + 1;
  return new ReadableStream({
    async pull(ctrl) {
      try {
        while (sent < len) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStart = pos;
          pos += value.byteLength;
          if (chunkStart + value.byteLength <= start) continue;   // aún no llegamos al recorte
          let s = 0;
          let e = value.byteLength;
          if (chunkStart < start) s = start - chunkStart;
          const limit = end + 1;
          if (chunkStart + e > limit) e = limit - chunkStart;
          if (e <= s) continue;
          const piece = value.subarray(s, e);
          sent += piece.byteLength;
          ctrl.enqueue(piece);
          return;
        }
        ctrl.close();
      } catch (e) {
        try { ctrl.error(e); } catch (_e) { /* noop */ }
      }
    },
    cancel() { try { reader.cancel(); } catch (_e) { /* noop */ } },
  });
}

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

  // El origen ignoró el Range (200 con el archivo completo): recortamos aquí y
  // devolvemos 206 para que el adelanto funcione de verdad.
  const total = Number(upstream.headers.get('content-length'));
  if (range && upstream.status === 200 && request.method !== 'HEAD' &&
      upstream.body && Number.isFinite(total) && total > 0) {
    const r = parseRange(range, total);
    if (r) {
      if (r.start >= total) {
        headers.set('Content-Range', 'bytes */' + total);
        return new Response(null, { status: 416, headers });
      }
      headers.set('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Content-Range', 'bytes ' + r.start + '-' + r.end + '/' + total);
      headers.set('Content-Length', String(r.end - r.start + 1));
      return new Response(sliceStream(upstream.body, r.start, r.end), { status: 206, headers });
    }
  }

  if (!upstream.headers.get('accept-ranges')) headers.set('Accept-Ranges', 'bytes');
  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}
