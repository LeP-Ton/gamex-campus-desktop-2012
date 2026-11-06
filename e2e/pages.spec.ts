import { test, expect, type Page } from '@playwright/test';

async function start(page: Page, name: string) {
  await page.goto('./');
  await page.getByRole('textbox', { name: '你的姓名' }).fill(name);
  await page.getByRole('button', { name: '开启我的大学生活' }).click();
  await expect(page.locator('.qq-profile strong')).toContainText(name);
}

test('项目子路径下图标、英雄原画与脚本都正确加载', async ({ page }) => {
  const failures: string[] = [];
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(response.url());
  });
  await start(page, 'GitHub同学');
  await expect
    .poll(() =>
      page.locator('.period-icon').evaluateAll((images) =>
        images.every((node) => {
          const image = node as HTMLImageElement;
          return (
            image.complete &&
            image.naturalWidth > 0 &&
            image.currentSrc.includes('/gamex-campus-desktop-2012/')
          );
        }),
      ),
    )
    .toBe(true);
  await page
    .getByRole('navigation', { name: '桌面快捷方式' })
    .getByRole('button', { name: '英雄联盟', exact: true })
    .click();
  await expect
    .poll(() => page.locator('.lol-featured img').evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.locator('.lol-featured img')).toHaveAttribute(
    'src',
    '/gamex-campus-desktop-2012/period-assets/ashe-2012.jpg',
  );
  await page.screenshot({ path: 'artifacts/github-pages.png', animations: 'disabled' });
  expect(failures).toEqual([]);
});

test('子路径支持离线读档，且不会删除同域其他项目缓存', async ({ page, context }) => {
  // 先在同源空白页面建立另一项目的缓存，再安装本项目的真实 Worker。
  await page.route('**/cache-fixture.html', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>缓存测试准备</title>' }),
  );
  await page.goto('cache-fixture.html');
  await page.evaluate(async () => {
    const cache = await caches.open('gamex-other-project-fixture');
    await cache.put('/another-project/marker', new Response('其他项目的数据'));
  });
  await page.unroute('**/cache-fixture.html');
  await start(page, 'Pages离线同学');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const workerScope = await page.evaluate(
    async () => (await navigator.serviceWorker.getRegistration())!.scope,
  );
  expect(workerScope).toBe('http://localhost:4273/gamex-campus-desktop-2012/');
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.qq-profile strong')).toContainText('Pages离线同学');
  await page
    .getByRole('navigation', { name: '桌面快捷方式' })
    .getByRole('button', { name: '学习中心', exact: true })
    .click();
  await page.getByRole('button', { name: /温故知新/ }).click();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('gamex-campus-save-v1')!).state);
  expect(state.stats.study).toBe(1);
  expect(await page.evaluate(async () => (await caches.keys()).includes('gamex-other-project-fixture'))).toBe(
    true,
  );
  await context.setOffline(false);
});
