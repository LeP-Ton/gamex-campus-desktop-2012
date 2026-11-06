# 大学生桌面模拟器

## 项目定位

GameX 的离线校园生活模拟游戏，背景为 2012 年中国大学。React 18、TypeScript、Vite、Zustand，原创 Aero 桌面外观。浏览器 localStorage 保存完整状态，无服务端或外部模型依赖。

## 开发约定

- 回复、文档、代码注释使用中文，聊天回复采用递增的 `会话-N：` 前缀。
- 开始任务先检查 Git、读取 `.agentdocs/index.md` 和相关需求 README；实际代码修改必须归档至对应需求阶段记录。
- `.agentdocs` 保存需求和阶段记录，本文只保存长期规范；`CLAUDE.md` 引用本文。
- 引擎只接收状态和指令，不读取 DOM、localStorage、系统时间或 Math.random；所有世界随机性使用持久化的统一伪随机数状态。
- 所有活动、后台匹配、消息期限和 NPC 日程使用引擎中的同一分钟时钟。现实时间只用于存档元数据。
- UI 调用 store 指令，内容放在 `src/content`，规则放在 `src/engine` 与 `src/systems`；扩展学期时保留存档版本迁移入口。
- 图标和壁纸使用原创 SVG/CSS 与通用线性图标，不使用第三方游戏素材。

## 目录与运行

- `src/engine`：类型、确定性随机数、指令和存档校验。
- `src/systems`：课程、NPC、事件、竞技、结算规则。
- `src/content`：专业、课程、NPC、事件、题库、称号数据。
- `src/stores`：状态持久化与应用窗口。
- `src/components`：桌面、应用和角色创建界面。
- `src/tests`：引擎与策略测试；`e2e`：浏览器验收。
- `npm install`、`npm run dev`；`npm run build`；`npm test`；`npm run test:e2e`。
- 优先使用 `rg` 定向检索，先验证引擎再验证界面，不把构建通过当成人工验收。
