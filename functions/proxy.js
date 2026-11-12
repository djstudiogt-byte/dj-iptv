/**
 * DJ-IPTV · Alias del proxy en la ruta /proxy (además de /api/proxy).
 * Misma función de túnel HTTPS transparente hacia el servidor IPTV: reenvía la
 * petición, conserva las cabeceras de Range y las respuestas 206 sin alterar los
 * datos binarios. Se mantiene como reexportación para que ambos caminos
 * documentados (/proxy y /api/proxy) queden siempre sincronizados.
 */
export { onRequest } from './api/proxy.js';
