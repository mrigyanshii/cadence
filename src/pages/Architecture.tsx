import { ArrowRight, Boxes, Cable, Database, GitBranch, ShieldCheck, Timer, TriangleAlert } from 'lucide-react'

import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { Button, Eyebrow, SectionHead } from '../components/ui'

const INK = '#14130c'
const LINE = 'rgba(242,240,233,0.18)'
const SOFT = '#c8c7be'
const MUTED = '#8d8f87'
const FAINT = '#62655e'
const LIME = '#d8a24a'

export function Architecture() {
  return (
    <div className="relative">
      <Container className="pb-20 pt-10 sm:pt-14">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow tone="lime">System architecture · v1.0</Eyebrow>
            <h1 className="mt-5 max-w-2xl text-[clamp(34px,4.8vw,58px)] leading-[1.02] tracking-[-0.022em]">
              The system behind <span className="serif-italic text-lime-text">the voice.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
              Telephony in, streaming speech, a tool-calling orchestrator grounded in a versioned corpus, and business systems written before the caller hangs up. Every hop has a latency budget.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[10.5px] uppercase tracking-[0.12em] text-faint">
            <span className="text-lime-text">p50 480 ms</span>
            <span>99.95% SLO</span>
            <span>3 regions</span>
            <span>EU / US / IN residency</span>
          </div>
        </div>

        {/* Diagram */}
        <Reveal>
          <div className="surface-night mt-9 overflow-hidden rounded-[20px] border border-line-2 shadow-float">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
              <div className="flex items-center gap-2.5">
                <GitBranch aria-hidden className="size-3.5 text-lime-text" />
                <span className="label">Request path · inbound call</span>
              </div>
              <div className="flex items-center gap-4 text-[9.5px] text-faint">
                <span className="flex items-center gap-1.5"><span aria-hidden className="h-px w-5 bg-fg/50" /> request</span>
                <span className="flex items-center gap-1.5"><span aria-hidden className="h-px w-5 border-t border-dashed border-fg/40" /> response</span>
                <span className="flex items-center gap-1.5"><span aria-hidden className="size-1.5 rounded-sm bg-lime" /> hot path</span>
              </div>
            </div>

            <div className="overflow-x-auto scroll-thin p-3 sm:p-5">
              <svg viewBox="0 0 1240 620" className="w-full min-w-[880px]" role="img" aria-label="Architecture diagram: telephony, speech, orchestration, knowledge and business systems">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="rgba(242,240,233,0.45)" />
                  </marker>
                  <marker id="arrowLime" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill={LIME} />
                  </marker>
                  <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.7" fill="rgba(242,240,233,0.10)" />
                  </pattern>
                </defs>

                <rect x="0" y="0" width="1240" height="620" fill="url(#dots)" opacity="0.5" />

                {/* column headers */}
                {[
                  ['EDGE', 24],
                  ['SPEECH', 232],
                  ['ORCHESTRATION', 444],
                  ['KNOWLEDGE', 692],
                  ['BUSINESS SYSTEMS', 940],
                ].map(([label, x]) => (
                  <text key={label as string} x={x as number} y="34" fill={FAINT} fontSize="9" fontFamily="JetBrains Mono, monospace" letterSpacing="1.6">
                    {label as string}
                  </text>
                ))}
                <line x1="24" y1="46" x2="1216" y2="46" stroke="rgba(242,240,233,0.07)" />

                {/* edges */}
                <g fill="none" stroke="rgba(242,240,233,0.32)" strokeWidth="1.2" markerEnd="url(#arrow)">
                  <path d="M108 164 V196" />
                  <path d="M192 236 H212 V142 H232" />
                  <path d="M318 188 V208" />
                  <path d="M404 244 H424 V200 H444" />
                  <path d="M652 176 H692" stroke={LIME} markerEnd="url(#arrowLime)" />
                  <path d="M692 214 H652" strokeDasharray="4 4" markerEnd="url(#arrow)" />
                  <path d="M548 280 V312" stroke={LIME} markerEnd="url(#arrowLime)" />
                  <path d="M444 248 H424 V340 H404" strokeDasharray="4 4" />
                  <path d="M232 352 H208 V300 H192" strokeDasharray="4 4" />
                  <path d="M790 328 V352" />
                  <path d="M692 388 H672 V214 H692" strokeDasharray="4 4" />
                  <path d="M652 366 H690 V446 H916" />
                  <path d="M916 446 V368" stroke="none" />
                  <path d="M916 128 H940" markerEnd="url(#arrow)" />
                  <path d="M916 208 H940" markerEnd="url(#arrow)" />
                  <path d="M916 288 H940" markerEnd="url(#arrow)" />
                  <path d="M916 368 H940" markerEnd="url(#arrow)" />
                </g>

                {/* edge labels */}
                <g fill={FAINT} fontSize="8" fontFamily="JetBrains Mono, monospace">
                  <text x="118" y="184">PCM 20 ms</text>
                  <text x="658" y="168">query</text>
                  <text x="660" y="230">top-k</text>
                  <text x="556" y="300">tool call</text>
                  <text x="214" y="330">audio out</text>
                  <text x="798" y="344">upsert</text>
                  <text x="700" y="462">webhooks · 15 s sync</text>
                </g>

                {/* EDGE */}
                <Node x={24} y={96} w={168} h={68} title="Caller" sub="PSTN · SIP · WebRTC" />
                <Node x={24} y={196} w={168} h={104} title="Media gateway" tags={['16 kHz · jitter buffer', 'VAD · barge-in', 'consent · DTMF']} />

                {/* SPEECH */}
                <Node x={232} y={96} w={172} h={92} title="Streaming ASR" tags={['partial hypotheses', 'word timings']} accent />
                <Node x={232} y={208} w={172} h={72} title="Turn detector" tags={['semantic endpointing']} />
                <Node x={232} y={312} w={172} h={86} title="Streaming TTS" tags={['phrase chunking', 'voice clone']} accent />

                {/* ORCHESTRATION */}
                <Node x={444} y={132} w={208} h={148} title="Orchestrator" tags={['state machine · slots', 'policy LLM', 'tool router · memory', 'guardrails']} accent wide />
                <Node x={444} y={312} w={208} h={92} title="Tool layer" tags={['calendar · CRM · email', 'idempotent + retries']} />

                {/* KNOWLEDGE */}
                <Node x={692} y={96} w={196} h={116} title="Hybrid retrieval" tags={['BM25 + vectors', 'rerank · citations']} accent />
                <Node x={692} y={236} w={196} h={92} title="Ingestion" tags={['crawl · chunk · embed', 'versioned corpus']} />
                <Node x={692} y={352} w={196} h={72} title="Vector index" tags={['pgvector · filters']} />

                {/* SYSTEMS */}
                <Node x={940} y={96} w={276} h={64} title="CRM" sub="HubSpot · Salesforce · Pipedrive" />
                <Node x={940} y={176} w={276} h={64} title="Calendar" sub="Google · Outlook · Cal.com" />
                <Node x={940} y={256} w={276} h={64} title="Email & Slack" sub="invites · recaps · hot-lead alerts" />
                <Node x={940} y={336} w={276} h={64} title="Warehouse" sub="transcripts · events · evals" />

                {/* trust band */}
                <g>
                  <rect x="24" y="492" width="1192" height="104" rx="12" fill={INK} stroke="rgba(242,240,233,0.12)" />
                  <text x="44" y="518" fill={SOFT} fontSize="11" fontFamily="Inter Tight, sans-serif">Trust, security and operations</text>
                  <text x="44" y="534" fill={FAINT} fontSize="8.5" fontFamily="JetBrains Mono, monospace">applies to every hop above</text>
                  {[
                    ['ENCRYPTION', 'AES-256 at rest · TLS 1.3', 44],
                    ['RESIDENCY', 'EU / US / IN · 7–365 day retention', 344],
                    ['GOVERNANCE', 'PII redaction · DNC · consent log', 664],
                    ['RELIABILITY', 'traces · evals · replay · canary', 964],
                  ].map(([k, v, x]) => (
                    <g key={k as string}>
                      <text x={x as number} y="562" fill={LIME} fontSize="8" fontFamily="JetBrains Mono, monospace" letterSpacing="1.2">{k as string}</text>
                      <text x={x as number} y="578" fill={MUTED} fontSize="9" fontFamily="Inter Tight, sans-serif">{v as string}</text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          </div>
        </Reveal>

        {/* latency + sequence */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="card h-full p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer aria-hidden className="size-4 text-lime-text" />
                  <span className="label">Latency budget · p50</span>
                </div>
                <span className="num text-[11px] text-lime-text">480 ms</span>
              </div>
              <div className="mt-5 space-y-3.5">
                {[
                  ['Semantic endpointing', 120, 'turn detector waits for meaning, not silence'],
                  ['ASR final hypothesis', 90, 'streaming, 20 ms frames'],
                  ['Hybrid retrieval', 35, 'BM25 + vector, reranked'],
                  ['Policy first tokens', 155, 'streamed, not awaited'],
                  ['TTS first audio', 60, 'phrase-chunked synthesis'],
                  ['Network + jitter', 20, 'edge PoP, Opus'],
                ].map(([label, ms, note]) => (
                  <div key={label as string}>
                    <div className="flex items-baseline justify-between text-[11.5px]">
                      <span className="text-soft">{label as string}</span>
                      <span className="num text-[10px] text-faint">{ms as number} ms</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-fg/6">
                      <div className="h-full rounded-full bg-lime/75" style={{ width: `${((ms as number) / 160) * 100}%` }} />
                    </div>
                    <div className="mt-1 text-[10px] text-faint">{note as string}</div>
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t border-line pt-3 text-[10.5px] leading-relaxed text-faint">
                Everything after first audio — tool calls, CRM write, summary — happens while the agent is still speaking. The caller never waits for it.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card h-full p-6">
              <div className="flex items-center gap-2">
                <Cable aria-hidden className="size-4 text-lime-text" />
                <span className="label">Call sequence</span>
              </div>
              <ol className="mt-5 space-y-0">
                {[
                  ['0 ms', 'SIP INVITE answered, consent played', 'gateway'],
                  ['120 ms', 'End of caller turn detected', 'turn detector'],
                  ['210 ms', 'Final transcript with timings', 'ASR'],
                  ['245 ms', 'Three chunks retrieved, scores attached', 'retrieval'],
                  ['400 ms', 'Policy streams the answer + next question', 'orchestrator'],
                  ['480 ms', 'First audio reaches the caller', 'TTS'],
                  ['1.4 s', 'Slot held, invite sent, CRM deal upserted', 'tools'],
                  ['3.0 s', 'Summary, sentiment arc and next step stored', 'pipeline'],
                ].map(([t, what, where], i) => (
                  <li key={t as string} className="flex gap-3 border-b border-line py-2.5 last:border-b-0">
                    <span className="num w-11 shrink-0 text-[9.5px] text-lime-text">{t as string}</span>
                    <div>
                      <div className="text-[11.5px] leading-snug text-soft">{what as string}</div>
                      <div className="mt-0.5 text-[9.5px] text-faint">{where as string}</div>
                    </div>
                    <span className="num ml-auto text-[8.5px] text-faint">{String(i + 1).padStart(2, '0')}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>

        {/* production mapping */}
        <section className="mt-16">
          <Reveal>
            <SectionHead
              eyebrow="Prototype to production"
              title={<>The same interfaces, <span className="serif-italic text-lime-text">real services.</span></>}
              lede="This build swaps three components for deterministic stand-ins so it runs offline. Everything else — the state machine, retrieval contract, tool layer and call record — is the production shape."
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-8 overflow-x-auto scroll-thin rounded-2xl border border-line">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-panel-2/60">
                    {['Layer', 'In this prototype', 'In production'].map((h) => (
                      <th key={h} className="label px-4 py-3 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Telephony', 'Browser mic / typed input', 'Twilio or LiveKit SIP, Opus, 20 ms frames'],
                    ['Speech recognition', 'Web Speech API (Chrome / Edge / Safari)', 'Deepgram Nova-3 or Whisper large-v3-turbo, streaming'],
                    ['Turn taking', 'Keyword intent + slot rules', 'Semantic endpointing model + barge-in policy'],
                    ['Policy', 'Deterministic sales script in src/lib/agent.ts', 'GPT-4.1 / Claude with tool calling, temperature 0.2'],
                    ['Retrieval', 'Lexical scorer over 8 sections', 'BM25 + pgvector, reciprocal rank fusion, reranker'],
                    ['Speech synthesis', 'SpeechSynthesis, system voices', 'ElevenLabs Flash v2.5 or Cartesia Sonic, cloned voice'],
                    ['CRM / calendar', 'Local state + generated invite', 'HubSpot / Salesforce API, Google Calendar, SendGrid'],
                    ['Storage', 'localStorage', 'Postgres + object storage + D1 for the edge app'],
                    ['Observability', 'In-page event log', 'OpenTelemetry traces, Langfuse, golden-set evals'],
                  ].map(([layer, proto, prod]) => (
                    <tr key={layer} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-3 text-[12px] text-fg">{layer}</td>
                      <td className="px-4 py-3 text-[11.5px] text-muted">{proto}</td>
                      <td className="px-4 py-3 text-[11.5px] text-soft">{prod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>

        {/* failure modes */}
        <section className="mt-16">
          <Reveal>
            <SectionHead eyebrow="Failure modes" title={<>Designed to <span className="serif-italic text-lime-text">degrade well.</span></>} />
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              { icon: TriangleAlert, t: 'Low ASR confidence', d: 'Rephrase once, then confirm the entity explicitly. If still below threshold, offer a human instead of guessing a number.' },
              { icon: Database, t: 'Retrieval miss', d: 'Below 0.62 confidence the agent says it does not have the detail and books the engineer. No invented pricing.' },
              { icon: Cable, t: 'Tool timeout', d: 'Idempotency keys on every calendar hold and CRM upsert; retry twice, then leave a task for the AE and confirm verbally.' },
              { icon: Timer, t: 'Model latency spike', d: 'Streamed filler audio ("let me pull that up") plus a 700 ms cap; fail over to the secondary model region.' },
            ].map((f, i) => (
              <Reveal key={f.t} delay={i * 60}>
                <div className="flex gap-4 rounded-2xl border border-line bg-panel p-5">
                  <f.icon aria-hidden className="mt-0.5 size-4 shrink-0 text-coral" />
                  <div>
                    <h3 className="text-[13.5px] font-medium text-fg">{f.t}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{f.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* data model */}
        <section className="mt-16 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-line bg-panel p-6">
              <div>
                <div className="flex items-center gap-2">
                  <Boxes aria-hidden className="size-4 text-lime-text" />
                  <span className="label">Call record</span>
                </div>
                <h2 className="mt-4 text-[24px] leading-tight tracking-[-0.03em]">One row per call, transcript and all.</h2>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  The summary, BANT scores, citations, booking and tool events are written together, so the analytics view never reconstructs context from logs.
                </p>
              </div>
              <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-line bg-bg/40 p-3 text-[11px] leading-relaxed text-faint">
                <ShieldCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-lime-text" />
                Transcripts are encrypted per tenant and retention is a column, not an afterthought.
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <pre className="surface-night scroll-thin overflow-x-auto rounded-[16px] border border-line p-5 font-mono text-[11px] leading-[1.75] text-soft">
{`{
  "id": "call_lumen_001",
  "started_at": "2026-11-25T09:14:02Z",
  "duration_sec": 222,
  "lang": "en",
  "caller": { "name": "Priya Raghavan", "company": "Lumen Retail",
              "role": "Head of Support", "size": 240 },
  "score": { "total": 88, "band": "hot",
             "bant": { "budget": 24, "authority": 24,
                       "need": 23, "timeline": 23 } },
  "sentiment": { "score": 0.54, "label": "positive" },
  "citations": ["pricing", "security", "roi", "integrations"],
  "booking": { "day": "Tue", "time": "14:30", "with": "Maya Chen" },
  "summary": { "disposition": "meeting_booked",
               "objections": ["Price versus hiring"] },
  "turns": [ /* 13 diarised turns */ ],
  "events": [ /* stt, rag, llm, tts, tool, crm */ ]
}`}
            </pre>
          </Reveal>
        </section>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-panel/60 px-5 py-4">
          <p className="text-[12.5px] text-muted">Next: the commercial case, the 100k-user plan and the cost model.</p>
          <Button href="/business" variant="outline" size="md">
            Read the business case <ArrowRight aria-hidden className="size-4" />
          </Button>
        </div>
      </Container>
    </div>
  )
}

function Node({
  x,
  y,
  w,
  h,
  title,
  sub,
  tags,
  accent = false,
  wide = false,
}: {
  x: number
  y: number
  w: number
  h: number
  title: string
  sub?: string
  tags?: string[]
  accent?: boolean
  wide?: boolean
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={accent ? 'rgba(217,246,95,0.07)' : INK} stroke={accent ? 'rgba(217,246,95,0.45)' : LINE} />
      <text x={x + 14} y={y + 22} fill="#f3f1ea" fontSize={wide ? 13 : 12} fontFamily="Inter Tight, sans-serif" fontWeight="500">
        {title}
      </text>
      {sub && (
        <text x={x + 14} y={y + 40} fill={MUTED} fontSize="8.5" fontFamily="JetBrains Mono, monospace">
          {sub}
        </text>
      )}
      {tags?.map((tag, i) => (
        <text key={tag} x={x + 14} y={y + (sub ? 46 : 40) + i * 14} fill={i === 0 ? SOFT : MUTED} fontSize="8.5" fontFamily="JetBrains Mono, monospace">
          {tag}
        </text>
      ))}
    </g>
  )
}
