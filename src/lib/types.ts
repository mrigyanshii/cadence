export type Lang = 'en' | 'es' | 'fr' | 'de'

export const LANGS: { id: Lang; label: string; bcp47: string; greeting: string }[] = [
  { id: 'en', label: 'English', bcp47: 'en-US', greeting: 'Hello' },
  { id: 'es', label: 'Spanish', bcp47: 'es-ES', greeting: 'Hola' },
  { id: 'fr', label: 'French', bcp47: 'fr-FR', greeting: 'Bonjour' },
  { id: 'de', label: 'German', bcp47: 'de-DE', greeting: 'Hallo' },
]

export type Speaker = 'agent' | 'caller'

export type Citation = {
  docId: string
  title: string
  section: string
  score: number
  snippet: string
}

export type Turn = {
  id: string
  speaker: Speaker
  text: string
  at: number
  lang: Lang
  citations?: Citation[]
  latencyMs?: number
  interim?: boolean
}

export type BantKey = 'budget' | 'authority' | 'need' | 'timeline'

export type LeadScore = {
  total: number
  band: 'hot' | 'warm' | 'cold'
  bant: Record<BantKey, number>
}

export type Sentiment = {
  score: number
  label: 'positive' | 'neutral' | 'negative'
  trend: number[]
}

export type Slots = {
  name?: string
  company?: string
  role?: string
  size?: number
  useCase?: string
  timeline?: string
  budget?: string
  email?: string
}

export type Booking = {
  id: string
  day: string
  date: string
  time: string
  tz: string
  with: string
  email?: string
  calendarLink: string
}

export type CallEvent = {
  id: string
  at: number
  kind: 'stt' | 'tts' | 'rag' | 'llm' | 'tool' | 'crm' | 'system'
  label: string
  detail?: string
  ms?: number
}

export type CallSummary = {
  headline: string
  bullets: string[]
  objections: string[]
  nextSteps: string[]
  topics: string[]
  disposition: 'meeting_booked' | 'qualified_nurture' | 'not_qualified' | 'follow_up'
}

export type Call = {
  id: string
  startedAt: string
  durationSec: number
  lang: Lang
  channel: 'inbound' | 'outbound'
  caller: {
    name: string
    company: string
    role: string
    email?: string
    size?: number
  }
  turns: Turn[]
  score: LeadScore
  sentiment: Sentiment
  citations: Citation[]
  booking?: Booking
  summary: CallSummary
  events: CallEvent[]
  talkRatio: number
  scripted?: boolean
}

export type Stage = 'greet' | 'discover' | 'answer' | 'objection' | 'book' | 'confirm' | 'wrap'

export type AgentState = {
  stage: Stage
  lang: Lang
  slots: Slots
  asked: string[]
  objections: string[]
  cited: string[]
  offered: Booking[]
  pending?: Booking
  booking?: Booking
  turn: number
  emailSent: boolean
  crmWritten: boolean
  sentiment: Sentiment
}

export type AgentReply = {
  text: string
  intent: string
  citations: Citation[]
  state: AgentState
  score: LeadScore
  sentiment: Sentiment
  events: CallEvent[]
}
