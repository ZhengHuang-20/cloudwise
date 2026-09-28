# 云端智荐 · 设计规范

> 版本 1.0 · 2026-09
> 基准：apple.com 深色产品页的视觉语言 + Apple Human Interface Guidelines，针对简体中文排版与 B2B 出海售前场景做了取舍。
> 实现：token 与组件类在 `src/index.css`，React 基础组件在 `src/components/ui/`。**本文档与这两处代码必须保持一致；改其一，同步改其余。**

---

## 0. 十条铁律（速查）

1. **一屏一事。** 每个章节只讲一件事：一个标题、一段导语、最多两个行动按钮。
2. **蓝色只属于交互。** `link` 与 `accent` 只用于按钮、链接、焦点、选中态。强调靠白色和字重，不靠蓝色。
3. **层级靠字号和灰度，不靠框。** 卡片内部用留白和分隔线组织信息，最多嵌套一层（`tile` → `well`）。
4. **平面优先。** 卡片是纯色 `surface`，不加描边、阴影和渐变。毛玻璃材质只给悬浮层用。
5. **只用 token。** 颜色、字号、圆角、缓动一律取自 `@theme`。不在组件里写 hex，也不写 `text-[13px]`。
6. **最小字号 14px**（`text-caption`）。层级靠颜色对比拉开，不靠把字缩小。
7. **数字用 `tabular-nums`，不用等宽字体。** 等宽字体只用于代码、SQL、URL 和密钥输入。
8. **按钮不带图标**（加载、下载、复制、发送除外）。文案以动词开头，不超过 8 个字。
9. **可点击的一定是 `<button>` 或 `<a>`**，并且有可见的焦点环。弹窗一律用 `Dialog`。
10. **文案全部用中文。** 不写英文大写眉标，不加装饰性的英文括注，不用 emoji 和感叹号。

---

## 1. 设计原则

| 原则 | 含义 | 在本站的落地 |
| --- | --- | --- |
| **内容为先** Deference | 界面退后，让内容和数据说话 | 纯黑画布、平面卡片、无装饰光晕；大数字和结论优先展示 |
| **清晰** Clarity | 每个元素只有一种解读 | 统一的 8 级字号阶梯；状态色只表达状态；按钮文案说清结果 |
| **层次** Depth | 用层级和动效表达空间关系 | 画布 → 卡片 → 内嵌块三级表面；弹窗从底部/中心浮起 |
| **克制** Restraint | 能删就删 | 每屏最多一个主按钮；全站只保留一处签名渐变 |
| **一致** Consistency | 同样的事永远用同样的方式做 | 同一组件、同一 token、同一文案语气；服务识别色全站一致 |
| **人人可用** Accessibility | 无障碍是底线，不是加分项 | AA 对比度、键盘可达、`aria` 语义、尊重减少动效设置 |

**适用对象**：出海企业的老板、外贸总监、IT 负责人。他们时间少、决策重，所以界面要让人第一眼抓到结论，第二眼看到依据，第三眼知道下一步点哪里。

---

## 2. 设计 Token

### 2.1 颜色（仅深色模式）

**表面层级**：同一时间最多出现三层。

```
canvas  #000000   页面画布
 └─ surface  #1d1d1f   tile / card（悬停 #242426）
     └─ surface-raised  #2c2c2e   well：卡片内的分组、指标块、聊天气泡
```

