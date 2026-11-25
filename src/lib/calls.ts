import { KB_BY_ID } from './knowledge'
import { useStored } from './storage'
import type { Call, Citation, LeadScore, Sentiment, Turn } from './types'

/*
  Call records live in localStorage for the prototype. In production this is a
  D1/Postgres table with the transcript in object storage and a vector row per
  summary; the shape below is the row you would persist.
*/

const KEY = 'calls'

function cite(docId: string): Citation {
  const doc = KB_BY_ID[docId]
  return { docId, title: doc.title, section: doc.section, score: 0.93, snippet: doc.body }
}

function t(id: string, speaker: 'agent' | 'caller', text: string, at: number, citations?: Citation[]): Turn {
  return { id, speaker, text, at, lang: 'en', citations, latencyMs: speaker === 'agent' ? 430 + (at % 140) : undefined }
}

const hot: LeadScore = { total: 88, band: 'hot', bant: { budget: 24, authority: 24, need: 23, timeline: 23 } }
const warm: LeadScore = { total: 61, band: 'warm', bant: { budget: 13, authority: 16, need: 23, timeline: 23 } }
const cold: LeadScore = { total: 31, band: 'cold', bant: { budget: 8, authority: 12, need: 8, timeline: 8 } }

const positive: Sentiment = { score: 0.54, label: 'positive', trend: [0.05, 0.12, 0.2, 0.31, 0.28, 0.42, 0.54] }
const neutral: Sentiment = { score: 0.09, label: 'neutral', trend: [0.04, 0.02, 0.08, -0.02, 0.05, 0.09] }
const negative: Sentiment = { score: -0.22, label: 'negative', trend: [0.06, -0.02, -0.14, -0.09, -0.18, -0.22] }

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString()

