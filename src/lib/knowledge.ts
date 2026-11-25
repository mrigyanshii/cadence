import type { Citation, Lang } from './types'

/*
  The retrieval corpus. Each document is one section of Meridian Cloud's sales
  knowledge base: the same shape you would chunk out of a help centre, a pricing
  page or a security portal before embedding it.

  `body` is the passage shown as a citation. `spoken` is the short answer the
  agent says out loud, per language pack.
*/
export type KbDoc = {
  id: string
  title: string
  section: string
  keywords: string[]
  body: string
  spoken: Record<Lang, string>
}

export const KB: KbDoc[] = [
  {
    id: 'pricing',
    title: 'Plans and pricing',
    section: 'Pricing · v4.2',
    keywords: ['price', 'pricing', 'cost', 'plan', 'plans', 'minute', 'minutes', 'budget', 'quote', 'seat', 'seats', 'annual', 'monthly', 'overage', 'expensive'],
    body:
      'Starter is $499 per month and includes 1,000 voice minutes and one phone number. Growth is $1,490 per month for 5,000 minutes, three numbers, outbound dialling and two-way CRM sync. Scale starts at $3,900 per month with unlimited seats, SSO, custom voice and regional data residency. Overage is $0.14 per minute on every plan, and annual billing includes two months free.',
    spoken: {
      en: 'Starter is 499 a month for a thousand minutes, Growth is 1,490 for five thousand minutes with CRM sync, and Scale is custom from 3,900. Overage is fourteen cents a minute, and annual billing gives you two months free.',
      es: 'El plan Starter cuesta 499 al mes por mil minutos, Growth son 1.490 por cinco mil minutos con sincronización de CRM, y Scale es a medida desde 3.900. El excedente son catorce centavos por minuto, y el pago anual incluye dos meses gratis.',
      fr: 'Starter est à 499 par mois pour mille minutes, Growth à 1 490 pour cinq mille minutes avec la synchronisation CRM, et Scale est sur mesure à partir de 3 900. Le dépassement est de quatorze cents la minute, et l’annuel inclut deux mois offerts.',
      de: 'Starter kostet 499 pro Monat für tausend Minuten, Growth 1.490 für fünftausend Minuten mit CRM-Sync, und Scale ist individuell ab 3.900. Jede weitere Minute kostet vierzehn Cent, und bei Jahreszahlung sind zwei Monate gratis.',
    },
  },
  {
    id: 'security',
    title: 'Security and compliance',
    section: 'Trust centre · Security overview',
    keywords: ['security', 'secure', 'soc', 'iso', 'gdpr', 'hipaa', 'compliance', 'data', 'privacy', 'residency', 'encryption', 'retention', 'audit', 'training'],
    body:
      'Meridian Cloud is SOC 2 Type II and ISO 27001 certified and GDPR-ready with a signed DPA. Data is encrypted with AES-256 at rest and TLS 1.3 in transit. Customers choose EU, US or India residency, retention from 7 to 365 days, and PII redaction before storage. Customer audio and transcripts are never used to train models.',
    spoken: {
      en: 'We are SOC 2 Type II and ISO 27001 certified, GDPR-ready with a signed DPA, and encrypted with AES-256 at rest and TLS 1.3 in transit. You choose EU, US or India residency, retention is configurable, and we never train on your calls.',
      es: 'Tenemos SOC 2 Type II e ISO 27001, cumplimos el RGPD con un DPA firmado, y ciframos con AES-256 en reposo y TLS 1.3 en tránsito. Usted elige la residencia de datos en la UE, EE. UU. o India, la retención es configurable, y nunca entrenamos modelos con sus llamadas.',
      fr: 'Nous sommes certifiés SOC 2 Type II et ISO 27001, conformes au RGPD avec un DPA signé, et chiffrés en AES-256 au repos et TLS 1.3 en transit. Vous choisissez l’hébergement UE, US ou Inde, la rétention est configurable, et nous n’entraînons jamais de modèle sur vos appels.',
      de: 'Wir sind SOC 2 Type II und ISO 27001 zertifiziert, DSGVO-konform mit unterschriebenem DPA, und verschlüsseln mit AES-256 im Ruhezustand und TLS 1.3 bei der Übertragung. Sie wählen EU-, US- oder Indien-Hosting, die Aufbewahrung ist konfigurierbar, und wir trainieren nie mit Ihren Gesprächen.',
    },
  },
  {
    id: 'integrations',
    title: 'CRM and calendar integrations',
    section: 'Integrations · Native connectors',
    keywords: ['integrate', 'integration', 'integrations', 'crm', 'salesforce', 'hubspot', 'pipedrive', 'dynamics', 'calendar', 'google', 'outlook', 'slack', 'api', 'webhook', 'zapier', 'sync'],
    body:
      'Native two-way sync with Salesforce, HubSpot, Pipedrive and Microsoft Dynamics, plus Google Calendar, Outlook, Slack, webhooks, Zapier and a REST API. Field mapping is configured during onboarding and changes are pushed in under 15 seconds by webhook.',
    spoken: {
      en: 'Native two-way sync with Salesforce, HubSpot, Pipedrive and Dynamics, plus Google and Outlook calendars, Slack, webhooks and a REST API. Field mapping is set up during onboarding.',
      es: 'Sincronización bidireccional nativa con Salesforce, HubSpot, Pipedrive y Dynamics, además de calendarios de Google y Outlook, Slack, webhooks y una API REST. El mapeo de campos se configura durante el onboarding.',
      fr: 'Synchronisation bidirectionnelle native avec Salesforce, HubSpot, Pipedrive et Dynamics, plus les agendas Google et Outlook, Slack, des webhooks et une API REST. Le mapping des champs est configuré à l’onboarding.',
      de: 'Native Zwei-Wege-Synchronisation mit Salesforce, HubSpot, Pipedrive und Dynamics, dazu Google- und Outlook-Kalender, Slack, Webhooks und eine REST-API. Das Feld-Mapping richten wir im Onboarding ein.',
    },
  },
  {
    id: 'onboarding',
    title: 'Onboarding and time to value',
    section: 'Implementation · Five-day plan',
    keywords: ['onboarding', 'setup', 'implement', 'launch', 'live', 'days', 'long', 'start', 'migrate', 'training'],
    body:
      'A standard deployment goes live in five business days. Days one and two ingest your help centre, pricing sheets and PDFs. Day three tunes the script, objection handling and voice. Day four connects CRM, calendar and phone numbers. Day five runs shadowed calls before full go-live. Growth and Scale include a named solutions engineer.',
    spoken: {
      en: 'Most teams go live in five business days: two days ingesting your documents, one day tuning script and voice, one day connecting CRM and calendar, then go-live with an engineer shadowing the first calls.',
      es: 'La mayoría de los equipos salen en vivo en cinco días hábiles: dos días para ingerir sus documentos, un día para ajustar el guion y la voz, un día para conectar CRM y calendario, y el lanzamiento con un ingeniero acompañando las primeras llamadas.',
      fr: 'La plupart des équipes sont en production en cinq jours ouvrés : deux jours pour ingérer vos documents, un jour pour régler le script et la voix, un jour pour connecter CRM et agenda, puis le lancement avec un ingénieur présent sur les premiers appels.',
      de: 'Die meisten Teams gehen in fünf Werktagen live: zwei Tage für das Einlesen Ihrer Dokumente, ein Tag für Skript und Stimme, ein Tag für CRM und Kalender, dann Go-live mit einem Engineer, der die ersten Anrufe begleitet.',
    },
  },
  {
    id: 'roi',
    title: 'Results and return on investment',
    section: 'Case study · Lumen Retail',
    keywords: ['roi', 'result', 'results', 'case', 'study', 'proof', 'reference', 'improve', 'conversion', 'meetings', 'benchmark', 'value', 'save'],
    body:
      'Lumen Retail deployed Cadence on its inbound line and cut speed-to-lead from four hours to forty seconds, tripling booked meetings. Across the reference book, 62% of inbound calls are resolved without a human, cost per booked meeting falls from about $210 to $18, and pipeline per rep rises 2.4 times within two quarters.',
    spoken: {
      en: 'Lumen Retail cut speed-to-lead from four hours to forty seconds and tripled booked meetings. Across our customers, 62% of inbound calls are resolved without a human, and cost per booked meeting drops from about 210 dollars to 18.',
      es: 'Lumen Retail redujo el tiempo de respuesta de cuatro horas a cuarenta segundos y triplicó las reuniones agendadas. En general, el 62% de las llamadas entrantes se resuelven sin un humano, y el coste por reunión baja de unos 210 a 18 dólares.',
      fr: 'Lumen Retail a réduit le délai de réponse de quatre heures à quarante secondes et triplé les rendez-vous. Globalement, 62 % des appels entrants sont résolus sans humain, et le coût par rendez-vous passe d’environ 210 à 18 dollars.',
      de: 'Lumen Retail hat die Reaktionszeit von vier Stunden auf vierzig Sekunden gesenkt und dreimal so viele Termine gebucht. Bei unseren Kunden werden 62 % der eingehenden Anrufe ohne Menschen gelöst, und die Kosten pro Termin sinken von etwa 210 auf 18 Dollar.',
    },
  },
  {
    id: 'trial',
    title: 'Pilot and contract terms',
    section: 'Commercial · Pilot terms',
    keywords: ['trial', 'pilot', 'test', 'contract', 'terms', 'cancel', 'commitment', 'lock', 'month', 'months', 'free', 'poc'],
    body:
      'A 14-day pilot runs on your own number with 250 minutes included, no card required. You keep the recordings and CRM records afterwards. Commercial plans are month-to-month with a 30-day exit, or annual with two months free; there is no minimum seat count on Starter or Growth.',
    spoken: {
      en: 'We run a fourteen-day pilot on your own number with 250 minutes included, no card. You keep the recordings and CRM records, and after that it is month to month with a thirty-day exit.',
      es: 'Hacemos un piloto de catorce días en su propio número con 250 minutos incluidos, sin tarjeta. Usted conserva las grabaciones y los registros del CRM, y después es mes a mes con salida a treinta días.',
      fr: 'Nous lançons un pilote de quatorze jours sur votre numéro, 250 minutes incluses, sans carte. Vous gardez les enregistrements et les données CRM, puis c’est mensuel avec une sortie à trente jours.',
      de: 'Wir starten einen vierzehntägigen Piloten auf Ihrer eigenen Nummer mit 250 Minuten, ohne Karte. Sie behalten Aufnahmen und CRM-Daten, danach läuft es monatlich mit dreißig Tagen Kündigungsfrist.',
    },
  },
  {
    id: 'voice',
    title: 'Voice quality and latency',
    section: 'Platform · Speech pipeline',
    keywords: ['voice', 'latency', 'delay', 'fast', 'language', 'languages', 'accent', 'sound', 'human', 'transfer', 'interrupt', 'barge', 'dtmf'],
    body:
      'Median end-of-speech to first-audio latency is 480 ms, with barge-in under 120 ms. The platform speaks 30+ languages with twelve stock voices and custom clones on Scale. Warm transfer to a human includes a spoken handover summary; DTMF menus and voicemail detection are supported.',
    spoken: {
      en: 'Median response latency is 480 milliseconds and barge-in is under 120. We support more than thirty languages, twelve stock voices, custom clones on Scale, and warm transfer to a human when the caller asks.',
      es: 'La latencia media de respuesta es de 480 milisegundos y la interrupción es inferior a 120. Soportamos más de treinta idiomas, doce voces estándar, clones en Scale y transferencia a un humano cuando el cliente lo pide.',
      fr: 'La latence médiane est de 480 millisecondes et l’interruption sous 120. Nous gérons plus de trente langues, douze voix standard, le clonage sur Scale, et le transfert vers un humain sur demande.',
      de: 'Die mittlere Latenz liegt bei 480 Millisekunden, Unterbrechung unter 120. Wir unterstützen über dreißig Sprachen, zwölf Standardstimmen, Voice-Cloning bei Scale und Warm Transfer zu einem Menschen auf Wunsch.',
    },
  },
  {
    id: 'consent',
    title: 'Recording consent and outbound rules',
    section: 'Compliance · Call handling',
    keywords: ['consent', 'recording', 'record', 'tcpa', 'dnc', 'opt', 'legal', 'notice', 'permission', 'outbound'],
    body:
      'Every call opens with a recording disclosure. Outbound lists are scrubbed against national do-not-call registries before dialling, opt-outs are applied within one second and honoured across all channels, and PII can be redacted from transcripts before storage. Consent language is configurable per region and per language.',
    spoken: {
      en: 'Every call opens with a recording disclosure, we scrub do-not-call lists before dialling, opt-outs are honoured immediately, and we can redact personal data before storage. That covers your TCPA and GDPR duties.',
      es: 'Cada llamada empieza con el aviso de grabación, filtramos las listas de no llamar antes de marcar, respetamos las bajas de inmediato y podemos ocultar datos personales antes de guardarlos. Eso cubre sus obligaciones de RGPD y TCPA.',
      fr: 'Chaque appel commence par la mention d’enregistrement, nous filtrons les listes d’opposition avant d’appeler, les désinscriptions sont immédiates, et nous pouvons masquer les données personnelles avant stockage. Cela couvre vos obligations RGPD et TCPA.',
      de: 'Jeder Anruf beginnt mit dem Hinweis auf die Aufzeichnung, wir prüfen Sperrlisten vor dem Wählen, Opt-outs gelten sofort, und personenbezogene Daten können vor der Speicherung maskiert werden. Das deckt Ihre DSGVO- und TCPA-Pflichten ab.',
    },
  },
]