| Token | 值 | Tailwind 类 | 用途 |
| --- | --- | --- | --- |
| `canvas` | `#000000` | `bg-canvas` | 页面背景、移动端菜单 |
| `surface` | `#1d1d1f` | `bg-surface` | tile、card、弹窗面板 |
| `surface-hover` | `#242426` | `hover:bg-surface-hover` | 可点击卡片的悬停态 |
| `surface-raised` | `#2c2c2e` | `bg-surface-raised` | well、AI 回复气泡 |
| `separator` | `#38383a` | `border-separator` / `divide-separator` | 分隔线 |
| `separator-strong` | `#48484a` | `border-separator-strong` | 输入框描边、滑块轨道、引用竖线 |
| `hairline` | `rgb(255 255 255 / .1)` | `border-hairline` | 悬浮材质（导航、浮动按钮、Toast）的描边 |
| `label` | `#f5f5f7` | `text-label` | 主文字、标题 |
| `label-secondary` | `#a1a1a6` | `text-label-secondary` | 正文辅助、说明、元信息 |
| `label-tertiary` | `#6e6e73` | `text-label-tertiary` | **仅限**占位符、禁用态、装饰性箭头 |
| `link` | `#2997ff` | `text-link` | 文字链接、描边按钮、焦点环 |
| `accent` | `#0071e3` | `bg-accent` | 主按钮、用户消息气泡、选中描边 |
| `accent-hover` / `accent-active` | `#0077ed` / `#006edb` | — | 主按钮的悬停与按下 |
| `fill` / `fill-hover` | `rgb(118 118 128 / .24 / .34)` | `bg-fill` | chip、分段控件轨道、中性按钮、图标按钮 |
| `thumb` | `#636366` | — | 分段控件的选中滑块 |

**对比度**（WCAG 2.1，已核算）：

| 前景 / 背景 | canvas | surface | surface-raised |
| --- | --- | --- | --- |
| `label` #f5f5f7 | 19.2 : 1 | 15.5 : 1 | 12.8 : 1 |
| `label-secondary` #a1a1a6 | 8.2 : 1 | 6.6 : 1 | 5.4 : 1 |
| `link` #2997ff | 6.9 : 1 | 5.5 : 1 | — |
| `label-tertiary` #6e6e73 | 4.1 : 1 ✗ | 3.3 : 1 ✗ | ✗ |
| 白字 / `accent` #0071e3 | 4.7 : 1 | | |

`label-tertiary` 达不到 AA，所以不能承载任何必读信息。

**状态色**：只表达状态，不做装饰。

| Token | 值 | 语义 |
| --- | --- | --- |
| `success` | `#30d158` | 健康、已完成、正向增长、已提及 |
| `warning` | `#ff9f0a` | 需关注、中等风险、误区提示 |
| `danger` | `#ff453a` | 断点严重、流失金额、错误、未提及 |

**分数 → 颜色**：唯一的映射写在 `ui/tone.ts`，不要在组件里另写一套。

| 分数 | 颜色 | 含义 |
| --- | --- | --- |
| ≥ 75 | `success` | 健康 |
| 50 – 74 | `warning` | 需关注 |
| < 50 | `danger` | 断点严重 |

状态徽标写法：`badge bg-success/15 text-success`（背景用同色 15% 透明度）。

**服务识别色**：`ui/serviceIdentity.ts` 集中定义。**只用在图标和小色点上**，不用于文字、按钮或大面积背景。

| 服务 | 代号 | 图标 | Token | 值 |
| --- | --- | --- | --- | --- |
| 海外独立站 | A | Globe | `svc-site` | `#64d2ff` |
| 外贸 SEO | B | Search | `svc-seo` | `#7d7aff` |
| 出海 GEO | C | Sparkles | `svc-geo` | `#bf5af2` |
| AI 智能客服 | D | Bot | `svc-chat` | `#30d158` |
| FDE 驻场 | E | Users | `svc-fde` | `#ff9f0a` |

**签名渐变**：`.text-gradient-ai`（蓝 → 紫 → 粉 → 橙），**全站只用一处**，即首页 Hero 的“让 AI 替你接住生意”。其他地方不再使用渐变文字、渐变背景或发光。

### 2.2 字体

**字体栈**（`--font-sans`）：`-apple-system` → SF Pro SC / SF Pro → **PingFang SC** → Hiragino Sans GB → Helvetica Neue → **Microsoft YaHei** → Arial。

- 不加载任何 Web 字体。Google Fonts 在中国大陆无法稳定访问，而系统字体在 Apple 设备上就是 SF Pro 与苹方，在 Windows 上是微软雅黑，这正是我们要的效果。
- `<html lang="zh-CN">` 必须保留，浏览器靠它选中文字形，读屏软件靠它选中文发音。

