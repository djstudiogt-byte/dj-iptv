📺 DJ-IPTV
Cliente IPTV 100% navegador · Estilo Apple TV (tvOS) · Un solo archivo HTML

🌐 Sitio web: https://dj-iptv.pages.dev

DJ-IPTV es un cliente IPTV que funciona directamente en tu navegador, sin instalar
nada: ni apps, ni Node.js, ni Python, ni emuladores de Android. Está pensado
especialmente para ChromeOS Flex, ideal para revivir computadoras viejas y
convertirlas en un centro de televisión con la estética de un Apple TV.

Funciona con cualquier servidor Xtream Codes API (el estándar de la mayoría
de proveedores IPTV): TV en vivo, películas y series.

✨ Características
📡 TV en vivo con EPG (programa actual y siguiente, con barra de progreso)
🎬 Películas y 📚 Series con temporadas y episodios
🔗 Dos tipos de cuenta: servidor Xtream Codes API o URL de lista M3U (get.php?type=m3u_plus) — la lista se clasifica sola en TV / Películas / Series, agrupa los episodios por temporada y funciona también con paneles que entregan enlaces «tokenizados» (/play/código#.mkv), con progreso de descarga y caché local (soporta listas de 40-60 MB con más de 100.000 entradas)
📦 Soporte MKV: lo intenta nativo, reintenta sin proxy y con extensiones alternativas (.mp4/.avi) y, si el códec no existe en el navegador (HEVC, AC3, DTS), ofrece copiar el enlace para VLC o descargar
🖼️ Picture-in-Picture: botón en el reproductor o tecla P para ver el vídeo en una ventana flotante mientras usas la app
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
Abre https://dj-iptv.pages.dev
Pulsa «Añadir cuenta» y elige el tipo:
Servidor Xtream — Host (ej. http://miservidor.tv), Puerto (ej. 8080),
Usuario y Contraseña.
Lista M3U (URL) — pega la URL que te da tu proveedor, por ejemplo:
http://miservidor.tv:8080/get.php?username=TU_USUARIO&password=TU_CLAVE&type=m3u_plus&output=m3u8
DJ-IPTV la descarga (verás el progreso en MB) y la clasifica sola: canales
en vivo, películas y series (S01E02 agrupados por temporada). Los paneles
que entregan enlaces tokenizados (/play/código#.mkv) se clasifican igual:
por pseudo-extensión y nombre.
¡Listo! Si el navegador bloquea la conexión directa (CORS), DJ-IPTV lo
resuelve solo: reintenta por el proxy integrado (Cloudflare Pages
Functions), después por proxies CORS públicos y por conexión directa,
y guarda la ruta que funcione.
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
P (reproductor)	Picture-in-Picture (imagen en imagen flotante)
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
Dos fuentes de catálogo: API Xtream Codes (player_api.php) o playlist
M3U/m3u_plus parseada en el navegador (get.php?...&type=m3u_plus).
Anti-CORS: proxy propio en Cloudflare Pages Functions
(functions/api/proxy.js) que además reescribe Range/206 para que
adelantar y retroceder funcione bien en películas y episodios; con
respaldo en proxies CORS públicos y conexión directa. Para las listas M3U
y para el vídeo, si una ruta falla (algunos paneles devuelven 403 a las
IPs de la nube) la app prueba la siguiente automáticamente y, en el
reproductor, reintenta la señal sin proxy (el <video> no necesita
CORS), luego con otra extensión, y solo entonces muestra la tarjeta de
error con «Copiar enlace (VLC)».
Almacenamiento local: IndexedDB (cuentas cifradas, descargas, caché de
catálogos y del texto crudo de las listas M3U) y localStorage (favoritos,
ajustes).
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

📁 Estructura del proyecto

├── index.html                  # La aplicación completa (SPA)
├── hls.min.js                  # Reproductor HLS (hls.js)
├── README.md
└── functions/
    └── api/
        ├── proxy.js            # Proxy anti-CORS con soporte Range (Pages Function)
        └── cors-check.js       # Chequeo de conectividad
        
⚠️ Aviso legal
DJ-IPTV es solo un reproductor. No incluye, aloja ni distribuye ningún
canal, película ni lista de contenido. Cada usuario debe conectar su propia
cuenta de un proveedor IPTV y asegurarse de que el contenido que reproduce
es legal en su país. El uso de la aplicación es responsabilidad del usuario.

Hecho con el ❤️ con el apoyo de DJStudioGT