export const KB_BY_ID: Record<string, KbDoc> = Object.fromEntries(KB.map((d) => [d.id, d]))

export const KB_META = {
  documents: KB.length,
  sections: KB.reduce((n, d) => n + d.body.split('. ').length, 0),
  version: '2026.11',
}

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'is', 'are', 'do', 'does', 'you', 'your', 'we', 'our',
  'it', 'that', 'this', 'with', 'can', 'could', 'would', 'i', 'me', 'my', 'what', 'how', 'about', 'have', 'has', 'be',
])

function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((t) => t.length > 1 && !STOP.has(t))
}

/**
 * Lexical retrieval with keyword weighting. In production this is BM25 plus an
 * embedding index fused by reciprocal rank; the citation shape is the same.
 */
export function retrieve(query: string, k = 3): Citation[] {
  const q = tokens(query)
  if (!q.length) return []
  const qset = new Set(q)
  const scored = KB.map((doc) => {
    const kw = doc.keywords.filter((word) => qset.has(word) || q.some((t) => t.startsWith(word) && word.length > 4))
    const body = new Set(tokens(doc.body + ' ' + doc.title))
    const overlap = q.filter((t) => body.has(t)).length
    return { doc, raw: kw.length * 3 + overlap, hits: kw.length }
  })
    .filter((r) => r.raw > 0)
    .sort((a, b) => b.raw - a.raw)

  return scored.slice(0, k).map((r) => ({
    docId: r.doc.id,
    title: r.doc.title,
    section: r.doc.section,
    score: Math.min(0.98, 0.34 + r.raw / 14 + r.hits * 0.04),
    snippet: r.doc.body,
  }))
}
