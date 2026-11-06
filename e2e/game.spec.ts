import { test, expect, type Page } from '@playwright/test';

async function start(page: Page, major = 'cs') {
  await page.goto('/');
  await page.getByRole('textbox', { name: '你的姓名' }).fill('南川同学');
  if (major === 'medicine') await page.getByRole('button', { name: /临床医学/ }).click();
  await page.getByRole('button', { name: '开启我的大学生活' }).click();
  await expect(page.locator('.qq-profile strong')).toContainText('南川同学');
}
async function open(page: Page, name: string) {
  if (page.viewportSize()!.width < 600) {
    await page.getByRole('button', { name: '打开开始菜单' }).click();
    await page.getByRole('textbox', { name: '查找校园程序' }).fill(name);
    await page.locator('.start-program-list').getByRole('button', { name, exact: true }).click();
  } else
    await page
      .getByRole('navigation', { name: '桌面快捷方式' })
      .getByRole('button', { name, exact: true })
      .click();
}
async function state(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('gamex-campus-save-v1')!).state);
}

test('入学界面和桌面视觉截图', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: '新生入学登记' })).toBeVisible();
  await page.screenshot({ path: 'artifacts/enrollment.png', animations: 'disabled' });
  await start(page);
  const qqBounds = await page.locator('.window-chat').boundingBox();
  expect(qqBounds!.x + qqBounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.screenshot({ path: 'artifacts/desktop.png', animations: 'disabled' });
  await page.getByRole('button', { name: '打开开始菜单' }).click();
  await page.screenshot({ path: 'artifacts/windows7-start.png' });
});

test('课程、作业、专业实验和刷新恢复', async ({ page }) => {
  await start(page);
  await open(page, '学习中心');
  await page.getByRole('button', { name: /完成本周作业/ }).click();
  let s = await state(page);
  expect(s.minute).toBe(570);
  expect(s.courses[0].lastHomework).toBe(0);
  await page.getByRole('button', { name: '编程实验室' }).click();
  await page.locator('.quiz-options button').nth(1).click();
  await page.getByRole('button', { name: '提交答案' }).click();
  s = await state(page);
  expect(s.stats.challenges).toBe(1);
  expect(s.minute).toBe(600);
  await page.reload();
  await expect(page.locator('.qq-profile strong')).toContainText('南川同学');
  expect((await state(page)).minute).toBe(600);
});

test('多窗口拖动、缩放、最大化、最小化与任务栏切换', async ({ page }) => {
  await start(page);
  await open(page, '课程表');
  await expect(page.locator('.aero-window')).toHaveCount(2);
  const win = page.getByRole('region', { name: '我的课程表' });
  const before = await win.boundingBox();
  const title = win.locator('.window-titlebar');
  const titleBox = await title.boundingBox();
  await page.mouse.move(titleBox!.x + 160, titleBox!.y + 15);
  await page.mouse.down();
  await page.mouse.move(titleBox!.x + 215, titleBox!.y + 45);
  await page.mouse.up();
  const moved = await win.boundingBox();
  expect(moved!.x).toBeGreaterThan(before!.x + 40);
  const grip = await win.getByRole('separator', { name: '调整窗口大小' }).boundingBox();
  await page.mouse.move(grip!.x + 8, grip!.y + 8);
  await page.mouse.down();
  await page.mouse.move(grip!.x + 28, grip!.y + 20);
  await page.mouse.up();
  expect((await win.boundingBox())!.width).toBeGreaterThan(moved!.width);
  await win.getByRole('button', { name: '最大化课程表' }).click();
  await expect(win).toHaveClass(/maximized/);
  await win.getByRole('button', { name: '最小化课程表' }).click();
  await expect(win).toHaveCount(0);
  await page.locator('.taskbar').getByRole('button', { name: '我的课程表', exact: true }).click();
  await expect(page.getByRole('region', { name: '我的课程表' })).toBeVisible();
});

test('聊天、独立会话和多维人物关系', async ({ page }) => {
  await start(page);
  await open(page, '腾讯QQ');
  await page.getByRole('button', { name: '与张浩然聊天' }).dblclick();
  const before = await state(page);
  await page.getByRole('button', { name: '认真回应' }).click();
  const s = await state(page);
  expect(s.minute).toBe(before.minute + 15);
  expect(s.npcs[0].trust).toBeGreaterThan(before.npcs[0].trust);
  await page.getByRole('button', { name: '人物关系与邀约' }).click();
  await page.getByRole('button', { name: /校园散步/ }).click();
  expect((await state(page)).npcs[0].shared).toBeGreaterThan(s.npcs[0].shared);
  await open(page, '腾讯QQ');
  await page.getByRole('button', { name: '与李维聊天' }).dblclick();
  await expect(page.locator('.app-chat')).toHaveCount(3);
  await page.screenshot({ path: 'artifacts/qq-2012-chat.png' });
});

