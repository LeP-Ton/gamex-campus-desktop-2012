import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

function offlineCache() {
  return {
    name: 'gamex-offline-cache',
    apply: 'build' as const,
    closeBundle() {
      const assets = readdirSync('dist/assets').map((name) => `/assets/${name}`);
      const files = ['/', '/index.html', '/wallpaper.svg', '/favicon.svg', ...assets];
      const revision = createHash('sha256').update(assets.join('|')).digest('hex').slice(0, 12);
      // 缓存仅服务同源静态文件；忽略预览服务器的 Vary: Origin，保证模块脚本离线可读。
      const worker = `const CACHE='gamex-${revision}';const FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('gamex-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.match(event.request,{ignoreVary:true}).then(cached=>cached||fetch(event.request).catch(()=>event.request.mode==='navigate'?caches.match('/index.html'):Response.error())));});`;
      writeFileSync('dist/sw.js', worker);
    },
  };
}

export default defineConfig({
  plugins: [react(), offlineCache()],
  test: { environment: 'node', include: ['src/tests/**/*.test.ts'] },
});
