📺 DJ-IPTV
Cliente IPTV 100% navegador · Estilo Apple TV (tvOS) · Un solo archivo HTML

🌐 Sitio web: https://dj-iptv.pages.dev/

DJ-IPTV es un cliente IPTV que funciona directamente en tu navegador, sin instalar
nada: ni apps, ni Node.js, ni Python, ni emuladores de Android. Está pensado
especialmente para ChromeOS Flex, ideal para revivir computadoras viejas y
convertirlas en un centro de televisión con la estética de un Apple TV.

Funciona con cualquier servidor Xtream Codes API (el estándar de la mayoría
de proveedores IPTV): TV en vivo, películas y series.

✨ Características
📡 TV en vivo con EPG (programa actual y siguiente, con barra de progreso)
🎬 Películas y 📚 Series con temporadas y episodios
🎨 Interfaz estilo Apple TV / tvOS: portadas grandes, carriles, foco resaltado, cristal esmerilado
🕹️ Mando de TV con el teclado: navega todo con WASD y abre con T (además de flechas y Enter)
⭐ Favoritos en TV, películas y series (se guardan por cuenta en el navegador)
🔎 Buscador global en tiempo real (Ctrl+K o /)
🗂️ Categorías con chips y panel lateral dentro del reproductor (tecla C)
⏺️ Grabar el directo (PVR) y ⬇️ descargar películas/episodios para ver sin conexión
🎚️ Menú de calidad cuando el canal HLS ofrece varias alternativas (tecla Q)
🚫 Filtro de contenido adulto: oculta automáticamente categorías XXX
🔐 Cuentas cifradas con AES-GCM en tu navegador (nada sale de tu equipo salvo la conexión a tu propio servidor)
🧪 Modo demo para probar sin cuenta
🌍 Funciona con doble clic en index.html (sin servidor) o publicado en la nube
🚀 Cómo usarlo
Abre https://dj-iptv.pages.dev/
Pulsa «Añadir cuenta» y escribe los datos de tu proveedor Xtream:
Host (ej. http://miservidor.tv)
Puerto (ej. 8080 o 80)
Usuario y Contraseña
¡Listo! Si el navegador bloquea la conexión directa (CORS), DJ-IPTV lo
resuelve solo: reintenta por el proxy integrado (Cloudflare Pages
Functions) y después por proxies CORS públicos, y guarda el que funcione.
💡 Sin cuenta también puedes entrar al Modo Demo para ver cómo funciona.

⌨️ Controles · Mando de TV
Tecla
Acción
W A S D	Mover el foco entre tarjetas, chips y menús (igual que las flechas)
T	Abrir / seleccionar lo resaltado (el «OK» del mando). Enter también vale
Esc	Volver atrás (cierra menú, buscador o reproductor)
A / D (reproductor)	Retroceder / adelantar 10 segundos
W / S (reproductor)	Cambiar de canal (TV) o de episodio (series)
C (reproductor)	Panel de categorías a la izquierda (TV en vivo)
L	Añadir o quitar de favoritos
R	Grabar el directo
B	Descargar película o episodio
Q	Menú de calidad (si el canal ofrece varias)
Espacio / K	Pausa · F pantalla completa · M silencio · + / − volumen
/ o Ctrl+K	Buscador global

La lista completa está dentro de la app, en Ajustes → Atajos de teclado.

🛠️ Cómo funciona (arquitectura)
text

┌─────────────────────────────┐         ┌──────────────────────────────┐
│  index.html (SPA · 1 solo   │  HTTPS  │   Tu servidor IPTV Xtream    │
│  archivo · HTML/CSS/JS)     │────────►│   player_api.php + streams   │
│  hls.min.js para HLS        │         └──────────────────────────────┘
│                             │
│  ¿CORS bloquea?             │         ┌──────────────────────────────┐
│  → functions/api/proxy.js   │────────►│  Proxy en Cloudflare Pages   │
│    (integrado, con soporte  │         │  (Range/206 para adelantar)  │
│    Range) o proxy público   │         └──────────────────────────────┘
└─────────────────────────────┘
Frontend: un único index.html autocontenido (HTML + CSS + JS vanilla,
sin frameworks) más hls.min.js para streams HLS.
API Xtream Codes: player_api.php para login, catálogos, series y EPG;
streams .m3u8 (live) y .mp4/.mkv (VOD).
Anti-CORS: proxy propio en Cloudflare Pages Functions
(functions/api/proxy.js) que además reescribe Range/206 para que
adelantar y retroceder funcione bien en películas y episodios; con
respaldo en proxies CORS públicos.
Almacenamiento local: IndexedDB (cuentas cifradas, descargas) y
localStorage (favoritos, ajustes, caché de catálogos con TTL de 6 h).
☁️ Publicar tu propia copia (Cloudflare Pages)
Sube a un repositorio de GitHub: index.html, hls.min.js y la carpeta
functions/ (con api/proxy.js y api/cors-check.js).
En Cloudflare → Workers & Pages → crea una página desde ese repositorio
(sin configuración de build; las funciones se detectan solas).
Para actualizar: sube la nueva versión de los archivos al repo
(index.html y, si cambió, functions/api/proxy.js). Cloudflare
redespliega solo en ~1 minuto.
También funciona local: doble clic en index.html y la app se las arregla
con proxies públicos si no hay servidor propio.
