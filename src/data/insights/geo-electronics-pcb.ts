import type { Insight } from './types';

export const geoElectronicsPcb: Insight = {
  slug: 'geo-electronics-pcb',
  topic: 'geo',
  author: 'founder',
  publishedAt: '2026-11-20',
  updatedAt: '2026-11-20',
  keywords: {
    zh: ['PCB GEO', '电子制造出海 GEO', 'PCBA 工厂 AI 搜索', 'PCB 工艺能力表怎么写', 'IPC 标准 官网展示', 'RoHS REACH 官网'],
    en: ['GEO for PCB manufacturers', 'PCB assembly supplier AI search', 'EMS provider ChatGPT visibility', 'PCB capability table website', 'IPC class 3 manufacturer China'],
  },
  relatedServices: ['geo', 'website', 'ai-customer-service'],
  relatedTerms: ['term-structured-data', 'term-entity', 'term-eeat'],
  relatedLessons: ['lesson-c-3-1', 'lesson-a-1-2'],
  zh: {
    title: 'PCB 与电子制造企业怎么做 GEO？2026 年技术实现与注意事项',
    seoTitle: 'PCB 与电子制造企业 GEO 指南（2026）',
    description:
      'PCB 与电子制造企业怎么做出海 GEO：工艺能力表怎么写、IPC 与 UL 资质、RoHS / REACH 合规，以及量产能力与打样能力为什么要分开写。',
    answer:
      'PCB 与电子制造企业做 GEO，关键是一张写清口径的工艺能力表：层数、最小线宽线距、最小孔径、板厚、材料、表面处理、阻抗公差，并区分量产能力与打样能力；再公开 IPC 验收等级、UL 认证档案号、RoHS 与 REACH 声明，以及按行业的质量体系（如汽车 IATF 16949、医疗 ISO 13485）。工程师和 AI 都按这些参数筛选供应商。',
    body: `## 海外工程师会怎么问 AI

电子制造的买家多是硬件工程师、NPI 工程师和供应链经理，他们问 AI 的问题很具体：

- "PCB manufacturers in China that support 0.075mm trace and HDI any-layer"
- "Turnkey PCBA suppliers with IPC-A-610 Class 3 for medical devices"
- "Rogers RO4350B PCB fabrication with impedance control, low volume"
- "EMS providers with ISO 13485 and box build capability"

这些问题本质上是参数筛选。AI 能不能推荐你，取决于它能不能读到你的工艺参数、验收等级和资质。机制见[ChatGPT 和 Gemini 怎么挑选推荐供应商](/insights/how-ai-picks-suppliers)。

## 工程师会核对的证据

| 证据 | 用来判断什么 | 官网上怎么写 |
|---|---|---|
| 工艺能力表 | 能不能做我的板 | HTML 表格，每项写清量产值与打样值 |
| IPC 标准与验收等级 | 质量水平是否满足产品要求 | 写清依据的标准（如 IPC-A-600、IPC-6012、IPC-A-610、J-STD-001）和可做到的等级（Class 2 / 3） |
| UL 认证 | 板材与成品板的阻燃与安全要求 | 写清 UL 档案号（E 开头）、认证的板材与阻燃等级（如 94V-0） |
| RoHS / REACH | 能否进入欧盟市场 | 提供符合性声明与检测报告的说明，写清依据的指令版本 |
| 行业质量体系 | 能否承接汽车、医疗、航空订单 | IATF 16949、ISO 13485、AS9100 等，写清证书编号与覆盖的工厂 |

UL 的认证可以在 UL 的公开认证数据库中按档案号查询，档案号写准，工程师自己就能核对。

## 技术实现方案

### 1. 工艺能力表：每一项写清口径

能力表是电子制造官网最重要的页面。建议分 PCB 制造、PCBA 组装、测试三张表：

- **PCB**：层数、板厚范围、最小线宽线距、最小机械孔与激光孔、HDI 阶数、板材（FR-4 各 Tg 等级、高频材料、铝基板）、表面处理（ENIG、沉银、OSP、HASL 等）、阻抗公差、最大板尺寸；
- **PCBA**：最小元件尺寸、BGA 最小间距、贴片与插件能力、X-Ray 与 AOI、三防漆、整机组装；
- **测试**：飞针、ICT、FCT、老化。

每一项分“量产能力”与“打样能力”两列。只写一个最好看的数字，工程师按它下单后做不出来，信任就没了。

### 2. 材料与工艺的独立页面

高频板、HDI、软硬结合板、厚铜板、铝基板这类工艺，各做一页：适用场景、你的能力范围、常用材料型号、设计建议（例如阻抗设计、叠层建议）。这类页面能直接回答工程师的技术问题，也是 AI 最愿意引用的内容类型。

### 3. 设计规范与文件要求

公开你接受的文件格式（Gerber RS-274X、ODB++、IPC-2581、BOM 与坐标文件）、DFM 检查流程、叠层与阻抗计算方式。工程师在选厂之前就会先看这些，也常常直接问 AI。

### 4. 结构化数据与实体信息

工艺页可以用 Service 结构化数据描述服务类型与服务范围，资质用正文链接或 hasCertification 表达。公司英文名、工厂地址和资质在官网、LinkedIn、行业展会名录（如 electronica、IPC APEX EXPO 的参展商页面）上保持一致。原理见 [实体](/glossary/entity) 与 [结构化数据](/glossary/structured-data)。

### 5. 第三方来源

行业媒体、IPC 会员名录、元器件分销与设计平台上的工厂介绍、工程师社区里的真实评价，都是 AI 交叉验证时会找的地方。真实的工程师评价分量很重，可以邀请合作客户在公开平台留下评价，但不要刷评价。

## 注意事项

1. **量产与打样分开写**：同一项参数的量产能力与打样能力往往差一个等级，混在一起写是最常见的失信点。
2. **IPC 等级写清“可以做到”还是“默认执行”**：多数工厂默认按 Class 2，按需做 Class 3，要写明，并说明 Class 3 的检验方式。
3. **RoHS 写准版本**：欧盟 RoHS 指令 2011/65/EU 经 (EU) 2015/863 增加了 4 种邻苯二甲酸酯，声明要写清依据的版本。原文见 [EUR-Lex](https://eur-lex.europa.eu/eli/dir/2011/65/oj)。
4. **不暗示代理关系**：写“可代购某品牌芯片”时，说明是采购服务而非授权代理，并写清元器件来源与追溯方式。
5. **出口管制要先评估**：涉及军工、航空航天或特定高性能器件的能力描述，可能触及出口管制，发布前先做合规评估。

## 上线检查清单

- 工艺能力表是 HTML，量产值与打样值分开
- 每种特殊工艺（HDI、高频、软硬结合等）有独立页面
- IPC 标准与等级、UL 档案号、RoHS / REACH 声明写清版本与范围
- 公开接受的文件格式与 DFM 流程
- 行业质量体系写清证书编号与覆盖工厂
- 公司信息在官网、LinkedIn 与展会名录一致

先[做一次免费测评](/audit)，看看 AI 能不能读到你的工艺能力。我们的[出海 GEO 服务](/services/geo)会按工艺与目标行业整理问题集；工程师常在非工作时间询价，可以配合 [AI 智能客服](/services/ai-customer-service) 及时回复。产品页的通用写法见[外贸官网产品页 6 项自查清单](/insights/ai-supplier-search-product-page-checklist)。`,
    faqs: [
      {
        q: 'PCB 企业做 GEO，最重要的页面是哪一个？',
        a: '工艺能力表。用 HTML 表格写清层数、线宽线距、孔径、材料、表面处理、阻抗公差等，并把量产能力和打样能力分开。',
      },
      {
        q: '为什么要区分量产能力和打样能力？',
        a: '两者常差一个等级。只写最好看的数字，客户按它下单却做不出来，会直接失去信任，AI 也可能引用到不准确的信息。',
      },
      {
        q: 'UL 认证怎么写才能被核对？',
        a: '写清 UL 档案号（E 开头）、认证的板材与阻燃等级。工程师可以在 UL 的公开认证数据库中按档案号查询。',
      },
      {
        q: '电子制造企业需要做多语言站吗？',
        a: '英文是基础。德国、日本、韩国等市场的工程师也常用本国语言搜索，可按目标市场逐步增加语言版本，并用独立网址和 hreflang 关联。',
      },
    ],
  },
  en: {
    title: 'GEO for PCB and electronics manufacturers in 2026: implementation and pitfalls',
    seoTitle: 'GEO for PCB and electronics manufacturers: a 2026 guide',
    description:
      'How PCB, PCBA and EMS makers get cited by AI: capability tables, IPC and UL credentials, RoHS / REACH, and why volume and prototype capability differ.',
    answer:
      'For PCB and electronics manufacturers, GEO comes down to a capability table with clear definitions: layer count, minimum trace and space, minimum hole, board thickness, materials, finishes and impedance tolerance, with volume and prototype capability shown separately. Add IPC acceptance classes, UL file numbers, RoHS and REACH declarations and sector quality systems such as IATF 16949 or ISO 13485. Engineers and AI both filter suppliers on these parameters.',
    body: `## What overseas engineers ask AI

Electronics buyers are mostly hardware engineers, NPI engineers and supply chain managers, and their questions are specific:

- "PCB manufacturers in China that support 0.075mm trace and HDI any-layer"
- "Turnkey PCBA suppliers with IPC-A-610 Class 3 for medical devices"
- "Rogers RO4350B PCB fabrication with impedance control, low volume"
- "EMS providers with ISO 13485 and box build capability"

These are filtering questions. Whether AI recommends you depends on whether it can read your process parameters, acceptance classes and credentials. See [how ChatGPT and Gemini pick suppliers](/insights/how-ai-picks-suppliers).

## The evidence engineers check

| Evidence | What it tells them | How to present it |
|---|---|---|
| Capability table | Whether you can build their board | An HTML table with a volume value and a prototype value for each item |
| IPC standards and classes | Whether quality meets the product's needs | The standards you work to (such as IPC-A-600, IPC-6012, IPC-A-610, J-STD-001) and the class you can deliver (Class 2 / 3) |
| UL recognition | Flammability and safety of laminates and finished boards | Your UL file number (starting with E), the laminates and the flammability rating (such as 94V-0) |
| RoHS / REACH | Whether products can enter the EU | Declarations of conformity and test reports, with the directive version |
| Sector quality systems | Whether you can take automotive, medical or aerospace orders | IATF 16949, ISO 13485, AS9100 and so on, with certificate numbers and the plants covered |

UL certifications can be searched by file number in UL's public certification database, so an accurate file number lets engineers verify it themselves.

## How to implement it

### 1. Capability tables with clear definitions

The capability table is the most important page on an electronics manufacturer's site. Split it into three tables for PCB fabrication, PCBA assembly and testing:

- **PCB**: layer count, thickness range, minimum trace and space, minimum mechanical and laser-drilled holes, HDI structure, laminates (FR-4 Tg grades, high-frequency materials, aluminium), finishes (ENIG, immersion silver, OSP, HASL and others), impedance tolerance, maximum panel size;
- **PCBA**: smallest component size, minimum BGA pitch, SMT and through-hole capability, X-ray and AOI, conformal coating, box build;
- **Testing**: flying probe, ICT, FCT, burn-in.

Give every item two columns: volume capability and prototype capability. If you publish only the most impressive number and an engineer orders against it, trust is gone when you cannot build it.

### 2. Separate pages for materials and processes

Give high-frequency boards, HDI, rigid-flex, heavy copper and aluminium boards a page each: where they are used, your capability range, common laminates, and design advice such as impedance and stack-up guidance. These pages answer engineers' technical questions directly, and they are the kind of content AI is most willing to cite.

### 3. Design rules and file requirements

Publish the formats you accept (Gerber RS-274X, ODB++, IPC-2581, BOM and pick-and-place files), your DFM review process and how stack-up and impedance are calculated. Engineers read this before choosing a factory, and often ask AI about it directly.

### 4. Structured data and entity details

Process pages can use Service structured data to describe service type and coverage, with credentials expressed through in-page links or hasCertification. Keep the English company name, plant addresses and credentials consistent on the website, LinkedIn and trade-fair listings (such as electronica or IPC APEX EXPO exhibitor pages). See [entity](/glossary/entity) and [structured data](/glossary/structured-data).

### 5. Third-party sources

Trade media, IPC member directories, factory profiles on component distribution and design platforms, and genuine reviews in engineering communities are all places AI checks. Real engineer reviews carry weight, so invite customers to leave public reviews, but never fake them.

## Pitfalls

1. **Separate volume from prototype capability.** The two are often a grade apart, and mixing them is the most common way to lose credibility.
2. **Say whether an IPC class is achievable or the default.** Most factories build to Class 2 by default and to Class 3 on request. Say so, and explain how Class 3 is inspected.
3. **Cite the right RoHS version.** EU RoHS Directive 2011/65/EU was amended by (EU) 2015/863 to add four phthalates, so state which version your declaration follows. The text is on [EUR-Lex](https://eur-lex.europa.eu/eli/dir/2011/65/oj).
4. **Do not imply distribution rights.** If you source branded chips for customers, say it is a purchasing service, not authorised distribution, and explain component sourcing and traceability.
5. **Check export controls first.** Capability descriptions involving defence, aerospace or certain high-performance components may touch export controls, so assess compliance before publishing.

## Launch checklist

- HTML capability tables with volume and prototype values separated
- A page for each special process (HDI, high-frequency, rigid-flex and so on)
- IPC standards and classes, UL file number and RoHS / REACH declarations with versions and scope
- Accepted file formats and the DFM process published
- Sector quality systems with certificate numbers and plants covered
- Consistent company details on the website, LinkedIn and trade-fair listings

[Run a free audit](/audit) to see whether AI can read your capabilities. Our [export GEO service](/services/geo) builds the question set by process and target industry; engineers often ask for quotes outside your working hours, so pair it with [AI customer service](/services/ai-customer-service). General product page rules are in the [six-point product page checklist](/insights/ai-supplier-search-product-page-checklist).`,
    faqs: [
      {
        q: 'Which page matters most for a PCB company’s GEO?',
        a: 'The capability table. Use HTML tables for layer count, trace and space, hole sizes, materials, finishes and impedance tolerance, with volume and prototype capability shown separately.',
      },
      {
        q: 'Why separate volume and prototype capability?',
        a: 'They are often a grade apart. If you publish only the best number and a customer orders against it, you lose their trust, and AI may cite inaccurate information.',
      },
      {
        q: 'How should UL recognition be shown so it can be checked?',
        a: 'Give your UL file number (starting with E), the laminates and the flammability rating. Engineers can look the file number up in UL’s public certification database.',
      },
      {
        q: 'Do electronics manufacturers need language versions?',
        a: 'English is the base. Engineers in Germany, Japan and Korea also search in their own languages, so add versions market by market, each on its own URL linked with hreflang.',
      },
    ],
  },
};
