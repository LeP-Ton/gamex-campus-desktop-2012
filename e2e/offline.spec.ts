import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

test('生产资源缓存后，断网刷新仍能读取存档与进行游戏', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: '你的姓名' }).fill('离线同学');
  await page.getByRole('button', { name: '开启我的大学生活' }).click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.qq-profile strong')).toContainText('离线同学');
  await page
    .getByRole('navigation', { name: '桌面快捷方式' })
    .getByRole('button', { name: '学习中心', exact: true })
    .click();
  await page.getByRole('button', { name: /温故知新/ }).click();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('gamex-campus-save-v1')!).state);
  expect(state.minute).toBe(540);
  expect(state.stats.study).toBe(1);
  await page
    .getByRole('navigation', { name: '桌面快捷方式' })
    .getByRole('button', { name: '英雄联盟', exact: true })
    .click();
  await expect(page.locator('.lol-featured img')).toHaveJSProperty('complete', true);
  expect(
    await page.locator('.lol-featured img').evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0);
  await context.setOffline(false);
});

test('缓存版本升级会显示新版并保留既有角色存档', async ({ page }) => {
  // 使用预览服务器实际提供的旧脚本，覆盖范围仅为构建产物，并在安装后恢复。
  const workerPath = 'dist/sw.js';
  const currentWorker = readFileSync(workerPath, 'utf8');
  writeFileSync(
    workerPath,
    `self.addEventListener('install',e=>{e.waitUntil(caches.open('gamex-legacy-fixture'));self.skipWaiting();});self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));`,
  );
  try {
    await page.goto('/');
    await page.getByRole('textbox', { name: '你的姓名' }).fill('跨版本同学');
    await page.getByRole('button', { name: '开启我的大学生活' }).click();
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    const before = await page.evaluate(
      () => JSON.parse(localStorage.getItem('gamex-campus-save-v1')!).state.runId,
    );
    writeFileSync(workerPath, currentWorker);
    const navigation = page.waitForEvent('framenavigated', {
      predicate: (frame) => frame === page.mainFrame(),
    });
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration!.update();
    });
    await navigation;
    await expect(page.locator('.qq-profile strong')).toContainText('跨版本同学');
    expect(
      await page.evaluate(() => JSON.parse(localStorage.getItem('gamex-campus-save-v1')!).state.runId),
    ).toBe(before);
    expect(await page.evaluate(async () => !(await caches.keys()).includes('gamex-legacy-fixture'))).toBe(
      true,
    );
  } finally {
    writeFileSync(workerPath, currentWorker);
  }
});
