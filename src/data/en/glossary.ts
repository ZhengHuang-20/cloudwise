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
    relatedTerms: ['SEO', 'RAG', 'AI Overview', 'E-E-A-T'],
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
    relatedTerms: ['SEO', 'GEO', 'Schema structured data'],
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
    relatedTerms: ['Technical SEO', 'Server-side rendering', 'CDN'],
  },
};
