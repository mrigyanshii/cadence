import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Database,
  FileText,
  Gauge,
  Languages,
  Lock,
  Radio,
  ShieldCheck,
} from 'lucide-react'

import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { Sparkline } from '../components/Sparkline'
import { Waveform } from '../components/Waveform'
import { Button, Eyebrow, SectionHead, Stat } from '../components/ui'
import { CAPABILITIES, METRICS, WORKFLOW } from '../content'
import { Link } from '../lib/router'

export function Home() {
  return (
    <>
      <Hero />
      <MetricStrip />
      <Problem />
      <Capabilities />
      <Flow />
      <Proof />
      <ArchitectureTeaser />
      <Deliverables />
    </>
  )
}

/* --------------------------------------------------------------------- hero */

function Hero() {
  return (
    <section className="surface-night relative flex min-h-[calc(100dvh-72px)] items-center overflow-hidden border-b border-line">
      <Container className="relative py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.03fr_0.97fr] lg:gap-14">
          <div>
            <Eyebrow tone="lime">Autonomous sales voice agent · working prototype</Eyebrow>

            <h1 className="mt-8 text-[clamp(42px,5.1vw,72px)] leading-[1.02] tracking-[-0.022em]">
              Every call answered.
              <br />
              Every lead qualified.
              <br />
              <span className="serif-italic text-lime-text">Every meeting booked.</span>
            </h1>

            <p className="mt-7 max-w-[31rem] text-[15.5px] leading-[1.72] text-muted">
              Cadence picks up in under half a second, remembers the account, answers from your own
              documents with citations, handles the objection, books the meeting and writes the CRM
              record — before the caller hangs up.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href="/console" variant="accent" size="lg">
                Open the live console
                <ArrowRight aria-hidden className="size-4" />
              </Button>
              <Button href="/architecture" variant="outline" size="lg">
                See the architecture
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 text-[11px] tracking-[0.02em] text-faint">
              <span>EN · ES · FR · DE</span>
              <span aria-hidden className="hidden h-3 w-px bg-line-2 sm:block" />
              <span>Browser speech, live model optional</span>
              <span aria-hidden className="hidden h-3 w-px bg-line-2 sm:block" />
              <span>Deterministic demo, real interfaces</span>
            </div>
          </div>

          <Reveal delay={120} className="w-full max-w-[660px] lg:justify-self-end">
            <HeroConsole />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

function HeroConsole() {
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-line-2 bg-panel shadow-float">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="live-dot" />
          <span className="num text-[11px] text-soft">02:47</span>
          <span aria-hidden className="h-3 w-px bg-line-2" />
          <span className="label text-[8.5px] text-faint">Inbound · Lumen Retail</span>
        </div>
        <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.14em]">
          <span className="text-lime-text">EN</span>
          <span className="text-faint">16 kHz</span>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <span className="flex size-8 items-center justify-center rounded-full border border-line-2 font-serif text-[13px] text-fg">
          A
        </span>
        <Waveform active bars={42} height={26} className="flex-1" />
        <span className="num text-[9px] text-faint">−18 dB</span>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="flex gap-3">
          <div className="mt-1 size-1.5 shrink-0 rounded-full bg-lime" />
          <div>
            <div className="rounded-[10px] rounded-tl-[2px] border border-line bg-panel-2 px-3.5 py-2.5 text-[11.5px] leading-[1.6] text-soft">
              Growth is $1,490 a month for 5,000 minutes; overage is 14 cents. You choose EU
              residency, and we never train on your calls.
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="chip px-1.5 py-0.5 text-[8.5px]">
                <FileText aria-hidden className="size-2.5" /> Pricing 0.94
              </span>
              <span className="chip px-1.5 py-0.5 text-[8.5px]">
                <FileText aria-hidden className="size-2.5" /> Security 0.91
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[88%] rounded-[10px] rounded-tr-[2px] bg-lime px-3.5 py-2.5 text-[11.5px] leading-[1.6] text-ink">
            Security is the blocker. Where is the data stored, and do you train on our calls?
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 size-1.5 shrink-0 rounded-full bg-lime" />
          <div className="rounded-[10px] rounded-tl-[2px] border border-line bg-panel-2 px-3.5 py-2.5 text-[11.5px] leading-[1.6] text-soft">
            SOC 2 Type II, ISO 27001, EU residency, PII redaction before storage. Nothing is used
            for training.
            <span aria-hidden className="ml-0.5 inline-block h-3 w-px animate-blink bg-lime align-middle" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-t border-line px-5 py-4">
        <div className="flex items-end gap-6">
          <div>
            <div className="label text-[8px]">Lead score</div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="font-serif text-[26px] leading-none text-fg">88</span>
              <span className="text-[10px] text-faint">/100</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="label text-[8px]">Sentiment</span>
              <span className="num text-[9px] text-lime-text">+0.54</span>
            </div>
            <div className="mt-1.5 w-[88px]">
              <Sparkline points={[-0.32, -0.12, -0.18, 0.04, 0.16, 0.38, 0.54]} height={20} />
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="label text-[8px] text-faint">Disposition</div>
          <div className="mt-1.5 flex items-center justify-end gap-1.5 text-[11px] text-lime-text">
            <CalendarCheck aria-hidden className="size-3" />
            Meeting booked · Tue 14:30
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricStrip() {
  return (
    <section aria-label="Reference metrics" className="border-b border-line">
      <Container>
        <dl className="grid grid-cols-2 py-9 lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className={`px-5 lg:px-8 ${i % 2 === 1 ? 'border-l border-line' : ''} ${
                i > 0 ? 'lg:border-l lg:border-line' : 'lg:border-l-0'
              } ${i > 1 ? 'mt-8 border-t border-line pt-8 lg:mt-0 lg:border-t-0 lg:pt-0' : ''}`}
            >
              <Stat value={m.value} unit={m.unit} label={m.label} note={m.note} />
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------------ problem */

function Problem() {
  return (
    <section id="problem" className="border-b border-line">
      <Container className="py-20 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <SectionHead
              index="01"
              eyebrow="The gap"
              title={
                <>
                  The lead called.
                  <br />
                  <span className="serif-italic text-lime-text">Nobody answered.</span>
                </>
              }
              lede="Sales teams spend on ads, events and outbound to make the phone ring, then lose the moment to voicemail, hold music or a rep who starts from zero."
            />
            <p className="mt-6 max-w-md text-[13.5px] leading-[1.7] text-muted">
              Cadence exists for the ninety seconds after intent appears — when the buyer is still on
              the page, still curious, and still choosing who to talk to.
            </p>
          </Reveal>

          <div>
            {[
              { v: '78%', l: 'of buyers pick the vendor that responds first', n: 'Lead Response Management study' },
              { v: '42 h', l: 'median first response to an inbound web lead', n: 'across 2,200 B2B companies' },
              { v: '31%', l: 'of inbound calls to small sales teams go unanswered', n: 'after-hours and peak overflow' },
              { v: '$210', l: 'cost of a human-sourced discovery meeting', n: 'blended SDR cost per meeting' },
            ].map((item, i) => (
              <Reveal key={item.v} delay={i * 70}>
                <div className="flex items-start gap-6 border-t border-line py-6 last:border-b">
                  <div className="w-[84px] shrink-0 font-serif text-[30px] leading-none tracking-[-0.01em] text-fg">
                    {item.v}
                  </div>
                  <div>
                    <div className="text-[14px] leading-snug text-soft">{item.l}</div>
                    <div className="mt-1 text-[11.5px] text-faint">{item.n}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

/* -------------------------------------------------------------- capabilities */

const CAP_ICONS = [Radio, Languages, Gauge, Database, CalendarCheck, FileText]

function Capabilities() {
  return (
    <section id="capabilities" className="border-b border-line bg-panel-2/35">
      <Container className="py-20 sm:py-24">
        <Reveal>
          <SectionHead
            index="02"
            eyebrow="Capabilities"
            title={
              <>
                Six jobs, <span className="serif-italic text-lime-text">one call.</span>
              </>
            }
            lede="A voice agent is not a chatbot with a microphone. It is a real-time system that listens, decides, speaks and acts — with the latency budget of a conversation."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((cap, i) => {
            const Icon = CAP_ICONS[i]
            return (
              <Reveal key={cap.n} delay={(i % 3) * 60} className="h-full">
                <article className="flex h-full flex-col rounded-[14px] border border-line bg-panel p-6 transition-shadow hover:shadow-card">
                  <div className="flex items-center justify-between">
                    <Icon aria-hidden className="size-4 text-lime-text" />
                    <span className="label text-[9px] text-faint">{cap.n}</span>
                  </div>
                  <h3 className="mt-5 text-[21px] leading-[1.18] text-fg">{cap.title}</h3>
                  <p className="mt-3 flex-1 text-[12.5px] leading-[1.7] text-muted">{cap.body}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-4 text-[9.5px] uppercase tracking-[0.12em] text-faint">
                    {cap.tags.map((tag, j) => (
                      <span key={tag} className="flex items-center gap-2">
                        {j > 0 && <span aria-hidden className="text-line-2">/</span>}
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

/* --------------------------------------------------------------------- flow */

function Flow() {
  return (
    <section id="workflow" className="border-b border-line">
      <Container className="py-20 sm:py-24">
        <Reveal>
          <SectionHead
            index="03"
            eyebrow="End-to-end workflow"
            title={
              <>
                From ring to CRM record in <span className="serif-italic text-lime-text">three seconds.</span>
              </>
            }
            lede="This is the demo path in the console, annotated with where each step sits in a production deployment."
          />
        </Reveal>

        <div className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOW.map((step, i) => (
            <Reveal key={step.n} delay={i * 60}>
              <div className="border-t border-line-2 pt-5">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-[20px] leading-none text-faint">{step.n}</span>
                  <span className="num text-[10px] text-lime-text">{step.ms}</span>
                </div>
                <h3 className="mt-3 text-[18px] leading-snug text-fg">{step.title}</h3>
                <p className="mt-2 text-[12.5px] leading-[1.7] text-muted">{step.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
            <span className="label">Demo it now</span>
            <span className="text-[13px] text-soft">
              The console runs steps 1–6 for real, with browser speech and a deterministic policy.
            </span>
            <Link
              href="/console"
              className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-lime-text transition-colors hover:text-fg"
            >
              Run the workflow <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

/* -------------------------------------------------------------------- proof */

function Proof() {
  return (
    <section className="border-b border-line bg-panel-2/35">
      <Container className="py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <SectionHead
              index="04"
              eyebrow="Grounded, not generated"
              title={
                <>
                  Answers with a <span className="serif-italic text-lime-text">source.</span>
                </>
              }
              lede="Every factual claim is retrieved from the customer's own corpus and cited with a document and section. When confidence is low, the agent says so and books a human."
            />
            <div className="mt-8">
              {[
                { icon: Lock, t: 'No-answer policy', d: 'Below 0.62 confidence the agent escalates instead of inventing.' },
                { icon: Languages, t: 'Language follows the caller', d: 'EN · ES · FR · DE in this build, 30+ with a production ASR/TTS pair.' },
                { icon: ShieldCheck, t: 'Consent before content', d: 'Recording disclosure, DNC scrub and PII redaction are part of the call flow.' },
              ].map((item) => (
                <div key={item.t} className="flex gap-3.5 border-t border-line py-4 last:border-b">
                  <item.icon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-lime-text" />
                  <div>
                    <div className="text-[13px] text-fg">{item.t}</div>
                    <div className="mt-0.5 text-[11.5px] leading-[1.7] text-muted">{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="overflow-hidden rounded-[16px] border border-line bg-panel shadow-card">
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <span className="label text-[9px]">Post-call summary · Lumen Retail</span>
                <span className="text-[9.5px] uppercase tracking-[0.14em] text-lime-text">meeting booked</span>
              </div>
              <div className="p-6">
                <h3 className="text-[22px] leading-[1.2] text-fg">
                  Lumen Retail — 240 agents, inbound support volume
                </h3>
                <ul className="mt-5 space-y-2.5">
                  {[
                    'Head of Support on the call; three regions, evaluating this quarter.',
                    'Answered pricing, security and integrations from four cited sections.',
                    'Objection: price versus hiring two more agents — reframed to cost per meeting.',
                    'Booked Tue 1 Dec, 14:30 with Maya Chen; invite and CRM deal written.',
                  ].map((b) => (
                    <li key={b} className="flex gap-3 text-[12.5px] leading-[1.65] text-soft">
                      <span aria-hidden className="mt-[8px] size-1 shrink-0 rounded-full bg-lime" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {['Price versus hiring', 'Pricing', 'Security', 'Results', 'Integrations'].map((t) => (
                    <span
                      key={t}
                      className={`chip px-2 py-0.5 text-[9px] ${t === 'Price versus hiring' ? 'chip-coral' : ''}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5">
                  <div>
                    <div className="label text-[8px]">Score</div>
                    <div className="mt-1.5 font-serif text-[22px] leading-none text-fg">
                      88<span className="ml-0.5 text-[11px] text-faint">/100</span>
                    </div>
                  </div>
                  <div>
                    <div className="label text-[8px]">Sentiment</div>
                    <div className="num mt-1.5 text-[15px] text-lime-text">+0.54</div>
                  </div>
                  <div>
                    <div className="label text-[8px]">Talk ratio</div>
                    <div className="num mt-1.5 text-[15px] text-fg">58%</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

/* ------------------------------------------------------------- architecture */

function ArchitectureTeaser() {
  const nodes = [
    { t: 'Telephony', s: 'SIP · WebRTC' },
    { t: 'Speech', s: 'ASR · VAD · TTS' },
    { t: 'Orchestrator', s: 'policy · tools' },
    { t: 'Knowledge', s: 'retrieval · citations' },
    { t: 'Systems', s: 'CRM · calendar' },
  ]

  return (
    <section className="border-b border-line">
      <Container className="py-20 sm:py-24">
        <div className="surface-night overflow-hidden rounded-[20px] border border-line-2">
          <div className="grid gap-10 p-7 sm:p-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <Reveal>
              <Eyebrow tone="lime">System design</Eyebrow>
              <h2 className="mt-6 text-[clamp(28px,3.2vw,40px)] leading-[1.08]">
                Built for the <span className="serif-italic text-lime-text">latency</span> of a
                conversation.
              </h2>
              <p className="mt-4 max-w-md text-[13.5px] leading-[1.72] text-muted">
                Streaming audio in, streaming audio out, with retrieval and tool calls inside a
                700 ms budget. The architecture page covers the full topology, sequence and failure
                modes.
              </p>
              <Button href="/architecture" variant="outline" size="md" className="mt-7">
                Open the architecture
                <ArrowUpRight aria-hidden className="size-4" />
              </Button>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-[14px] border border-line bg-panel/70 p-5">
                <div className="flex items-center justify-between">
                  <span className="label">Request path</span>
                  <span className="num text-[10px] text-faint">p50 480 ms</span>
                </div>
                <div className="mt-5 space-y-2">
                  {nodes.map((n, i) => (
                    <div key={n.t}>
                      <div
                        className={`flex h-10 items-center justify-between rounded-[8px] border px-3.5 ${
                          i === 2 ? 'border-lime/40 bg-lime-soft' : 'border-line bg-panel'
                        }`}
                      >
                        <span className="text-[12px] text-soft">{n.t}</span>
                        <span className="num text-[9px] text-faint">{n.s}</span>
                      </div>
                      {i < nodes.length - 1 && (
                        <div aria-hidden className="ml-4 h-3 w-px bg-line-2" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[10px] text-faint">
                  <span>Observability · traces, evals, replay</span>
                  <span className="num text-lime-text">99.95% SLO</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}

/* -------------------------------------------------------------- deliverables */

function Deliverables() {
  const items = [
    {
      label: 'Working prototype',
      title: 'Talk to the agent',
      body: 'A live inbound call with browser speech, retrieval, scoring and a booked meeting.',
      href: '/console',
    },
    {
      label: 'System architecture',
      title: 'Read the topology',
      body: 'Five layers, a latency budget, the call sequence and every failure mode.',
      href: '/architecture',
    },
    {
      label: 'Business case',
      title: 'Check the numbers',
      body: 'Problem, market, 100k-user scaling, security and an open-book cost model.',
      href: '/business',
    },
  ]

  return (
    <section>
      <Container className="py-16 sm:py-20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-[24px] leading-tight text-fg">The three deliverables</h2>
          <p className="text-[12.5px] text-muted">Everything the brief asks for, in one place.</p>
        </div>

        <div className="mt-8 grid gap-px overflow-hidden rounded-[16px] border border-line bg-line md:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col bg-panel p-6 transition-colors hover:bg-panel-2/60"
            >
              <span className="label text-[9px] text-lime-text">{item.label}</span>
              <span className="mt-3 flex items-center justify-between gap-3 font-serif text-[22px] leading-tight text-fg">
                {item.title}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 shrink-0 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:text-fg"
                />
              </span>
              <span className="mt-2 text-[12px] leading-[1.65] text-muted">{item.body}</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

