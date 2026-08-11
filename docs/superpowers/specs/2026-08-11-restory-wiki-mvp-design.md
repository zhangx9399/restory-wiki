# ReStory Wiki 三页 MVP 设计方案

日期：2026-08-11  
状态：待用户书面确认  
适用关卡：AI 游戏站出海训练营第四关

## 1. 项目目标

为 `ReStory: Chill Electronics Repairs` 制作一个纯英文、非官方的游戏攻略站 MVP，并在本地浏览器完成第四关验收。

首版只制作三个可访问页面：

1. 首页：`/`
2. Guide 导航页：`/guide/`
3. 清洁教程：`/guide/how-to-clean/`

三页验证通过后，再复用同一套页面模板扩展第二关确定的其余九个首发页面。

## 2. 验收目标

MVP 必须同时满足：

- 网站能够在本地启动和访问。
- 首页、Guide 导航页和清洁教程可以通过站内链接互相访问。
- 每页具有独立的 HTML `title` 和 meta description。
- 每页只有一个 H1。
- 正文按 H2、H3 形成正确层级，不跳级表达主要结构。
- AITDK Overview 可以识别 title、description 和标题层级。
- 桌面端与移动端均无空白页面、明显错位或文字溢出。
- 生产构建成功。

## 3. 非目标

本轮不做：

- 中文或其他语言版本。
- 域名购买、Cloudflare 配置和线上部署。
- 全部 12 个首发页面。
- 登录、评论、搜索、后台或数据库。
- 复制参考站的文字、图片、Logo 或品牌素材。
- 发布没有可靠证据支持的游戏操作步骤。

## 4. 设计方向

采用已确认的方案 C：`Warm Guide Hub`。

该方向把成熟攻略站的信息结构与 ReStory 的温暖维修店气质结合：

- 暖黄色用于导航和主要识别元素。
- 米白色作为页面背景。
- 复古青绿色用于主按钮和重要链接。
- 珊瑚红作为少量强调色。
- 卡片布局用于快速扫描，正文区域保持安静、易读。

首版采用项目自产 Favicon、CSS 图形和非侵权的装饰元素，不直接复制游戏官方图片。页面明显标注 `Fan-Made Guide`，页脚加入非官方免责声明。

## 5. 信息架构

### 5.1 全站导航

桌面端顶部导航包含：

- Guides → `/guide/`
- Demo → 暂不提供死链接，可在首页内容区显示为后续页面
- Repairs → 指向 `/guide/` 的 Repair 分类区域
- System Requirements → 暂不提供死链接，可标记为后续页面
- Play on Steam → 官方 Steam 商店外链

移动端折叠为菜单按钮，保留首页、Guide、清洁教程和 Steam 外链。

### 5.2 首页 `/`

首页模块顺序：

1. 顶部导航。
2. Hero：`Fan-Made Repair Guide`、一个 H1、简介、Guide 主按钮、Repair 次按钮、Steam 外链。
3. Start Here：Beginner Guide、Demo vs Full Game、How to Clean、Customize Your Shop 四张卡片。
4. 分类标签：Beginner、Repair、Shop、Troubleshooting。首版标签在同一页面切换可见内容，不产生无效 URL。
5. About the Game：解释维修、清洁、店铺经营和客户选择。
6. Quick Facts：开发商、发行商、发布日期、标准价格、主线时长和平台。
7. FAQ：回答游戏是什么、在哪里购买、是否为官方网站等基础问题。
8. 结尾 CTA 与页脚免责声明。

首页只将已经完成的 Guide 和清洁教程设为可点击站内入口。未完成页面显示 `Coming next`，不伪装成可用链接。

### 5.3 Guide 导航页 `/guide/`

页面模块顺序：

1. 面包屑。
2. H1：`ReStory Guides`。
3. 新手阅读顺序说明。
4. 分类区域：Getting Started、Repair & Cleaning、Shop & Customization、Technical Help。
5. 已完成的清洁教程卡片正常链接。
6. 其余计划页面以 `Coming next` 状态展示，避免死链。
7. 来源与内容政策说明。

Guide 页是导航页，不写成一篇冗长的万能攻略。

### 5.4 清洁教程 `/guide/how-to-clean/`

页面模块顺序：

1. 面包屑。
2. 文章类型和最后核查日期。
3. H1：`How to Clean Items in ReStory`。
4. 开头直接回答：需要把对应部件放入正确清洁区域并进入清洁交互；不同部件和异常状态需要分别判断。
5. Quick Answer 提示框。
6. H2：`How Cleaning Works in ReStory`。
7. H2：`Cleaning the First Pokia Device`。
8. H2：`Using the Correct Workbench Area`。
9. H2：`Why Dirt Is Not Disappearing`，其下使用 H3 展开交互、输入和 UI/Bug 排查。
10. H2：`Cleaning Troubleshooting Checklist`。
11. H2：`Frequently Asked Questions`。
12. 证据说明、来源链接和相关文章入口。

