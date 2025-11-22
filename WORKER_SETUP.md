# FFmpeg Proxy Worker

Para poder generar MP4 en el navegador mientras usamos COOP/COEP necesitamos servir el bundle de `@ffmpeg/ffmpeg` desde un dominio que controle las cabeceras CORS y que no tenga el límite de 25 MB de Cloudflare Pages. Para eso añadimos el worker en `workers/ffmpeg-proxy`.

## 1. Requisitos

- Cuenta de Cloudflare con Workers habilitado.
- Wrangler instalado (`npm install -g wrangler` o `pnpm dlx wrangler`).

## 2. Deploy

```bash
cd workers/ffmpeg-proxy
pnpm install # o npm/yarn
pnpm run deploy
```

Guarda la URL pública que entrega Cloudflare (formato `https://<worker>.workers.dev`).

## 3. Configurar el frontend

Edita el snippet en `products.html` y reemplaza el placeholder:

```html
window.__FFMPEG_PROXY__ = window.__FFMPEG_PROXY__ || (
  window.location.hostname === 'localhost'
    ? 'http://localhost:8787'
    : 'https://ffmpeg-proxy.tu-worker.workers.dev'
);
```

Tras redeployar Pages, el frontend cargará los scripts desde el Worker y FFmpeg volverá a funcionar.

## 4. Desarrollo local

Si corres `pnpm run dev` dentro del worker, se expondrá en `http://localhost:8787`. El snippet anterior ya usa esa URL para `localhost`, así que puedes probar haciendo `wrangler dev --persist`.


