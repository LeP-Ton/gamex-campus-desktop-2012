# 大学生桌面模拟器

## 项目定位

GameX 的离线校园生活模拟游戏，背景为 2012 年中国大学。React 18、TypeScript、Vite、Zustand，以 Windows 7 和 2012 年真实软件为视觉基准。浏览器 localStorage 保存完整状态，无服务端或外部模型依赖。

## 开发约定

- 回复、文档、代码注释使用中文，聊天回复采用递增的 `会话-N：` 前缀。
- 开始任务先检查 Git、读取 `.agentdocs/index.md` 和相关需求 README；实际代码修改必须归档至对应需求阶段记录。
- `.agentdocs` 保存需求和阶段记录，本文只保存长期规范；`CLAUDE.md` 引用本文。
- 引擎只接收状态和指令，不读取 DOM、localStorage、系统时间或 Math.random；所有世界随机性使用持久化的统一伪随机数状态。
- 所有活动、后台匹配、消息期限和 NPC 日程使用引擎中的同一分钟时钟。现实时间只用于存档元数据。
- UI 调用 store 指令，内容放在 `src/content`，规则放在 `src/engine` 与 `src/systems`；扩展学期时保留存档版本迁移入口。
- 桌面与应用按 2012 年真实软件还原：Windows 7、QQ2012、QQ空间、人人网、英雄联盟旧客户端和多玩盒子。不要替换成现代统一卡片设计。
- 历史图像与游戏资源保存在 `public/period-assets`，来源记录在 `docs/2012界面参考与素材.md`。运行时不加载第三方 CDN，新增资源需纳入生产离线缓存。
- 真实软件和 Windows 系统图标直接使用原始资源，不以简化 SVG 或生成图代替；图标清单记录源地址、摘要和原生分辨率。ICO 按同尺寸最高色深提取，避免选到低色深兼容帧。
- `src/components/apps/PeriodSocial.tsx`、`PeriodGames.tsx` 与 `src/period.css` 管理历史软件界面；已有游戏规则与存档兼容性保持独立。

## 目录与运行

- `src/engine`：类型、确定性随机数、指令和存档校验。
- `src/systems`：课程、NPC、事件、竞技、结算规则。
- `src/content`：专业、课程、NPC、事件、题库、称号数据。
- `src/stores`：状态持久化与应用窗口。
- `src/components`：桌面、应用和角色创建界面。
- `src/tests`：引擎与策略测试；`e2e`：浏览器验收。
- `npm install`、`npm run dev`；`npm run build`；`npm test`；`npm run test:e2e`。
- 优先使用 `rg` 定向检索，先验证引擎再验证界面，不把构建通过当成人工验收。
