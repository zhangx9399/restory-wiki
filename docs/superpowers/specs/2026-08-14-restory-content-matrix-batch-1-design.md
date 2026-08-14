# ReStory 首批内容矩阵设计方案

日期：2026-08-14

状态：用户已确认
适用阶段：公网 MVP 上线后的第一批内容扩展

## 1. 项目目标

在已经上线的 ReStory Wiki 三页 MVP 基础上，新增四个证据优先的英文精品页面，并把 Guide 导航页中对应的 `Coming next` 卡片改为真实链接：

1. Demo 指南：`/demo/`
2. 自定义展示区：`/guide/customize-display/`
3. 配置要求：`/system-requirements/`
4. 喷漆教程：`/guide/painting/`

四页完成后，首发清单的 12 个页面中将有 7 个页面可访问：首页、Guide 导航、清洁教程和本批四页。剩余五页继续保留 `Coming next`，不制造死链。

## 2. 内容策略

采用已确认的方案 B：证据优先的精品页批量生产。

- 每页目标正文长度为 900–1,300 个英文单词，不为凑字数重复内容。
- 页面开头直接回答主搜索问题，再展开步骤、限制和排查。
- A 级官方来源支撑发布日期、功能范围、最低配置和购买入口等确定事实。
- B 级完整实机或维护良好的资料页只用于交叉验证可见功能与使用场景。
- C 级玩家报告必须写成 `player report`、`community report` 或等价限定，不能包装成官方结论。
- 未找到可靠证据的按键、解锁条件、评分公式、推荐配置和存档继承结论不得编造。
- 每页显示最后核查日期，并在来源区说明版本或证据限制。

## 3. 共享页面结构

四页复用现有清洁教程的文章框架和 Warm Guide Hub 视觉系统：

1. 面包屑。
2. 文章类型、证据标签和最后核查日期。
3. 唯一 H1 与简短导语。
4. Quick Answer 提示框。
5. 只链接真实 H2 锚点的目录。
6. 按搜索意图组织的 H2/H3 正文。
7. 可见 FAQ。
8. Sources and Evidence Notes。
9. 相关文章与返回 Guide 的入口。

每页具有独立的 title、description、canonical、Open Graph、Article、BreadcrumbList 和 FAQPage 结构化数据。可见 FAQ 与 FAQPage JSON-LD 使用同一份数据，避免内容漂移。

## 4. 页面设计

### 4.1 Demo 指南 `/demo/`

**搜索意图**：Demo 在哪里下载、包含什么、与正式版有什么不同、进度是否继承。

**页面标题**：`ReStory Demo Guide — Download, Content & Full Game`

**H1**：`ReStory Demo Guide`

**Meta description**：`Learn where to download the ReStory demo, what it includes, how it differs from the full game, and what is known about demo save progress.`

正文结构：

1. `Where to Download the ReStory Demo`
2. `What the Demo Includes`
3. `ReStory Demo vs Full Game`
4. `Does Demo Progress Carry Over?`
5. `Demo Requirements and Known Limits`
6. `Frequently Asked Questions`
7. `Sources and Evidence Notes`

证据边界：Demo 上线日期、Steam App ID、功能范围和正式版新增内容使用官方来源。存档继承只能表述为玩家报告与尚无同等级官方确认，不给出保证。

### 4.2 自定义展示区 `/guide/customize-display/`

**搜索意图**：改变店铺墙面、货架、储物和装饰，并区分店铺装修与设备喷漆。

**页面标题**：`How to Customize Your Shop in ReStory`

**H1**：`How to Customize Your Shop in ReStory`

**Meta description**：`Understand ReStory shop customization, including walls, shelf styles, storage, decorations, and how shop changes differ from gadget painting.`

正文结构：

1. `Shop Customization vs Gadget Painting`
2. `What You Can Customize`
3. `Walls, Shelves, and Storage`
4. `Adding and Arranging Decorations`
5. `Customization Tips and Version Notes`
6. `Frequently Asked Questions`
7. `Sources and Evidence Notes`

证据边界：官方来源确认墙面、货架、储物架和装饰功能存在；完整实机只用于交叉验证场景。没有可靠来源支持的具体按键、菜单路径和解锁等级不写成事实。

### 4.3 配置要求 `/system-requirements/`

**搜索意图**：确认电脑能否运行游戏，并在掉帧时获得安全的设置建议。

**页面标题**：`ReStory System Requirements — Can Your PC Run It?`

**H1**：`ReStory System Requirements`

**Meta description**：`Check ReStory's official minimum PC requirements, storage and DirectX needs, and version-labeled VSync and frame-rate troubleshooting advice.`

正文结构：

