/*
  Shared marketing copy and demo configuration. Page-specific copy lives in the
  page file that renders it.
*/

export const BRAND = {
  name: 'Cadence',
  product: 'Autonomous AI sales voice agent',
  email: 'founders@cadence.voice',
  demoCompany: 'Meridian Cloud',
  demoAgent: 'Ada',
  demoAgentRole: 'AI sales development representative',
}

export const NAV = [
  { label: 'Overview', href: '/' },
  { label: 'Live console', href: '/console' },
  { label: 'Call analytics', href: '/analytics' },
  { label: 'Architecture', href: '/architecture' },
  { label: 'Business case', href: '/business' },
]

export const METRICS = [
  { value: '480', unit: 'ms', label: 'median response latency', note: 'p50, end of caller speech to first audio' },
  { value: '118', unit: 'ms', label: 'barge-in', note: 'agent yields the moment the caller speaks' },
  { value: '4', unit: 'langs', label: 'in this prototype', note: 'EN · ES · FR · DE, 30+ in production' },
  { value: '62', unit: '%', label: 'calls resolved without a human', note: 'across the reference deployment' },
]

export const CAPABILITIES = [
  {
    n: '01',
    title: 'Real-time speech, both directions',
    body: 'Streaming ASR transcribes while the caller is still talking. A turn detector decides when they are done, so the agent answers in under half a second instead of waiting for silence.',
    tags: ['Streaming STT', 'VAD', 'Barge-in', 'Neural TTS'],
  },
  {
    n: '02',
    title: 'Memory that survives the call',
    body: 'Every turn is written to a per-contact memory store: objections raised, products discussed, who else is involved. The next call starts with that context, not a blank slate.',
    tags: ['Episodic memory', 'Contact graph', 'Summaries'],
  },
  {
    n: '03',
    title: 'Qualification and sentiment, live',
    body: 'BANT signals are extracted from natural speech, not a form. Sentiment is scored per turn, so the agent can slow down, reframe or hand off before a deal goes cold.',
    tags: ['BANT', 'Intent', 'Sentiment', 'Hand-off'],
  },
  {
    n: '04',
    title: 'Answers grounded in your documents',
    body: 'Retrieval over your pricing, security and onboarding docs returns the passage behind every claim. If the answer is not in the corpus, the agent says so and books a human instead of inventing.',
    tags: ['Hybrid retrieval', 'Citations', 'No-answer policy'],
  },
  {
    n: '05',
    title: 'Books the meeting, writes the CRM',
    body: 'Calendar availability, timezone resolution, invite delivery and a CRM deal with a full transcript and next step. One tool-calling loop, no copy-paste.',
    tags: ['Calendar', 'CRM sync', 'Email', 'Audit log'],
  },
  {
    n: '06',
    title: 'Summaries your manager actually reads',
    body: 'Each call ends with a disposition, the buying signals, the objection, the quote that matters and the next step, rolled into pipeline analytics across every call.',
    tags: ['Disposition', 'Insights', 'Pipeline'],
  },
]

export const WORKFLOW = [
  { n: '01', title: 'Call lands', detail: 'Inbound number or outbound dialler. SIP or WebRTC into the media gateway, recording consent played, language detected.', ms: '0.0s' },
  { n: '02', title: 'Streaming transcription', detail: '16 kHz audio framed at 20 ms, sent to streaming ASR. Partial hypotheses drive the "listening" state in the console.', ms: '0.3s' },
  { n: '03', title: 'Retrieval + reasoning', detail: 'Hybrid BM25 + vector search over the knowledge base, then a tool-calling turn that decides to answer, qualify or book.', ms: '0.4s' },
  { n: '04', title: 'Speech out', detail: 'Token stream is chunked into phrases and synthesised while the rest of the sentence is still being generated.', ms: '0.5s' },
  { n: '05', title: 'Tools fire', detail: 'Calendar slot hold, invite email, CRM deal with transcript, Slack alert for hot leads, audit record written.', ms: '1.4s' },
  { n: '06', title: 'Summary + insight', detail: 'Structured summary, sentiment arc, objections and next step, pushed to the dashboard within seconds of hang-up.', ms: '3.0s' },
]

export const PRICING = [
  {
    name: 'Starter',
    price: '$499',
    cadence: 'per month',
    blurb: 'One number, one team, everything you need to prove the channel.',
    features: ['1,000 voice minutes', '1 phone number', 'Knowledge base + citations', 'Calendar booking', 'Email summaries'],
    cta: 'Start a pilot',
  },
  {
    name: 'Growth',
    price: '$1,490',
    cadence: 'per month',
    blurb: 'For teams running inbound at volume with a CRM they care about.',
    features: ['5,000 voice minutes', '3 numbers + outbound', 'CRM two-way sync', 'Sentiment + objection analytics', 'A/B script testing', 'Solutions engineer'],
    cta: 'Book a walkthrough',
    featured: true,
  },
  {
    name: 'Scale',
    price: 'Custom',
    cadence: 'from $3,900',
    blurb: 'Regulated, multi-region, multi-brand deployments.',
    features: ['Unlimited seats', 'SSO + SCIM', 'EU / US / India residency', 'Custom voice clone', 'Warm transfer + supervisor mode', '99.95% SLA'],
    cta: 'Talk to sales',
  },
]

export const FAQ = [
  {
    q: 'Does the agent invent answers?',
    a: 'No. Every factual claim is retrieved from your knowledge base and carries the document and section it came from. When retrieval confidence is below threshold the agent says it does not have that detail and offers a human, which is exactly what a good SDR does.',
  },
  {
    q: 'What happens when the caller asks for a person?',
    a: 'The agent offers a warm transfer during business hours, with a spoken handover summary for the rep, and books a callback outside them. Transfers and reasons are logged in the CRM record.',
  },
  {
    q: 'How long until we are live?',
    a: 'Five business days for a standard deployment: two days ingesting documents, one day tuning script and voice, one day connecting CRM and calendar, one day of shadowed calls before full go-live.',
  },
  {
    q: 'Is this prototype using a real model?',
    a: 'This build runs a deterministic sales policy with real browser speech recognition and synthesis, so it works offline and costs nothing to demo. The architecture page shows exactly where an LLM, streaming ASR and neural TTS slot in, and the interfaces are the ones those services expose.',
  },
  {
    q: 'What about recording consent and data retention?',
    a: 'A recording disclosure opens every call, do-not-call lists are scrubbed before dialling, opt-outs are honoured immediately, PII can be redacted before storage, and retention is configurable per region.',
  },
]

export const FOOTER = {
  blurb: 'An autonomous voice agent for inbound and outbound sales: qualified, booked, summarised and written to the CRM before the caller hangs up.',
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Overview', href: '/' },
        { label: 'Live console', href: '/console' },
        { label: 'Call analytics', href: '/analytics' },
      ],
    },
    {
      title: 'Engineering',
      links: [
        { label: 'Architecture', href: '/architecture' },
        { label: 'Business case', href: '/business#problem' },
        { label: 'Security', href: '/business#security' },
      ],
    },
    {
      title: 'Delivery',
      links: [
        { label: 'Scale to 100k', href: '/business#scale' },
        { label: 'Cost model', href: '/business#costs' },
        { label: 'Deployment', href: '/business#operations' },
      ],
    },
  ],
  legal: '© 2026 Cadence. Built as a working prototype, not a marketing claim.',
}