export function seedCalls(): Call[] {
  return [
    {
      id: 'call_lumen_001',
      startedAt: hoursAgo(1.2),
      durationSec: 222,
      lang: 'en',
      channel: 'inbound',
      caller: { name: 'Priya Raghavan', company: 'Lumen Retail', role: 'Head of Support', email: 'priya@lumenretail.com', size: 240 },
      score: hot,
      sentiment: positive,
      citations: [cite('pricing'), cite('security'), cite('roi'), cite('integrations')],
      booking: {
        id: 'slot_lumen',
        day: 'Tue',
        date: '1 Dec',
        time: '14:30',
        tz: 'Europe/London',
        with: 'Maya Chen',
        email: 'priya@lumenretail.com',
        calendarLink: 'https://cal.meridian.cloud/cadence/2026-12-01-1430',
      },
      summary: {
        headline: 'Lumen Retail — 240 agents, inbound support volume',
        bullets: [
          '240 agents across three regions, Head of Support on the call.',
          'Primary need: inbound support volume and speed to lead.',
          'Answered from four knowledge sections: pricing, security, results, integrations.',
          'Meeting booked Tue 1 Dec at 14:30 with Maya Chen.',
          'Lead score 88 (hot); sentiment positive (0.54).',
        ],
        objections: ['Price versus hiring', 'Incumbent or DIY stack'],
        nextSteps: [
          'Send agenda, recording and trust pack to priya@lumenretail.com.',
          'Move the CRM deal to Discovery for Tue 14:30.',
          'AE intro email within five minutes of hang-up.',
        ],
        topics: ['Plans and pricing', 'Security and compliance', 'Results and return on investment', 'CRM and calendar integrations'],
        disposition: 'meeting_booked',
      },
      events: [
        { id: 'e1', at: 0, kind: 'stt', label: 'asr.final', detail: '18 tokens', ms: 212 },
        { id: 'e2', at: 0, kind: 'rag', label: 'rag.retrieve', detail: '3 chunks · top 0.94', ms: 31 },
        { id: 'e3', at: 0, kind: 'crm', label: 'crm.deal.upsert', detail: 'HubSpot · stage=Discovery', ms: 168 },
      ],
      turns: [
        t('t1', 'agent', 'Meridian Cloud, this is Ada. Thanks for calling — are you looking at your inbound support or sales line right now?', 0),
        t('t2', 'caller', 'Support. We are drowning in inbound calls and our response time is embarrassing.', 6000),
        t('t3', 'agent', 'Got it. How many agents are on the team today?', 11000),
        t('t4', 'caller', 'About 240 across three regions, and we are evaluating vendors this quarter.', 16000),
        t('t5', 'agent', 'Understood. I can put fifteen minutes in with our solutions engineer, Maya Chen. I have Tue 1 Dec at 10:00, Tue 1 Dec at 14:30, or Wed 2 Dec at 09:15 — which works best?', 24000),
        t('t6', 'caller', 'What does Growth cost for that size, and is there an overage?', 32000),
        t('t7', 'agent', 'Growth is 1,490 a month for five thousand minutes with CRM sync; overage is fourteen cents a minute. You choose EU, US or India residency, and we never train on your calls.', 38000, [cite('pricing'), cite('security')]),
        t('t8', 'caller', 'Honestly it sounds expensive compared with hiring two more people.', 47000),
        t('t9', 'agent', 'Fair. The right measure is cost per booked meeting: customers land around 18 dollars against roughly 210 for a human SDR. The pilot is free for fourteen days.', 53000, [cite('roi')]),
        t('t10', 'caller', 'Okay. I am Priya Raghavan, Head of Support at Lumen Retail. Email is priya@lumenretail.com.', 62000),
        t('t11', 'agent', 'Booked: Tue 1 Dec at 14:30 with Maya Chen. I have emailed the invite and written the deal to your CRM record.', 70000, [cite('trial')]),
        t('t12', 'caller', 'Great, that is all I needed. Thanks.', 78000),
        t('t13', 'agent', 'Thanks for your time — the recap and recording link will be in your inbox in a few minutes. Goodbye.', 84000),
      ],
      talkRatio: 0.58,
    },
    {
      id: 'call_northwind_002',
      startedAt: hoursAgo(4.6),
      durationSec: 174,
      lang: 'en',
      channel: 'inbound',
      caller: { name: 'Daniel Okafor', company: 'Northwind Freight', role: 'Operations Director', email: 'd.okafor@northwind.co', size: 60 },
      score: warm,
      sentiment: neutral,
      citations: [cite('pricing'), cite('onboarding')],
      summary: {
        headline: 'Northwind Freight — 60 agents, outbound qualification',
        bullets: [
          '60 agents, Operations Director on the call.',
          'Primary need: outbound qualification and meeting booking.',
          'Answered from two knowledge sections: pricing, onboarding.',
          'No meeting booked — asked for a board date next month.',
          'Lead score 61 (warm); sentiment neutral (0.09).',
        ],
        objections: ['Needs internal approval'],
        nextSteps: ['AE follow-up within 24 hours with pilot terms.', 'Send the SOC 2 pack and the Lumen Retail case study.'],
        topics: ['Plans and pricing', 'Onboarding and time to value'],
        disposition: 'qualified_nurture',
      },
      events: [
        { id: 'e1', at: 0, kind: 'stt', label: 'asr.final', detail: '14 tokens', ms: 240 },
        { id: 'e2', at: 0, kind: 'llm', label: 'policy.turn', detail: 'question · pricing', ms: 611 },
      ],
      turns: [
        t('t1', 'agent', 'Meridian Cloud, this is Ada. Thanks for calling — are you looking at your inbound support or sales line right now?', 0),
        t('t2', 'caller', 'Sales line. We want better outbound qualification without hiring four more SDRs.', 6000),
        t('t3', 'agent', 'Got it. How many agents are on the team today?', 12000),
        t('t4', 'caller', 'Sixty people, but only eight do outbound. Board reviews the budget next month.', 18000),
        t('t5', 'agent', 'Makes sense. Who else needs to see this — finance, security, or your CTO?', 26000),
        t('t6', 'caller', 'Finance and our COO. I need to bring them a number, not a demo.', 33000),
        t('t7', 'agent', 'Growth is 1,490 a month for five thousand minutes with CRM sync, and most teams go live in five business days.', 40000, [cite('pricing'), cite('onboarding')]),
        t('t8', 'caller', 'Send me that in writing and I will come back after the board.', 48000),
      ],
      talkRatio: 0.52,
    },
    {
      id: 'call_aria_003',
      startedAt: hoursAgo(22),
      durationSec: 141,
      lang: 'en',
      channel: 'inbound',
      caller: { name: 'Sofia Marino', company: 'Aria Health', role: 'IT Manager', email: 'sofia@ariahealth.eu', size: 120 },
      score: warm,
      sentiment: negative,
      citations: [cite('security'), cite('consent')],
      summary: {
        headline: 'Aria Health — 120 agents, security review blocked',
        bullets: [
          '120 agents, IT Manager on the call.',
          'Primary need: inbound support volume, blocked on data residency.',
          'Answered from two knowledge sections: security, consent.',
          'No meeting booked — needs the DPA and penetration test before any call.',
          'Lead score 58 (warm); sentiment negative (-0.22).',
        ],
        objections: ['Needs internal approval'],
        nextSteps: ['AE follow-up within 24 hours with pilot terms.', 'Send the SOC 2 pack and the Lumen Retail case study.'],
        topics: ['Security and compliance', 'Recording consent and outbound rules'],
        disposition: 'qualified_nurture',
      },
      events: [{ id: 'e1', at: 0, kind: 'rag', label: 'rag.retrieve', detail: '2 chunks · top 0.95', ms: 28 }],
      turns: [
        t('t1', 'agent', 'Meridian Cloud, this is Ada. Thanks for calling — are you looking at your inbound support or sales line right now?', 0),
        t('t2', 'caller', 'Support. But our security team will block anything that stores patient-adjacent data outside the EU.', 6000),
        t('t3', 'agent', 'Understood. We are SOC 2 Type II and ISO 27001, you choose EU residency, retention is configurable, and PII can be redacted before storage.', 14000, [cite('security')]),
        t('t4', 'caller', 'I am not comfortable with the recording retention. Send the DPA and the pen test summary, then we can talk.', 22000),
        t('t5', 'agent', 'That is reasonable. I will have Maya send the DPA, the penetration test summary and the sub-processor list today.', 30000, [cite('consent')]),
      ],
      talkRatio: 0.55,
    },
    {
      id: 'call_selfserve_004',
      startedAt: hoursAgo(30),
      durationSec: 58,
      lang: 'en',
      channel: 'outbound',
      caller: { name: 'Tom Becker', company: 'Independent', role: 'Not captured', size: 2 },
      score: cold,
      sentiment: neutral,
      citations: [],
      summary: {
        headline: 'Tom Becker — small team, not qualified',
        bullets: [
          '2 people, no role captured.',
          'Primary need not established.',
          'No knowledge sections cited.',
          'No meeting booked — below the qualification floor.',
          'Lead score 31 (cold); sentiment neutral (0.09).',
        ],
        objections: [],
        nextSteps: ['Add to nurture sequence; no AE time this week.', 'Re-qualify in 30 days or when budget is confirmed.'],
        topics: [],
        disposition: 'follow_up',
      },
      events: [{ id: 'e1', at: 0, kind: 'system', label: 'voicemail.detected', detail: 'no human · 8s', ms: 8000 }],
      turns: [
        t('t1', 'agent', 'Hi, this is Ada from Meridian Cloud — is now a bad time to talk about your inbound line?', 0),
        t('t2', 'caller', 'It is just me and my co-founder, we are not buying anything this year.', 5000),
        t('t3', 'agent', 'No problem at all. I will send one short email and stay out of your way. Goodbye.', 11000),
      ],
      talkRatio: 0.61,
    },
  ]
}

