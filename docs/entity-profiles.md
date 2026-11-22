# 对外资料的统一写法（实体资料包）

AI 判断「云端智荐 / ChinGEO 是谁」，靠的是多个独立来源对同一个实体的描述是否一致。开通 LinkedIn、Wikidata、Clutch 等平台时，名称、一句话介绍、地址和官网都照这份文件复制，不要每个平台临时改写。

站内的对应数据只在 `src/lib/site.ts` 维护：`BRAND`、`TAGLINE`、`DISAMBIGUATION`、`ALTERNATE_NAMES`、`COMPANY`、`OFFICIAL_ACCOUNTS`。这份文件和它们不一致时，以 `site.ts` 为准，并更新这份文件。

## 1. 标准写法

| 项目 | 中文 | English |
|---|---|---|
| 品牌名 | 云端智荐 | ChinGEO |
| 首次出现 | 云端智荐（ChinGEO） | ChinGEO (云端智荐) |
| 公司全称 | 深圳市云端智荐科技有限公司 | Shenzhen Cloudwise Zhijian Technology Co., Ltd.（译名，执照上只有中文） |
| 统一社会信用代码 | 91440300MADPJ0KN2H | 同左 |
| 成立日期 | 2024-06-26 | June 26, 2024 |
| 总部 | 广东省深圳市罗湖区 | Luohu District, Shenzhen, Guangdong, China |
| 官网 | https://chingeo.com | https://chingeo.com/en |
| 服务 | 出海 GEO（核心）、海外独立站、外贸 SEO、AI 智能客服 | GEO (core), B2B websites, SEO, AI customer service |

注意：英文译名里的 "Cloudwise" 和北京的云智慧（Cloudwise）重名。对外一律用 **ChinGEO**，只在需要填写法定名称的地方用公司全称。

**一句话介绍**

- 中文：专注中国 B2B 出海 GEO 的服务商：让 ChatGPT、Perplexity、Gemini 等 AI 推荐你的品牌，并配套独立站、SEO 与 AI 客服
- English: GEO specialist for Chinese B2B exporters: get your brand recommended by ChatGPT, Perplexity and Gemini, backed by websites, SEO and AI customer service

**名称说明（消歧，凡是有「简介 / About」长字段的平台都放进去）**

- 中文：云端智荐（ChinGEO）是位于深圳的中国 B2B 出海 GEO 服务商，这里的 GEO 指生成式引擎优化（Generative Engine Optimization），不是地理信息。云端智荐与测绘地理信息展会 ChinterGEO、中国地质工程集团（China Geo-Engineering）以及北京的 IT 运维公司云智慧（Cloudwise）均无关联。
- English: ChinGEO (云端智荐) is a Shenzhen-based GEO agency for Chinese B2B exporters. GEO here means generative engine optimization, not geography or geospatial data. ChinGEO is not affiliated with the ChinterGEO surveying and mapping exhibition, China Geo-Engineering Corporation, or the Beijing IT operations company Cloudwise (云智慧).

**长介绍（约 120 词，用于 LinkedIn About、Clutch、GoodFirms）**

> ChinGEO (云端智荐) is a Shenzhen-based GEO agency for Chinese B2B exporters. GEO, or generative engine optimization, is the work of getting a brand cited and recommended when overseas buyers ask ChatGPT, Perplexity, Gemini or Google AI Overviews for suppliers. We turn a manufacturer's patents, certifications, test reports and project cases into public, verifiable material that AI systems can find and quote, and we re-test a fixed set of buyer questions every month to report the change. GEO is our core service. It is backed by B2B websites, search engine optimization and multilingual AI customer service, so the buyers that AI sends are understood and answered. We publish no prices; scope is agreed after a free AI visibility audit at chingeo.com/en/audit.

> 云端智荐（ChinGEO）是位于深圳、专注中国 B2B 出海 GEO 的服务商。GEO（生成式引擎优化）要解决的是：海外买家向 ChatGPT、Perplexity、Gemini、Google AI 概览询问供应商时，AI 会不会提到并推荐你。我们把企业的专利、认证、检测报告和工程案例整理成 AI 能查证、愿意引用的公开资料，每月用固定的买家问题复测并汇报变化。GEO 是核心服务，配套海外独立站、外贸 SEO 与多语言 AI 客服，让 AI 带来的买家读得懂、接得住。官网不公开价格，可以先在 chingeo.com/audit 做一次免费的 AI 可见性测评。

