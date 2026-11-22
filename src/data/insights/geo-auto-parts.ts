import type { Insight } from './types';

export const geoAutoParts: Insight = {
  slug: 'geo-auto-parts',
  topic: 'geo',
  author: 'founder',
  publishedAt: '2026-11-20',
  updatedAt: '2026-11-20',
  keywords: {
    zh: ['汽车零部件 GEO', '汽配出海 GEO', '汽配官网怎么写', 'OE 号对照', 'ACES PIES TecDoc', 'IATF 16949 官网展示'],
    en: ['GEO for auto parts manufacturers', 'auto parts supplier AI search', 'aftermarket parts ChatGPT visibility', 'OE number cross reference website', 'ACES PIES TecDoc data'],
  },
  relatedServices: ['geo', 'website', 'seo'],
  relatedTerms: ['term-structured-data', 'term-entity', 'term-ai-crawlers'],
  relatedLessons: ['lesson-c-3-1', 'lesson-b-1-3'],
  zh: {
    title: '汽车零部件企业怎么做 GEO？2026 年技术实现与注意事项',
    seoTitle: '汽车零部件企业 GEO 指南（2026）：实现与注意事项',
    description:
      '汽车零部件企业怎么做出海 GEO：OE 对照与适配车型数据、ACES / PIES 与 TecDoc、IATF 16949 与 E-mark 怎么公开，以及商标与适配错误的注意事项。',
    answer:
      '汽车零部件企业做 GEO，核心是结构化的零件数据：每个零件有独立页面，写清 OE 对照号、适配车型（品牌、车型、年份、发动机）和关键尺寸，并按北美的 ACES / PIES、欧洲的 TecDoc 等行业标准提供数据；再公开 IATF 16949、E-mark 等可查验的资质。AI 和采购都靠零件号与车型匹配，没有这些数据就很难被推荐。',
    body: `## 海外买家会怎么问 AI

汽配买家分两类：主机厂与一级供应商的采购（OEM / OES），以及售后市场的进口商、批发商和连锁维修店。他们的问题通常带着零件号、车型或资质：

- "Brake pad manufacturers with ECE R90 approval in China"
- "Replacement brake pads for OE 12345-67890, wholesale supplier"（编号为示例）
- "IATF 16949 certified aluminum die casting suppliers for EV battery housings"
- "Which aftermarket suppliers provide ACES and PIES data for North America?"

售后市场的问题高度依赖“零件号对得上、车型适配对得上”。AI 能不能推荐你，先看它能不能读到这些结构化数据。机制见[ChatGPT 和 Gemini 怎么挑选推荐供应商](/insights/how-ai-picks-suppliers)。

## 两条市场路线，两套证据

| 路线 | 买家看什么 | 官网上怎么写 |
|---|---|---|
| OEM / OES 配套 | IATF 16949、PPAP 能力、工艺能力（压铸、冲压、注塑、机加）、检测设备、产能、配套过的项目 | 资质页写清证书编号与认证范围，工艺页写清设备与能力，项目经验按授权公开 |
| 售后市场 | OE 对照号、适配车型、尺寸与材质、法规认证（如刹车片的 ECE R90）、包装与起订量、数据格式 | 每个零件一页，车型适配表、OE 对照表与尺寸图都写成 HTML |

IATF 16949 证书可以在 IATF 的全球监督数据库中查询，证书编号和认证范围写准，买家就能自己核对。

## 技术实现方案

### 1. 零件页：一个零件号一页

每个零件号一页，包含：你的零件号、OE 对照号、适配车型表（品牌、车型、年份、发动机或排量、位置如前轴后轴）、关键尺寸、材质、认证、包装信息和产品图。适配表用 HTML 表格，不要做成图片。零件多时用模板批量生成页面，但每页的数据必须是真实的。

### 2. 按行业数据标准提供数据

北美售后市场普遍使用汽车售后协会（Auto Care Association）维护的 ACES（车型适配数据）与 PIES（产品属性数据）标准，欧洲常用 TecAlliance 的 TecDoc 目录。能按这些标准交付数据，本身就是进入渠道的门槛，也值得在官网写清：支持哪些标准、哪些版本、如何获取数据。

### 3. 结构化数据

零件页输出 Product 结构化数据，用 mpn 写零件号，additionalProperty 写尺寸和材质。Schema.org 的 isAccessoryOrSparePartFor 可以表达“是某车型的配件”。不公开价格时拿不到商品富结果，但结构化数据仍能帮助搜索引擎和 AI 理解零件与车型的关系。写法见 [结构化数据](/glossary/structured-data) 与 [Google 的 Product 文档](https://developers.google.com/search/docs/appearance/structured-data/product)。

### 4. 站内搜索要能被爬到

很多汽配站只有“按车型查找”的下拉框，爬虫进不去。除了交互式查找，还要有可以直接访问的车型列表页（例如 /vehicles/toyota/camry），每页列出适配零件并链接到零件页，这样搜索引擎和 AI 都能顺着链接读到全部数据。

### 5. 工艺与资质页

面向 OEM 的买家，写清工艺能力：设备品牌与吨位、尺寸与公差能力、检测设备（三坐标、X 光探伤等）、PPAP 提交级别与经验、年产能。这些是采购做供应商初筛时 AI 会摘取的信息。

### 6. 第三方来源

展会名录（如 Automechanika、AAPEX 的参展商页面）、渠道商的产品目录、行业协会会员页、主机厂公开的供应商名单（有的话），都是 AI 交叉验证的来源。官网与这些地方的公司名、零件号写法要统一。原理见 [实体](/glossary/entity)。

## 注意事项

1. **OE 号只用于对照**：写成“Replacement for OE 12345-67890”（编号为示例），并说明是售后替换件、非原厂件。不要把主机厂商标用作你自己的品牌或标题主体，避免商标纠纷。
2. **适配数据错一条，伤害很大**：装不上的零件会带来退货和差评。适配表要有数据来源与审核记录，更新时写上日期。
3. **认证写准范围**：E-mark 按具体法规与零件类型认证，例如刹车片按 UN ECE R90；不要写成“全部产品 E-mark 认证”。
4. **配套经验要有授权**：写“为某主机厂配套”必须有书面许可；没有授权就写行业与车型平台类别。
5. **安全件更要克制**：刹车、转向、悬挂等安全件，不写无法证明的性能比较，测试结果写明标准与检测机构。

## 上线检查清单

- 每个零件号一页，OE 对照与适配车型是 HTML 表格
- 有可直接访问的车型列表页，链接到零件页
- 说明支持的数据标准（ACES / PIES、TecDoc 等）
- Product 结构化数据，含 mpn 与尺寸属性
- IATF 16949、E-mark 等资质写清编号与范围
- 公司名与零件号写法在官网、展会名录和渠道商目录一致

先[做一次免费测评](/audit)，看看 AI 能不能读到你的零件数据。我们的[出海 GEO 服务](/services/geo)会按零件品类与目标市场整理问题集；关键词与页面规划可以配合 [外贸 SEO](/services/seo)。`,
    faqs: [
      {
        q: '汽配企业做 GEO，最重要的数据是什么？',
        a: '零件号与车型适配数据。每个零件一页，写清 OE 对照号、适配的品牌、车型、年份与发动机，并用 HTML 表格而不是图片呈现。',
      },
      {
        q: '官网可以写主机厂的 OE 号吗？',
        a: '可以用于对照，写成“Replacement for OE 某号”，并说明是售后替换件、非原厂件。不要把主机厂商标当作自己的品牌或标题主体。',
      },
      {
        q: 'ACES、PIES 和 TecDoc 是什么？',
        a: 'ACES 与 PIES 是北美售后市场的车型适配与产品属性数据标准，由汽车售后协会维护；TecDoc 是欧洲常用的零件目录。能按这些标准提供数据，是进入渠道的重要条件。',
      },
      {
        q: '“按车型查找”的下拉框会影响 GEO 吗？',
        a: '会。爬虫通常不会操作下拉框，读不到背后的数据。要同时提供可以直接访问的车型列表页，链接到每个零件页。',
      },
    ],
  },
  en: {
    title: 'GEO for auto parts manufacturers in 2026: implementation and pitfalls',
    seoTitle: 'GEO for auto parts manufacturers: a 2026 guide',
    description:
      'How auto parts makers get cited by AI: OE cross references and fitment data, ACES / PIES and TecDoc, IATF 16949 and E-mark, plus trademark pitfalls.',
    answer:
      'For auto parts makers, GEO runs on structured parts data. Give every part number its own page with OE cross references, fitment (make, model, year, engine) and key dimensions, supply data in industry formats such as ACES / PIES in North America and TecDoc in Europe, and publish verifiable credentials such as IATF 16949 and E-mark approvals. Buyers and AI match on part numbers and vehicles; without that data you are rarely recommended.',
    body: `## What overseas buyers ask AI

Auto parts buyers fall into two groups: purchasers at carmakers and tier-one suppliers (OEM / OES), and aftermarket importers, wholesalers and repair chains. Their questions usually name a part number, a vehicle or a credential:

- "Brake pad manufacturers with ECE R90 approval in China"
- "Replacement brake pads for OE 12345-67890, wholesale supplier" (example number)
- "IATF 16949 certified aluminum die casting suppliers for EV battery housings"
- "Which aftermarket suppliers provide ACES and PIES data for North America?"

Aftermarket questions depend on matching part numbers and fitment. Whether AI recommends you starts with whether it can read that structured data. See [how ChatGPT and Gemini pick suppliers](/insights/how-ai-picks-suppliers).

## Two routes to market, two sets of evidence

| Route | What buyers look at | How to present it |
|---|---|---|
| OEM / OES supply | IATF 16949, PPAP capability, process capability (die casting, stamping, moulding, machining), inspection equipment, capacity, programmes supplied | A credentials page with certificate number and scope, process pages with equipment and capability, programme experience shown with permission |
| Aftermarket | OE cross references, fitment, dimensions and material, regulatory approvals (such as ECE R90 for brake pads), packaging and MOQ, data formats | One page per part, with fitment, cross reference and dimension tables in HTML |

IATF 16949 certificates can be looked up in IATF's global oversight database, so an accurate certificate number and scope let buyers verify it themselves.

## How to implement it

### 1. Part pages: one part number per page

Each part number gets its own page with your part number, OE cross references, a fitment table (make, model, year, engine or displacement, position such as front or rear axle), key dimensions, material, approvals, packaging and product images. Keep the fitment table in HTML, not an image. With many parts, generate pages from a template, but every page's data must be real.

### 2. Supply data in industry standards

The North American aftermarket widely uses ACES (fitment data) and PIES (product attribute data), maintained by the Auto Care Association; in Europe, TecAlliance's TecDoc catalogue is common. Delivering data in these formats is often the entry ticket to distribution, so say on your site which standards and versions you support and how buyers get the data.

### 3. Structured data

Output Product structured data on part pages, with the part number in mpn and dimensions and material in additionalProperty. Schema.org's isAccessoryOrSparePartFor can express that a part fits a vehicle. Without published prices you will not get product rich results, but structured data still helps search engines and AI understand the part-to-vehicle relationship. See [structured data](/glossary/structured-data) and [Google's Product documentation](https://developers.google.com/search/docs/appearance/structured-data/product).

### 4. Make the catalogue crawlable

Many parts sites only offer a "find by vehicle" drop-down, which crawlers do not use. Alongside the interactive finder, provide directly reachable vehicle pages (for example /vehicles/toyota/camry) that list the fitting parts and link to each part page, so search engines and AI can follow the links to all of the data.

### 5. Process and credentials pages

For OEM buyers, describe process capability: equipment makes and tonnage, size and tolerance capability, inspection equipment (CMM, X-ray inspection and so on), PPAP submission levels and experience, and annual capacity. AI extracts exactly this when a purchaser screens suppliers.

### 6. Third-party sources

Trade-fair exhibitor pages (such as Automechanika or AAPEX), distributors' catalogues, association member pages and carmakers' published supplier lists (where they exist) are all used by AI to cross-check. Keep the company name and part number format consistent across them. See [entity](/glossary/entity).

## Pitfalls

1. **Use OE numbers only as cross references.** Write "Replacement for OE 12345-67890" (an example number) and state that it is an aftermarket replacement, not a genuine part. Do not use a carmaker's trademark as your brand or as the subject of a headline.
2. **One wrong fitment entry does real damage.** Parts that do not fit bring returns and bad reviews. Keep a data source and review record for fitment, and date every update.
3. **State the scope of approvals.** E-mark approvals are granted per regulation and part type, such as UN ECE R90 for brake pads. Do not write "all products E-marked".
4. **Programme experience needs permission.** Writing "supplier to carmaker X" requires written approval; otherwise describe the industry and the type of vehicle platform.
5. **Be especially careful with safety parts.** For brakes, steering and suspension, avoid performance comparisons you cannot prove, and give the standard and lab for test results.

## Launch checklist

- One page per part number, with OE cross references and fitment in HTML tables
- Directly reachable vehicle pages linking to part pages
- The data standards you support (ACES / PIES, TecDoc and so on)
- Product structured data with mpn and dimension properties
- IATF 16949, E-mark and other approvals with numbers and scope
- Consistent company name and part number format on the website, trade-fair listings and distributor catalogues

[Run a free audit](/audit) to see whether AI can read your parts data. Our [export GEO service](/services/geo) builds the question set by part category and market; keyword and page planning pairs with [export SEO](/services/seo).`,
    faqs: [
      {
        q: 'What data matters most for auto parts GEO?',
        a: 'Part numbers and fitment. Give every part its own page with OE cross references and the make, model, year and engine it fits, in HTML tables rather than images.',
      },
      {
        q: 'Can we show carmakers’ OE numbers on our site?',
        a: 'Yes, as cross references written as "Replacement for OE ...", stating it is an aftermarket replacement, not a genuine part. Do not use the carmaker’s trademark as your brand or headline subject.',
      },
      {
        q: 'What are ACES, PIES and TecDoc?',
        a: 'ACES and PIES are North American aftermarket standards for fitment and product attribute data, maintained by the Auto Care Association; TecDoc is a widely used European parts catalogue. Supplying data in these formats is an important condition for entering distribution.',
      },
      {
        q: 'Does a "find by vehicle" drop-down hurt GEO?',
        a: 'Yes. Crawlers usually do not operate drop-downs, so they miss the data behind them. Provide directly reachable vehicle pages that link to each part page as well.',
      },
    ],
  },
};