**字号阶梯**：通过 `@theme` 的 `--text-*` 生成，每个类自带行高、字重、字距。标题字号用 `clamp()` 随视口连续缩放，不用写断点。

| 类 | 移动 → 桌面 | 行高 | 字重 | 用途 |
| --- | --- | --- | --- | --- |
| `text-display` | 40 → 80px | 1.06 | 600 | **仅首页 Hero** |
| `text-headline` | 32 → 56px | 1.1 | 600 | 页面 H1、首页章节标题、关键大数字 |
| `text-title-1` | 28 → 40px | 1.12 | 600 | 大卡片标题、指标大数字 |
| `text-title-2` | 24 → 28px | 1.2 | 600 | 卡片标题、区块标题 |
| `text-title-3` | 21px | 1.3 | 600 | 小卡片标题、面板标题、弹窗标题 |
| `text-intro` | 19 → 21px | 1.52 | 400 | 标题下的导语、重点结论 |
| `text-body` | 17px | 1.6 | 400 | 正文、按钮、表单输入、列表 |
| `text-caption` | 14px | 1.45 | 400 | 元信息、标签、脚注、徽标（**全站最小字号**） |

`.eyebrow`（17 → 21px，600，`label-secondary`）用于标题上方的小标题。

**字重只用两档**：400（正文）与 600（`font-semibold`，标题和强调）。不用 500、700 及以上。

**中文排版规则**

- 字距为 0，仅 `text-display` / `text-headline` 自带 -0.015em / -0.005em 的轻微收紧。不再用 `tracking-*`。
- 中文与英文、数字之间加一个半角空格（`AI 客服`、`60 组`），数字与单位之间也加（`8 ~ 12 周`、`30 分钟`）。
- 使用全角标点。区间用 `~`，并列用 `·` 或 `、`。
- 标题默认启用 `text-wrap: balance`。如果长标题在词组中间断行，就把词组包进 `<span className="inline-block">`，让它只在词组之间换行：

  ```tsx
  <h2 className="text-headline">
    <span className="inline-block">见销售之前，</span>
    <span className="inline-block">先看清问题与方案。</span>
  </h2>
  ```

- 导语段落宽度不超过 `max-w-2xl`（约 32 个汉字每行）。
- 不用斜体（中文没有真斜体，会被机械倾斜），不用全大写。

### 2.3 间距与布局

**4pt 基准**：常用值为 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80，即 Tailwind 的 1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 / 12 / 16 / 20。

**容器**

| 类 | 最大宽度 | 用途 |
| --- | --- | --- |
| `layout-wide` | 1216px | 卡片网格、工具页、页脚 |
| `layout-text` | 1008px | 页头、首页 Hero 与评估工具 |
| `layout-reading` | 752px | 长文阅读 |

左右边距：移动端 24px，≥ 768px 时 32px（已内置在容器类里）。

**垂直节奏**

- `.section`：章节上下内边距 72 → 140px。相邻章节的第二个用 `pt-0`，避免间距叠加。
- `.page-header`：页头上 56 → 96px，下 40 → 64px。
- 页面末尾统一留白：`pb-[clamp(4.5rem,2.5rem+6vw,8.75rem)]`。

**栅格**

- 卡片间距：移动端 `gap-4`（16px），桌面 `gap-5`（20px）。
- tile 内边距：24 → 40px，已内置在类里；card 为 24px；well 为 20px。
- 首页服务区用 6 列 bento：前两张各占 3 列，后三张各占 2 列；FDE 隐藏、只有四项服务时为 2 × 2。
- 工具页左右分栏为 7 : 5，结果栏在 `lg` 以上 `sticky top-20`。

**断点**：`sm` 640 · `md` 768 · `lg` 1024（桌面导航出现）· `xl` 1280（导航栏显示线索评分）。

### 2.4 圆角