export function useCalls() {
  const [calls, setCalls] = useStored<Call[]>(KEY, seedCalls())
  const addCall = (call: Call) => setCalls((prev) => [call, ...prev].slice(0, 40))
  const removeCall = (id: string) => setCalls((prev) => prev.filter((c) => c.id !== id))
  const reset = () => setCalls(seedCalls())
  return { calls, addCall, removeCall, reset }
}

export type Analytics = {
  total: number
  booked: number
  qualified: number
  pipeline: number
  avgSentiment: number
  connectRate: number
  funnel: { label: string; value: number; pct: number }[]
  intents: { label: string; value: number }[]
  sentiments: number[]
  minutes: number
}

export function analytics(calls: Call[]): Analytics {
  const total = calls.length
  const booked = calls.filter((c) => c.booking).length
  const qualified = calls.filter((c) => c.score.total >= 55).length
  const avgSentiment = total ? calls.reduce((n, c) => n + c.sentiment.score, 0) / total : 0
  const minutes = calls.reduce((n, c) => n + c.durationSec, 0) / 60
  const pipeline = booked * 42000 + qualified * 9000

  const connected = calls.filter((c) => c.turns.some((turn) => turn.speaker === 'caller' && !/voicemail/i.test(turn.text))).length
  const topics = new Map<string, number>()
  for (const call of calls) for (const topic of call.summary.topics) topics.set(topic, (topics.get(topic) ?? 0) + 1)

  return {
    total,
    booked,
    qualified,
    pipeline,
    avgSentiment,
    connectRate: total ? connected / total : 0,
    funnel: [
      { label: 'Calls answered', value: total, pct: 100 },
      { label: 'Conversations', value: connected, pct: total ? Math.round((connected / total) * 100) : 0 },
      { label: 'Qualified (BANT ≥ 55)', value: qualified, pct: total ? Math.round((qualified / total) * 100) : 0 },
      { label: 'Meetings booked', value: booked, pct: total ? Math.round((booked / total) * 100) : 0 },
    ],
    intents: Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value })),
    sentiments: calls.map((c) => c.sentiment.score).reverse(),
    minutes,
  }
}