test('匹配等待可聊天，三阶段比赛完整结算', async ({ page }) => {
  await start(page);
  await open(page, '英雄联盟');
  await page.getByRole('button', { name: /PLAY/ }).click();
  await page.getByRole('button', { name: '寻找对局' }).click();
  await open(page, '腾讯QQ');
  await page.getByRole('button', { name: '与张浩然聊天' }).dblclick();
  await page.getByRole('button', { name: '认真回应' }).click();
  await open(page, '英雄联盟');
  await page.getByRole('button', { name: '等待匹配完成' }).click();
  await page.getByRole('button', { name: '接受对局，准备上场' }).click();
  await page.screenshot({ path: 'artifacts/lol-battle-2012.png' });
  await open(page, '学习中心');
  const before = (await state(page)).minute;
  await page.getByRole('button', { name: /温故知新/ }).click();
  expect((await state(page)).minute).toBe(before);
  await page.getByRole('button', { name: '最小化学习中心' }).click();
  await page.getByRole('button', { name: /稳健补刀/ }).click();
  await page.getByRole('button', { name: /布置视野，再争资源/ }).click();
  await page.getByRole('button', { name: /保护核心，等待机会/ }).click();
  expect((await state(page)).stats.matches).toBe(1);
  await expect(page.locator('.last-match')).toBeVisible();
  await page.screenshot({ path: 'artifacts/game.png' });
  await open(page, '英雄联盟盒子');
  await expect(page.locator('.box-record-list')).toContainText('召唤师峡谷');
  await page.screenshot({ path: 'artifacts/lol-box.png' });
});

test('事件选择、兼职、论坛与日记均落入存档', async ({ page }) => {
  await start(page);
  await open(page, '我的校园');
  await page.getByRole('button', { name: /校园来信/ }).click();
  await page.locator('.event-letter').first().click();
  await page.locator('.event-options button').first().click();
  expect((await state(page)).stats.events).toBe(1);
  await open(page, 'Internet Explorer');
  await page.getByRole('button', { name: /查看岗位/ }).click();
  await page.getByRole('button', { name: '去做这份工作' }).first().click();
  expect((await state(page)).stats.earned).toBeGreaterThan(0);
  await open(page, '人人网');
  await page.getByRole('textbox', { name: '发布校园动态' }).fill('今天第一次在大学做兼职，真的很有意思。');
  await page.getByRole('button', { name: '发布状态', exact: true }).click();
  expect((await state(page)).posts.some((p: { author: string }) => p.author === 'player')).toBe(true);
  await open(page, '大学日记');
  await page.getByRole('button', { name: '写下今天' }).click();
  await page.getByRole('textbox', { name: '日记内容' }).fill('第一天，遇见了新室友。');
  await page.getByRole('button', { name: '保存这一天' }).click();
  expect((await state(page)).diary[0].text).toBe('第一天，遇见了新室友。');
});

test('两专业具有不同课程、特色题目和兼职', async ({ page }) => {
  await start(page, 'medicine');
  await open(page, '学习中心');
  await expect(page.getByRole('heading', { name: '人体解剖学基础' })).toBeVisible();
  await page.getByRole('button', { name: '医学学习室' }).click();
  await expect(page.locator('.challenge-card')).toContainText(/结构匹配|间隔记忆|基础病例/);
  await open(page, 'Internet Explorer');
  await page.getByRole('button', { name: /查看岗位/ }).click();
  await expect(page.locator('.job-list')).toContainText('实验室整理助理');
  await expect(page.locator('.job-list')).not.toContainText('宿舍电脑维修');
});

test('仅通过界面结束今天，可完成整个学期并查看六榜', async ({ page }) => {
  await start(page);
  let count = 0;
  while ((await state(page)).phase !== 'ended' && count++ < 60) {
    await page.locator('.sleep-gadget').click();
    await page.getByRole('button', { name: '关机睡觉，迎接新一天' }).click();
  }
  const s = await state(page);
  expect(s.phase).toBe('ended');
  expect(s.day).toBe(111);
  expect(s.result.scores).toHaveLength(5);
  await expect(page.locator('.semester-memo')).toBeVisible();
  await page.screenshot({ path: 'artifacts/semester.png' });
  await open(page, '风云榜');
  await expect(page.locator('.ranking-tabs button')).toHaveCount(6);
  await expect(page.locator('.app-rankings .data-table')).toContainText('南川同学');
});

test('小屏可创建角色并操作主应用，无页面横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await expect(page.locator('.qq-profile strong')).toContainText('南川同学');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await open(page, '学习中心');
  await page.getByRole('button', { name: /温故知新/ }).click();
  expect((await state(page)).minute).toBe(540);
  await page.screenshot({ path: 'artifacts/mobile.png' });
});