| Token | 值 | 用于 |
| --- | --- | --- |
| `rounded-tile` | 28px | 页面级大面板（tile）、弹窗 |
| `rounded-card` | 18px | 卡片、well、列表分组 |
| `rounded-control` | 12px | 输入框、选项卡片、内嵌小块 |
| `rounded-full` | — | 按钮、chip、分段控件、徽标、头像 |

**同心规则**：内层圆角不大于外层圆角减去内边距。所以 tile 里嵌 well 用 18px，well 里再有元素只能用 12px 或更小。

### 2.5 材质与层级

毛玻璃 `.material`（`rgb(22 22 23 / .8)` + `saturate(180%) blur(20px)`）**只用于悬浮层**：全局导航、浮动 AI 按钮、Toast。卡片和面板一律不用。

> 注意：`backdrop-filter` 会让元素成为 `position: fixed` 子元素的定位容器。所以悬浮层内部不要再放 fixed 元素（移动端菜单因此渲染在 `<header>` 之外）。

| z-index | 层 |
| --- | --- |
| 0 | 内容 |
| 40 | 全局导航（sticky）、浮动 AI 按钮 |
| 45 | 移动端菜单 |
| 50 | 弹窗与遮罩 |
| 60 | Toast |
| 70 | “跳到主要内容”链接 |

阴影只用于弹窗、浮动按钮和 Toast 这类悬浮层。卡片不用阴影，在纯黑背景上阴影本来就看不见。

### 2.6 动效

- **缓动**：`ease-apple` = `cubic-bezier(0.28, 0.11, 0.32, 1)`，与 apple.com 一致。
- **时长**：悬停与按下 200ms；组件状态切换 240–300ms；弹窗 360ms；滚动出现 900ms。

| 可用动画 | 类 / 组件 | 场景 |
| --- | --- | --- |
| 淡入 | `animate-fade-in` | 切换 tab 后的内容、结果面板 |
| 弹窗浮起 | `animate-sheet-in` | Dialog（已内置） |
| Toast 下落 | `animate-toast-in` | Toast（已内置） |
| 侧栏滑入 | `animate-slide-in` | AI 顾问的 CRM 透视栏 |
| 滚动出现 | `<Reveal>` | **仅**首页营销章节 |
| 旋转 | `animate-spin` | 仅用于加载图标 |

**禁止**：`animate-pulse` 呼吸点、弹跳、悬停上浮（`translateY`）、悬停缩放大卡片、发光阴影、按下缩放。

`prefers-reduced-motion: reduce` 时，所有动画和过渡已在全局降为瞬时，`<Reveal>` 直接显示内容。

### 2.7 图标

- 统一使用 `lucide-react`，笔画在全局压到 1.75，接近 SF Symbols 的粗细。
- 尺寸：行内 16px（`h-4 w-4`）；列表前导 20px（`h-5 w-5`）；列表状态 24px（`h-6 w-6`）；卡片识别 32px（`h-8 w-8`）。
- 颜色：默认继承文字色。服务图标用服务识别色；状态图标用状态色（`Check` → success，`AlertTriangle` → warning）。
- 图标直接放置，**不要装进带描边或底色的小方块**。
- 纯图标按钮必须有 `aria-label`。

---

## 3. 组件规范

### 3.1 按钮

| 变体 | 类 | 外观 | 何时用 |
| --- | --- | --- | --- |
| 主按钮 | `btn btn-primary` | 实心蓝 | 本视图最重要的一个动作，**每个视图（或每个结果面板）最多一个** |
| 次按钮 | `btn btn-secondary` | 蓝色描边，悬停变实心 | 与主按钮并列的第二个动作 |
| 中性按钮 | `btn btn-neutral` | 灰色填充 | 工具性动作：复制、下载、邀请、标记完成 |
| 文字链接 | `link` + `<ChevronRight />` | 蓝字加 › | 第三个动作、“了解更多”、“查看全部” |
| 图标按钮 | `btn-icon` | 36px 灰色圆形 | 关闭、账户、重播 |

| 尺寸 | 类 | 高度 | 字号 |
| --- | --- | --- | --- |
| 小 | `btn-sm` | 36px | 14px：只用于导航栏和密集的工具栏 |
| 默认 | — | 44px | 17px |
| 大 | `btn-lg` | 52px | 17px：首页 Hero、表单提交、页面收尾的行动区 |

