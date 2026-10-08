import type { CourseEn } from './types';

export const courseA: CourseEn = {
  title: 'Websites——One site that speaks to buyers, Google and AI at once',
  subtitle:
    'Learn to plan an export website on your own: who it is written for, which pages it needs, which technical standards it must meet, and which numbers to watch after launch.',
  targetAudience: 'Export decision-makers, export directors, technical leads',
  relatedService: 'Overseas websites',
  heroCase: 'Aikang Medical overseas site (ak-medical-global.com)',
  toolName: 'AI visibility audit',
  executiveModuleSummary:
    'A website is not a template. It is the first data asset for overseas lead generation. A three-reader architecture (buyers, Google and AI) means the site can convert and be indexed on the day it goes live.',
  modules: {
    1: {
      name: 'M1 Foundations: the overseas website is the main front',
      description: 'Understand how an independent site differs from a platform store and from an "e-brochure" site',
    },
    7: {
      name: 'M7 Dashboard: the core metrics of an export website',
      description: 'From visitors and bounce rate to ChatGPT referrals and enquiry conversion: read the lead dashboard',
    },
  },
  lessons: {
    'lesson-a-1-1': {
      title: '1.1 Independent site, platform store and "e-brochure" site: what is the difference',
      summary:
        'Platform stores borrow traffic and rarely keep it. E-brochure sites talk only to themselves. An independent site builds first-party overseas data, international brand authority, and a home for enquiries from everywhere.',
      conceptContent: `Many Chinese exporters fall into two traps. The first is relying entirely on third-party marketplaces such as Alibaba.com, where the rules keep changing and customer assets cannot be kept. The second is machine-translating a Chinese brochure into English and putting it online, creating a "zombie brochure" that nobody visits.

A modern independent site offers three things nothing else can:
1. Customer data you control: every overseas visitor's browsing behaviour and enquiry form belongs to your own private data.
2. A fit with overseas B2B buying: large overseas buyers (procurement managers and engineers) read on average 7–10 technical specifications and case studies before ordering. The independent site is the single authoritative source that supports that decision.
3. One entity that Google and AI can recognise: a brand without its own site cannot build a verified knowledge-graph entity in Google or in large language models such as ChatGPT.`,
      misconceptions: [
        'Thinking an independent site means hiring a web agency to install a WordPress template for a few thousand yuan.',
        'Machine-translating the Chinese brochure word for word and ignoring overseas technical standards and units of measure.',
        'Judging the site only by how it looks, while ignoring load speed, mobile experience and structured data.',
      ],
      executiveTakeaway:
        'An export website is an investment, not a cost. It is the final destination for all overseas traffic: SEO, GEO, trade fairs and ads.',
      quiz: [
        {
          question: 'What is the core role of a modern overseas export website?',
          options: [
            'Only to let customers glance at it after a business card is handed out at a trade fair',
            'A digital home for lead generation across overseas buyers, Google and AI',
            'A machine-translated mirror of the Chinese site',
            'A full replacement for every task a salesperson does by hand',
          ],
          explanation:
            'A modern export website must satisfy overseas buyers’ purchasing decisions, Google’s indexing and AI models’ answer recommendations at the same time, forming a closed loop for lead generation across all three.',
        },
      ],
      nextStepLabel: 'Go to 1.2 Why one website has to be written for three readers',
    },
    'lesson-a-1-2': {
      title: '1.2 Why one website has to be written for three readers',
      summary:
        'Human buyers need evidence of trust and a purchasing logic. Google relies on a clearly structured semantic index. AI models need knowledge entities with definitions, data and structure.',
      conceptContent: `Overseas buying journeys have been fundamentally reshaped by 2026:
- Reader 1: the human buyer (engineers and procurement directors). They arrive with specific parameters, delivery times and certification needs, and need the spec sheet, engineering cases and verifiable certificates straight away.
- Reader 2: the Google search engine. It needs a clear H1/H2 hierarchy, Schema structured markup, canonical tags and fast Core Web Vitals.
- Reader 3: AI question-answering models (ChatGPT, Perplexity, Gemini). They build answers from public, high-value definitions, numerical tables and FAQs. If your site does not define your category clearly, AI will leave you out of its answers.`,
      misconceptions: [
        'Believing that the flashier the site and the more animation it has, the more overseas buyers it will attract. The result slows loading, and AI crawlers cannot read the content at all.',
        'Stuffing keywords to fool search engines, so the buyers who do arrive cannot understand the site and bounce at a rate above 90%.',
      ],
      executiveTakeaway:
        'Before designing the site, map each reader’s needs to every module: product pages give buyers the parameters, the underlying code gives Google its structure, and definitions and FAQs feed AI.',
      quiz: [
        {
          question:
            'When assessing an independent site, which content format do AI models (such as ChatGPT or Perplexity) favour most?',
          options: [
            'Slides made entirely of large image posters with almost no text',
            'Structured text with clear concept definitions, measured data tables and question-style FAQs',
            'Pages protected by complex JavaScript encryption that block crawlers',
            'Long passages copied from Wikipedia that have nothing to do with the product',
          ],
          explanation:
            'Large models rely on retrieval-augmented generation (RAG) and pretrained weights, and they cite knowledge with definitions, data and question-and-answer structure very readily.',
        },
      ],
      nextStepLabel: 'Check your site’s export readiness for free',
    },
    'lesson-a-1-4': {
      title: '1.4 For decision-makers: investment, timeline and acceptance',
      summary:
        'Understand what goes into an export website, the 2–3 month delivery rhythm and five objective acceptance criteria, so an owner can decide rationally in 15 minutes.',
      conceptContent: `Owners of export websites care most about three things:
1. Where the money goes: in a professional build, most of the investment is not in writing code. It goes into overseas buyer persona research, native-level English content and technical document rewriting, and deploying a Core Web Vitals architecture on an overseas CDN.
2. How long it takes: the standard delivery cycle is 8–12 weeks. The first 3 weeks cover buyer modelling and content structure, the middle 4 weeks cover front-end and back-end development and multilingual deployment, and the last 3 weeks cover technical SEO tuning, AI crawler access and form-to-CRM integration.
3. How to accept it: do not accept on subjective "looks good or not". Use objective measures: a Google PageSpeed score above 85, zero Schema validation errors, load times under 2.5 seconds in key overseas regions, and forms stored automatically in the CRM.`,
      misconceptions: [
        'Chasing a quick launch in a few days, and receiving a template site full of holes that has only a handful of pages indexed six months later.',
        'Leaving acceptance entirely to the owner’s personal taste in visuals, and ignoring how overseas procurement teams actually read.',
      ],
      executiveTakeaway:
        'Accept the project against engineered, data-based deliverable metrics, so that the site can be crawled effectively by Google and AI on the day it goes live.',
      nextStepLabel: 'Open the project planner to see the build timeline',
    },
    'lesson-a-7-4': {
      title: '7.4 Case study: reading one week of data on the Aikang Medical overseas dashboard',
      summary:
        'A real dashboard from the Aikang Medical global site. Read Google organic search, ChatGPT referral traffic, the spread of high-intent countries and the enquiry conversion path.',
      conceptContent: `In the sixth page of the brochure, the back-end dashboard of the Aikang Medical (AK Medical) global site shows a highly representative data structure:
1. Among referral sources, visits from generative AI such as chatgpt.com and perplexity.ai have climbed to 18% of the total, and these visitors stay 2.4 times longer than an average visitor.
2. The most visited pages are no longer "About Us" but the technical white-paper pages with parameter tables for porous 3D-printed titanium.
3. The enquiry funnel maps clearly: AI visibility audit → download of the technical white paper → live chat with smart customer service → follow-up by a salesperson.`,
      caseSnippet: {
        company: 'Aikang Medical (listed in Hong Kong)',
        title: 'The domestic site scores 47, the new overseas site scores 95, and ChatGPT brings steady real enquiries',
        description:
          'Comparing the domestic site (ak-medical.net) with the new overseas site (ak-medical-global.com) shows how the three-reader architecture and GEO planning work in overseas medical procurement.',
      },
      misconceptions: [
        'Looking only at page views and unique visitors, and ignoring the quality of traffic sources and the real enquiry conversion rate.',
      ],
      executiveTakeaway:
        'A proper export website needs a transparent data dashboard built in, so that every visit from Google or ChatGPT can be traced to its source.',
      nextStepLabel: 'Book a 30-minute diagnosis call',
    },
  },
};
