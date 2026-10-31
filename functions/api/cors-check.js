/**
 * DJ-IPTV · Función de Cloudflare Pages → /api/cors-check
 * Firma que la app reconoce para activar sola el proxy integrado
 * (el usuario no configura nada: abre el enlace y ya).
 */
export async function onRequest() {
  return new Response(JSON.stringify({ ok: true, proxy: 'DJ-IPTV', via: 'pages' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });
}
