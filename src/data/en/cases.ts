// 标杆案例与行业方案的英文覆盖层，按 id 合并到 src/data/caseStudiesData.ts 的中文数据上。
// 结构与中文一一对应；typicalProblemClusters、relatedCaseId、iconName 等本身就是英文或无需翻译的字段，沿用中文数据。

export interface CaseStudyEn {
  clientName: string;
  industry: string;
  status: string;
  targetMarket: string;
  buyerRoles: string[];
  startingPointFriction: string;
  scoreComparison?: { metric: string; beforeLabel: string; afterLabel: string };
  whatWeDid: string[];
  results: { metrics: string[]; directOutcome: string };
  dataScopeStatement: string;
  reusableExperience: string[];
  testimonial?: { quote: string; author: string; title: string };
}

export interface SolutionEn {
  name: string;
  description: string;
  overseasDecisionMakers: { role: string; focusPoints: string[] }[];
  recommendedContentFormat: string[];
  complianceNotes: string[];
}

export const CASE_STUDIES_EN: Record<string, CaseStudyEn> = {
  'case-ak-medical': {
    clientName: 'Aikang Medical (AK Medical)',
    industry: 'Medical devices · orthopaedic implants and 3D-printed prostheses',
    status: 'Hong Kong-listed company · a leading Chinese orthopaedic joint maker',
    targetMarket: 'Major public and specialist medical institutions in Western Europe, North America, Latin America and Southeast Asia',
    buyerRoles: [
      'Orthopaedic surgeons',
      'Chairs of hospital medical device procurement committees',
      'Regional medical device distributors overseas',
      'National health registration review engineers',
    ],
    startingPointFriction:
      'The English content on the domestic site (ak-medical.net) was a machine translation of a Chinese brochure, with no three-reader technical architecture and no structured knowledge. Its GEO / SEO score was only 47, and overseas awareness was held back.',
    scoreComparison: {
      metric: 'GEO / SEO score comparison',
      beforeLabel: 'Current domestic site',
      afterLabel: 'New overseas site',
    },
    whatWeDid: [
      'Built a new English overseas site (ak-medical-global.com) as the main overseas front, meeting Core Web Vitals and multilingual standards',
      'Ran in-depth intent modelling for four types of overseas medical decision-makers, and mapped 91 high-authority English technical content items for the year',
      'Turned the clinical results of China’s 3D-printed porous titanium into bilingual parameter comparison guides and white papers that meet FDA and CE technical requirements',
      'Built authoritative sources across platforms (academic indexes, LinkedIn, official trade-fair directories) and ran monthly probe monitoring',
    ],
    results: {
      metrics: [
        'GEO / SEO score of 95 for the new overseas site, against 47 for the current domestic site',
        'chatgpt.com and perplexity.ai have sent referral visits consistently for several months (average stay 4 minutes 35 seconds)',
        'Organic enquiries to the overseas site up 320% month on month',
      ],
      directOutcome:
        'In research questions about international hospital tenders in Europe and Latin America, ChatGPT and Perplexity listed the company among the top three recommended suppliers in the Asia-Pacific region.',
    },
    dataScopeStatement:
      'Note: 47 is the GEO / SEO score of the current domestic site (ak-medical.net), and 95 is the score of the new overseas site (ak-medical-global.com). This compares two sites, not a before-and-after on the same site. Both were measured by the third-party tool arobis.ai on the same basis (site-wide signals, Schema definition completeness and source weighting). Referral traffic and enquiry sources come from real Google Analytics 4 and CRM tracking.',
    reusableExperience: [
      'Find out what overseas buyers ask AI before writing content',
      'Make the official site the single source of truth: every third-party media report and LinkedIn post links back to the site’s definition pages',
      'Be rigorous about how data is explained: overseas medical companies care about authenticity, and clean data earns international trust',
    ],
    testimonial: {
      quote:
        '“ChinGEO helped us turn dry technical parameters into authoritative evidence that overseas doctors and procurement committees can look up in ChatGPT. Right after the new site went live, distributors in Latin America came to us directly.”',
      author: 'International business department, Aikang Medical',
      title: 'Overseas market director',
    },
  },
  'case-tide-lion': {
    clientName: 'Taining Tech (Tide Lion)',
    industry: 'Environmental technology · rainwater management and municipal sponge-city works',
    status: 'National “little giant” specialised SME · co-authored dozens of national industry standards',
    targetMarket:
      'Municipal infrastructure contracting and water engineering in Europe (UK, Germany), the Middle East and Southeast Asia',
    buyerRoles: [
      'ESG investment officers at multinational companies',
      'Municipal rainwater drainage planning engineers in Europe',
      'Chief engineers at overseas water conservancy design institutes',
      'Procurement directors at international EPC contractors',
    ],
    startingPointFriction:
      'The company had top benchmark projects in China, including the Water Cube and Beijing Daxing Airport, but was almost invisible in overseas Google and AI search. Its English keywords did not match the words overseas engineers use.',
    whatWeDid: [
      'Mapped a 60-group English core keyword library with high commercial value, covering informational, comparison and procurement search intent',
      'Against the UK SuDS (sustainable drainage systems) standard, wrote a full set of English compliance guides and a selection and calculation handbook',
      'Published a technical article, "Lifecycle cost comparison: siphonic vs gravity drainage", with interactive data tables',
      'Deployed 24/7 AI customer service to answer large engineering enquiries from the Middle East and Europe in several languages, across time zones',
    ],
    results: {
      metrics: [
        '60 English core keyword groups reach the first two pages of Google in key US and European markets',
        'In Perplexity search, questions about UK municipal planning directly cite the company as a reference source',
        'Every engineering enquiry received outside working hours got a first reply',
      ],
      directOutcome:
        'Entered the international supplier shortlist for a rainwater storage project in a new Middle East city, with a stated purchase intent of more than US$800,000.',
    },
    dataScopeStatement:
      'Note: keyword rankings are monitored in real time through Google Search Console. Perplexity citations are verified through monthly blank probe sessions.',
    reusableExperience: [
      'Turn the credibility of co-authoring Chinese national standards into technical evidence that matches overseas engineering standards such as SuDS and ASTM',
      'Map one keyword to one page, so the company’s own pages never compete for the same term',
      'AI customer service picks up the overseas engineers who ask late at night, so they are not lost before the buyer shortlists',
    ],
    testimonial: {
      quote:
        '“We used to print brochures for overseas trade fairs, and nothing happened once the fair was over. Now European contractors searching for SuDS solutions find our white paper directly. It is the best export investment we have made.”',
      author: 'Overseas business division, Taining Tech',
      title: 'Vice president',
    },
  },
};

