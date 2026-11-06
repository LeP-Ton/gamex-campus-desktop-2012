import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

function offlineCache() {
  return {
    name: 'gamex-offline-cache',
    apply: 'build' as const,
    closeBundle() {
      const collect = (dir: string, prefix = ''): string[] =>
        readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
          entry.isDirectory()
            ? collect(`${dir}/${entry.name}`, `${prefix}${entry.name}/`)
            : [`${prefix}${entry.name}`],
        );
      const assets = collect('dist').filter((name) => name !== 'sw.js');
      const files = ['/', ...assets.map((name) => `/${name}`)];
      const digest = createHash('sha256');
      for (const name of assets) digest.update(readFileSync(`dist/${name}`));
      const revision = digest.digest('hex').slice(0, 12);
      // 缓存仅服务同源静态文件；忽略预览服务器的 Vary: Origin，保证模块脚本离线可读。
      // 页面导航不加入 activate 的等待链，避免导航等待新 Worker 激活、激活又等待导航的循环。
      const worker = `const CACHE='gamex-${revision}';const FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();const older=keys.filter(key=>key.startsWith('gamex-')&&key!==CACHE);await Promise.all(older.map(key=>caches.delete(key)));await self.clients.claim();if(older.length){const tabs=await self.clients.matchAll({type:'window'});for(const tab of tabs)tab.navigate(tab.url).catch(()=>{});}})());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.match(event.request,{ignoreVary:true}).then(cached=>cached||fetch(event.request).catch(()=>event.request.mode==='navigate'?caches.match('/index.html'):Response.error())));});`;
      writeFileSync('dist/sw.js', worker);
    },
  };
}

export default defineConfig({
  plugins: [react(), offlineCache()],
  test: { environment: 'node', include: ['src/tests/**/*.test.ts'] },
});
