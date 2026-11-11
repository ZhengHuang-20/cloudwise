// 术语百科的英文覆盖层，按 id 合并到 src/data/glossaryData.ts 的中文数据上。
export interface GlossaryEn {
  term: string;
  questionTitle: string;
  oneLineDefinition: string;
  detailedExplanation: string;
  realWorldExample: string;
  commonPitfalls: string[];
  relatedTerms: string[];
}

export const GLOSSARY_EN: Record<string, GlossaryEn> = {
  'term-geo': {
    term: 'GEO (Generative Engine Optimisation)',
    questionTitle: 'What is export GEO (Generative Engine Optimisation)?',
    oneLineDefinition:
      'GEO turns a company’s material into public sources that AI can verify and is willing to cite, so that ChatGPT, Perplexity and Gemini are more likely to mention you when they answer overseas procurement questions.',
    detailedExplanation:
      'Unlike traditional SEO, which only cares where a keyword ranks in a list of results, GEO targets large language models that combine several sources to write one answer. When a buyer asks something like "recommend a few high-quality Asian orthopaedic implant suppliers", the model draws on its training data and live retrieval results, and picks up entities with clear definitions, credible numerical tables and authoritative third-party citations. GEO means getting AI to cite your material through decision-maker modelling, technical white papers, authoritative industry sources and monthly monitoring.',
    realWorldExample:
      'After Aikang Medical implemented GEO, when ChatGPT and Perplexity were asked about Asian 3D-printed porous titanium orthopaedic consumables, the company went from not being mentioned at all to ranking in the top three across repeated tests, with a link to its technical guide.',
    commonPitfalls: [
      'Believing that GEO means "poisoning" a model or inflating results through hacking. Compliant GEO has to rest on a real, public and authoritative chain of technical evidence.',
      'Believing that generating hundreds of low-quality articles with AI on your website will improve GEO. In practice, low-quality rewritten articles get demoted by search engines, and AI does not cite them either.',
    ],
    relatedTerms: ['SEO', 'AEO', 'AI Overviews', 'E-E-A-T', 'Entity'],
  },
  'term-fde': {
    term: 'FDE (Forward Deployed Engineer)',
    questionTitle: 'What is an FDE (forward deployed engineer)?',
    oneLineDefinition:
      'An FDE is an engineer who works on site inside a company’s business and is accountable for business results. Using AI, they write front-line experience down as standards, load the standards into systems, let AI carry out the work on those systems, and leave the capability with the company when they leave.',
    detailedExplanation:
      'The FDE originated at Palantir, where teams were split into Echo, who understand the industry, and Delta, who write code. An ordinary engineer builds one feature for many customers; an FDE makes many capabilities work for one customer. After 2024, AI companies such as OpenAI and Anthropic set up FDE teams, because what stalls enterprise AI projects is often not the model, but the fact that it cannot get into real processes, data and systems. For Chinese export companies the problem starts even earlier: many processes live in veteran salespeople’s experience and in WeChat chats, not in systems. So the FDE builds three layers from the bottom up: standardisation (write experience as rules), digitisation (load the rules into systems) and intelligence (let AI work on the systems). Each layer uses AI to speed things up, there is one observe–prototype–trial–consolidate cycle every week, and when the FDE leaves, the standards, systems, data and the people who can use them all stay with the company.',
    realWorldExample:
      'Example: in the first week on site, the FDE finds that salespeople judge by experience whether an enquiry is worth chasing. The FDE uses AI to distil grading rules from three months of enquiry emails, the sales director approves them, and they are written into the CRM intent field. AI then tags new enquiries by the rules, salespeople confirm or correct them, and corrected cases are written back into the rules every week.',
    commonPitfalls: [
      'Treating an FDE as on-site outsourcing or staffing. Outsourcing is accountable for a requirements document, but an FDE is accountable for business results and must leave the capability with the company.',
      'Skipping standardisation and digitisation to go straight to AI. Without clear rules and clean data, AI only produces demos, and nobody catches its mistakes after launch.',
      'Having only the IT department work with the FDE. If the business lead and frontline salespeople do not take part in the weekly trials and decisions, the system gets built and nobody uses it.',
    ],
    relatedTerms: ['Knowledge assets', 'Agile prototyping', 'Private deployment'],
  },
  'term-eeat': {
    term: 'E-E-A-T quality framework',
    questionTitle: 'What is Google’s E-E-A-T quality framework?',
    oneLineDefinition:
      'The framework in Google’s quality rater guidelines for judging how credible content is: Experience, Expertise, Authoritativeness and Trustworthiness, with trustworthiness as the core principle above the rest.',
    detailedExplanation:
      'In export B2B industrial and medical fields, overseas procurement is a major commercial decision, and Google’s quality assessment takes E-E-A-T signals into account. Companies need to show on their websites project photos from real surgical or engineering use, the credentials of technical authors, reports from internationally recognised testing laboratories, and strict privacy and anti-counterfeit policies.',
    realWorldExample:
      'Taining Tech turned its standing as a co-author of Chinese national standards into an authoritative technical report that matches UK engineering standards, with verifiable references to the standards.',
    commonPitfalls: [
      'Treating pure slogans, such as "world-leading, quality first", as professional evidence, without checkable third-party test reports.',
    ],
    relatedTerms: ['SEO', 'GEO', 'Structured data', 'Entity'],
  },
  'term-core-web-vitals': {
    term: 'Core Web Vitals (core page performance metrics)',
    questionTitle: 'What are Core Web Vitals, and why must an export website pass them?',
    oneLineDefinition:
      'Google’s three hard technical metrics for page experience: Largest Contentful Paint (LCP), Interaction to Next Paint (INP) and Cumulative Layout Shift (CLS).',
    detailedExplanation:
      'For an export website, buyers are spread across Europe, the Middle East and other regions. If the server sits only in China, or is not optimised with a global CDN, visits from overseas can be noticeably slow. Google treats page experience, including Core Web Vitals, as one reference for rankings. A speed gap affects the experience and can affect rankings, but it is not the only factor.',
    realWorldExample:
      'Through static rendering and a global Anycast CDN edge network, average overseas first-screen LCP was kept under 1.8 seconds.',
    commonPitfalls: [
      'Stacking dozens of megabytes of uncompressed, high-definition carousel videos on the homepage, which makes the mobile experience badly stutter.',
    ],
    relatedTerms: ['Technical SEO', 'Server-side rendering', 'CDN', 'Structured data'],
  },
  'term-aeo': {
    term: 'AEO (Answer Engine Optimisation)',
    questionTitle: 'What is AEO (answer engine optimisation), and how does it differ from GEO?',
    oneLineDefinition:
      'AEO is the practice of getting your content chosen as the direct answer by search engines and AI assistants: one page answers one question, with the conclusion first and the evidence after. It overlaps heavily with GEO, which puts more weight on being cited and recommended by generative AI.',
    detailedExplanation:
      'The term AEO is older than GEO. It first referred to Google’s featured snippets and voice assistants: a user asks one question, the system gives one answer, and whoever supplies that answer gets all the exposure. Once generative AI became mainstream, "answer engines" came to include ChatGPT, Perplexity, Gemini and Google AI Overviews, and the industry now often uses the two terms interchangeably. The difference is one of emphasis. AEO is about who supplies the answer to a single question, so the work is question-style headings, a direct answer at the top, steps and tables. GEO also has to deal with whether AI trusts you when it combines several sources, which adds third-party sources, a clear brand entity and regular re-testing. Exporters do not need to choose between them: work done the GEO way already covers what AEO asks for.',
    realWorldExample:
      'The glossary entries and articles on this site are organised the AEO way: the heading is a question, the first paragraph under it is an answer that can be quoted on its own, and the explanation, example and pitfalls come after. Each page also outputs FAQPage structured data.',
    commonPitfalls: [
      'Treating AEO as adding a block of FAQs at the bottom of a page. The answer belongs at the top, and it has to answer a question buyers really ask.',
      'Trying to answer ten questions on one page. Answer engines pick content question by question, so one page per question is easier to select.',
      'Changing the format without adding evidence. An answer with no data, sources or third-party confirmation can be read by AI, but will not be cited first.',
    ],
    relatedTerms: ['GEO', 'AI Overviews', 'Zero-click search', 'Structured data'],
  },
  'term-ai-overviews': {
    term: 'AI Overviews (Google)',
    questionTitle: 'What are Google AI Overviews, and how do you get cited in them?',
    oneLineDefinition:
      'AI Overviews are summaries written by generative AI at the top of Google search results, with links to their sources. To be cited, a page must first be indexed by Google and eligible to show a snippet, and its content has to answer the question directly.',
    detailedExplanation:
      'AI Overviews grew out of Google’s Search Generative Experience (SGE). They launched in the United States in May 2024 and have since expanded to more countries and languages. They do not appear for every search; they are more common for question-style searches that need information from several places, such as how to choose a supplier for a type of equipment. Google’s own guidance is that no special markup is needed to appear in an AI Overview: the page has to be indexed, meet the basic requirements for Search and be allowed to show a snippet, and the foundations of traditional SEO still apply. The controls are the same as for Search: nosnippet, max-snippet and data-nosnippet limit what can be quoted. The Google-Extended token in robots.txt governs training and grounding for Gemini and has no effect on AI Overviews, which rely on the index built by Googlebot.',
    realWorldExample:
      'Example: a buyer searches "how to verify an orthopaedic implant supplier’s credentials". An AI-written list of steps appears at the top of the results, with a few source links beside it. The pages listed as sources usually already rank well organically and contain a passage that answers the question directly.',
    commonPitfalls: [
      'Blocking Googlebot or adding nosnippet to the whole site to "protect content", and losing ordinary search snippets at the same time.',
      'Assuming that blocking Google-Extended opts you out of AI Overviews. It only affects Gemini, not Search.',
      'Watching rankings and ignoring how results are displayed. A page on page one that does not answer the question directly is unlikely to be pulled into an overview.',
    ],
    relatedTerms: ['GEO', 'AEO', 'Zero-click search', 'E-E-A-T'],
  },
  'term-zero-click': {
    term: 'Zero-click search',
    questionTitle: 'What is zero-click search, and what does it mean for an export website?',
    oneLineDefinition:
      'A zero-click search is one where the user gets the answer on the results page or inside an AI reply and never visits a website. For exporters, the measure of success has to widen from "how many clicks" to "are we named in the answer".',
    detailedExplanation:
      'Zero-click searches come from the growing number of direct answers on the results page: featured snippets, knowledge panels, "People also ask" and Google AI Overviews. AI assistants such as ChatGPT and Perplexity go further, completing the whole answer inside the conversation. Informational questions (what is, how to choose, which ones) are the most likely to end without a click, while searches with clear purchase intent still lead people to a website for specifications, certifications and contact details. The response is not to stop publishing, but to work on two layers. Informational content aims to be quoted and cited, so the brand name appears in the answer. Product pages, certification pages and enquiry forms serve the buyers who do click. Alongside clicks, track impressions, branded search volume and how often AI answers mention you.',
    realWorldExample:
      'Example: a procurement engineer asks AI "which suppliers make stormwater attenuation modules commonly used in Europe" and gets a list straight away. The companies on the list receive no click, yet they are now in the buyer’s consideration set. Companies missing from the list never get compared at all.',
    commonPitfalls: [
      'Seeing clicks fall, concluding the content is useless and stopping it. Check first whether impressions and branded searches are rising.',
      'Counting only website traffic and never testing mentions in AI answers. Part of your exposure now happens off your site.',
      'Writing every piece as a teaser that only pays off after a click. The deeper the answer is buried, the less likely it is to be quoted.',
    ],
    relatedTerms: ['AI Overviews', 'AEO', 'GEO'],
  },
  'term-entity': {
    term: 'Entity (brand entity)',
    questionTitle: 'What is an entity, and why must AI recognise your brand first?',
    oneLineDefinition:
      'An entity is a single "thing" that search engines and language models can identify uniquely: a company, a product, a person or a place. Before AI recommends a brand, it has to establish who the brand is, what it does and which facts belong to it.',
    detailedExplanation:
      'A keyword is a string; an entity is the object behind the string. Google’s Knowledge Graph and the internal knowledge of language models are both organised around entities. A company’s Chinese name, English name, short name, website and platform accounts have to be recognised as one object before the facts about it (founding date, location, products, certifications, customers) can accumulate in one place. Exporters often have a blurred entity: the Chinese and English names do not match, the English name is shared with another company, or descriptions on different platforms contradict each other. AI then either leaves the brand out or attaches someone else’s information to it. Three things make an entity clear: one name and one-sentence description used everywhere; Organization structured data on the website stating the legal name, address and official accounts (sameAs); and consistent descriptions in third-party sources such as industry directories, media and certification bodies.',
    realWorldExample:
      'This site’s English brand name is ChinGEO precisely to avoid sharing the name Cloudwise with another company. Every page outputs the same Organization node, stating the full company name, unified social credit code, address and official accounts.',
    commonPitfalls: [
      'Picking an English name casually, so it collides with an existing overseas brand or a generic word and AI cannot tell who is meant.',
      'Letting the company description differ across the website, B2B platforms and social accounts, with founding dates and main products that contradict each other.',
      'Saying who you are only on your own website, with no third-party source to confirm it.',
    ],
    relatedTerms: ['Structured data', 'E-E-A-T', 'GEO'],
  },
  'term-structured-data': {
    term: 'Structured data (Schema / JSON-LD)',
    questionTitle: 'What is structured data (Schema and JSON-LD), and what should an export site add?',
    oneLineDefinition:
      'Structured data is a machine-readable description written into a page’s code. Using the Schema.org vocabulary, usually in JSON-LD format, it states which company, product or article the page is about, so search engines and AI can understand the page accurately.',
    detailedExplanation:
      'Schema.org is a vocabulary founded in 2011 by Google, Microsoft, Yahoo and Yandex. It defines hundreds of types such as Organization, Product, Article and FAQPage. JSON-LD is one format for writing that information into a page, and the one Google recommends. For a B2B export site the most valuable types are: a site-wide Organization (legal name, address, contact details, official accounts); Product on product pages (model, specifications, certifications; the price can be left out when B2B prices are not published); Article on articles (author, publication and update dates); BreadcrumbList for the navigation hierarchy; and FAQPage where the page has questions and answers. Two rules matter. The markup must match what is visible on the page. And markup only makes a page eligible for rich results; it does not guarantee them. How each AI platform uses structured data has not been fully disclosed, but one thing is certain: it means "who is this page about" no longer has to be guessed.',
    realWorldExample:
      'Every page on this site outputs JSON-LD from the server: Organization and WebSite site-wide, Service plus FAQPage on service pages, Article plus an author Person on articles, DefinedTerm on glossary pages, and VideoObject on lesson pages.',
    commonPitfalls: [
      'Marking up content that is not on the page, such as ratings and reviews nobody can see. This breaks Google’s structured data rules.',
      'Inserting JSON-LD in the browser with JavaScript, so crawlers that do not run scripts never see it.',
      'Expecting rankings to rise because structured data was added. It solves "can be understood", not "ranks higher".',
    ],
    relatedTerms: ['Entity', 'E-E-A-T', 'AI crawlers', 'Core Web Vitals'],
  },
  'term-ai-crawlers': {
    term: 'AI crawlers',
    questionTitle: 'What are AI crawlers, and should you allow GPTBot, ClaudeBot and PerplexityBot?',
    oneLineDefinition:
      'AI crawlers are the programs AI companies use to fetch web pages. They fall into three kinds: for training, for building a search index, and for reading a page live when a user asks. Exporters who want AI to recommend them should allow these crawlers in robots.txt and make sure the content can be read without running scripts.',
    detailedExplanation:
      'The main AI companies publish the names and purposes of their crawlers. OpenAI has three: GPTBot for model training, OAI-SearchBot to build the index for ChatGPT search, and ChatGPT-User to visit pages live when a user asks. Anthropic’s equivalents are ClaudeBot, Claude-SearchBot and Claude-User; Perplexity has PerplexityBot and Perplexity-User. Google-Extended is not a separate crawler but a robots.txt token that controls whether content may be used for Gemini training and grounding. These crawlers differ from search engine crawlers in two ways. First, published tests show that most AI crawlers do not execute JavaScript, so content that only appears after browser rendering is invisible to them. Second, fetches triggered by a user’s question are not always handled under robots.txt rules; check each company’s documentation. For a company that wants to be cited by AI, blocking the search-index crawlers means leaving AI search results voluntarily, and blocking the training crawlers reduces the chance of the brand entering a model’s long-term knowledge.',
    realWorldExample:
      'This site’s robots.txt explicitly allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot and others, and blocks only API paths. Every page is generated as complete HTML on the server, and the site provides llms.txt and a Markdown version of each page.',
    commonPitfalls: [
      'A website template or security plugin blocks "unknown bots" by default and shuts out AI crawlers without the owner knowing.',
      'robots.txt allows the crawlers, but the CDN or firewall returns 403 by user agent. Check both.',
      'The page is rendered entirely in the browser, so the crawler receives an empty HTML shell and cannot read anything even when allowed.',
    ],
    relatedTerms: ['Structured data', 'GEO', 'IndexNow'],
  },
  'term-hreflang': {
    term: 'hreflang (language version annotations)',
    questionTitle: 'What is hreflang, and how do you get it right on a multilingual site?',
    oneLineDefinition:
      'hreflang is an annotation that tells search engines which language or regional versions exist for the same content, so a German buyer finds the German page and a US buyer the English one. It shows the right version to the right person; it does not raise rankings directly.',
    detailedExplanation:
      'hreflang can be declared in three places: link tags in the page head, HTTP response headers, or sitemap.xml. Pick one and keep it consistent. A value is a language code (ISO 639-1, such as en, de, zh) plus an optional region code (ISO 3166-1, such as en-GB, zh-CN), and x-default marks the fallback page when no version matches. Three rules are strict. Annotations must be reciprocal: if page A declares page B, page B must declare page A, or the pair is ignored. Each page must include an entry pointing to itself. And every URL must be a canonical address that loads normally and can be indexed, not a redirect or a noindex page. hreflang is used mainly by Google and Yandex. It does not merge content; it only swaps between versions, so each language version still has to be good enough on its own.',
    realWorldExample:
      'On this site Chinese pages have no path prefix and English pages sit under /en. Each page declares three hreflang entries (zh-CN, en and x-default) in both the head and the sitemap, and the two languages point to each other.',
    commonPitfalls: [
      'Adding an annotation on the English page that points to the German page, with no return link from the German page, which invalidates the set.',
      'Getting the region code wrong, such as en-UK (the correct code is en-GB), or giving a region with no language.',
      'Redirecting visitors automatically by IP address. Crawlers mostly visit from the United States and would never see the other language versions.',
      'Machine-translating dozens of language versions and adding hreflang. Low-quality translated pages do not rank because they are annotated.',
    ],
    relatedTerms: ['Structured data', 'Core Web Vitals', 'IndexNow'],
  },
  'term-indexnow': {
    term: 'IndexNow (URL submission protocol)',
    questionTitle: 'What is IndexNow, and why does it matter for ChatGPT search too?',
    oneLineDefinition:
      'IndexNow is an open protocol that lets a website tell search engines which pages are new or updated. Microsoft Bing and Yandex launched it in 2021. After a submission, search engines can crawl the pages sooner without waiting to discover them.',
    detailedExplanation:
      'It is simple to use. Generate a key, place a text file with the same name at the root of the site to prove ownership, then submit the changed URLs in one HTTP request, up to 10,000 at a time. A submission to any participating search engine is shared with the others, which currently include Bing, Yandex, Naver and Seznam. Google has not adopted IndexNow and still relies on sitemaps and its own crawling. It matters for GEO because Bing’s index serves more than Bing: Microsoft Copilot uses it, and ChatGPT search uses Bing as one of its index sources. For a new site, or one that changes rarely, crawlers arrive slowly, and active submission shortens the time from publishing to being indexed. It is only a notification and does not guarantee indexing; the quality of the page still decides the outcome.',
    realWorldExample:
      'After each production deployment of this site, the build script submits every indexable URL through IndexNow. The key file sits at the root of the site.',
    commonPitfalls: [
      'Assuming a submitted URL will be indexed. IndexNow only says "come and look"; the content decides the rest.',
      'Resubmitting unchanged pages every day. The protocol asks for URLs that were added, updated or deleted.',
      'Using IndexNow alone, without submitting a sitemap or verifying Google Search Console. Google does not use this protocol.',
    ],
    relatedTerms: ['AI crawlers', 'hreflang', 'Structured data'],
  },
};
