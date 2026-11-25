import { KB_BY_ID, retrieve } from './knowledge'
import type {
  AgentState,
  Booking,
  Call,
  CallEvent,
  CallSummary,
  Citation,
  Lang,
  LeadScore,
  Sentiment,
  Slots,
  Turn,
} from './types'

/*
  The sales policy.

  This is deliberately deterministic: a production deployment replaces the
  "reason" step with an LLM call, but everything around it — language detection,
  slot filling, BANT scoring, retrieval, tool calls, booking and summarisation —
  is the real orchestration a voice agent needs. It runs offline, costs nothing
  to demo and behaves identically on every machine.
*/

export const AGENT_NAME = 'Ada'
export const AE_NAME = 'Maya Chen'

let seq = 0
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(seq++).toString(36)}`
const tick = (min: number, max: number) => Math.round(min + Math.random() * (max - min))
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type Phrase = Record<Lang, string>

const P = {
  opening: {
    en: 'Meridian Cloud, this is Ada. Thanks for calling — are you looking at your inbound support or sales line right now?',
    es: 'Meridian Cloud, soy Ada. Gracias por llamar. ¿Está revisando su línea de soporte o de ventas?',
    fr: 'Meridian Cloud, Ada à l’appareil. Merci de votre appel. Regardez-vous votre ligne support ou commerciale ?',
    de: 'Meridian Cloud, hier ist Ada. Danke für Ihren Anruf. Sehen Sie sich gerade Ihre Support- oder Vertriebsline an?',
  },
  ack: { en: 'Got it.', es: 'Entendido.', fr: 'Compris.', de: 'Verstanden.' },
  askUseCase: {
    en: 'What would you like to fix first: speed to lead, after-hours coverage, or cost per conversation?',
    es: '¿Qué quiere mejorar primero: velocidad de respuesta, cobertura fuera de horario o coste por conversación?',
    fr: 'Que voulez-vous améliorer en premier : la vitesse de réponse, la couverture hors horaires ou le coût par conversation ?',
    de: 'Was möchten Sie zuerst verbessern: Reaktionsgeschwindigkeit, Erreichbarkeit außerhalb der Zeiten oder Kosten pro Gespräch?',
  },
  askSize: {
    en: 'How many agents are on the team today?',
    es: '¿Cuántos agentes tiene el equipo hoy?',
    fr: 'Combien d’agents compte l’équipe aujourd’hui ?',
    de: 'Wie viele Agenten hat das Team heute?',
  },
  askTimeline: {
    en: 'Is this something you are deciding this quarter, or further out?',
    es: '¿Lo están decidiendo este trimestre o más adelante?',
    fr: 'Est-ce une décision pour ce trimestre ou plus tard ?',
    de: 'Entscheiden Sie das in diesem Quartal oder später?',
  },
  askEmail: {
    en: 'Perfect. What is the best email for the calendar invite?',
    es: 'Perfecto. ¿Cuál es el mejor correo para la invitación?',
    fr: 'Parfait. Quel est le meilleur e-mail pour l’invitation ?',
    de: 'Perfekt. Welche E-Mail-Adresse ist für die Einladung am besten?',
  },
  whichSlot: {
    en: 'Which of those works best — 1, 2 or 3?',
    es: '¿Cuál de esos horarios le funciona mejor: 1, 2 o 3?',
    fr: 'Lequel vous convient : 1, 2 ou 3 ?',
    de: 'Welcher Termin passt: 1, 2 oder 3?',
  },
  offerSlots: {
    en: 'I can put fifteen minutes in with our solutions engineer, Maya Chen. I have {0}, {1}, or {2} — which works best?',
    es: 'Puedo reservar quince minutos con nuestra ingeniera de soluciones, Maya Chen. Tengo {0}, {1} o {2}. ¿Cuál le funciona?',
    fr: 'Je peux réserver quinze minutes avec notre ingénieure solutions, Maya Chen. J’ai {0}, {1} ou {2}. Lequel vous convient ?',
    de: 'Ich kann fünfzehn Minuten mit unserer Solutions Engineer Maya Chen reservieren. Ich habe {0}, {1} oder {2}. Was passt am besten?',
  },
  confirm: {
    en: 'Booked: {0} at {1} with Maya Chen. I have emailed the invite to {2} and written the deal to your CRM record — a recap is on its way.',
    es: 'Reservado: {0} a las {1} con Maya Chen. He enviado la invitación a {2} y he creado la oportunidad en su CRM. El resumen va en camino.',
    fr: 'C’est réservé : {0} à {1} avec Maya Chen. J’ai envoyé l’invitation à {2} et créé l’opportunité dans votre CRM. Le récapitulatif arrive.',
    de: 'Gebucht: {0} um {1} mit Maya Chen. Ich habe die Einladung an {2} geschickt und die Opportunity im CRM angelegt. Die Zusammenfassung kommt gleich.',
  },
  wrap: {
    en: 'Anything else before we wrap up?',
    es: '¿Algo más antes de terminar?',
    fr: 'Autre chose avant de terminer ?',
    de: 'Noch etwas, bevor wir abschließen?',
  },
  human: {
    en: 'Of course. Maya Chen covers your region and already has your notes. I can transfer you now, or book a slot if she is on another call — which do you prefer?',
    es: 'Claro. Maya Chen cubre su región y ya tiene sus notas. Puedo transferirle ahora o reservar una hora si está en otra llamada. ¿Qué prefiere?',
    fr: 'Bien sûr. Maya Chen couvre votre région et a déjà vos notes. Je peux vous transférer maintenant ou réserver un créneau si elle est en appel. Que préférez-vous ?',
    de: 'Natürlich. Maya Chen betreut Ihre Region und hat Ihre Notizen schon. Ich kann Sie jetzt verbinden oder einen Termin buchen, wenn sie telefoniert. Was ist Ihnen lieber?',
  },
  noAnswer: {
    en: 'That one is not in my knowledge base, and I would rather not guess. Maya can cover it properly on the call.',
    es: 'Eso no está en mi base de conocimiento y prefiero no inventarlo. Maya puede cubrirlo bien en la llamada.',
    fr: 'Ce point n’est pas dans ma base de connaissances et je préfère ne pas inventer. Maya pourra le traiter pendant l’appel.',
    de: 'Das steht nicht in meiner Wissensbasis, und ich möchte nichts erfinden. Maya kann es im Gespräch sauber klären.',
  },
  langSwitch: {
    en: 'Happy to continue in English.',
    es: 'Por supuesto, sigo en español.',
    fr: 'Bien sûr, je continue en français.',
    de: 'Gerne, ich mache auf Deutsch weiter.',
  },
  bye: {
    en: 'Thanks for your time — the recap and recording link will be in your inbox in a few minutes. Goodbye.',
    es: 'Gracias por su tiempo. El resumen y el enlace de la grabación llegan a su correo en unos minutos. Hasta pronto.',
    fr: 'Merci de votre temps. Le récapitulatif et le lien d’enregistrement arrivent par e-mail dans quelques minutes. À bientôt.',
    de: 'Danke für Ihre Zeit. Die Zusammenfassung und der Aufnahme-Link kommen in wenigen Minuten per E-Mail. Auf Wiederhören.',
  },
  deny: { en: 'No problem.', es: 'Sin problema.', fr: 'Pas de problème.', de: 'Kein Problem.' },
  greeting: { en: 'Hello, this is Ada.', es: 'Hola, soy Ada.', fr: 'Bonjour, je suis Ada.', de: 'Hallo, ich bin Ada.' },
  objectionPrice: {
    en: 'Fair. The right measure is cost per booked meeting, not cost per minute: customers land around 18 dollars against roughly 210 for a human SDR. The pilot is free for fourteen days, so you can test that on your own line.',
    es: 'Es justo. La medida correcta es el coste por reunión, no por minuto: nuestros clientes están en unos 18 dólares frente a unos 210 de un SDR humano. El piloto es gratis catorce días, así que puede probarlo en su propia línea.',
    fr: 'C’est juste. Le bon indicateur est le coût par rendez-vous, pas par minute : nos clients sont autour de 18 dollars contre environ 210 pour un SDR humain. Le pilote est gratuit quatorze jours, vous pouvez tester sur votre ligne.',
    de: 'Fair. Der richtige Maßstab sind Kosten pro gebuchtem Termin, nicht pro Minute: unsere Kunden liegen bei etwa 18 Dollar gegenüber rund 210 für einen menschlichen SDR. Der Pilot ist vierzehn Tage kostenlos, Sie können es auf Ihrer Leitung testen.',
  },
  objectionContract: {
    en: 'No lock-in. It is month to month with a thirty-day exit, and the pilot needs no card at all.',
    es: 'Sin permanencia. Es mes a mes con salida a treinta días, y el piloto no pide tarjeta.',
    fr: 'Sans engagement. C’est mensuel avec une sortie à trente jours, et le pilote ne demande pas de carte.',
    de: 'Keine Bindung. Es läuft monatlich mit dreißig Tagen Kündigungsfrist, und der Pilot braucht keine Karte.',
  },
  objectionCompetitor: {
    en: 'Most teams we win are replacing a DIY stack, because latency, CRM hygiene and prompt maintenance quietly become a second job. Happy to run side by side during the pilot and let the numbers decide.',
    es: 'La mayoría de los equipos que llegan vienen de una solución interna, porque la latencia, la higiene del CRM y el mantenimiento se vuelven un segundo trabajo. Podemos comparar durante el piloto y decidir con números.',
    fr: 'La plupart des équipes arrivent d’une solution maison, parce que la latence, l’hygiène CRM et la maintenance deviennent un second métier. On peut comparer pendant le pilote et décider avec les chiffres.',
    de: 'Die meisten Teams kommen von einer Eigenbaulösung, weil Latenz, CRM-Hygiene und Wartung zur zweiten Arbeit werden. Wir können im Piloten vergleichen und mit Zahlen entscheiden.',
  },
  objectionAuthority: {
    en: 'Makes sense. Who else needs to see this — finance, security, or your CTO? I can shape the recap for them and include the SOC 2 pack.',
    es: 'Tiene sentido. ¿Quién más debería verlo: finanzas, seguridad o su CTO? Preparo el resumen para ellos e incluyo el paquete SOC 2.',
    fr: 'C’est logique. Qui doit le voir aussi : la finance, la sécurité ou votre CTO ? Je prépare le récapitulatif et j’ajoute le dossier SOC 2.',
    de: 'Verständlich. Wer sollte es noch sehen: Finanzen, Security oder Ihr CTO? Ich bereite die Zusammenfassung auf und lege das SOC-2-Paket dazu.',
  },
  notSure: {
    en: 'That is fine — nothing to decide on this call.',
    es: 'No hay problema, no hay que decidir nada en esta llamada.',
    fr: 'Pas de souci, rien à décider pendant cet appel.',
    de: 'Alles gut, auf diesem Anruf muss nichts entschieden werden.',
  },
  noted: {
    en: 'That helps.',
    es: 'Eso ayuda.',
    fr: 'C’est utile.',
    de: 'Das hilft.',
  },
} satisfies Record<string, Phrase>

const OBJECTION_LABEL: Record<string, string> = {
  price: 'Price versus hiring',
  contract: 'Contract length and lock-in',
  competitor: 'Incumbent or DIY stack',
  authority: 'Needs internal approval',
}

function fill(template: string, vars: string[]): string {
  return vars.reduce((out, value, i) => out.split(`{${i}}`).join(value), template)
}

/* ---------------------------------------------------------------- language */

const LANG_CUES: Record<Lang, string[]> = {
  en: [],
  es: ['hola', 'gracias', 'precio', 'cuanto', 'cuánto', 'seguridad', 'quiero', 'necesito', 'reunion', 'reunión', 'cuesta', 'datos', 'manana', 'mañana', 'podemos', 'tenemos', 'estamos', 'somos', 'correo'],
  fr: ['bonjour', 'merci', 'prix', 'combien', 'securite', 'sécurité', 'nous', 'rendez', 'reunion', 'réunion', 'donnees', 'données', 'voulez', 'notre', 'sommes', 'bonsoir'],
  de: ['hallo', 'danke', 'preis', 'kosten', 'kostet', 'sicherheit', 'sicher', 'funktioniert', 'wir', 'ich', 'termin', 'daten', 'mochte', 'möchte', 'brauche', 'bitte', 'unser', 'sind', 'haben', 'gespräch', 'gesprach'],
}

export function detectLang(text: string, fallback: Lang): Lang {
  const words = new Set((text.toLowerCase().match(/[a-zà-ÿäöüß]+/g) ?? []).map((w) => w))
  let best: Lang = fallback
  let bestScore = 0
  for (const lang of ['es', 'fr', 'de'] as Lang[]) {
    const score = LANG_CUES[lang].filter((cue) => words.has(cue)).length
    if (score > bestScore) {
      best = lang
      bestScore = score
    }
  }
  return bestScore >= 1 ? best : fallback
}

/* ------------------------------------------------------------- extraction */

const TIMELINE_RE = /\b(q[1-4]|this quarter|next quarter|this month|next month|this year|next year|by (?:january|february|march|april|may|june|july|august|september|october|november|december))\b/i

const USE_CASES: { re: RegExp; label: string }[] = [
  { re: /\b(speed to lead|response time|slow response|answer faster|missed call|coverage|after hours|after-hours)\b/i, label: 'speed to lead and after-hours coverage' },
  { re: /\b(support (?:calls|volume|queue)|drowning|ticket|deflect|resolution|help ?desk)\b/i, label: 'inbound support volume' },
  { re: /\b(qualif|outbound|pipeline|prospect|sdr|bdr|book(?:ing)? more meetings)\b/i, label: 'outbound qualification and meeting booking' },
  { re: /\b(cost per|headcount|hire|hiring|expensive)\b/i, label: 'cost per conversation' },
]

export function extractSlots(text: string, prev: Slots): Slots {
  const next: Slots = { ...prev }

  const email = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)
  if (email) next.email = email[0].replace(/[.,;]+$/, '').toLowerCase()

  const size = text.match(/\b(\d{2,5})\s*(?:support\s*|sales\s*)?(agents|seats|reps|people|employees|advisors|staff)\b/i)
  if (size) next.size = Number(size[1])

  const timeline = text.match(TIMELINE_RE)
  if (timeline) next.timeline = timeline[1].toLowerCase()

  const name = text.match(/\b(?:i'?m|i am|this is|my name is|soy|je m'appelle|ich bin)\s+([A-ZÀ-Ý][a-zà-ÿ]+(?:\s+[A-ZÀ-Ý][a-zà-ÿ]+)?)/)
  if (name) next.name = name[1]

  const roleMatch = text.match(/\b(head of [a-z ]{2,26}|vp(?: of)? [a-z ]{2,26}|director of [a-z ]{2,26}|chief [a-z ]{2,26}|founder|co-?founder|cto|coo|cfo|support manager|sales manager)\b/i)
  if (roleMatch) {
    next.role = roleMatch[1].split(/\s+(?:at|from|chez|bei)\s+/i)[0].trim().replace(/\s+/g, ' ')
  }

  // Only "at / from" introductions; "with HubSpot" is an integration, not a company.
  const company = text.match(/\b(?:at|from|chez|bei)\s+([A-Z][A-Za-z0-9&'-]*(?:\s+[A-Z][A-Za-z0-9&'-]*){0,2})/)
  if (company) {
    const value = company[1].replace(/[.,;]+$/, '').trim()
    const stop = /^(Inc|Ltd|GmbH|Email|The|We|Our|Your|I)$/i
    if (value.length > 1 && !stop.test(value)) next.company = value
  }

  if (/\b(budget (?:is )?(?:approved|confirmed|signed off)|approved budget|we have budget|budget for this)\b/i.test(text)) next.budget = 'approved'
  else if (/\bbudget\b/i.test(text) && !next.budget) next.budget = 'in discussion'

  if (!next.useCase) {
    const match = USE_CASES.find((u) => u.re.test(text))
    if (match) next.useCase = match.label
  }

  return next
}

/* ---------------------------------------------------------------- scoring */

const POSITIVE = ['great', 'love', 'perfect', 'helpful', 'exactly', 'interested', 'good', 'useful', 'thanks', 'thank', 'appreciate', 'promising', 'nice', 'works', 'brilliant', 'parfait', 'perfecto', 'genial', 'super', 'klar']
const NEGATIVE = ['expensive', 'pricey', 'too much', 'concerned', 'worried', 'not sure', 'problem', 'issue', 'slow', 'hate', 'unfortunately', 'cannot', "can't", 'blocker', 'risky', 'complicated', 'teuer', 'cher', 'caro', 'problema', 'probleme']

export function nextSentiment(prev: Sentiment, text: string): Sentiment {
  const t = text.toLowerCase()
  const pos = POSITIVE.filter((w) => t.includes(w)).length
  const neg = NEGATIVE.filter((w) => t.includes(w)).length
  const delta = (pos - neg) / 3
  const score = clamp(prev.score * 0.55 + delta * 0.45 + 0.02, -1, 1)
  const label: Sentiment['label'] = score > 0.18 ? 'positive' : score < -0.12 ? 'negative' : 'neutral'
  const trend = [...prev.trend, Number(score.toFixed(2))].slice(-24)
  return { score: Number(score.toFixed(2)), label, trend }
}

const SENIOR = /head|vp|director|chief|founder|cto|coo|cfo|owner|president/i

export function scoreFor(slots: Slots, sentiment: Sentiment, objections: string[]): LeadScore {
  const bant = {
    budget: slots.budget === 'approved' ? 24 : objections.includes('price') ? 13 : 8,
    authority: slots.role && SENIOR.test(slots.role) ? 24 : slots.role ? 16 : slots.name ? 12 : 8,
    need: slots.useCase ? 23 : 8,
    timeline: slots.timeline ? 23 : 8,
  }
  let total = bant.budget + bant.authority + bant.need + bant.timeline
  total += Math.round(sentiment.score * 6)
  if (slots.size && slots.size >= 50) total += 3
  total = clamp(Math.round(total), 4, 100)
  const band: LeadScore['band'] = total >= 74 ? 'hot' : total >= 46 ? 'warm' : 'cold'
  return { total, band, bant }
}

/* ---------------------------------------------------------------- booking */

export function formatSlot(booking: Booking): string {
  return `${booking.day} ${booking.date} at ${booking.time}`
}

export function offerSlots(now = new Date()): Booking[] {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time'
  const times = ['10:00', '14:30', '09:15']
  const out: Booking[] = []
  const cursor = new Date(now)
  let guard = 0
  while (out.length < 3 && guard++ < 16) {
    cursor.setDate(cursor.getDate() + 1)
    const wd = cursor.getDay()
    if (wd === 0 || wd === 6) continue
    out.push({
      id: uid('slot'),
      day: DAYS[wd],
      date: `${cursor.getDate()} ${MONTHS[cursor.getMonth()]}`,
      time: times[out.length],
      tz,
      with: AE_NAME,
      calendarLink: `https://cal.meridian.cloud/cadence/${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}-${times[out.length].replace(':', '')}`,
    })
  }
  return out
}

