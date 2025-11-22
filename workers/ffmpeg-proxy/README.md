## FFmpeg Proxy Worker

Re-envía el bundle de `@ffmpeg/ffmpeg` con cabeceras CORS/CORP amigables para páginas en modo COEP.

### Deploy rápido

```bash
cd workers/ffmpeg-proxy
pnpm install # o npm install
pnpm run deploy # wrangler deploy
```

Una vez publicado, apunta a las rutas:

- `<worker-url>/ffmpeg.min.js`
- `<worker-url>/ffmpeg-core.js`
- `<worker-url>/ffmpeg-core.wasm`

El worker cachea los archivos desde jsDelivr durante 24h y aplica `Access-Control-Allow-Origin: *` y `Cross-Origin-Resource-Policy: cross-origin`.

