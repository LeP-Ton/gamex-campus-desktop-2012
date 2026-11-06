import { test, expect } from '@playwright/test';

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
  await expect(page.getByRole('heading', { name: /早安，离线同学/ })).toBeVisible();
  await page
    .getByRole('navigation', { name: '桌面快捷方式' })
    .getByRole('button', { name: '学习中心', exact: true })
    .click();
  await page.getByRole('button', { name: /温故知新/ }).click();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('gamex-campus-save-v1')!).state);
  expect(state.minute).toBe(540);
  expect(state.stats.study).toBe(1);
  await context.setOffline(false);
});