- 全宽按钮加 `btn-block`。
- 按钮组：主按钮在前（左或上），次按钮在后。移动端纵向排列（`flex-col sm:flex-row`）。
- 禁用态由 `disabled` 属性触发，自动变为 42% 不透明度。**不要用改颜色的方式表示禁用。**
- 加载态：替换文案为 `<Loader2 className="animate-spin" />正在…`，同时禁用按钮。
- 按钮文案以动词开头，不超过 8 个字：“开始评估”、“预约专家诊断”、“保存并进入方案空间”。不要写成“立即智能评估出海 GEO & SEO →”。

### 3.2 链接

`<button className="link">查看全部案例<ChevronRight /></button>`。在可点击卡片内，链接只作视觉提示，放在 `<span className="link">` 里，由整张卡片承担点击。卡片悬停时，› 右移 2px（`group-hover:translate-x-0.5`）。

### 3.3 表面：tile、card、well

| 类 | 圆角 | 内边距 | 用于 |
| --- | --- | --- | --- |
| `tile` | 28px | 24 → 40px | 页面级区块：工具面板、服务详情、案例详情 |
| `card` | 18px | 24px | 网格中的小卡片：资源、角色路径、套餐 |
| `well` | 18px | 20px | tile 内的分组：指标块、建议框、实测问答 |

- 可点击的 tile 或 card：用 `<button className="tile interactive group …">`，悬停只改变背景色。
- tile 内部**优先用分隔线组织**：`border-t border-separator pt-8`，列表用 `divide-y divide-separator`。只有需要成组对比的内容（并排的指标、前后对比）才用 well。
- 不允许 well 套 well，也不允许 tile 套 tile。

### 3.4 表单

```tsx
<label htmlFor="booking-name" className="field-label">您的称呼</label>
<input id="booking-name" className="field" placeholder="如 张总 / 李总监" autoComplete="name" required />
```

- 标签放在输入框**上方**（`field-label`：14px，600），并通过 `htmlFor` / `id` 关联。**不能只用 placeholder 代替标签。**
- placeholder 只写示例，以“如”开头。
- 输入框（`field`）高 48px，Hero 的主输入框用 `field field-lg`（56px）。聚焦时：蓝色描边加 3px 光环。
- `select.field` 自带 chevron；`textarea.field` 最小高度 128px，可纵向拉伸。
- 补充说明放在输入框下方：`mt-2 text-caption text-label-secondary`。
- 必填项加 `required`，联系方式加 `autoComplete`。
- 滑块一律用 `<Slider label value min max step onChange format />`，自带标签、读数和已填充轨道。只有数值本身带语义时（例如流失率），才改读数颜色和 `trackColor`。
- 开关（switch）：`<input type="checkbox" role="switch" className="peer sr-only">` 加视觉轨道，写法参考方案规划页的“私有化部署”。

### 3.5 选择控件：三种，别混用

| 组件 | 外观 | 语义 | 用于 |
| --- | --- | --- | --- |
| `SegmentedControl` | 灰色轨道，选中项为浮起的灰色滑块 | `role="tablist"`，←/→ 键切换 | **切换视图**。页面级用 `size="lg"`（学院课程、案例/方案），面板内用默认尺寸 |
| `chip` + `aria-pressed` | 灰色胶囊，选中后反白（白底黑字） | 切换按钮 | **筛选和多选**：术语分类、接入渠道、示例快捷试测、页内索引 |
| `choice` + `role="radio"` + `aria-checked` | 描边卡片，选中后为 2px 蓝色描边（Apple Store 选配样式） | 单选组 | **有说明文字的单选项**：诊断会形式、课后自测、套餐 |

选中态由 aria 属性驱动样式，不要另写 `isActive ? … : …` 的类名分支。

### 3.6 徽标

`badge`：14px，600，胶囊形。默认是灰底灰字，用于中性标签（“最受欢迎”“旗舰工具”、分类名）。表示状态时叠加状态色：`badge bg-success/15 text-success`。**徽标不能点击。**

