type Env = {
  UPSTREAM_BASE: string;
};

const FILE_MAP: Record<string, { path: string; type: string }> = {
  '/ffmpeg.min.js': {
    path: '@ffmpeg/ffmpeg@0.12.6/dist/ffmpeg.min.js',
    type: 'application/javascript; charset=utf-8'
  },
  '/ffmpeg-core.js': {
    path: '@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
    type: 'application/javascript; charset=utf-8'
  },
  '/ffmpeg-core.wasm': {
    path: '@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm',
    type: 'application/wasm'
  }
};

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
  'Access-Control-Allow-Headers': 'Accept,Range,Content-Type',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Vary': 'Origin'
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const asset = FILE_MAP[url.pathname];

    if (!asset) {
      return new Response('Not found', { status: 404 });
    }

    const upstream = `${env.UPSTREAM_BASE}/${asset.path}`;
    const upstreamResponse = await fetch(upstream, {
      cf: {
        cacheKey: upstream,
        cacheEverything: true,
        cacheTtl: 60 * 60 * 24 // 24h
      }
    });

    if (!upstreamResponse.ok) {
      return new Response(`Upstream error ${upstreamResponse.status}`, { status: upstreamResponse.status });
    }

    const headers = new Headers(upstreamResponse.headers);
    headers.set('Content-Type', asset.type);
    headers.set('Cache-Control', 'public, max-age=86400, immutable');

    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers
    });
  }
};

