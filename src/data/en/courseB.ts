import type { CourseEn } from './types';

export const courseB: CourseEn = {
  title: 'SEO——Get overseas buyers to find you on Google',
  subtitle:
    'Understand and run an export SEO project: Google standards, keyword mapping, the E-E-A-T quality framework and how to measure results.',
  targetAudience: 'Export general managers, overseas market directors, brand operators',
  relatedService: 'Export SEO',
  heroCase: 'Taining Tech: 60 English core keyword groups and the UK SuDS standard',
  toolName: 'AI visibility audit',
  executiveModuleSummary:
    'SEO is not just about ranking keywords. It is the underlying knowledge channel for GEO. Through E-E-A-T authority signals and topic clusters of content, it builds a lasting, natural lead-generation moat.',
  modules: {
    1: {
      name: 'M1 Foundations: how search engines work and divide the labour',
      description: 'Crawling, indexing, ranking and the search mindset of overseas buyers',
    },
    3: {
      name: 'M3 Keyword system and content clusters',
      description: 'Build core, long-tail and question keyword systems from buyers’ search intent',
    },
  },
  lessons: {
    'lesson-b-1-3': {
      title: '1.3 How SEO, paid ads and GEO fit together',
      summary:
        'Paid ads stop delivering the moment the budget stops. SEO is a lasting public asset. GEO is the final recommendation built on search indexes. Together they form the lead-generation funnel.',
      conceptContent: `Traditional export lead generation depends too heavily on Google Ads keyword bidding. The cost per click rises every year, and traffic falls off a cliff the moment the budget stops. SEO, by contrast, builds the natural authority of your digital assets. Every technical article that Google indexes keeps earning long-tail returns.

More importantly, the answers from today's leading AI tools (Google AI Overviews, Perplexity, ChatGPT Search) are built by retrieving, in real time, from high-authority pages that Google has already crawled and trusts. Without a healthy SEO foundation, GEO recommendations have nothing to stand on.`,
      misconceptions: [
        'Believing that SEO means hiring an offshore team to buy backlinks and stuff keywords, which gets the site demoted by Google’s algorithm.',
        'Setting SEO and GEO against each other, without realising that SEO’s technical foundation is the fuel for GEO.',
      ],
      executiveTakeaway:
        'Treat the SEO budget as an investment in a fixed digital asset. SEO earns the site a pass into Google’s index, and that directly supports later GEO recommendations.',
      quiz: [
        {
          question: 'Why is SEO described as "the underlying channel for export GEO"?',
          options: [
            'Because SEO produces results much faster than GEO',
            'Because large models that retrieve in real time (such as ChatGPT Search and Perplexity) depend heavily on high-authority pages indexed by mainstream search engines',
            'Because Google and OpenAI are the same company',
            'Because overseas buyers only search on Google and never use AI',
          ],
          explanation:
            'The retrieval-augmented mechanisms of large models depend on high-quality indexes of public web pages. Healthy SEO and structured data are the prerequisites for AI to crawl and cite your content.',
        },
      ],
      nextStepLabel: 'Go to 3.5 Taining Tech’s 60 core keyword case',
    },
    'lesson-b-3-5': {
      title: '3.5 Case study: how Taining Tech built a 60-group English core keyword system',
      summary:
        'From a Chinese rainwater product line to 60 high-commercial-value English keyword groups that match how engineers on European and US municipal projects search.',
      conceptContent: `Taining Tech is a leading Chinese rainwater management and sponge-city company. Early in its overseas push, it translated "rainwater module" and "infiltration well" word for word as "Rainwater Module". That term had very low search volume overseas and did not match engineering practice.

The Cloudwise team rebuilt the buyer intent in depth:
1. Keyword families: the library was split into informational ("What is SuDS compliance?"), comparison ("Siphon drainage vs gravity drainage cost comparison") and procurement ("stormwater attenuation tank manufacturer supplier") terms.
2. One keyword, one page: no two internal pages are allowed to compete for the same keyword.
3. Alignment with UK and EU standards: authoritative compliance guidance was written around SuDS (sustainable drainage systems), so international contractors can follow it directly.`,
      caseSnippet: {
        company: 'Taining Tech (Tide Lion)',
        title: '60 core keyword groups reach European and US municipal engineering and water contractors precisely',
        description:
          'The company’s Chinese project experience, from landmark water and airport projects, was turned into English technical evidence that matches the UK SuDS standard and ASTM specifications.',
      },
      misconceptions: [
        'Running keywords through machine translation word for word, ignoring the standard technical terms that engineers in the industry actually use.',
      ],
      executiveTakeaway:
        'Keywords are not pulled from thin air. They must come from the real purchase intent of overseas buyers and from local engineering standards.',
      nextStepLabel: 'Download the Taining Tech keyword mapping template',
    },
  },
};