### 3.7 数据展示

- **大数字**：`text-headline` 或 `text-title-1`，加 `tabular-nums`，单位放在后面：`<span className="ml-1 text-title-3 text-label-secondary">分</span>`。
- **得分**：`<ScoreRing value={42} caption="/ 100" />`，颜色按分数自动取值。
- **进度或占比**：`<div className="meter"><span className={TONE_BG[tone]} style={{ width }} /></div>`，6px 高。
- **键值对**：`<dl>` 配 `divide-y divide-separator`，键为 `text-label-secondary`，值右对齐。
- **前后对比**：`47 → 95`，旧值用 `label-secondary`，新值用 `success`。

### 3.8 弹窗 Dialog

```tsx
<Dialog open={isOpen} onClose={onClose} size="lg" title="预约 1 对 1 出海诊断会" description="带着测评报告进会议，直奔实质方案。">
  <DialogBody>…</DialogBody>
</Dialog>
```

- 尺寸：`md` 576px（设置类）· `lg` 768px（表单、课时、个人空间）· `xl` 1024px（带侧栏的 AI 顾问、销售情报）。
- 结构：标题栏（可选的 `leading` 头像、标题、描述、`actions`、关闭按钮）→ 可选的分段控件栏 → `DialogBody` 滚动区。
- 已内置的行为：Esc 关闭、点击遮罩关闭、Tab 焦点圈定、打开时聚焦面板、关闭时把焦点还给触发按钮、锁定背景滚动、多层弹窗只响应最上层。
- 移动端从底部弹出（上圆角、全宽），`sm` 以上居中显示。
- 成功态：居中的 `CheckCircle2`（56px，success），加一个 `text-title-2` 标题、一句说明和一个次按钮“完成”。重新打开弹窗时要回到初始状态。

### 3.9 导航

- **全局导航**：52px 高，毛玻璃。左侧品牌（点击回首页），中间 6 个 2–4 字的短标签，右侧依次为线索评分（xl 以上）、“预约诊断”小号主按钮、账户图标按钮。当前页的标签为白字，底部有 2px 白色指示条，并标注 `aria-current="page"`。
- **移动端（< 1024px）**：汉堡按钮打开全屏菜单。菜单按“了解 / 决策”分组，条目为 24px 标题加一行说明，底部是全宽的主按钮和中性按钮。Esc 可关闭，打开时锁定背景滚动。
- **页脚**：品牌简介加两组站点地图，底部一行放版权、CRM 工作台、数据同步设置和备案号。
- **地址同步**：当前页写入 `#/tab`，所以浏览器前进后退、分享链接和“复制链接”都能用。切页时滚动到顶部，并更新 `document.title`。
- 导航数据只维护在 `src/components/navigation.ts` 一处。

### 3.10 Toast

顶部居中的毛玻璃胶囊，`role="status"`，3.5 秒后消失，新消息会替换旧消息并重新计时。文案是不超过 20 字的陈述句，不加感叹号和 emoji，例如“方案已保存，方案空间已开启”。

### 3.11 浮动 AI 顾问按钮

全站唯一的浮动元素：右下角的毛玻璃胶囊，内含一个绿色在线点和“AI 售前顾问”。弹窗打开时隐藏。**不要再增加其他浮动按钮**（CRM 透视入口已并入 AI 顾问弹窗的标题栏）。

### 3.12 头像

`avatar`：灰色渐变圆形加姓名首字母，与 Apple 通讯录的样式一致。**不使用图库人像**：一是不真实，二是外链图片在大陆加载不稳定。

### 3.13 空状态与加载

- 空状态：一句说明现状并告诉用户下一步做什么的话，居中，`label-secondary`。需要时加一个次按钮。
- 分步加载：用列表逐项展示，已完成的打 `Check`（success），进行中的用旋转的 `Loader2`，未开始的用灰点。
- 不做骨架屏，不做假进度条。

---

## 4. 页面模板

### 4.1 二级页面