test('所有应用可打开，运行期间没有未捕获异常', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await start(page);
  for (const name of [
    '课程表',
    '学习中心',
    '腾讯QQ',
    '人人网',
    'Internet Explorer',
    '英雄联盟',
    '计算机',
    '大学日记',
    '教务系统',
    '风云榜',
    '控制面板',
    'QQ空间',
    '英雄联盟盒子',
    '回收站',
  ]) {
    await open(page, name);
    await expect(page.locator('.fatal-error')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test('导出完整存档，损坏文件导入不覆盖当前游戏', async ({ page }) => {
  await start(page);
  await open(page, '控制面板');
  const before = await state(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出存档', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('南川同学');
  await page.locator('input[type="file"]').setInputFiles({
    name: '损坏的存档.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"format":"bad"}'),
  });
  await expect(page.getByRole('alert')).toContainText('存档格式或版本不受支持');
  expect((await state(page)).runId).toBe(before.runId);
  expect((await state(page)).money).toBe(before.money);
});

test('人人网与QQ空间具有独立布局，发布和评论使用真实存档', async ({ page }) => {
  await start(page);
  await open(page, '人人网');
  await expect(page.locator('.renren-bluebar')).toContainText('人人网');
  await page.getByRole('textbox', { name: '发布校园动态' }).fill('大学的第一天，认识了新朋友。');
  await page.getByRole('button', { name: '发布状态', exact: true }).click();
  await page.screenshot({ path: 'artifacts/renren-2012.png' });
  await open(page, 'QQ空间');
  await expect(page.locator('.qzone-cover h1')).toHaveText('南川同学的空间');
  await page.getByRole('textbox', { name: 'QQ空间说说' }).fill('把这个秋天收藏进QQ空间。');
  await page.getByRole('button', { name: '发表说说' }).click();
  expect(
    (await state(page)).posts.some(
      (p: { category: string; text: string }) =>
        p.category === '空间说说' && p.text === '把这个秋天收藏进QQ空间。',
    ),
  ).toBe(true);
  await page.screenshot({ path: 'artifacts/qzone-2012.png' });
  await page.locator('.qzone-tabs').getByRole('button', { name: '相册', exact: true }).click();
  await expect(page.locator('.qzone-main')).toContainText('参与摄影');
});

test('旧版英雄大厅、英雄选择、盒子资料及本地资源均正常显示', async ({ page }) => {
  const failed: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().includes('/period-assets/')) failed.push(r.url());
  });
  await start(page);
  await open(page, '英雄联盟');
  await expect(page.locator('.lol-featured')).toContainText('寒冰射手');
  await page.screenshot({ path: 'artifacts/lol-lobby-2012.png' });
  await page.getByRole('button', { name: /PLAY/ }).click();
  await page
    .locator('.lol-hero-grid')
    .getByRole('button', { name: /黑暗之女/ })
    .click();
  await page.getByRole('button', { name: '寻找对局' }).click();
  expect((await state(page)).match.champion).toBe('Annie');
  expect((await state(page)).match.hero).toBe('法师');
  await open(page, '英雄联盟盒子');
  await page.getByRole('button', { name: '出装攻略', exact: true }).click();
  await expect(page.locator('.box-guides')).toContainText('无尽之刃');
  await page.screenshot({ path: 'artifacts/lol-box-guide.png' });
  await page.getByRole('button', { name: '工具设置', exact: true }).click();
  await page.getByRole('checkbox', { name: '显示野区与资源阶段提示' }).uncheck();
  expect(await page.evaluate(() => localStorage.getItem('gamex-box-hints'))).toBe('false');
  expect(failed).toEqual([]);
});

test('访问NPC的QQ空间不会把玩家日记显示成对方的公开日志', async ({ page }) => {
  await start(page);
  await open(page, '大学日记');
  await page.getByRole('button', { name: '写下今天' }).click();
  await page.getByRole('textbox', { name: '日记内容' }).fill('这是我自己的大学日记。');
  await page.getByRole('button', { name: '保存这一天' }).click();
  await open(page, '腾讯QQ');
  await page.getByRole('button', { name: '与许慕晚聊天' }).dblclick();
  await page.locator('.conversation-window').getByTitle('访问QQ空间', { exact: true }).click();
  const space = page.locator('.app-qzone');
  await expect(space.locator('.qzone-cover h1')).toHaveText('许慕晚的空间');
  await space.locator('.qzone-tabs').getByRole('button', { name: '日志', exact: true }).click();
  await expect(space.locator('.qzone-main')).toContainText('TA还没有发表公开日志');
  await expect(space.locator('.qzone-main')).not.toContainText('这是我自己的大学日记');
});
