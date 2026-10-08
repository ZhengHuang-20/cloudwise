import type { CourseEn } from './types';

export const courseC: CourseEn = {
  title: 'GEO——Get AI to name you in its answers',
  subtitle:
    'ChinGEO flagship course: how AI picks suppliers, how to measure your position inside AI, and how to keep improving through a six-step closed loop.',
  targetAudience: 'Export decision-makers, marketing directors, heads of export sales',
  relatedService: 'Export GEO',
  heroCase: 'Aikang Medical: 91 content items planned for the year and an AI recommendation score of 95',
  toolName: 'AI visibility audit',
  executiveModuleSummary:
    'The buyer’s first stop is moving from the search box to the AI chat window. Doing GEO means staying in the first tier of the 3–5 supplier names that ChatGPT, Perplexity and Gemini give.',
  modules: {
    1: {
      name: 'M1 Foundations: the shift from the search box to the AI chat window',
      description: 'How overseas buyers’ purchasing behaviour has changed, and how large models work',
    },
    3: {
      name: 'M3 Closed loop: ChinGEO’s six-step GEO method',
      description: 'Diagnose, model, create content, build sources, manage reputation and monitor, iterated monthly',
    },
    10: {
      name: 'M10 For decision-makers: investment, timeline and acceptance',
      description: 'How to judge GEO return on investment rationally, choose a provider and respect compliance red lines',
    },
  },
  lessons: {
    'lesson-c-1-1': {
      title: '1.1 The buyer’s first stop is changing: from reading dozens of pages to asking AI for a shortlist',
      summary:
        'Buyers used to open ten web pages from the results and filter them slowly. Now AI draws on the whole web and gives 3–5 recommended suppliers with reasons. If you are not in the answer, you are cut out entirely.',
      conceptContent: `According to the latest 2026 research on overseas purchasers, more than 54% of European and US B2B purchase decision-makers start their initial research by asking ChatGPT-4o, Perplexity or Gemini something like: "Recommend three cost-effective Asia-Pacific orthopaedic implant suppliers with CE/FDA certification".

When AI writes an answer, it does not show thousands of blue links. It gives a concise paragraph and a comparison table. That means:
- In the past, ranking eighth on Google could still bring hundreds of clicks.
- Today, if AI does not name you among the three suppliers it generates, your potential customer never knows you exist. This is the most serious "invisible, not trusted" bottleneck facing export companies.`,
      misconceptions: [
        'Believing AI is just a toy, and that serious overseas buyers of industrial or medical equipment would never use AI to look for suppliers.',
        'Thinking that posting a few AI-generated, reworded articles on your website counts as doing GEO.',
      ],
      executiveTakeaway:
        'GEO is the biggest structural opportunity for export companies over the next three to five years. The earlier you are cited as an authoritative source in the major AI knowledge bases, the deeper your moat.',
      quiz: [
        {
          question:
            'When overseas buyers ask AI (such as ChatGPT or Perplexity) directly to recommend suppliers, what is the most important response for an export company?',
          options: [
            'Keep spending heavily on banner ads on traditional B2B directories',
            'Implement GEO (generative engine optimisation): build high-authority evidence chains and earn citations from third-party authoritative sources',
            'Block all crawlers from the company website completely',
            'Pay a team of paid reviewers to post praise on forums',
          ],
          explanation:
            'GEO works by building structured evidence, modelling decision-makers and placing content on third-party authoritative sources, so that when a large model compares options it has solid grounds to recommend your brand.',
        },
      ],
      nextStepLabel: 'Take the AI visibility audit',
    },
    'lesson-c-1-2': {
      title: '1.2 What GEO is: how it differs from SEO and how they connect',
      summary:
        'SEO aims to get you onto the first page of search results. GEO aims to be understood by AI and listed as a recommended option in the body of its generated answer.',
      conceptContent: `GEO (Generative Engine Optimisation) and SEO (Search Engine Optimisation) are closely linked:
- SEO: optimising pages to match specific search keywords and win clicks. The metrics are keyword ranking, impressions and click-through rate (CTR).
- GEO: optimising the company’s knowledge entities and source evidence across the web, so that it is named as a recommendation in the final conclusion of an AI answer. The three core metrics are AI visibility (%), recommendation rank and sentiment (the share of positive supporting evidence).

SEO is the water channel; GEO is the knowledge that flows together into the sea.`,
      misconceptions: [
        'Believing that GEO means hacking or poisoning a model’s data to alter its parameters.',
        'Assuming GEO can guarantee first place every time, without understanding the randomness built into how large models sample answers.',
      ],
      executiveTakeaway:
        'Do not put your budget on a single channel. Use SEO to secure a transparent public crawling path, and use GEO to win the next generation of AI-driven procurement recommendations.',
      nextStepLabel: 'Go to 3.1 The six-step GEO closed-loop method',
    },
    'lesson-c-3-1': {
      title: '3.1 Overview of the six-step loop: diagnosis, modelling, content, sources, reputation and monitoring',
      summary:
        'Stop running one-off blind campaigns. Run six steps of data-driven iteration every month, so that the work accumulates into a lasting international digital asset.',
      conceptContent: `ChinGEO’s standard GEO delivery follows a strict six-step closed loop:
1. Diagnosis: run hundreds of probing questions across the major platforms in fresh, memory-free sessions, to map the current position and the gap with competitors.
2. Modelling: reconstruct the frequent purchase intents and real question clusters of three to seven overseas decision-making roles (procurement, engineers, distributors).
3. Content: create the high-value technical white papers, compliance comparison guides and numerical definitions that AI is most willing to cite.
4. Sources: centred on the independent site, build authoritative external links across academic platforms, overseas trade media and LinkedIn.
5. Reputation: organise third-party endorsements, engineering cases and anti-counterfeit certifications, and correct negative information.
6. Monitoring: run an automated evaluation set every month, track the visibility curve and plan the next month’s actions.`,
      misconceptions: [
        'Running a one-off push and assuming the job is finished. The knowledge bases and web indexes behind large models are updated every month.',
      ],
      executiveTakeaway:
        'The six-step loop turns the vague idea of "AI recommendation" into an engineered project that can be scheduled, measured and accepted every month.',
      nextStepLabel: 'Take the AI visibility audit',
    },
    'lesson-c-10-2': {
      title: '10.2 Case study: stating the basis of Aikang Medical’s 47 and 95 points objectively',
      summary:
        'Be clear about the basis. 47 and 95 are the GEO / SEO scores of the domestic site and the new overseas site, measured with the same third-party tool, arobis.ai. Alongside real, high-value referral visits from chatgpt.com, telling the truth shows professional respect.',
      conceptContent: `The brochure publicly shares Aikang Medical’s results. Its domestic site (ak-medical.net) has a GEO / SEO score of 47, and the new overseas site we built (ak-medical-global.com) scores 95. When reporting to clients, the basis of the data must be explained up front:
- This compares two different sites. It is not a before-and-after of one site after a rebuild. Both scores were estimated by the third-party evaluation platform arobis.ai on the same basis, covering content structure, definition completeness and source readiness.
- More solid business evidence comes from the Google Analytics 4 back end: AI domains such as chatgpt.com and perplexity appear as referral sources, and for several months they have consistently brought visits from engineers in overseas orthopaedic device procurement departments, with an average session of 4 minutes 35 seconds.

Being upfront about the basis, and not playing with numbers, is what makes ChinGEO a credible export engineering team.`,
      caseSnippet: {
        company: 'Aikang Medical',
        title: 'A global GEO example from a leading 3D-printed orthopaedic company',
        description:
          'An annual plan of 91 technical content items and modelling of four types of overseas decision-makers took a leading domestic company towards a globally trusted brand.',
      },
      misconceptions: [
        'Some unscrupulous providers claim "pay and ChatGPT will put your ad at the top". This deceives owners who do not understand the technology.',
      ],
      executiveTakeaway:
        'Do GEO in a compliant way, and build real, valuable digital assets for the company. Reject black-hat tricks and information poisoning, and enjoy the AI export dividend over the long term.',
      nextStepLabel: 'Book a 30-minute diagnosis call',
    },
  },
};