```
PageHeader（eyebrow → h1 text-headline → intro → 分段控件 / 页内索引）
  └─ layout-wide 内容区（tile / card 网格）
       └─ 收尾行动区（可选：headline + intro + 主按钮 + 次按钮）
```

- 每个页面只有一个 H1，由 `PageHeader` 输出。
- 眉标就是页面的中文名（“方案规划”“出海学院”），不写英文。

### 4.2 首页

Hero（eyebrow、`text-display` 标语、导语、两个按钮）→ AI 可见性测评 tile → 五项服务 bento → 售前工具（AI 可见性测评 · 方案规划 · 方案空间）→ 标杆案例 → 收尾行动区。营销章节用 `<Reveal>` 包裹，测评区不包。AI 可见性测评是站内唯一的自测工具，不单独成页。

### 4.3 工具页（方案规划）

- 左 7 右 5：左侧是输入，右侧是结果，结果栏在 `lg` 以上吸顶。
- 结果面板加 `aria-live="polite"`。窄屏下生成结果后，主动把结果滚动到可见区域。
- 预填的默认值要告诉用户（例如“已预填 8 题的典型现状”）。

### 4.4 工作区页（方案空间）

页头左对齐，H1 用 `text-title-1`，右侧放操作按钮，下方是分段控件。适用于登录后的协作空间一类页面。

### 4.5 信息架构

| 分组 | 页面（短标签 / 全称） |
| --- | --- |
| 了解 | 服务 / 五项服务 · 案例 / 标杆案例 · 学院 / 出海学院 · 资源 / 模板与术语 |
| 决策 | 规划 / 方案规划 · 方案空间 |

新增页面需要同时改动：`navigation.ts`（导航数据）、`App.tsx`（渲染分支）、新的 view 文件（以 `PageHeader` 开头）。

---

## 5. 文案规范

**语气**：像一位靠谱的资深顾问，说话笃定、具体、克制。用数字代替形容词，用动词代替口号。

| 场景 | 规则 | ✗ 之前 | ✓ 之后 |
| --- | --- | --- | --- |
| 眉标 | 中文页面名或章节名 | `OUR CORE SERVICES` | 核心服务 |
| 标题 | 一句话讲一件事，可用句号收尾 | 云端智荐提供的四大出海核心服务 | 五项服务，一套获客系统。 |
| 按钮 | 动词开头，不超过 8 字 | 立即智能评估出海 GEO & SEO → | 开始评估 |
| 英文 | 行业术语保留（GEO、SEO、CRM、FDE、AI），去掉装饰性括注 | 实时透视面板 (Live Inspector) | 实时透视 |
| Toast | 不超过 20 字的陈述句 | 🎉 本课时已学完！学习进度已实时更新到您的出海档案。 | 本课时已学完，进度已更新 |
| 数字 | 阿拉伯数字，与单位之间加空格 | 8~12周 | 8 ~ 12 周 |
| 称呼 | 营销叙述（标语、标题、导语、服务介绍）用“你”，与品牌标语“让海外买家找到你”一致；交互与服务场景（表单、题目、AI 对话、预约、方案与合同）用“您” | 说说你的品类… | 说说您的品类… |
| 诚实 | 示例数据要标明是示例；题目数量等计数从数据计算 | 12 题（实际 8 题） | 共 {n} 题 |

---

## 6. 无障碍清单

- [ ] 所有可交互元素都是 `<button type="button">`、`<a>` 或表单控件，没有 `div onClick`
- [ ] 全局有 `:focus-visible` 焦点环（2px `link`，偏移 2px），不能用 `outline-none` 去掉它（输入框改用光环）
- [ ] 纯图标按钮有 `aria-label`；装饰性元素加 `aria-hidden="true"`
- [ ] 切换视图用 `role="tablist"` 加 `aria-selected`；开关与筛选用 `aria-pressed`；单选用 `role="radio"` 加 `aria-checked`；折叠用 `aria-expanded` 加 `aria-controls`
- [ ] 弹窗有 `role="dialog"`、`aria-modal`、`aria-labelledby`，Esc 可关闭，焦点被圈定在弹窗内（用 `Dialog` 就自动满足）
- [ ] 表单控件都有关联的 `<label>`；动态结果区域有 `aria-live`
- [ ] 文字对比度达到 AA（见 2.1）；不单靠颜色传达状态，同时配图标或文字
- [ ] 主要触控目标不小于 44px；密集工具栏不小于 36px
- [ ] 尊重 `prefers-reduced-motion`
- [ ] 页面顶部有“跳到主要内容”；每页只有一个 `<h1>`，标题层级不跳级