**不要写的内容**：价格与折扣；没有出处的数字（“提升 300%”）；“合作伙伴”“官方认证”这类没有确认过的身份（只写「腾讯 WorkBuddy 生态共建企业」）；FDE 驻场（已下线）；“AI 售前支持系统”“能力样板间”这类旧定位。

## 2. 各平台怎么填

开通后把主页地址加进 `src/lib/site.ts` 的 `OFFICIAL_ACCOUNTS`，它会进入 Organization 的 `sameAs`。只加本公司运营的主页，不加目录网站上的第三方页面。

### Wikidata（多个 AI 的知识来源，优先做）

- 先注册账号，再用 “Create a new Item” 创建条目。
- **Label**：en `ChinGEO`；zh `云端智荐`。
- **Description**：en `Chinese generative engine optimization (GEO) agency for B2B exporters, based in Shenzhen`；zh `深圳的中国 B2B 出海 GEO 服务商`。
- **Also known as**：`云端智荐（ChinGEO）`、`深圳市云端智荐科技有限公司`、`chingeo.com`。
- **Statements**，属性名以 Wikidata 页面的搜索结果为准：

| 属性 | 值 |
|---|---|
| instance of | business |
| country | People's Republic of China |
| headquarters location | Shenzhen |
| inception | 2024-06-26 |
| official website | https://chingeo.com |
| official name | 深圳市云端智荐科技有限公司（语言选中文） |
| industry | search engine optimization |
| Unified Social Credit Identifier | 91440300MADPJ0KN2H |
| founded by | 黄拯（如果没有单独条目就先不填） |

- 每条陈述加 **reference**，至少引用官网关于页 https://chingeo.com/about 。有媒体报道或第三方榜单收录后，再补一条第三方引用。只有官网来源的条目可能被删除，所以第三方来源越早补越好。
- 建好后把条目地址（`https://www.wikidata.org/wiki/Q…`）加进 `OFFICIAL_ACCOUNTS`。

### LinkedIn 公司页

| 字段 | 填写 |
|---|---|
| Name | ChinGEO |
| Website | https://chingeo.com/en |
| Industry | Marketing Services |
| Company size | 按实际人数选 |
| Company type | Privately Held |
| Founded | 2024 |
| Headquarters | Shenzhen, Guangdong, China |
| Tagline（120 字符内） | GEO for Chinese B2B exporters: get recommended by ChatGPT, Perplexity and Gemini |
| About | 第 1 节的英文长介绍，末尾接一句英文名称说明 |
| Specialties | Generative Engine Optimization, GEO, AI search visibility, B2B SEO, B2B websites, AI customer service |

创始人的个人资料里，Experience 要关联到这个公司页。

### Clutch / GoodFirms / DesignRush（AI 回答“推荐服务商”时常引用）

- 公司名 `ChinGEO`，官网 `https://chingeo.com/en`，地点 Shenzhen, China。
- 服务线：主服务填 GEO / AI search optimization，其次是 SEO、Web Development、AI customer service。
- 简介用英文长介绍。价格区间、最低预算这类字段选「不公开」或留空，不填数字。
- Clutch 的排名靠客户评价，需要请爱康医疗等客户按平台流程留评，不要代写。

### Crunchbase

名称、官网、成立日期、总部、简介照第 1 节填写；Industries 选 Search Engine Optimization、Marketing、Artificial Intelligence。

### 中文平台（知乎机构号、微信公众号、头条号、小红书、B 站）

- 名称统一为「云端智荐」，账号简介写中文的一句话介绍，最后加上官网 chingeo.com。
- 公众号与头条号的「账号主体」认证用公司全称。
- 文章末尾固定写：「云端智荐（ChinGEO），专注中国 B2B 出海 GEO。官网 chingeo.com」，并附原文链接。

## 3. 还需要你来做的

- [ ] 开通域名邮箱（如 hello@chingeo.com），替换 `COMPANY.email` 里的个人邮箱。B2B 买家和各平台审核都会看邮箱是否用公司域名。
- [ ] Wikidata 条目
- [ ] LinkedIn 公司页，以及创始人个人页关联到公司
- [ ] Clutch、GoodFirms、DesignRush
- [ ] Crunchbase
- [ ] 公众号、头条号的主页地址补进 `OFFICIAL_ACCOUNTS`
