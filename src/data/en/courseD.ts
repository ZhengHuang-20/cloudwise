import type { CourseEn } from './types';

export const courseD: CourseEn = {
  title: 'AI customer service and system integration——Catch every enquiry, 24/7',
  subtitle:
    'Plan a high-conversion AI customer service: knowledge base building, multichannel access, automatic intent grading and a direct CRM connection to stop losses.',
  targetAudience: 'Deputy heads of export sales, overseas customer service managers, IT leads',
  relatedService: 'AI customer service and system integration',
  heroCase: 'A US customer enquires at 03:12, and the details are written into the CRM automatically at 03:14',
  executiveModuleSummary:
    'It solves the pain of a 12-hour time-zone gap. The AI is not a cold keyword reply. It is a 24/7 export sales assistant that works from your knowledge base, understands technical terms and grades high-intent buyers.',
  modules: {
    1: {
      name: 'M1 Pain diagnosis: why enquiries leak so badly during cross-time-zone nights',
      description: 'Work out the hidden losses from slow replies, and break down a typical 3 a.m. scenario',
    },
    9: {
      name: 'M9 For decision-makers: the numbers behind system integration',
      description: 'The enquiry-loss formula, direct links to the CRM and WeCom, and the ROI of every yuan',
    },
  },
  lessons: {
    'lesson-d-1-2': {
      title: '1.2 Case study: how a 3 a.m. enquiry is caught properly',
      summary:
        'At 03:12 a customer in California asks a detailed technical question. At 03:13 the AI answers from the knowledge base and asks for the order quantity. At 03:14 the details go into the CRM and are routed. At 09:00 the salesperson quotes directly and closes the order.',
      conceptContent: `A real export scenario:
- 03:12 (late night in Beijing): a procurement director of an engineering company in California visits the website and asks in the chat window: "Do your drainage components meet AASHTO M252? If we order 500 pieces for a first batch, roughly how long is the lead time?"
- 03:13: on a traditional website, this hour usually brings a cold "Customer service is offline, please leave a message". The buyer closes the page and looks for the next competitor.
- Cloudwise AI customer service: within milliseconds it queries the ASTM and AASHTO compliance parameter knowledge base and replies: "Yes, it fully meets the standard. For 500 pieces, the standard production lead time is about 18 working days. Which port on the US West Coast should we calculate the landed price for, including duties?"
- 03:14: the buyer replies with a port. The AI instantly extracts "intent level: HIGH", "order quantity: 500 pcs" and "destination port: Long Beach", creates a lead card in the company CRM, and sends a high-priority to-do alert to the regional sales manager on WeCom.
- 09:00: the domestic salesperson starts work with no cold outreach needed. They follow up with an accurate quotation straight away, and win the order.`,
      misconceptions: [
        'Assuming smart customer service is just a traditional rule tree: "press 1 to track a parcel, press 2 for a human".',
        'Worrying that a large model might make things up, promise low prices or leak your cost price. With strict boundary prompts and knowledge-base isolation, this stays fully under control.',
      ],
      executiveTakeaway:
        'An industrial order worth US$50,000 is often decided in the first five minutes after a buyer asks late at night. AI customer service is the strongest lock on export conversion.',
      nextStepLabel: 'Plan the AI customer service solution',
    },
    'lesson-d-9-2': {
      title: '9.2 For decision-makers: work out the cost with the enquiry-loss formula',
      summary:
        'Enter monthly enquiries Q, the share arriving at night p, average order value A and close rate c, and work out how much real money slow replies lose each year.',
      conceptContent: `The Cloudwise official loss-estimation model: L = Q × p × r × c × A. Here Q is total monthly enquiries, p is the share that arrives at night across time zones, r is the loss rate from delayed replies, c is the close rate and A is the average order value. Many companies lose hundreds of thousands of dollars of orders a year to slow overnight replies, while deploying AI customer service costs far less, so the return is overwhelming.`,
      misconceptions: [
        'Believing the customer is not in a hurry, and that replying to the email the next morning is good enough. Overseas procurement teams request quotes from three suppliers at once on average, and the first professional reply wins 70% more often.',
      ],
      executiveTakeaway:
        'Do not let overseas traffic that you have paid advertising money for be lost while it waits overnight.',
      nextStepLabel: 'Book a 30-minute diagnosis call',
    },
  },
};