---

## 7. 禁用清单

| ✗ 不要 | ✓ 改为 |
| --- | --- |
| `apple-glass`、`backdrop-blur-*` 做卡片 | `tile` / `card`（纯色） |
| `bg-white/[0.04] border border-white/10` 手写卡片 | `well` 或分隔线 |
| 卡片 `hover:-translate-y`、发光阴影 `shadow-[0_0_24px_…]` | `interactive`（仅改背景色） |
| 渐变文字、径向光晕背景 | 纯色文字；签名渐变全站仅一处 |
| `text-[#2997ff]` 装饰标签和数字 | `text-label-secondary` 或 `text-label` 加 `font-semibold` |
| `font-mono` 显示数字 | `tabular-nums` |
| `text-xs`、`text-[11px]` | `text-caption` |
| `font-bold`、`font-extrabold`、`font-medium` | `font-semibold` 或默认 400 |
| `uppercase tracking-wider` 英文眉标 | `eyebrow` 中文 |
| `animate-pulse` 状态点、`animate-in` | 静态色点；`animate-fade-in` |
| 按钮里放 `ArrowRight`、`Sparkles` | 纯文字按钮；需要引导就用 `link` 加 › |
| 图标装在带描边的彩色小方块里 | 图标直接放，配识别色 |
| 自写弹窗遮罩和面板 | `Dialog` 加 `DialogBody` |
| 自写分段控件 | `SegmentedControl` |
| Unsplash 人像头像 | `avatar` 首字母 |
| `slate-*`、`blue-600` 等 Tailwind 默认色板 | 语义 token |
| emoji、感叹号、英文括注 | 见第 5 节 |

---

## 8. 评审清单（提交前自查）

1. 这一屏只讲一件事吗？主按钮只有一个吗？
2. 有没有新写 hex、默认色板、`text-[Npx]`、`font-mono` 数字？
3. 蓝色是不是只出现在可交互元素上？
4. 有没有盒中盒？能不能用分隔线代替边框？
5. 标题在 390px 宽的手机上会不会在词组中间断行？
6. 键盘能不能走完整个流程？焦点是否可见？
7. 文案是否是中文、动词开头、没有 emoji 和感叹号？
8. 在 390px 与 1440px 两个宽度下截图检查过吗？
9. `bun run lint` 与 `bun run build` 是否通过？

---

## 9. 实现索引

| 文件 | 内容 |
| --- | --- |
| `src/index.css` | `@theme` token（颜色、字号、圆角、缓动、动画）；base 层（字体、焦点、14px 兜底、减少动效）；组件类（layout、section、tile/card/well、btn、field、range、chip、choice、segmented、badge、avatar、meter、reveal、material） |
| `src/components/ui/Dialog.tsx` | 弹窗外壳与 `DialogBody` |
| `src/components/ui/SegmentedControl.tsx` | 分段控件 |
| `src/components/ui/PageHeader.tsx` | 二级页页头 |
| `src/components/ui/Slider.tsx` | 带读数的滑块 |
| `src/components/ui/ScoreRing.tsx` | 圆环得分 |
| `src/components/ui/Reveal.tsx` | 滚动出现 |
| `src/components/ui/tone.ts` | 分数 → 状态色 |
| `src/components/ui/serviceIdentity.ts` | 五项服务的图标与识别色 |
| `src/components/navigation.ts` | 导航分组与标签、`TabId` |
| `src/components/Header.tsx` / `Footer.tsx` | 全局导航与页脚 |