内容必须区分：

- 官方确认：清洁属于游戏核心维修流程。
- 玩家验证线索：把脏部件拖到工作台右上方的杯子/清洁位置并进入刷洗交互。
- 玩家报告或可能的 Bug：有声音但污渍不消失、输入异常、清洁区域越界。

不得把玩家经验写成官方保证，也不得声称某个排查方法一定有效。

## 6. SEO 设计

### 6.1 首页

- Title：`ReStory Wiki — Guides, Demo & Repair Tips`
- Description：`Explore ReStory: Chill Electronics Repairs guides, demo details, system requirements, repair walkthroughs, customization tips, and troubleshooting help.`
- H1：`ReStory: Chill Electronics Repairs Guides`

### 6.2 Guide 导航页

- Title：`ReStory Guides — Beginner, Repair & Shop Help`
- Description：`Browse ReStory guides for beginners, cleaning, repairs, shop management, customization, system requirements, and common troubleshooting questions.`
- H1：`ReStory Guides`

### 6.3 清洁教程

- Title：`How to Clean Items in ReStory — First Device Guide`
- Description：`Learn how cleaning works in ReStory, where to place dirty parts, how to clean the first Pokia device, and what to check when dirt will not disappear.`
- H1：`How to Clean Items in ReStory`

每页还包括：

- 唯一 canonical URL。
- Open Graph 基础元数据。
- 首页的 WebSite 与 FAQ 结构化数据。
- Guide 页的 CollectionPage 与 BreadcrumbList 结构化数据。
- 清洁教程的 Article、BreadcrumbList 与 FAQPage 结构化数据。
- 语义化 `header`、`nav`、`main`、`article`、`aside` 和 `footer`。

## 7. 技术架构

采用：

- Next.js App Router。
- TypeScript。
- Tailwind CSS。
- MDX 管理攻略正文。
- 静态页面优先，不引入数据库。

建议目录职责：

- `app/`：路由、布局和页面元数据。
- `components/`：导航、Hero、卡片、FAQ、面包屑、文章目录、页脚等可复用组件。
- `content/`：MDX 攻略正文与来源注释。
- `data/`：导航和页面卡片配置。
- `public/`：现有 Favicon 和项目自产静态资源。

首版不加入多语言依赖，避免无用复杂度。后续确认需要国际化时再设计语言路由。

## 8. 内容来源

网站内容以现有文件为事实来源：

- `第二关-内页矩阵/SERP竞争与最终首发清单.md`
- `第三关-游戏信息与素材/首页基础信息.md`
- `第三关-游戏信息与素材/关键词素材.md`
- `第三关-游戏信息与素材/素材索引.json`
- `第三关-游戏信息与素材/正式版补证记录.md`

页面生成时保留来源等级与版本提醒；折扣、评价和玩家数量等时效数据不写死为长期事实。

## 9. 响应式与可访问性

- 以 360px 移动端宽度作为最低检查基准。
- 导航可用键盘操作，移动菜单具有清晰的可访问名称。
- 标签切换使用正确的 tab 语义和焦点状态。
- 文字与背景保持足够对比度。
- 不依赖颜色单独表达 `Coming next`、来源等级或警告。
- 外部链接明确标识并安全打开。

## 10. 测试与验收流程

1. 安装依赖并启动本地开发服务器。
2. 在浏览器访问三个页面并逐一点击导航。
3. 在桌面宽度和约 360px 移动宽度检查布局。
4. 检查每页 title、description、canonical、H1 数量和 H2/H3 顺序。
5. 检查结构化数据可解析。
6. 使用 AITDK Overview 复核 title、description 和标题层级。
7. 运行 lint、类型检查和生产构建。
8. 修复所有阻碍第四关验收的问题后再扩展其他页面。

## 11. 风险与处理

- 参考站复制风险：只借鉴结构，不复制文字、品牌和素材。
- 官方素材版权不确定：首版不用官方图片作为站点主视觉。
- 清洁步骤证据等级不一致：页面明确标注官方事实和玩家报告。
- 未完成页面导致死链：使用不可点击的 `Coming next` 状态。
- SEO 标题层级被组件破坏：页面模板约束一个 H1，并在验收脚本中检查。
- 首版范围膨胀：通过三页 MVP 后再批量扩展。

## 12. 已确认的关键决定

- 纯英文首版。
- 三页 MVP 先验收。
- 采用 Warm Guide Hub 视觉方向。
- 首个攻略内页为清洁教程。
- Next.js + TypeScript + Tailwind CSS + MDX。
- 本轮目标是本地通过，暂不部署线上。
