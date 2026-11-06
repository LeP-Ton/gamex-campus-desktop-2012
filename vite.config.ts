import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import type { ResolvedConfig } from 'vite';

function offlineCache() {
  let base = '/';
  let outputDirectory = 'dist';
  return {
    name: 'gamex-offline-cache',
    apply: 'build' as const,
    configResolved(config: ResolvedConfig) {
      base = config.base;
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const collect = (dir: string, prefix = ''): string[] =>
        readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
          entry.isDirectory()
            ? collect(`${dir}/${entry.name}`, `${prefix}${entry.name}/`)
            : [`${prefix}${entry.name}`],
        );
      const assets = collect(outputDirectory)
        .filter((name) => name !== 'sw.js')
        .sort();
      const files = [base, ...assets.map((name) => `${base}${name}`)];
      const digest = createHash('sha256');
      for (const name of assets) digest.update(readFileSync(`${outputDirectory}/${name}`));
      const revision = digest.digest('hex').slice(0, 12);
      const prefix = `gamex-${createHash('sha256').update(base).digest('hex').slice(0, 8)}-`;
      // 缓存仅服务同源静态文件；忽略预览服务器的 Vary: Origin，保证模块脚本离线可读。
      // 页面导航不加入 activate 的等待链，避免导航等待新 Worker 激活、激活又等待导航的循环。
      // 子目录分别拥有缓存，避免同一 GitHub 用户下的其他项目互相覆盖。
      const worker = `const BASE=${JSON.stringify(base)};const PREFIX=${JSON.stringify(prefix)};const CACHE=PREFIX+'${revision}';const FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();const older=keys.filter(key=>key!==CACHE&&(key.startsWith(PREFIX)||(BASE==='/'&&/^gamex-[a-f0-9]{12}$/.test(key))));await Promise.all(older.map(key=>caches.delete(key)));await self.clients.claim();if(older.length){const tabs=await self.clients.matchAll({type:'window'});for(const tab of tabs)if(new URL(tab.url).pathname.startsWith(BASE))tab.navigate(tab.url).catch(()=>{});}})());});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(BASE))return;event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request,{ignoreVary:true}).then(cached=>cached||fetch(event.request).catch(()=>event.request.mode==='navigate'?cache.match(BASE+'index.html'):Response.error()))));});`;
      writeFileSync(`${outputDirectory}/sw.js`, worker);
    },
  };
}

export default defineConfig({
  plugins: [react(), offlineCache()],
  test: { environment: 'node', include: ['src/tests/**/*.test.ts'] },
});
