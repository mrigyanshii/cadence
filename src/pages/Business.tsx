import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  CircleDollarSign,
  Cloud,
  Globe2,
  Layers,
  Lock,
  Server,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { Button, Eyebrow, SectionHead } from '../components/ui'
import { Link } from '../lib/router'

const NAV = [
  ['problem', 'Problem'],
  ['implementation', 'Implementation'],
  ['market', 'Commercial'],
  ['scale', 'Scale to 100k'],
  ['security', 'Security'],
  ['operations', 'Operations'],
  ['costs', 'Cost model'],
]

export function Business() {
  return (
    <div className="relative">
      <Container className="pb-20 pt-10 sm:pt-14">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow tone="lime">Business case · commercial feasibility</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-[clamp(34px,4.8vw,58px)] leading-[1.02] tracking-[-0.022em]">
              A working prototype is the easy part. <span className="serif-italic text-lime-text">This is the business.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
              Who pays, why now, what it costs to run, how it holds at a hundred thousand users, and what breaks first. Numbers are modelled assumptions, stated as such.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[10.5px] uppercase tracking-[0.12em] text-faint">
            <span className="text-lime-text">$0.032 / min COGS</span>
            <span>79% gross margin at scale</span>
            <span>190 concurrent calls</span>
          </div>
        </div>
      </Container>

      <div className="sticky top-[68px] z-30 border-y border-line bg-bg/90 backdrop-blur-xl">
        <Container>
          <nav aria-label="Sections" className="scroll-thin flex gap-6 overflow-x-auto py-3">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="shrink-0 text-[12px] text-muted transition-colors hover:text-lime-text">
                {label}
              </a>
            ))}
          </nav>
        </Container>
      </div>

      <Container className="pb-24">
        {/* ------------------------------------------------------------ problem */}
        <Section id="problem" index="01" eyebrow="The problem" title={<>Intent arrives once. <span className="serif-italic text-lime-text">Usually nobody picks up.</span></>}>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4 text-[14px] leading-relaxed text-muted">
              <p>
                A mid-market B2B team gets 100 inbound calls a day. Roughly a third land outside business hours, in a queue, or in voicemail. The buyer does not wait — they call the next vendor, or fill in a competitor's form.
              </p>
              <p>
                The cost is not the missed call. It is the pipeline behind it: at an 8% conversion to opportunity and an $18,000 average contract value, 31 missed calls a day is roughly <span className="text-fg">$1.6M of annual pipeline</span> walking to someone else.
              </p>
              <p>
                Hiring is the obvious answer, and it is slow: a 12-week ramp, $210 per booked meeting, and the same rep asking the same twelve qualification questions on every call. After-hours coverage never happens at all.
              </p>
              <p className="text-soft">
                Cadence is not a chatbot bolted onto a phone number. It is a sales policy with ears: it qualifies against BANT, answers from the company's own documents, books the calendar and leaves the CRM cleaner than a human would.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { v: '31%', l: 'of inbound calls to small sales teams are never answered', i: Users },
                { v: '$1.6M', l: 'annual pipeline at risk for a 100-call-a-day team', i: TrendingUp },
                { v: '12 wks', l: 'ramp time for a new SDR before full quota', i: Building2 },
                { v: '62%', l: 'of calls the reference deployment resolves without a human', i: BadgeCheck },
              ].map((s) => (
                <div key={s.v} className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-line-2 bg-panel-2 text-lime-text"><s.i className="size-4" /></span>
                  <div>
                    <div className="num text-[20px] leading-none text-fg">{s.v}</div>
                    <div className="mt-1 text-[11.5px] leading-snug text-muted">{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ----------------------------------------------------- implementation */}
        <Section id="implementation" index="02" eyebrow="Technical implementation" title={<>Six requirements, <span className="serif-italic text-lime-text">six working parts.</span></>} lede="Each row is implemented in this repository and demonstrable in the console. The architecture page shows the production topology.">
          <div className="mt-8 overflow-x-auto scroll-thin rounded-2xl border border-line">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-panel-2/60">
                  {['Requirement', 'How it works', 'Where to see it'].map((h) => <th key={h} className="label px-4 py-3 font-normal">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Real-time STT + TTS', 'Web Speech recognition streams partial hypotheses; SpeechSynthesis returns audio per reply. Language packs switch voice and reply language.', '/console'],
                  ['Contextual memory + multilingual', 'Slot memory persists company, role, size, timeline, objections and cited docs across turns; language auto-detects EN/ES/FR/DE.', '/console'],
                  ['Qualification + sentiment', 'BANT is scored per turn from extracted signals; a lexicon-scored sentiment arc drives escalation and tone.', '/console · /analytics'],
                  ['RAG knowledge retrieval', 'Lexical hybrid retrieval over eight versioned sections, with per-answer citations and a no-answer policy below 0.62.', '/console'],
                  ['Booking + CRM integration', 'Availability holds, slot confirmation, invite email and CRM upsert with stage, owner and value, all as tool events.', '/console · /analytics'],
                  ['Summaries + business insight', 'Post-call summary, objections, next steps, disposition, talk ratio and pipeline roll-ups across calls.', '/analytics'],
                ].map(([a, b, c]) => (
                  <tr key={a} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3.5 text-[12px] text-fg">{a}</td>
                    <td className="px-4 py-3.5 text-[11.5px] leading-relaxed text-muted">{b}</td>
                    <td className="px-4 py-3.5"><Link href={c.split(' · ')[0]} className="num text-[10px] text-lime-text hover:text-lime">{c}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[11.5px] text-faint">
            Production substitution points — ASR, policy model, TTS, vector index, CRM — are listed on the <Link href="/architecture" className="text-soft underline decoration-line-2 underline-offset-2 hover:text-lime-text">architecture page</Link>.
          </p>
        </Section>

        {/* ------------------------------------------------------------- market */}
        <Section id="market" index="03" eyebrow="Commercial feasibility" title={<>Who buys, and <span className="serif-italic text-lime-text">what they pay.</span></>}>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center gap-2"><Building2 aria-hidden className="size-4 text-lime-text" /><span className="label">Ideal customer</span></div>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {[
                  ['Firmographic', 'B2B SaaS, logistics, healthcare admin and professional services. 50–1,000 employees, inside sales or a support line that feeds pipeline.'],
                  ['Trigger', '20–500 inbound calls a day, or an outbound team spending more than $8k a month on SDR time.'],
                  ['Economic buyer', 'VP Sales or Head of Revenue Operations. Security review owned by IT; pilot signed by the functional buyer.'],
                  ['Why now', 'Buyers expect an answer in seconds, voice models crossed the quality bar in 2025, and CRM hygiene is now a board metric.'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[11px] text-fg">{k}</div>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
                <Mini label="ACV" value="$18k" />
                <Mini label="CAC" value="$9k" />
                <Mini label="Payback" value="6 mo" />
                <Mini label="Net revenue retention" value="118%" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2"><CircleDollarSign aria-hidden className="size-4 text-lime-text" /><span className="label">Revenue model</span></div>
              <ul className="mt-4 space-y-3">
                {[
                  ['Platform fee', '$499 – $3,900 / mo', 'per tenant, by included volume'],
                  ['Voice minutes', '$0.09 – $0.30 / min', 'bundled, then $0.14 overage'],
                  ['Pilot', '$0 for 14 days', '250 minutes, converts to Growth'],
                  ['Enterprise', 'Custom', 'residency, SSO, voice clone, SLA'],
                ].map(([k, v, n]) => (
                  <li key={k} className="border-b border-line pb-2.5 last:border-b-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[12px] text-fg">{k}</span>
                      <span className="num text-[10.5px] text-lime-text">{v}</span>
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-faint">{n}</div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[10.5px] leading-relaxed text-faint">Annual contracts get two months free. Land with one line, expand to outbound and every region.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { t: 'Land', d: 'One inbound number, one team, fourteen-day pilot. Success = booked meetings the team would have missed.' },
              { t: 'Expand', d: 'Outbound campaigns, additional regions, supervisor tools, then the CRM-native analytics layer.' },
              { t: 'Defend', d: 'The corpus and CRM field mapping become the switching cost; latency and compliance are the moat, not the model.' },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-line bg-panel/60 p-5">
                <div className="label text-lime-text">{c.t}</div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">{c.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* -------------------------------------------------------------- scale */}
        <Section id="scale" index="04" eyebrow="Scalability" title={<>From 1,000 to <span className="serif-italic text-lime-text">100,000 users.</span></>} lede="Scale here means concurrent audio streams, not page views. The unit that matters is a live call, and the constraint is per-turn latency, not throughput alone.">
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-x-auto scroll-thin rounded-2xl border border-line">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-panel-2/60">
                    {['Stage', 'Users', 'Calls / mo', 'Peak concurrent', 'Regions', 'Infra / mo', 'Cost / user'].map((h) => <th key={h} className="label px-3 py-3 font-normal">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Pilot', '1,000', '12,000', '2', '1', '$1,900', '$1.90'],
                    ['Growth', '10,000', '120,000', '19', '2', '$14,800', '$1.48'],
                    ['Scale', '100,000', '1,200,000', '190', '3', '$134,460', '$1.34'],
                  ].map((row, i) => (
                    <tr key={row[0]} className={`border-b border-line last:border-b-0 ${i === 2 ? 'bg-lime-soft/40' : ''}`}>
                      {row.map((cell, j) => (
                        <td key={j} className={`px-3 py-3 text-[11.5px] ${j === 0 ? 'text-fg' : j === 5 ? 'num text-lime-text' : 'num text-muted'}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-5">
              <div className="label">Peak concurrency math</div>
              <div className="mt-3 space-y-2 font-mono text-[10.5px] leading-relaxed text-muted">
                <div>1.2M calls/mo ÷ 30 = <span className="text-fg">40,000 calls/day</span></div>
                <div>8% in the busiest hour = <span className="text-fg">3,200 calls/hour</span></div>
                <div>× 3.5 min average = <span className="text-fg">187 concurrent</span></div>
                <div>× 1.6 headroom = <span className="text-lime-text">300 provisioned streams</span></div>
              </div>
              <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-faint">
                Provisioned, not theoretical: load tests run at 2× peak before each region is enabled.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { i: Layers, t: 'Stateless orchestration', d: 'Call state in Redis with 5-minute checkpoints; workers scale horizontally on active streams, not CPU. A pod loss mid-call rehydrates in under 400 ms.' },
              { i: Globe2, t: 'Regional media + data', d: 'Media servers in EU, US and India. Calls never cross a region; only anonymised aggregate metrics do.' },
              { i: Server, t: 'Backpressure by tenant', d: 'Token buckets per tenant on calls, minutes and tool calls. Outbound campaigns queue instead of degrading inbound latency.' },
              { i: Cloud, t: 'Retrieval at read scale', d: 'Per-tenant namespaces in pgvector with HNSW, read replicas per region and a 10-minute cache on the top queries.' },
              { i: Calculator, t: 'Cost routing', d: 'Small model for slot filling, large model only for objections; prompt caching; TTS phrase cache for disclosures and disclaimers.' },
              { i: ShieldCheck, t: 'Isolation and blast radius', d: 'Per-tenant KMS keys, per-tenant rate limits, canary deploys by tenant cohort, and a kill switch that hands calls to humans.' },
            ].map((c) => (
              <div key={c.t} className="flex gap-3.5 rounded-2xl border border-line bg-panel/60 p-4">
                <c.i aria-hidden className="mt-0.5 size-4 shrink-0 text-lime-text" />
                <div>
                  <div className="text-[12.5px] font-medium text-fg">{c.t}</div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ----------------------------------------------------------- security */}
        <Section id="security" index="05" eyebrow="Security and compliance" title={<>Voice is the most <span className="serif-italic text-lime-text">sensitive</span> channel you own.</>} lede="A recording is biometric-adjacent data. The controls below are the ones a security reviewer will ask for, mapped to where they sit in the system.">
          <div className="mt-8 overflow-x-auto scroll-thin rounded-2xl border border-line">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-panel-2/60">
                  {['Control', 'Implementation', 'Where'].map((h) => <th key={h} className="label px-4 py-3 font-normal">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Encryption', 'TLS 1.3 in transit, AES-256 at rest, per-tenant KMS keys for recordings', 'Storage + media'],
                  ['Residency', 'EU / US / India clusters; no cross-region replication of audio or transcripts', 'Infra'],
                  ['Access control', 'SSO + SCIM, RBAC (admin, supervisor, viewer), least-privilege service tokens', 'App + API'],
                  ['PII handling', 'Redaction before storage, optional transcript hashing, no PII in logs', 'Ingestion'],
                  ['Consent', 'Recording disclosure on every call, consent log, DNC scrub before dialling, opt-out < 1 s', 'Telephony'],
                  ['Retention', '7–365 days per tenant, delete API, legal hold exception, purge job with audit trail', 'Data'],
                  ['Audit', 'Immutable event log per call and per tool call, exportable to SIEM', 'Platform'],
                  ['Model safety', 'Zero-retention LLM endpoints, no training on customer data, tool allowlist, retrieved text treated as data', 'Policy'],
                  ['Vendor posture', 'DPAs, sub-processor list, annual pen test, SOC 2 Type II and ISO 27001', 'Company'],
                  ['Availability', '99.95% SLA, RPO 5 min, RTO 30 min, regional failover tested quarterly', 'Ops'],
                ].map(([a, b, c]) => (
                  <tr key={a} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 text-[12px] text-fg">{a}</td>
                    <td className="px-4 py-3 text-[11.5px] leading-relaxed text-muted">{b}</td>
                    <td className="num px-4 py-3 text-[9.5px] text-faint">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Prompt injection via documents', 'Retrieved text is never executed. Tool allowlist, no URL fetching from retrieved content, schema-validated arguments.'],
              ['Recording breach', 'Per-tenant keys, short retention default, signed URLs, access logged per play.'],
              ['Toll fraud', 'Destination allowlists, spend caps per tenant, anomaly alerts on call velocity.'],
              ['Voice cloning abuse', 'Verified consent, watermark on cloned voices, opt-out registry, human review before enabling.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-line bg-panel/60 p-4">
                <div className="flex items-center gap-1.5 text-[11.5px] text-fg"><Lock aria-hidden className="size-3 text-coral" />{t}</div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* --------------------------------------------------------- operations */}
        <Section id="operations" index="06" eyebrow="Infrastructure and operations" title={<>Deploy on a Tuesday. <span className="serif-italic text-lime-text">Sleep on Tuesday night.</span></>}>
          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="card p-6">
              <div className="label">Deployment pipeline</div>
              <ol className="mt-4 space-y-3">
                {[
                  ['Commit', 'Typecheck, unit tests, 500-call golden-set eval (WER, task success, hallucination rate, p95 latency).'],
                  ['Staging', 'Synthetic call load at 2× peak, chaos on tool timeouts, schema migration expand/contract.'],
                  ['Canary', '5% of tenants, 30 minutes, automatic rollback on SLO burn or eval regression.'],
                  ['Production', 'Blue/green with feature flags per tenant; rollback under five minutes.'],
                  ['Observe', 'OpenTelemetry traces, per-tenant dashboards, paging on error-budget burn.'],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-3">
                    <span className="num flex size-5 shrink-0 items-center justify-center rounded-full border border-line-2 text-[9px] text-lime-text">{i + 1}</span>
                    <div>
                      <div className="text-[12px] text-fg">{t}</div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card p-6">
              <div className="label">What on-call actually does</div>
              <div className="mt-4 space-y-3 text-[11.5px] leading-relaxed text-muted">
                <p><span className="text-fg">SLOs:</span> 99.95% call setup, 99.9% tool success, p95 first audio under 800 ms. Error budget is 21 minutes a month.</p>
                <p><span className="text-fg">Alerts:</span> burn-rate alerts page at 2× and 6×; a single failed call does not page. Tool-provider outages open an incident and flip the affected tenants to human hand-off.</p>
                <p><span className="text-fg">Runbooks:</span> ASR degradation, model region failover, calendar outage, toll-fraud spike, tenant data deletion.</p>
                <p><span className="text-fg">Cost guardrails:</span> daily spend per tenant, anomaly alert at 3× trailing average, automatic pause of outbound campaigns before inbound is touched.</p>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
                <Mini label="Deploy freq." value="Daily" />
                <Mini label="Rollback" value="< 5 min" />
                <Mini label="Eval gate" value="500 calls" />
              </div>
            </div>
          </div>
        </Section>

        {/* -------------------------------------------------------------- costs */}
        <Section id="costs" index="07" eyebrow="Operational costs" title={<>The cost model, <span className="serif-italic text-lime-text">open book.</span></>} lede="Modelled at 100,000 users, 1.2M calls and 4.2M voice minutes a month. Vendor prices are current list rates rounded to conservative values.">
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-x-auto scroll-thin rounded-2xl border border-line">
              <table className="w-full min-w-[480px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-panel-2/60">
                    {['Line item', 'Driver', 'Monthly'].map((h) => <th key={h} className="label px-4 py-3 font-normal">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Telephony', '4.2M min × $0.0085', '$35,700'],
                    ['Streaming ASR', '4.2M min × $0.0043', '$18,060'],
                    ['Neural TTS', '1.26B chars × $30/M', '$37,800'],
                    ['LLM + rerank', '7.9B tokens, cached', '$7,900'],
                    ['Orchestration compute', '300 streams, 3 regions', '$14,500'],
                    ['Postgres · pgvector · Redis · R2', '12 TB hot, 40 TB archive', '$9,200'],
                    ['Observability + evals', 'Traces, eval runs, storage', '$5,400'],
                    ['Email, calendar, SMS APIs', '1.2M invites + alerts', '$2,100'],
                    ['Egress + bandwidth', '~18 TB', '$3,800'],
                  ].map(([a, b, c]) => (
                    <tr key={a} className="border-b border-line">
                      <td className="px-4 py-2.5 text-[11.5px] text-soft">{a}</td>
                      <td className="num px-4 py-2.5 text-[9.5px] text-faint">{b}</td>
                      <td className="num px-4 py-2.5 text-[11px] text-fg">{c}</td>
                    </tr>
                  ))}
                  <tr className="bg-panel-2/60">
                    <td className="px-4 py-3 text-[11.5px] text-fg">Total COGS</td>
                    <td className="num px-4 py-3 text-[9.5px] text-lime-text">$0.032 / minute</td>
                    <td className="num px-4 py-3 text-[12px] text-lime-text">$134,460</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <CostCalculator />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ['Revenue at this volume', '$672,000 / mo', '4.2M minutes at a blended $0.16 realised rate'],
              ['Gross margin', '80%', '$537,540 gross profit; TTS is the largest single cost'],
              ['Cost per user', '$1.34 / mo', 'vs. $16.80 average revenue per seat'],
            ].map(([k, v, n]) => (
              <div key={k} className="rounded-2xl border border-line bg-panel p-4">
                <div className="label">{k}</div>
                <div className="num mt-2 text-[22px] leading-none text-fg">{v}</div>
                <div className="mt-1.5 text-[10.5px] leading-relaxed text-faint">{n}</div>
              </div>
            ))}
          </div>

          <p className="mt-5 max-w-3xl text-[11px] leading-relaxed text-faint">
            Assumptions: 3.5 minutes average call, 1,050 spoken characters per call, 6 policy turns, 300 provisioned concurrent streams at 1.6× headroom, blended LLM price with 60% prompt-cache hit rate. Vendor pricing changes; the model is a spreadsheet, not a promise. Enterprise residency and voice cloning add 8–12%.
          </p>
        </Section>

        <div className="surface-night mt-14 flex flex-wrap items-center justify-between gap-5 rounded-[20px] border border-line-2 px-6 py-7 sm:px-8">
          <div>
            <h2 className="text-[22px] leading-tight tracking-[-0.03em]">Everything above is demoable, not just described.</h2>
            <p className="mt-1.5 text-[12.5px] text-muted">Run the call, read the summary, open the architecture, check the numbers.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button href="/console" variant="accent" size="md">Open the console <ArrowRight aria-hidden className="size-4" /></Button>
            <Button href="/architecture" variant="outline" size="md">Architecture</Button>
          </div>
        </div>
      </Container>
    </div>
  )
}

function Section({
  id,
  index,
  eyebrow,
  title,
  lede,
  children,
}: {
  id: string
  index: string
  eyebrow: string
  title: ReactNode
  lede?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-[136px] border-b border-line py-16 last:border-b-0 sm:py-20">
      <Reveal>
        <SectionHead index={index} eyebrow={eyebrow} title={title} lede={lede} />
      </Reveal>
      {children}
    </section>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label text-[8px]">{label}</div>
      <div className="num mt-1 text-[14px] text-fg">{value}</div>
    </div>
  )
}

function CostCalculator() {
  const [calls, setCalls] = useState(1_200_000)
  const [minutes, setMinutes] = useState(3.5)

  const model = useMemo(() => {
    const totalMinutes = calls * minutes
    const cogs = totalMinutes * 0.032 + calls * 0.0035
    const revenue = totalMinutes * 0.16
    const profit = revenue - cogs
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0
    return { totalMinutes, cogs, revenue, profit, margin }
  }, [calls, minutes])

  const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`

  return (
    <div className="rounded-2xl border border-line-2 bg-panel p-6">
      <div className="flex items-center gap-2">
        <Calculator aria-hidden className="size-4 text-lime-text" />
        <span className="label">Unit economics · live</span>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="calls" className="text-[11.5px] text-soft">Calls per month</label>
            <span className="num text-[11px] text-lime-text">{calls.toLocaleString('en-US')}</span>
          </div>
          <input
            id="calls"
            type="range"
            min={20000}
            max={1500000}
            step={10000}
            value={calls}
            onChange={(e) => setCalls(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="minutes" className="text-[11.5px] text-soft">Average call length</label>
            <span className="num text-[11px] text-lime-text">{minutes.toFixed(1)} min</span>
          </div>
          <input
            id="minutes"
            type="range"
            min={2}
            max={8}
            step={0.5}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-4">
        <div>
          <div className="label text-[8px]">Minutes</div>
          <div className="num mt-1 text-[16px] text-fg">{Math.round(model.totalMinutes / 1000)}k</div>
        </div>
        <div>
          <div className="label text-[8px]">COGS</div>
          <div className="num mt-1 text-[16px] text-fg">{money(model.cogs)}</div>
        </div>
        <div>
          <div className="label text-[8px]">Revenue</div>
          <div className="num mt-1 text-[16px] text-fg">{money(model.revenue)}</div>
        </div>
        <div>
          <div className="label text-[8px]">Gross profit</div>
          <div className="num mt-1 text-[16px] text-lime-text">{money(model.profit)}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-[10.5px]">
          <span className="text-faint">Gross margin</span>
          <span className="num text-lime-text">{model.margin.toFixed(1)}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-fg/8">
          <div className="h-full rounded-full bg-lime transition-all duration-300" style={{ width: `${Math.max(2, Math.min(100, model.margin))}%` }} />
        </div>
      </div>
      <p className="mt-4 text-[10px] leading-relaxed text-faint">
        $0.032/min COGS, $0.0035 fixed per call, $0.16/min blended revenue. Move the sliders to see where the model breaks.
      </p>
    </div>
  )
}
