# GSC 基线（2026-11）

第一次把 Search Console 接进检查流程时抄下来的现状，用来跟以后对比。数据来自 `sc-domain:chingeo.com`（服务账号，只读），采集时间 2026-11-27。

复测方式：`bun run seo:audit:full`（`--live --gsc`），里面有 sitemap 提交数、抽样页索引状态和 Google canonical 的自动检查。

## 1. 流量（28 天：2026-10-30 → 11-27）

| 指标 | 数值 |
|---|---|
| 点击 | 1 |
| 曝光 | 73 |
| CTR | 1.37% |
| 平均排名 | 28.3 |
| 设备 | 桌面 54 次曝光 / 位置 35.0；移动 19 次 / 位置 9.5 |

曝光不是均匀的：11-21 才有第一行数据，11-25 与 11-26 两天占了 53 次（22 + 31）。**说明站点刚进入放量阶段，任何 CTR / 排名结论都还不可靠**（样本量 73，单日波动就能翻倍）。

## 2. 索引状态

| 项目 | 状态 |
|---|---|
| sitemap | `Valid`，提交 126 条，0 错误 0 警告，最近下载 2026-11-26 |
| 首页 | `Submitted and indexed`，canonical 一致，移动端抓取 |
| `/services/geo` | 同上，富结果识别到 Breadcrumbs |
| 最新文章 `/insights/geo-agencies-public-info` | 同上 |
| `/en/glossary/ai-crawlers` | 同上 |
| 抽查的课时页 `/academy/website/a-1-1` | `Discovered - currently not indexed`（已知地址，尚未抓取） |

注意：Search Console 的 sitemap 接口里那个 126 是**提交条数**，不是已收录数（`contents[].indexed` 只在部分属性下有值）。真实收录情况要看 URL Inspection：当时手工抽查 16 条 URL，14 条已收录、2 条还在队列里（`/academy/geo` 与 `/academy/website/a-1-1`）；`seo:audit --gsc` 现在固定抽查首页 / 服务 / 文章 / 术语 / 课时各一个中文页，英文页靠 `--live` 的抽样覆盖。

## 3. 查询（90 天，全部可见数据只有 10 条）

| 查询 | 曝光 | 位置 | 落地页 |
|---|---|---|---|
| export core web vitals | 12 | 12.8 | `/en/glossary/core-web-vitals`（**www 变体**，已改 308） |
| ai crawlers | 6 | 77.5 | `/en/glossary/ai-crawlers` |
| ai crawler | 3 | 70.3 | 同上 |
| geo for solar companies | 4 | 63.0 | `/en/insights/geo-solar-pv` |
| china geo | 1 | 10.0 | `/en` |
| fde | 1 | 62.0 | `/glossary/fde` |
| json ld structured data（含带连字符写法） | 2 | 85–88 | `/en/glossary/structured-data` |
| what is an ai crawler | 1 | 49.0 | `/en/glossary/ai-crawlers` |

**结论：现在做不出有统计意义的「机会词清单」。** 唯一落在 11–30 名区间的是 `export core web vitals`（12 次曝光、位置 12.8），而且它落在 www 变体上——www 2026-11-27 已从 307 改成 308，等 Google 重新抓取后权重才会并到主域。

其余词分两类：位置 49–88 的术语页（已进索引、缺权重，靠内链和外链解决，不是改标题），以及与业务无关的噪声词（`entity meaning in kannada`）。

## 4. 中文页面并不是「零曝光」

28 天视图里 10 条 query×page 组合全部落在英文页，容易误判成中文侧没收录。看 90 天的 page 维度可以看到中文页其实有曝光：

```
/insights/geo-electronics-pcb   位置 1.0，1 次曝光
/glossary/geo                   位置 10.0，1 次曝光
/glossary/entity                位置 6.0，1 次曝光
/insights/geo-solar-pv          位置 2.0，1 次曝光
```

但逐页查 `query` 时会返回 “No search data found”——**这些页的查询词被 Google 隐去了**（低量查询的保护）。所以：

- 中文页技术上是收录的、也有零星曝光，问题是**量太小**，不是坏了；
- 现在看不到它们靠什么词进来，等单个页面稳定有 20+ 曝光后再按词优化，否则会照着噪声改标题。

## 5. 这一轮的三个动作

1. **www 307 → 308**（已完成，2026-11-27）：临时跳转不传递权重合并，改永久后 www 变体的曝光会逐步并到主域。
2. **`--gsc` 接进 `seo:audit`**：以后 `bun run seo:audit:full` 会同时检查 sitemap 提交数、抽样页索引状态、Google canonical，不用再手动开 Search Console。
3. **暂缓「机会词清单」**：等 28 天曝光到 500+ 或出现位置 11–30 的词超过 5 个再拉清单；在那之前优先做内链（术语页 ↔ 文章 ↔ 服务页）和外链，这些和具体词无关。

## 6. 不要做的事

- 不要因为 1 次点击就去改标题或描述——现在任何 CTR 数字的置信区间都覆盖了全部可能。
- 不要把 FAQPage 富结果当 KPI：Google 自 2023 起基本只对政府和医疗类站点展示 FAQ 富结果。FAQ 结构化数据对 GEO（被 AI 引用）仍然有用，但不会在搜索结果里出现折叠问答。
- 不要反复提交 sitemap 或 URL 催促收录：`Discovered - currently not indexed` 是抓取预算问题，重复提交只会被忽略。