1. `Official Minimum System Requirements`
2. `Can Your PC Run ReStory?`
3. `Storage, DirectX, and Windows Support`
4. `VSync and Frame-Rate Troubleshooting`
5. `What Is Not Officially Confirmed`
6. `Frequently Asked Questions`
7. `Sources and Evidence Notes`

证据边界：最低配置逐项引用 Steam。旧构建的 VSync 与 30/60 FPS 建议明确标注版本。没有官方推荐配置时，页面必须明确说明 `recommended specifications are not officially published`，不得自行补齐一套参数。

### 4.4 喷漆教程 `/guide/painting/`

**搜索意图**：获得 Airbrush 和调色板，理解喷漆用途并处理图案订单。

**页面标题**：`ReStory Painting Guide — Airbrush & Color Palettes`

**H1**：`ReStory Painting Guide`

**Meta description**：`Learn what the Airbrush and color palettes do in ReStory, how painting differs from shop customization, and which painting details remain unconfirmed.`

正文结构：

1. `What Painting Does in ReStory`
2. `Getting the Airbrush and Color Palettes`
3. `Painting a Customer Device`
4. `Pattern Orders and Custom Designs`
5. `Known Limits and Unconfirmed Details`
6. `Frequently Asked Questions`
7. `Sources and Evidence Notes`

证据边界：官方来源确认 Airbrush、颜色调色板、设备外观和社区设计。实机与玩家讨论只支持存在指定图案订单。撤销方式、覆盖范围、颜色消耗和评分公式没有可靠证据时必须保留为未确认项。

## 5. 导航与内链

- Guide 页四张对应卡片从 `coming-next` 改为 `published` 并指向真实 URL。
- 首页 Start Here 的 Demo 与 Customize 卡片改为可点击。
- 顶部导航将 Demo 指向 `/demo/`，System Requirements 指向 `/system-requirements/`。
- 四篇新文章均链接 Guide、清洁教程和至少两个相关新页面。
- Demo 与配置要求互相链接；自定义展示区与喷漆教程互相链接。
- 剩余出售、处理多余设备、Atari joystick、Missing joystick 和类似游戏继续显示 `Coming next`，不添加空 URL。

## 6. 技术边界

- 继续使用 Next.js App Router、TypeScript、MDX 和现有 CSS，不引入 CMS、数据库或新 UI 框架。
- 每篇正文放入独立 MDX 文件；路由文件负责 metadata、面包屑、目录、FAQ、相关文章和 JSON-LD。
- 共用文章数据只在能消除 FAQ 或来源重复时提取，避免为四页建立过度抽象的内容系统。
- 现有清洁页面行为、GA4、Search Console verification、sitemap 和 robots 不得回归。
- `SITE_URL` 继续决定生产 canonical、Open Graph 和结构化数据中的绝对网址。

## 7. 测试与验收

每页必须通过以下自动化和真实页面检查：

- 路由可渲染且只有一个 H1。
- title、description、canonical 和 Open Graph 与设计一致。
- Article、BreadcrumbList 和 FAQPage JSON-LD 可解析，关键字段与页面内容一致。
- Quick Answer 位于首个 H2 之前。
- 目录中的每个锚点在正文中存在且唯一。
- H2/H3 层级不跳级。
- FAQ 可见内容与结构化数据逐项一致。
- 来源链接可访问，玩家证据具有明确限定词。
- Guide 与首页只把真实存在的路由标为可点击。
- 360–390px 移动视口无横向溢出，桌面布局无明显错位。
- 全量测试、类型检查、lint、production build 和 live SEO checker 通过。
- 公网部署完成后，首页、Guide、清洁页和四个新路由均返回 HTTP 200。

## 8. 发布策略

四页在同一隔离分支中按页面逐一完成并测试，全部通过后再合并并非强制推送到 GitHub `main`，由 Vercel 自动部署。上线后立即检查真实 canonical、站内链接、sitemap 路由数量和 GA4 页面浏览事件。

若某页在写作时发现关键事实缺少可靠来源，该页不得用推测补齐。优先缩小断言范围并保留证据说明；只有在页面无法解决核心搜索意图时，才暂停该页并报告阻塞。

## 9. 非目标

本批不制作出售教程、处理多余设备、Atari joystick 维修、Missing joystick 修复或类似游戏页面；不增加多语言、站内搜索、评论、登录、广告、后台或数据库；不复制游戏官方图片和其他攻略站文字。

## 10. 已确认决定

- 采用方案 B：证据优先的精品页批量生产。
- 首批页面为 Demo、自定义展示区、配置要求和喷漆教程。
- 每页目标 900–1,300 个英文单词。
- 使用现有文章模板和视觉系统。
- 所有页面完成自动与真实浏览器验收后再统一部署。
