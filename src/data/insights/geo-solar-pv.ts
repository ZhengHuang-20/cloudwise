import type { Insight } from './types';

export const geoSolarPv: Insight = {
  slug: 'geo-solar-pv',
  topic: 'geo',
  author: 'founder',
  publishedAt: '2026-11-20',
  updatedAt: '2026-11-20',
  keywords: {
    zh: ['光伏 GEO', '光伏组件出海', '逆变器出海 AI 搜索', '光伏企业官网怎么写', '光伏 PAN 文件', '光伏供应链追溯'],
    en: ['GEO for solar manufacturers', 'solar module supplier AI search', 'inverter manufacturer ChatGPT visibility', 'PV module datasheet website', 'solar supply chain traceability'],
  },
  relatedServices: ['geo', 'website', 'seo'],
  relatedTerms: ['term-structured-data', 'term-entity', 'term-hreflang'],
  relatedLessons: ['lesson-c-3-1', 'lesson-c-1-2'],
  zh: {
    title: '光伏组件与逆变器企业怎么做 GEO？2026 年技术实现与注意事项',
    seoTitle: '光伏组件与逆变器企业 GEO 指南（2026）',
    description:
      '光伏组件与逆变器企业怎么做出海 GEO：按国家公开 IEC 与并网认证、HTML 数据表与 PAN / OND 文件、结构化数据，以及供应链追溯与质保表述的注意事项。',
    answer:
      '光伏企业做 GEO，要让 AI 能按市场核对你的产品：组件写清 IEC 61215、IEC 61730 与 UL 61730，逆变器写清目标国家的并网标准，数据表做成 HTML 并提供 PVsyst 用的 PAN / OND 文件，再把供应链追溯与质保条款写成可查证的页面。按国家组织内容，比泛泛写“全球领先”更容易被引用。',
    body: `## 海外买家会怎么问 AI

光伏的买家是分销商、安装商、EPC 与电站开发商，他们的问题通常同时带着产品、认证和国家：

- "Bifacial TOPCon module manufacturers with UL 61730 for US projects"
- "Hybrid inverter brands approved for G99 in the UK"
- "Which Chinese inverters are on the CEC approved list in Australia?"
- "Solar module suppliers with traceable polysilicon supply chain"

AI 回答时会挑出能证明“这款产品能在这个国家用”的来源。产品页不分市场、认证只放一张证书图片，AI 很难把你和具体问题对上。机制见[ChatGPT 和 Gemini 怎么挑选推荐供应商](/insights/how-ai-picks-suppliers)。

## 按市场整理认证与准入证据

| 产品 | 常见标准与准入 | 官网上怎么写 |
|---|---|---|
| 组件 | IEC 61215（设计鉴定）、IEC 61730（安全）；美国市场 UL 61730 | 写清证书编号、发证机构、覆盖的型号系列 |
| 组件 | 盐雾、氨气、PID 等环境测试 | 写明测试标准与条件，附报告出具机构 |
| 逆变器 | IEC 62109（安全）；德国 VDE-AR-N 4105、英国 G98 / G99、澳大利亚 AS/NZS 4777.2、美国 IEEE 1547 与 UL 1741 | 每个国家一段：标准、证书编号、适用型号 |
| 逆变器 | 澳大利亚等市场的认可产品名单 | 写清名单名称与查询方式，让买家自己核对 |

原则是**一张认证对应一个市场、一组型号**。建议做“按国家查看认证”的页面（例如 /certifications/uk），把这个国家要求的标准、你的证书和适用型号放在一起。买家问“英国能用吗”，AI 能直接找到一页完整的答案。

## 技术实现方案

### 1. 数据表做成 HTML，并提供设计软件文件

组件页把 STC 下的功率、效率、开路电压、短路电流、温度系数、NMOT、尺寸重量、机械载荷、质保写成 HTML 表格；逆变器页写清 MPPT 路数与电压范围、最大效率与欧洲效率、并网与离网模式、通信方式。电站设计常用 PVsyst，提供组件的 PAN 文件和逆变器的 OND 文件下载，对 EPC 和设计院很实用，也是专业度的直接证明。

### 2. 型号系列与单个功率档的页面结构

组件通常一个系列有多个功率档。建议一个系列一页，各功率档的参数放在同一张表里，用页内锚点区分，避免几十个几乎相同的页面互相抢词。逆变器按功率段或应用（户用、工商业、储能混合）分页。

### 3. 结构化数据与多语言

产品页输出 Product 结构化数据，参数放进 additionalProperty，系列与型号用 model 区分。德语、西语等多语言版本用独立 URL，并用 hreflang 互相关联，不要用浏览器自动翻译插件代替。做法见 [hreflang](/glossary/hreflang) 与 [结构化数据](/glossary/structured-data)。

### 4. 项目与产能信息

电站案例写清国家、装机容量、组件或逆变器型号、并网时间、运营方（有授权时）。产能、工厂地点与可追溯的出货记录，是银行和开发商评估“可融资性”时会看的信息。部分买家与金融机构会参考 BloombergNEF 的 Tier 1 名单，但不要在官网写自己“必然入选”或冒用名单。

### 5. 第三方来源

PV Magazine、PV Tech 等行业媒体的报道、独立检测机构（如 PVEL 的组件可靠性记分卡、RETC 的报告）的公开结果、电站业主公开的项目信息，都是 AI 交叉验证时常见的来源。参加了独立测试就在官网写明年份与结果出处，并链接原文。

## 注意事项

1. **供应链追溯要和证据一致**：美国的《维吾尔强迫劳动预防法》（UFLPA，2022 年 6 月生效）和欧盟的强迫劳动产品禁令（(EU) 2024/3015，2027 年 12 月起适用）都会让买家追问多晶硅与硅片来源。官网只写能被审计材料支持的追溯说明，不写无法证明的宣传语。欧盟条例原文见 [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/3015/oj)。
2. **衰减与质保写清口径**：首年衰减、年均衰减、质保年限要与质保书一致，并写明质保主体（哪家公司承担）。
3. **认证不要跨型号套用**：新系列没拿到证书前，不要沿用旧系列的证书编号。
4. **效率数字写清条件**：组件效率写明 STC，逆变器写清是最大效率还是欧洲效率 / CEC 效率。
5. **按国家更新**：并网标准会更新，证书到期要换，“按国家查看认证”页面写上最近核对日期。

## 上线检查清单

- 组件、逆变器的参数表是 HTML，效率与衰减写清条件
- 每个目标国家有一页认证说明，含标准、证书编号与适用型号
- 提供 PAN / OND 文件下载
- Product 结构化数据，多语言用独立 URL 与 hreflang
- 至少 3 个电站案例页，写清型号与并网时间
- 供应链追溯说明与审计材料一致

想知道 AI 现在怎么描述你的品牌，先[做一次免费测评](/audit)。我们的[出海 GEO 服务](/services/geo)会按目标国家整理问题集与证据；面向北美市场的通用注意事项见[面向美国、加拿大采购商做 GEO](/insights/geo-us-canada-buyers)。`,
    faqs: [
      {
        q: '光伏企业的认证页为什么要按国家做？',
        a: '买家问 AI 时通常带着国家，例如“英国 G99 认证的逆变器”。按国家组织的页面能直接回答这个问题，AI 也更容易引用。',
      },
      {
        q: '提供 PAN 和 OND 文件有什么用？',
        a: '电站设计常用 PVsyst 建模，PAN 与 OND 是组件和逆变器的参数文件。公开下载能方便 EPC 和设计院选型，也是专业度的直接证明。',
      },
      {
        q: '供应链追溯怎么写才安全？',
        a: '只写能被审计材料与证书支持的内容，例如原材料来源与追溯体系的说明。不要写无法证明的绝对化表述。',
      },
      {
        q: '多语言站点有必要吗？',
        a: '德国、西班牙、拉美等市场的安装商常用本国语言搜索与提问。多语言版本要有独立网址和 hreflang，并由懂行业的人审校。',
      },
    ],
  },
  en: {
    title: 'GEO for solar module and inverter makers in 2026: implementation and pitfalls',
    seoTitle: 'GEO for solar module and inverter makers: a 2026 guide',
    description:
      'How solar module and inverter makers get cited by AI: certifications and grid codes by country, HTML datasheets, PAN / OND files and supply-chain traceability.',
    answer:
      'For solar manufacturers, GEO means letting AI check your products market by market. List IEC 61215, IEC 61730 and UL 61730 for modules and the grid codes for each target country for inverters, publish datasheets as HTML with PVsyst PAN / OND files, and put supply-chain traceability and warranty terms on checkable pages. Content organised by country is cited far more readily than "global leader" claims.',
    body: `## What overseas buyers ask AI

Solar buyers are distributors, installers, EPCs and developers, and their questions usually combine a product, a certification and a country:

- "Bifacial TOPCon module manufacturers with UL 61730 for US projects"
- "Hybrid inverter brands approved for G99 in the UK"
- "Which Chinese inverters are on the CEC approved list in Australia?"
- "Solar module suppliers with traceable polysilicon supply chain"

AI picks the sources that prove a product can be used in that country. If product pages ignore markets and certifications are only certificate images, AI struggles to match you to the question. See [how ChatGPT and Gemini pick suppliers](/insights/how-ai-picks-suppliers).

## Organise certification evidence by market

| Product | Common standards and approvals | How to present it |
|---|---|---|
| Modules | IEC 61215 (design qualification), IEC 61730 (safety); UL 61730 for the US | Certificate number, issuing body and the model series covered |
| Modules | Salt mist, ammonia, PID and other environmental tests | The test standard and conditions, and the lab that issued the report |
| Inverters | IEC 62109 (safety); VDE-AR-N 4105 in Germany, G98 / G99 in the UK, AS/NZS 4777.2 in Australia, IEEE 1547 and UL 1741 in the US | One section per country: standard, certificate number, models |
| Inverters | Approved product lists in markets such as Australia | The list's name and how to look you up, so buyers can verify it themselves |

The rule is **one certification, one market, one set of models**. Build a "certifications by country" page (for example /certifications/uk) that puts the required standards, your certificates and the applicable models together. When a buyer asks "can I use this in the UK?", AI finds one complete answer.

## How to implement it

### 1. HTML datasheets, plus design software files

For modules, put STC power, efficiency, open-circuit voltage, short-circuit current, temperature coefficients, NMOT, dimensions and weight, mechanical load and warranty in an HTML table. For inverters, list MPPT count and voltage range, maximum and European efficiency, on-grid and off-grid modes, and communication. Plant designers often use PVsyst, so offer PAN files for modules and OND files for inverters. EPCs and design institutes find them genuinely useful, and they show expertise directly.

### 2. Page structure for series and power classes

A module series usually has several power classes. Use one page per series with all power classes in one table and in-page anchors, rather than dozens of near-identical pages competing for the same terms. Split inverters by power range or application (residential, C&I, hybrid storage).

### 3. Structured data and languages

Output Product structured data with parameters in additionalProperty and model to separate variants. German, Spanish and other language versions need their own URLs linked with hreflang, not a browser translation plug-in. See [hreflang](/glossary/hreflang) and [structured data](/glossary/structured-data).

### 4. Projects and manufacturing capacity

Project pages should give the country, capacity, module or inverter models, grid connection date and the operator (with permission). Capacity, factory locations and traceable shipment records are what lenders and developers check when they assess bankability. Some buyers and lenders refer to the BloombergNEF Tier 1 list, but never claim a listing you do not hold.

### 5. Third-party sources

Coverage in trade media such as PV Magazine and PV Tech, published results from independent test labs (such as PVEL's PV Module Reliability Scorecard or RETC reports) and project information published by plant owners are common sources when AI cross-checks. If you took part in an independent test, state the year and the result, and link to the original.

## Pitfalls

1. **Traceability claims must match the evidence.** The US Uyghur Forced Labor Prevention Act (in force since June 2022) and the EU forced labour regulation ((EU) 2024/3015, applying from December 2027) lead buyers to ask where polysilicon and wafers come from. Publish only traceability statements your audit material supports. The EU text is on [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/3015/oj).
2. **Be precise about degradation and warranty.** First-year degradation, annual degradation and warranty terms must match the warranty document, and name the company that stands behind it.
3. **Do not reuse certificates across models.** A new series cannot borrow the old series' certificate numbers before it is certified.
4. **State the conditions behind efficiency figures.** Module efficiency at STC; for inverters, say whether it is maximum, European or CEC efficiency.
5. **Keep country pages current.** Grid codes change and certificates expire, so show the date each page was last checked.

## Launch checklist

- HTML parameter tables for modules and inverters, with efficiency and degradation conditions
- One certification page per target country with standard, certificate number and models
- PAN / OND files available for download
- Product structured data; language versions on their own URLs with hreflang
- At least three project pages with models and grid connection dates
- Traceability statements consistent with audit material

To see how AI describes your brand today, [run a free audit](/audit). Our [export GEO service](/services/geo) builds the question set and evidence for each target country; general rules for North America are in [GEO for US and Canadian buyers](/insights/geo-us-canada-buyers).`,
    faqs: [
      {
        q: 'Why organise certification pages by country?',
        a: 'Buyers usually name the country when they ask AI, for example "inverters with G99 approval in the UK". A page organised by country answers that directly, and AI cites it more readily.',
      },
      {
        q: 'What is the point of publishing PAN and OND files?',
        a: 'Plant designers often model in PVsyst, and PAN and OND files carry the module and inverter parameters. Making them downloadable helps EPCs and design institutes select your products and shows expertise directly.',
      },
      {
        q: 'How should supply-chain traceability be described safely?',
        a: 'Only state what audit material and certificates support, such as raw material sources and how the traceability system works. Avoid absolute claims you cannot prove.',
      },
      {
        q: 'Do we need language versions?',
        a: 'Installers in Germany, Spain and Latin America often search and ask in their own language. Each version needs its own URL and hreflang, and should be reviewed by someone who knows the industry.',
      },
    ],
  },
};