export const SOLUTIONS_EN: Record<string, SolutionEn> = {
  'solution-medical': {
    name: 'Medical devices and premium consumables export plan',
    description: 'A plan to win enquiries from overseas hospitals, procurement committees and drug regulators.',
    overseasDecisionMakers: [
      {
        role: 'Specialist attending physicians',
        focusPoints: ['Clinical evidence', 'Biocompatibility', 'Instrument feel and ease of use in surgery'],
      },
      {
        role: 'Procurement committee chairs',
        focusPoints: ['Total procurement cost', 'FDA/CE certification numbers', 'Batch consistency and supply-chain delivery'],
      },
      {
        role: 'Regional distributors overseas',
        focusPoints: ['Exclusive distribution protection policies', 'Minimum order quantities', 'Local after-sales and technical training'],
      },
    ],
    recommendedContentFormat: [
      'Abstracts of peer-reviewed retrospective clinical studies',
      'Product technical white papers with downloadable national registration certificates',
      'Tables of surgery volumes across countries and five-year survival follow-up data',
    ],
    complianceNotes: [
      'Strictly follow local advertising law, and do not exaggerate efficacy',
      'Publish CE MDR and FDA registration numbers for verification',
    ],
  },
  'solution-environmental': {
    name: 'Environmental technology and municipal engineering export plan',
    description:
      'Helps international contractors, overseas municipal planning institutes and water agencies find you, and trust you, when they select suppliers.',
    overseasDecisionMakers: [
      {
        role: 'Municipal water engineering chief engineers',
        focusPoints: ['Basis for return-period rainfall calculations', 'Material compressive strength class', 'ASTM test reports'],
      },
      {
        role: 'International EPC procurement',
        focusPoints: ['Container shipping volume ratio', 'On-site assembly labour savings', 'International payment terms and warranty'],
      },
      {
        role: 'Multinational ESG officers',
        focusPoints: ['Share of recycled materials', 'Full lifecycle carbon footprint', 'Bonus points for LEED green building certification'],
      },
    ],
    recommendedContentFormat: [
      'Engineering selection calculators and CAD node drawings that comply with local codes, available to download',
      'English construction and operating performance reports for landmark projects such as the Water Cube and Beijing Daxing Airport',
      'Third-party laboratory reports on compressive strength and service life',
    ],
    complianceNotes: [
      'State clearly that the products apply to local European and US engineering standards (such as BS EN 17152-1 and ASTM)',
    ],
  },
};