function slotIndex(text: string, offered: Booking[]): number {
  const t = text.toLowerCase()
  for (let i = 0; i < offered.length; i++) {
    if (t.includes(offered[i].day.toLowerCase())) return i
  }
  const words: Record<string, number> = { first: 0, second: 1, third: 2, one: 0, two: 1, three: 2 }

  const bare = t.match(/^\s*(1|2|3)\s*[.!]?\s*$/)
  if (bare) return Number(bare[1]) - 1

  const explicit = t.match(/\b(?:option|slot)\s*(1|2|3)\b/)
  if (explicit) return Number(explicit[1]) - 1

  // "let's do the second slot", "I'll take the first one", "the third"
  const chosen = t.match(/\b(?:(?:let'?s|let us)\s+do|i'?ll take|go with|the|that)\s+(?:the\s+)?(first|second|third|one|two|three)\b/)
  if (chosen) return words[chosen[1]]

  const combo = t.match(/\b(first|second|third)\s+(?:one|slot|option|works)\b/)
  if (combo) return words[combo[1]]

  return -1
}

/* ----------------------------------------------------------------- intent */

export type Intent =
  | 'slot'
  | 'discovery'
  | 'bye'
  | 'objection_price'
  | 'objection_contract'
  | 'objection_competitor'
  | 'objection_authority'
  | 'human'
  | 'booking'
  | 'pricing'
  | 'security'
  | 'integrations'
  | 'onboarding'
  | 'roi'
  | 'trial'
  | 'voice'
  | 'consent'
  | 'affirm'
  | 'deny'
  | 'greeting'
  | 'unknown'

export const INTENT_LABEL: Record<string, string> = {
  slot: 'slot choice',
  discovery: 'discovery signal',
  bye: 'close',
  objection_price: 'objection · price',
  objection_contract: 'objection · contract',
  objection_competitor: 'objection · incumbent',
  objection_authority: 'objection · approval',
  human: 'hand-off',
  booking: 'booking',
  pricing: 'question · pricing',
  security: 'question · security',
  integrations: 'question · integrations',
  onboarding: 'question · onboarding',
  roi: 'question · proof',
  trial: 'question · pilot',
  voice: 'question · voice',
  consent: 'question · compliance',
  affirm: 'agreement',
  deny: 'decline',
  greeting: 'greeting',
  unknown: 'unclassified',
}

export function classify(text: string, state: AgentState): Intent {
  const t = text.toLowerCase()
  if (state.offered.length && slotIndex(t, state.offered) !== -1) return 'slot'
  if (/\b(bye|goodbye|that'?s all|that is all|nothing else|we'?re good|i'?m done|no thanks|adiós|adios|au revoir|tschüss|tschuss)\b/.test(t)) return 'bye'
  if (/\b(expensive|pricey|too much|costly|cheaper|afford|cost concern|tight budget)\b/.test(t)) return 'objection_price'
  if (/\b(lock(?:ed)? in|contract|commitment|minimum term|annual commitment|tie us in)\b/.test(t)) return 'objection_contract'
  if (/\b(already (?:use|have)|competitor|vapi|retell|synthflow|elevenlabs|another vendor|in-house|diy|built our own)\b/.test(t)) return 'objection_competitor'
  if (/\b(need to (?:check|ask|talk)|my (?:boss|team|cto|cfo)|approval|not my decision|procurement)\b/.test(t)) return 'objection_authority'
  if (/\b(integrat|salesforce|hubspot|pipedrive|dynamics|crm|calendar|slack|webhook)\b/.test(t)) return 'integrations'
  if (/\b(security|soc ?2|iso ?27001|gdpr|compliance|data (?:stored|residency|privacy)|train on|encrypt|sicherheit|seguridad|sécurité|datos|données|donnees|daten)\b/.test(t)) return 'security'
  if (/\b(book|demo|meeting|walkthrough|appointment|schedule|termin|réservation|reservation|reserva|cita)\b/.test(t)) return 'booking'
  if (/\b(price|pricing|cost|how much|plan|plans|per minute|seat|quote|overage|kostet|preis|prix|coûte|coute|cuesta|precio|cuánto|cuanto)\b/.test(t)) return 'pricing'
  if (/\b(onboard|setup|set up|go live|how long|implementation)\b/.test(t)) return 'onboarding'
  if (/\b(roi|results|case study|proof|reference|benchmark)\b/.test(t)) return 'roi'
  if (/\b(pilot|trial|free|test it|poc)\b/.test(t)) return 'trial'
  if (/\b(latency|voice|accent|language|languages|interrupt|barge)\b/.test(t)) return 'voice'
  if (/\b(recording|consent|opt out|dnc|legal)\b/.test(t)) return 'consent'
  if (/\b(speak to (?:a )?(?:human|person)|talk to (?:a )?(?:human|person)|real person|representative|transfer me)\b/.test(t)) return 'human'
  if (/^(yes|yeah|yep|sure|okay|ok|sounds good|perfect|great|works|let'?s do)\b/.test(t)) return 'affirm'
  if (/^(no|nope|not really|not now)\b/.test(t)) return 'deny'
  if (/\b(hi|hello|hey|hola|bonjour|hallo)\b/.test(t)) return 'greeting'
  return 'unknown'
}

const DOC_FOR_INTENT: Partial<Record<Intent, string>> = {
  pricing: 'pricing',
  security: 'security',
  integrations: 'integrations',
  onboarding: 'onboarding',
  roi: 'roi',
  trial: 'trial',
  voice: 'voice',
  consent: 'consent',
}

function citationFor(docId: string): Citation | null {
  const doc = KB_BY_ID[docId]
  if (!doc) return null
  return { docId: doc.id, title: doc.title, section: doc.section, score: 0.94, snippet: doc.body }
}

function mergeCitations(primary: Citation | null, extra: Citation[]): Citation[] {
  const out: Citation[] = []
  if (primary) out.push(primary)
  for (const c of extra) {
    if (!out.some((x) => x.docId === c.docId)) out.push(c)
  }
  return out.slice(0, 3)
}

/* ------------------------------------------------------------------ state */

export function createState(lang: Lang = 'en'): AgentState {
  return {
    stage: 'greet',
    lang,
    slots: {},
    asked: [],
    objections: [],
    cited: [],
    offered: [],
    turn: 0,
    emailSent: false,
    crmWritten: false,
    sentiment: { score: 0.08, label: 'neutral', trend: [0.08] },
  }
}

export function opening(lang: Lang = 'en'): { text: string; state: AgentState } {
  const state: AgentState = { ...createState(lang), stage: 'discover', asked: ['useCase'], turn: 1 }
  return { text: P.opening[lang], state }
}

export function nextQuestion(state: AgentState): string {
  const lang = state.lang
  if (state.booking) return P.wrap[lang]
  if (!state.slots.useCase) return P.askUseCase[lang]
  if (!state.slots.size) return P.askSize[lang]
  if (!state.slots.timeline) return P.askTimeline[lang]
  if (state.offered.length) return P.whichSlot[lang]
  return ''
}

/* ---------------------------------------------------------------- respond */

export type RespondOptions = { now?: Date }

export function respond(prev: AgentState, raw: string, opts: RespondOptions = {}): {
  text: string
  intent: Intent
  state: AgentState
  citations: Citation[]
  score: LeadScore
  sentiment: Sentiment
  events: CallEvent[]
} {
  const now = opts.now ?? new Date()
  const text = raw.trim()
  const lang = detectLang(text, prev.lang)
  const switched = lang !== prev.lang
  const slots = extractSlots(text, prev.slots)
  const sentiment = nextSentiment(prev.sentiment, text)

  let state: AgentState = {
    ...prev,
    lang,
    slots,
    sentiment,
    turn: prev.turn + 1,
  }

  let intent = classify(text, state)
  const newSignal = (['useCase', 'size', 'timeline', 'name', 'email', 'company', 'role'] as const).some(
    (key) => slots[key] !== undefined && prev.slots[key] === undefined,
  )
  if (newSignal && (intent === 'unknown' || intent === 'greeting' || intent === 'affirm')) intent = 'discovery'

  const events: CallEvent[] = [
    { id: uid('ev'), at: now.getTime(), kind: 'stt', label: 'asr.final', detail: `${text.split(/\s+/).length} tokens`, ms: tick(160, 290) },
  ]

  let body = ''
  let citations: Citation[] = []
  let follow: string | null = null
  let skipFollow = false

  if (switched) body = P.langSwitch[lang]

  switch (intent) {
    case 'slot': {
      const chosen = state.offered[slotIndex(text, state.offered)]
      if (!state.slots.email) {
        state = { ...state, pending: chosen, stage: 'book' }
        body = [body, P.askEmail[lang]].filter(Boolean).join(' ')
        skipFollow = true
      } else {
        const booking: Booking = { ...chosen, email: state.slots.email }
        state = { ...state, booking, pending: undefined, stage: 'confirm', emailSent: true, crmWritten: true }
        body = [body, fill(P.confirm[lang], [booking.day + ' ' + booking.date, booking.time, booking.email ?? ''])]
          .filter(Boolean)
          .join(' ')
        events.push({ id: uid('ev'), at: now.getTime(), kind: 'tool', label: 'calendar.hold → confirm', detail: `${booking.day} ${booking.date} · ${booking.time}`, ms: tick(90, 160) })
        events.push({ id: uid('ev'), at: now.getTime(), kind: 'crm', label: 'crm.deal.upsert', detail: 'HubSpot · stage=Discovery', ms: tick(120, 220) })
        events.push({ id: uid('ev'), at: now.getTime(), kind: 'tool', label: 'email.send', detail: `invite → ${booking.email}`, ms: tick(80, 140) })
      }
      break
    }

    case 'booking': {
      if (!state.offered.length) state = { ...state, offered: offerSlots(now), stage: 'book' }
      body = [body, fill(P.offerSlots[lang], state.offered.slice(0, 3).map(formatSlot))].filter(Boolean).join(' ')
      events.push({ id: uid('ev'), at: now.getTime(), kind: 'tool', label: 'calendar.availability', detail: '3 slots held for 10 min', ms: tick(80, 150) })
      skipFollow = true
      break
    }

    case 'discovery': {
      body = [body, P.noted[lang]].filter(Boolean).join(' ')
      state = { ...state, stage: 'discover' }
      break
    }

    case 'objection_price':
    case 'objection_contract':
    case 'objection_competitor':
    case 'objection_authority': {
      const kind = intent.replace('objection_', '')
      if (!state.objections.includes(kind)) state = { ...state, objections: [...state.objections, kind], stage: 'objection' }
      const play =
        kind === 'price' ? P.objectionPrice : kind === 'contract' ? P.objectionContract : kind === 'competitor' ? P.objectionCompetitor : P.objectionAuthority
      body = [body, P.ack[lang], play[lang]].filter(Boolean).join(' ')
      const docId = kind === 'price' || kind === 'competitor' ? 'roi' : kind === 'contract' ? 'trial' : 'security'
      const cite = citationFor(docId)
      citations = mergeCitations(cite, retrieve(text, 2).filter((c) => c.score >= 0.72))
      break
    }

    case 'pricing':
    case 'security':
    case 'integrations':
    case 'onboarding':
    case 'roi':
    case 'trial':
    case 'voice':
    case 'consent': {
      const docId = DOC_FOR_INTENT[intent] ?? 'pricing'
      const doc = KB_BY_ID[docId]
      const cite = citationFor(docId)
      citations = mergeCitations(cite, retrieve(text, 2).filter((c) => c.score >= 0.72))
      body = [body, doc?.spoken[lang] ?? P.noAnswer[lang]].filter(Boolean).join(' ')
      state = { ...state, stage: 'answer' }
      events.push({ id: uid('ev'), at: now.getTime(), kind: 'rag', label: 'rag.retrieve', detail: `${citations.length} chunks · top ${(citations[0]?.score ?? 0).toFixed(2)}`, ms: tick(18, 46) })
      break
    }

    case 'human': {
      body = [body, P.human[lang]].filter(Boolean).join(' ')
      state = { ...state, stage: 'answer' }
      events.push({ id: uid('ev'), at: now.getTime(), kind: 'tool', label: 'handoff.offered', detail: `${AE_NAME} · warm transfer`, ms: tick(40, 90) })
      skipFollow = true
      break
    }

    case 'bye': {
      body = [body, P.bye[lang]].filter(Boolean).join(' ')
      state = { ...state, stage: 'wrap' }
      skipFollow = true
      break
    }

    case 'affirm': {
      body = [body, state.offered.length ? P.whichSlot[lang] : P.ack[lang]].filter(Boolean).join(' ')
      skipFollow = state.offered.length > 0
      break
    }

    case 'deny': {
      body = [body, P.deny[lang]].filter(Boolean).join(' ')
      break
    }

    case 'greeting': {
      body = [body, P.greeting[lang]].filter(Boolean).join(' ')
      break
    }

    default: {
      // Unknown utterance: retrieve, answer if there is a confident match,
      // otherwise offer the human instead of guessing.
      citations = retrieve(text, 2)
      if (citations.length && citations[0].score >= 0.62) {
        const doc = KB_BY_ID[citations[0].docId]
        body = [body, doc?.spoken[lang] ?? P.noAnswer[lang]].filter(Boolean).join(' ')
      } else {
        body = [body, P.noAnswer[lang]].filter(Boolean).join(' ')
        citations = []
      }
      break
    }
  }

  // Slot filling drives the next question; once discovery is complete the
  // agent offers real availability instead of asking another form question.
  if (!skipFollow && !state.booking && !state.pending) {
    if (!state.slots.useCase) follow = P.askUseCase[lang]
    else if (!state.slots.size) follow = P.askSize[lang]
    else if (!state.slots.timeline) follow = P.askTimeline[lang]
    else if (!state.offered.length) {
      state = { ...state, offered: offerSlots(now), stage: 'book' }
      follow = fill(P.offerSlots[lang], state.offered.slice(0, 3).map(formatSlot))
      events.push({ id: uid('ev'), at: now.getTime(), kind: 'tool', label: 'calendar.availability', detail: '3 slots held for 10 min', ms: tick(80, 150) })
    } else if (intent !== 'slot') {
      follow = P.whichSlot[lang]
    }
  }
  if (state.booking && intent !== 'bye') follow = P.wrap[lang]

  const out = [body, follow ?? ''].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  const score = scoreFor(state.slots, sentiment, state.objections)
  const cited = citations.map((c) => c.docId)
  state = { ...state, cited: Array.from(new Set([...state.cited, ...cited])) }

  events.push({ id: uid('ev'), at: now.getTime(), kind: 'llm', label: 'policy.turn', detail: INTENT_LABEL[intent] ?? intent, ms: tick(380, 720) })
  events.push({ id: uid('ev'), at: now.getTime(), kind: 'tts', label: 'tts.first_audio', detail: `${out.split(/\s+/).length} tokens queued`, ms: tick(70, 140) })

  return { text: out, intent, state, citations, score, sentiment, events }
}

/* -------------------------------------------------------------- summarise */

export function summarise(args: {
  state: AgentState
  score: LeadScore
  sentiment: Sentiment
  booking?: Booking
}): CallSummary {
  const { state, score, sentiment, booking } = args
  const s = state.slots
  const citedTitles = Array.from(new Set(state.cited.map((id) => KB_BY_ID[id]?.title).filter(Boolean) as string[]))

  const headline = s.company
    ? `${s.company} — ${s.size ?? '—'} agents, ${s.useCase ?? 'inbound evaluation'}`
    : `${s.name ?? 'Inbound caller'} — ${s.useCase ?? 'inbound evaluation'}`

  const bullets = [
    `${s.size ? `${s.size} agents` : 'Team size not captured'}${s.role ? `, ${s.role}` : ''}${s.company ? ` at ${s.company}` : ''}, on the call.`,
    s.useCase ? `Primary need: ${s.useCase}.` : 'Primary need not established.',
    citedTitles.length ? `Answered from ${citedTitles.length} knowledge sections: ${citedTitles.join(', ')}.` : 'No knowledge sections cited.',
    booking ? `Meeting booked ${booking.day} ${booking.date} at ${booking.time} with ${booking.with}.` : 'No meeting booked — follow-up required.',
    `Lead score ${score.total} (${score.band}); sentiment ${sentiment.label} (${sentiment.score.toFixed(2)}).`,
  ]

  const nextSteps = booking
    ? [
        `Send agenda, recording and trust pack to ${booking.email ?? s.email ?? 'the caller'}.`,
        `Move the CRM deal to Discovery for ${booking.day} ${booking.time}.`,
        'AE intro email within five minutes of hang-up.',
      ]
    : score.total >= 55
      ? ['AE follow-up within 24 hours with pilot terms.', 'Send the SOC 2 pack and the Lumen Retail case study.']
      : ['Add to nurture sequence; no AE time this week.', 'Re-qualify in 30 days or when budget is confirmed.']

  return {
    headline,
    bullets,
    objections: state.objections.map((o) => OBJECTION_LABEL[o] ?? o),
    nextSteps,
    topics: citedTitles,
    disposition: booking ? 'meeting_booked' : score.total >= 55 ? 'qualified_nurture' : 'follow_up',
  }
}

export function buildCall(args: {
  state: AgentState
  turns: Turn[]
  startedAt: number
  endedAt: number
  channel?: 'inbound' | 'outbound'
  scripted?: boolean
}): Call {
  const { state, turns, startedAt, endedAt } = args
  const score = scoreFor(state.slots, state.sentiment, state.objections)
  const booking = state.booking
  const summary = summarise({ state, score, sentiment: state.sentiment, booking })

  const agentChars = turns.filter((t) => t.speaker === 'agent').reduce((n, t) => n + t.text.length, 0)
  const allChars = turns.reduce((n, t) => n + t.text.length, 0) || 1
  const citations = Array.from(new Map(turns.flatMap((t) => t.citations ?? []).map((c) => [c.docId, c])).values())

  const events: CallEvent[] = [
    { id: uid('ev'), at: startedAt, kind: 'system', label: 'call.connected', detail: 'inbound · WebRTC · 16 kHz', ms: 42 },
    { id: uid('ev'), at: endedAt, kind: 'system', label: 'call.ended', detail: `${Math.round((endedAt - startedAt) / 1000)}s · recording stored`, ms: 0 },
  ]

  return {
    id: uid('call'),
    startedAt: new Date(startedAt).toISOString(),
    durationSec: Math.max(1, Math.round((endedAt - startedAt) / 1000)),
    lang: state.lang,
    channel: args.channel ?? 'inbound',
    caller: {
      name: state.slots.name ?? 'Unknown caller',
      company: state.slots.company ?? 'Unknown company',
      role: state.slots.role ?? 'Not captured',
      email: state.slots.email,
      size: state.slots.size,
    },
    turns,
    score,
    sentiment: state.sentiment,
    citations,
    booking,
    summary,
    events,
    talkRatio: Number((agentChars / allChars).toFixed(2)),
    scripted: args.scripted,
  }
}

/* ------------------------------------------------------------- scripted demo */

export const SCRIPT: { text: string; pause: number }[] = [
  { text: 'Hi, I saw your site — we are drowning in inbound support calls.', pause: 1500 },
  { text: 'We run about 240 agents across three regions and we are evaluating vendors this quarter.', pause: 1900 },
  { text: 'What does Growth cost for that size, and is there an overage?', pause: 2100 },
  { text: 'Security is the blocker for us — where is the data stored, and do you train on our calls?', pause: 2200 },
  { text: 'Honestly it sounds expensive compared with hiring two more people.', pause: 2200 },
  { text: 'Does it sync both ways with HubSpot and our Google calendars?', pause: 2100 },
  { text: 'Okay. I am Priya Raghavan, Head of Support at Lumen Retail. Email is priya@lumenretail.com.', pause: 2300 },
  { text: 'Let us do the second slot.', pause: 1800 },
  { text: 'Great, that is all I needed. Thanks.', pause: 1600 },
]
