# ReStory Wiki 第五关公网部署设计

日期：2026-08-13

## 1. 目标与范围

按照训练营第五关要求，把当前 ReStory Wiki 从只能本地访问的网站变成可公开访问、可采集真实数据的线上网站。

本轮采用新手路线：先使用 Vercel 免费默认域名完成上线，不购买或绑定独立域名。最终必须获得可公开访问的生产链接，并接入 Google Analytics 4（GA4）和 Google Search Console（GSC）。

本轮范围包括：

- 为全站加入可选的 GA4 统计代码。
- 让 canonical、Open Graph、结构化数据、sitemap 和 robots 使用真实公网地址。
- 生成并验证 `/sitemap.xml` 和 `/robots.txt`。
- 将 GitHub 公开仓库连接到 Vercel，并生产部署 `main` 分支。
- 获得 Vercel 公网地址后创建 GA4 Web 数据流，回填测量 ID 并重新部署。
- 验证 GA4 能接收实时访问。
- 在 GSC 中验证网站、提交 sitemap，并请求首页索引。
- 检查电脑端、手机端、HTTPS 和基础 SEO。
- 整理第五关作业所需的链接、截图和复盘文案。

暂不包括：

- 购买独立域名。
- Cloudflare DNS 配置。
- 广告接入或第六关的数据迭代。
- 新增更多游戏内容页面。

## 2. 采用方案及流程

采用“先补上线基础，再生产部署”的方案。

正确执行顺序：

1. 代码先支持 `SITE_URL` 和 `NEXT_PUBLIC_GA_ID`。
2. 增加 sitemap、robots 和 GA 全站组件，并完成本地测试。
3. 将代码提交并同步到 GitHub。
4. 连接 Vercel，生产部署 `main`，获得默认公网域名。
5. 在 GA4 中以该公网域名创建 Web 数据流，取得 `G-XXXXXXXXXX` 测量 ID。
6. 将 `SITE_URL` 与 `NEXT_PUBLIC_GA_ID` 写入 Vercel 环境变量，重新生产部署。
7. 验证公网三页、sitemap、robots、canonical、HTTPS 和 GA4 实时数据。
8. 在 GSC 中添加网站资源，完成验证、提交 sitemap、检查网址并请求首页索引。
9. 用电脑和手机各访问一次，整理第五关作业资料。

这一顺序与教程的核心要求一致，并避免在网站尚未公开可访问时提前做 GSC 验证。

## 3. 技术设计

### 3.1 站点公网地址

新增统一的站点地址解析逻辑：

- 生产环境优先读取 `SITE_URL`。
- 若没有显式配置，可读取 Vercel 提供的域名变量并补成 HTTPS 地址。
- 本地开发回退为 `http://localhost:3000`。
- 对地址做格式校验、去除末尾斜杠，避免生成重复斜杠或非法 URL。

页面 metadata、canonical、Open Graph、Article schema、Breadcrumb schema、sitemap 和 robots 必须共享同一个解析结果，不能各自写死域名。

### 3.2 Google Analytics 4

在根布局中挂载一个独立 GA 组件：

- 从 `NEXT_PUBLIC_GA_ID` 读取测量 ID。
- ID 存在且格式有效时加载 Google tag，并初始化 `gtag`。
- ID 不存在时不输出统计脚本，网站仍可正常构建和浏览。
- 组件挂在根布局，确保首页、导航页和所有内页都会统计。

真实测量 ID 只配置在 Vercel 环境变量中，不提交到 Git 仓库。

### 3.3 Sitemap 与 Robots

使用 Next.js Metadata Route 生成：

- `/sitemap.xml`：至少包含首页、Guide 导航页和 Cleaning Guide 内页，并使用正式公网绝对地址。
- `/robots.txt`：允许正常搜索引擎抓取，并声明正式 sitemap 地址。

两者都必须由统一站点地址函数生成，防止残留 `localhost` 或未来复制模板时出现旧域名。

### 3.4 Vercel 部署

- 来源仓库：`https://github.com/zhangx9399/restory-wiki`。
- 框架由 Vercel 自动识别为 Next.js。
- 生产分支：`main`。
- 初次部署获得 Vercel 默认域名。
- 获得域名后配置生产环境变量：
  - `SITE_URL=https://<vercel-domain>`
  - `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
- 环境变量变更后重新生产部署。

## 4. 数据流

访问者打开 Vercel 公网地址后：

1. Next.js 输出正确的页面内容和 SEO metadata。
2. 浏览器加载根布局中的 GA tag，把匿名访问事件发送到 GA4。
3. Google 爬虫通过 robots 找到 sitemap。
4. sitemap 提供三个正式页面的公网 URL。
5. GSC 汇总收录、展示、点击和抓取问题；GA4 汇总访问与页面行为。

## 5. 错误处理与安全边界

- 缺少 GA ID 时不阻断部署，只是不加载 GA；最终验收前必须补齐。
- 非法 `SITE_URL` 或非法 GA ID 应在测试或构建阶段暴露，避免静默生成错误 metadata。
- 不把 Google 账号密码、验证码或其他登录凭证写入代码或文档。
- Google、Vercel 的登录、验证码、授权确认由用户本人完成；自动化只继续处理用户明确授权后的步骤。
- 不关闭 HTTPS 或证书校验来规避网络错误。

## 6. 测试与验收

代码验收：

- GA ID 有值时输出正确脚本，无值时不输出。
- 站点地址在本地与生产变量下分别生成正确绝对 URL。
- sitemap 包含三个已发布页面，且没有 localhost。
- robots 允许抓取并指向正确 sitemap。
- 现有单元测试、类型检查、lint 和生产构建全部通过。

公网验收：

- 首页、导航页、Cleaning Guide 内页均返回成功并可浏览。
- `/sitemap.xml` 和 `/robots.txt` 可公开访问。
- 每页 title、description、唯一 H1、canonical 和结构化数据正确。
- 浏览器地址为 HTTPS。
- GA4 实时报告能看到一次实际访问。
- GSC 验证成功，sitemap 提交成功，并已请求首页索引。
- 电脑和手机均完成实际访问测试。

## 7. 第五关作业资料

最终资料包包括：

- 网站线上链接。
- Vercel 部署成功截图。
- GSC 验证成功或 sitemap 已提交截图。
- GA4 已接入并能记录访问的截图。
- 电脑端和手机端线上页面截图。
- 本关最大收获、卡点及解决方法的复盘文案。
