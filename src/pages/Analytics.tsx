import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  FileText,
  Gauge,
  PhoneCall,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { Container } from '../components/Container'
import { Sparkline } from '../components/Sparkline'
import { Button, Eyebrow } from '../components/ui'
import { useToast } from '../components/Toast'
import { analytics, useCalls } from '../lib/calls'
import { Link } from '../lib/router'
import type { Call } from '../lib/types'

const DISPO: Record<Call['summary']['disposition'], { label: string; tone: 'lime' | 'mint' | 'default' | 'coral' }> = {
  meeting_booked: { label: 'Meeting booked', tone: 'lime' },
  qualified_nurture: { label: 'Qualified · nurture', tone: 'mint' },
  follow_up: { label: 'Follow up', tone: 'default' },
  not_qualified: { label: 'Not qualified', tone: 'coral' },
}

function rel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60_000)
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Analytics() {
  const { calls, reset } = useCalls()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const a = useMemo(() => analytics(calls), [calls])
  const selected = calls.find((c) => c.id === selectedId) ?? calls[0]
  const avgScore = calls.length ? Math.round(calls.reduce((n, c) => n + c.score.total, 0) / calls.length) : 0
  const avgHandle = calls.length ? calls.reduce((n, c) => n + c.durationSec, 0) / calls.length : 0
  const avgTalk = calls.length ? calls.reduce((n, c) => n + c.talkRatio, 0) / calls.length : 0

  return (
    <div className="relative">
      <Container className="pb-20 pt-10 sm:pt-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow tone="lime">Call intelligence · last 48 hours</Eyebrow>
            <h1 className="mt-5 text-[clamp(34px,4.6vw,56px)] leading-[1.03] tracking-[-0.022em]">
              What the calls <span className="serif-italic text-lime-text">actually said.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
              Every call is summarised, scored and written to the pipeline. Calls you run in the console land here automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11.5px] text-faint">{calls.length} calls on record</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                reset()
                toast('Demo calls restored')
              }}
            >
              <RotateCcw aria-hidden className="size-3.5" />
              Reset demo data
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Calls answered" value={String(a.total)} note={`${a.minutes.toFixed(1)} minutes handled`} icon={<PhoneCall className="size-4" />} />
          <Kpi label="Meetings booked" value={String(a.booked)} note={`${a.total ? Math.round((a.booked / a.total) * 100) : 0}% of answered calls`} icon={<CalendarCheck className="size-4" />} accent />
          <Kpi label="Pipeline created" value={`$${Math.round(a.pipeline / 1000)}k`} note="weighted, 42k ACV per booked meeting" icon={<TrendingUp className="size-4" />} />
          <Kpi label="Avg. lead score" value={String(avgScore)} note={`sentiment ${a.avgSentiment >= 0 ? '+' : ''}${a.avgSentiment.toFixed(2)}`} icon={<Gauge className="size-4" />} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {/* Funnel */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="label">Conversation funnel</span>
              <span className="num text-[10px] text-faint">agent · 62% resolved without a human</span>
            </div>
            <div className="mt-5 space-y-4">
              {a.funnel.map((step, i) => (
                <div key={step.label}>
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span className="text-soft">{step.label}</span>
                    <span className="num text-[11px] text-faint">{step.value} <span className="text-faint/70">· {step.pct}%</span></span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-fg/6">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${i === 3 ? 'bg-lime' : i === 2 ? 'bg-lime/70' : i === 1 ? 'bg-mint/60' : 'bg-fg/25'}`}
                      style={{ width: `${Math.max(3, step.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-4">
              <Mini label="Connect rate" value={`${Math.round(a.connectRate * 100)}%`} />
              <Mini label="Avg. handle time" value={fmtDuration(avgHandle)} />
              <Mini label="Agent talk ratio" value={`${Math.round(avgTalk * 100)}%`} />
            </div>
          </div>

          {/* Sentiment */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="label">Sentiment arc</span>
              <span className={`chip px-1.5 py-0.5 text-[9px] ${a.avgSentiment > 0.15 ? 'chip-lime' : a.avgSentiment < -0.1 ? 'chip-coral' : ''}`}>
                {a.avgSentiment > 0.15 ? 'positive' : a.avgSentiment < -0.1 ? 'negative' : 'neutral'}
              </span>
            </div>
            <div className="mt-4 h-[88px]">
              <Sparkline points={a.sentiments.length > 1 ? a.sentiments : [0.1, 0.2, 0.05, 0.3]} tone={a.avgSentiment < -0.1 ? 'coral' : 'lime'} height={88} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-faint">
              <span>oldest</span>
              <span className="num text-soft">{a.avgSentiment >= 0 ? '+' : ''}{a.avgSentiment.toFixed(2)}</span>
              <span>latest</span>
            </div>
            <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-[11px] text-muted">
              <div className="flex items-center gap-2"><TrendingUp aria-hidden className="size-3 text-lime-text" /> Price handled → reframed to cost per meeting</div>
              <div className="flex items-center gap-2"><TrendingDown aria-hidden className="size-3 text-coral" /> Security review → DPA + pen test requested</div>
            </div>
          </div>
        </div>

        {/* Topics + calls */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card p-5">
            <div className="label">Top knowledge topics</div>
            <div className="mt-4 space-y-3">
              {a.intents.length === 0 && <p className="text-[12px] text-faint">No topics yet.</p>}
              {a.intents.map((t) => (
                <div key={t.label}>
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span className="truncate pr-3 text-soft">{t.label}</span>
                    <span className="num text-[10px] text-faint">{t.value}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-fg/6">
                    <div className="h-full rounded-full bg-lime/70" style={{ width: `${(t.value / Math.max(...a.intents.map((x) => x.value))) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-line bg-bg/40 p-3 text-[11px] leading-relaxed text-faint">
              <FileText aria-hidden className="mt-0.5 size-3.5 shrink-0 text-lime-text" />
              Topics come from the documents retrieved during each call, not from keyword tagging afterwards.
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="label">Call log</span>
              <span className="num text-[10px] text-faint">select a row</span>
            </div>
            <div className="max-h-[286px] overflow-y-auto scroll-thin">
              {calls.map((call) => {
                const active = selected?.id === call.id
                const dispo = DISPO[call.summary.disposition]
                return (
                  <button
                    key={call.id}
                    type="button"
                    onClick={() => setSelectedId(call.id)}
                    className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 ${active ? 'bg-lime-soft/60' : 'hover:bg-fg/4'}`}
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line-2 bg-panel-2 text-[9px] text-muted">
                      {call.caller.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[12px] text-fg">{call.caller.name}</span>
                        <span className="truncate text-[10px] text-faint">· {call.caller.company}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-faint">
                        <span>{rel(call.startedAt)}</span>
                        <span aria-hidden>·</span>
                        <span>{fmtDuration(call.durationSec)}</span>
                        <span aria-hidden>·</span>
                        <span className="uppercase">{call.lang}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] text-faint">
                        <span
                          aria-hidden
                          className={`size-1 rounded-full ${dispo.tone === 'lime' ? 'bg-lime' : dispo.tone === 'coral' ? 'bg-coral' : dispo.tone === 'mint' ? 'bg-mint' : 'bg-faint'}`}
                        />
                        {dispo.label}
                      </span>
                      <span className={`num text-[10px] ${call.score.total >= 74 ? 'text-lime-text' : call.score.total >= 46 ? 'text-mint' : 'text-faint'}`}>{call.score.total}</span>
                    </div>
                  </button>
                )
              })}
              {calls.length === 0 && <p className="px-5 py-8 text-center text-[12px] text-faint">No calls yet. Run one in the console.</p>}
            </div>
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <section aria-labelledby="call-detail" className="mt-4 overflow-hidden rounded-[20px] border border-line-2 bg-panel">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-panel-2/50 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="label">Call detail</span>
                <span className="num text-[10px] text-faint">{selected.id}</span>
              </div>
              <div className="flex items-center gap-5 text-[10px] uppercase tracking-[0.12em] text-faint">
                <span className="text-lime-text">{DISPO[selected.summary.disposition].label}</span>
                <span>{selected.channel}</span>
                <span>{selected.lang}</span>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="border-b border-line p-5 lg:border-b-0 lg:border-r">
                <h2 id="call-detail" className="text-[20px] leading-tight tracking-[-0.025em] text-fg">{selected.summary.headline}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-faint">
                  <span className="flex items-center gap-1.5"><Clock aria-hidden className="size-3" /> {fmtDuration(selected.durationSec)}</span>
                  <span>{rel(selected.startedAt)}</span>
                  <span>{selected.caller.role}</span>
                  {selected.caller.email && <span className="num text-[10px]">{selected.caller.email}</span>}
                </div>

                <ul className="mt-5 space-y-2.5">
                  {selected.summary.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-[12.5px] leading-relaxed text-soft">
                      <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-lime" />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div>
                    <div className="label mb-2">Objections</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.summary.objections.length === 0 && <span className="text-[11px] text-faint">None raised</span>}
                      {selected.summary.objections.map((o) => <span key={o} className="chip chip-coral px-2 py-0.5 text-[9px]">{o}</span>)}
                    </div>
                  </div>
                  <div>
                    <div className="label mb-2">Topics</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.summary.topics.length === 0 && <span className="text-[11px] text-faint">None cited</span>}
                      {selected.summary.topics.slice(0, 3).map((t) => <span key={t} className="chip px-2 py-0.5 text-[9px]">{t}</span>)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-line bg-bg/40 p-3.5">
                  <div className="label">Next steps</div>
                  <ol className="mt-2 space-y-2">
                    {selected.summary.nextSteps.map((s, i) => (
                      <li key={s} className="flex gap-2.5 text-[11.5px] leading-relaxed text-soft">
                        <span className="num text-[9px] text-lime-text">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="chip px-2 py-0.5 text-[9px]">score {selected.score.total}</span>
                  <span className="chip px-2 py-0.5 text-[9px]">sentiment {selected.sentiment.score >= 0 ? '+' : ''}{selected.sentiment.score.toFixed(2)}</span>
                  <span className="chip px-2 py-0.5 text-[9px]">talk {Math.round(selected.talkRatio * 100)}%</span>
                  {selected.booking && <span className="chip chip-lime px-2 py-0.5 text-[9px]">booked {selected.booking.day} {selected.booking.time}</span>}
                </div>
              </div>

              <div className="flex max-h-[420px] flex-col">
                <div className="flex items-center justify-between border-b border-line px-5 py-2.5">
                  <span className="label">Transcript</span>
                  <span className="num text-[9.5px] text-faint">{selected.turns.length} turns</span>
                </div>
                <div className="scroll-thin flex-1 overflow-y-auto p-5">
                  <div className="space-y-3.5">
                    {selected.turns.map((turn) => (
                      <div key={turn.id}>
                        <div className="label mb-1 text-[8.5px]">{turn.speaker === 'agent' ? 'Ada · AI' : selected.caller.name}</div>
                        <p className={`text-[12px] leading-relaxed ${turn.speaker === 'agent' ? 'text-soft' : 'text-fg'}`}>{turn.text}</p>
                        {turn.citations && turn.citations.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {turn.citations.map((c) => (
                              <span key={c.docId} className="chip px-1.5 py-0.5 text-[8.5px]"><FileText aria-hidden className="size-2" /> {c.title}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-panel/60 px-5 py-4">
          <p className="text-[12.5px] text-muted">
            These records are stored in your browser. Run a call in the console and it appears here within a second.
          </p>
          <Link href="/console" className="inline-flex items-center gap-1.5 text-[13px] text-lime-text hover:text-lime">
            Open the console <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      </Container>
    </div>
  )
}

function Kpi({ label, value, note, icon, accent }: { label: string; value: string; note: string; icon: ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? 'border-lime/30 bg-lime-soft' : 'border-line bg-panel'}`}>
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        <span className={accent ? 'text-lime-text' : 'text-faint'}>{icon}</span>
      </div>
      <div className="num mt-3 text-[30px] leading-none text-fg">{value}</div>
      <div className="mt-1.5 text-[10.5px] text-faint">{note}</div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label text-[8.5px]">{label}</div>
      <div className="num mt-1 text-[15px] text-fg">{value}</div>
    </div>
  )
}
