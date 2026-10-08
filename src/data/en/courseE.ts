import type { CourseEn } from './types';

export const courseE: CourseEn = {
  title: 'FDE on-site engineers——Use AI to make standardisation, digitisation and intelligence real',
  subtitle:
    'Understand where the forward deployed engineer came from, and how they use AI to turn a company’s experience into standards, systems and productivity.',
  targetAudience: 'Export decision-makers, CIOs, IT and operations leads',
  relatedService: 'FDE on-site engineers',
  heroCase: 'Three-layer build · a weekly "observe–prototype–trial–consolidate" cycle',
  executiveModuleSummary:
    'Many companies buy software they cannot use, and AI pilots stall at the demo stage. The root cause is usually that experience has not been written down as standards, and standards have not been loaded into systems. FDE engineers work on site with AI, build three layers from the bottom up, are accountable for business results, and leave the capability behind.',
  modules: {
    1: {
      name: 'M1 Foundations: what an FDE (forward deployed engineer) is',
      description:
        'From Palantir to AI companies: where FDEs came from, the three-layer build method, and how they differ from outsourcing, SaaS and consulting',
    },
    8: {
      name: 'M8 For decision-makers: where to start, how to work together, how to accept, and what remains',
      description:
        'Which scenario to start with, which people the company must provide, how to accept each layer, and what is left after the FDE leaves',
    },
  },
  lessons: {
    'lesson-e-1-1': {
      title: '1.1 Where FDEs came from, and how they differ from outsourcing, SaaS and consulting',
      summary:
        'An FDE is an engineer who works on site inside the customer’s business and is accountable for business results. An ordinary engineer builds one feature for many customers; an FDE makes many capabilities work for one customer.',
      conceptContent: `The FDE (Forward Deployed Engineer) was born at Palantir. Palantir split its on-site teams into two kinds: one understands the industry and can explain exactly where the front-line problems lie; the other writes code and can quickly deliver a working system when information is incomplete. Put together, they became what is now called the FDE.

After 2024, AI companies such as OpenAI and Anthropic set up FDE teams. The reason is simple: models keep getting stronger, yet most AI projects inside companies stall at the pilot stage. What blocks them is not the model, but the fact that the model cannot get into real processes, data and systems.

Four common routes compared:
- Consulting firms: deliver advisory reports that stop at slides. Implementation is left to the company.
- Software outsourcing: writes code to a requirements document. Outsourced staff do not understand the business, so every change costs more.
- Standard SaaS: delivers accounts and standard features. Processes must bend to the software, and the value stops when the payments stop.
- FDE: delivers business results. They work on site alongside your team, look and build at the same time, iterate every week, and leave the standards, systems, data and trained people with the company when they go.`,
      misconceptions: [
        'Equating FDEs with on-site outsourcing or staffing. An FDE is accountable for business results, not for hours or requirement documents.',
        'Thinking an FDE only comes to "plug in an AI API". The time-consuming part is usually sorting out processes, cleaning data and coordinating teams.',
      ],
      executiveTakeaway:
        'When evaluating an FDE service, do not only ask "how many people, and for how long". Ask "what result is delivered each week, and what remains after they leave".',
      quiz: [
        {
          question: 'What is the most fundamental difference between an FDE and traditional software outsourcing?',
          options: [
            'FDEs send more people and stay on site for longer',
            'FDEs are accountable for business results, work on site alongside the team, iterate weekly, and leave the capability with the company',
            'FDEs only handle purchasing and installing AI software',
            'FDEs do not write code and only deliver consulting reports',
          ],
          explanation:
            'Outsourcing is accountable for the requirements document, consulting for its advice, and an FDE for business results. They write production-grade code, make sure the front line really uses it, and leave the capability with the company when they leave.',
        },
      ],
      nextStepLabel: 'Go to 1.2 The three-layer build',
    },
    'lesson-e-1-2': {
      title: '1.2 The three-layer build: standardisation, digitisation and intelligence',
      summary:
        'AI amplifies the order a company already has. The FDE pushes three layers from the bottom up: first write experience down as rules, then load the rules into systems, and finally let AI work on those systems.',
      conceptContent: `Many export companies fail when they adopt AI, not because the model is weak, but because the foundations were never laid. Quotes are worked out in a veteran salesperson’s head, product parameters are scattered across PDFs and WeChat messages, customers sit in Excel and leads sit in personal mailboxes. Putting AI on top of that only produces a fine demo.

The FDE’s work is therefore done in three layers, from the bottom up:

Layer 1, standardisation: write experience down as rules
Shadow the key business staff, use AI to transcribe recordings, and distil rules from historical emails, quotes and chat logs. Draft the SOPs, product master data, pricing rules and enquiry-grading criteria, then have the business lead approve them.

Layer 2, digitisation: load the rules into systems
Use AI to help with data cleaning, field mapping and interface scripts. Connect the website form, email, WhatsApp, the CRM and the ERP into one flow, set up permissions and operation logs, and let the owner see the complete funnel for the first time.

Layer 3, intelligence: let AI work on the systems
On top of clear rules and clean data, deploy AI customer service, enquiry grading, quotation assistants and pre-meeting business intelligence. Every scenario comes with an evaluation set and human review points, and it is tuned weekly after launch.

The three layers are not three projects launched one after another. They advance together every week: one scenario goes through one round of "observe–prototype–trial–consolidate", and each layer moves forward one step.`,
      caseSnippet: {
        company: 'Example scenario',
        title: 'Enquiry grading: all three layers in one week',
        description:
          'Monday and Tuesday: shadow the team and use AI to distil grading rules from historical enquiries (standardisation). Wednesday: turn the rules into a CRM intent field and connect the forms and the enquiry mailbox (digitisation). Thursday: AI tags each enquiry by the rules and a salesperson confirms each one (intelligence). Friday: write the corrected cases back into the rules and the evaluation set.',
      },
      misconceptions: [
        'Skipping the first two layers and buying an AI tool straight away. Without standards and data, when the AI gets an answer wrong nobody notices, and nobody catches it.',
        'Taking standardisation to mean writing a pile of policy documents nobody reads. The standards here are rules and data that the system can execute and AI can call.',
      ],
      executiveTakeaway:
        'Intelligence without standardisation just automates the mess. First ask whether the company’s experience has been written down and whether the data is in the system, and only then talk about which AI to add.',
      quiz: [
        {
          question: 'An export company wants AI to grade enquiries automatically. What does the FDE usually do first?',
          options: [
            'Buy an AI customer service product and launch it straight away',
            'Shadow the team, understand the judgement that salespeople use, and use AI to distil it into executable grading rules',
            'Recruit an algorithm team to build a large model from scratch',
            'Have the IT department write a requirements document and hand it to an outside developer',
          ],
          explanation:
            'Grading rules are the basis for AI to act on. Standardise the front-line experience first, load it into the CRM, and then let AI tag according to the rules, so that the results can be verified and corrected.',
        },
      ],
      nextStepLabel: 'Go to 8.1 For decision-makers',
    },
    'lesson-e-8-1': {
      title: '8.1 For decision-makers: where to start, how to work together, and how to accept',
      summary:
        'Start from one high-value scenario and complete the first closed loop in 2–4 weeks. Accept each layer separately. Prepare for the exit from the first week.',
      conceptContent: `When an owner brings in an FDE, four things need to be clear:

1. Where to start: choose one scenario that is frequent, painful and measurable, such as "from enquiry to quotation". Do not try to digitise the whole company at once.

2. Which people the company provides: one business lead who can make decisions, two or three frontline salespeople willing to trial the system, and one IT contact. An FDE can write code, but cannot replace the business team’s judgement.

3. How to accept: accept by layer, not by person-days. For standardisation, check whether the rules have been approved by the business lead and written into the SOP. For digitisation, check whether leads and data are stored automatically and the dashboard is usable. For intelligence, check the accuracy on the evaluation set, the rate of human correction and response time.

4. What remains when they leave: source code, data, documents and accounts all stay in the company’s name. Use least-privilege access, separate development from production, and keep full operation logs. At least one or two internal AI business leads are trained alongside, and after the handover the FDE becomes an adviser.`,
      misconceptions: [
        'Expecting the FDE to solve everything alone, while the business lead takes no part in the weekly trials and decisions.',
        'Accepting the work by "how many person-days were spent on site", instead of checking what each layer has left behind.',
      ],
      executiveTakeaway:
        'A good FDE makes themselves less needed over time. On the day they leave, the standards are there, the systems are there, the data is there, and so are the people who can use them.',
      nextStepLabel: 'Book a 60-minute technical integration review',
    },
  },
};
