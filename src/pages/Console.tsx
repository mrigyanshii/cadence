import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  CalendarCheck,
  CircleAlert,
  Database,
  FileText,
  Gauge,
  Loader2,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { Container } from '../components/Container'
import { ScoreRing } from '../components/ScoreRing'
import { Sparkline } from '../components/Sparkline'
import { Waveform } from '../components/Waveform'
import { Button, Eyebrow } from '../components/ui'
import { useToast } from '../components/Toast'
import { AE_NAME, buildCall, opening, respond, SCRIPT, scoreFor } from '../lib/agent'
import { useCalls } from '../lib/calls'
import { askModel, modelStatus } from '../lib/model'
import type { ModelReply } from '../lib/model'
import { createRecognizer, speak, stopSpeaking, sttSupported, ttsSupported } from '../lib/speech'
import type { Recognizer } from '../lib/speech'
import { LANGS } from '../lib/types'
import type { AgentState, Call, CallEvent, Citation, Lang, LeadScore, Sentiment, Turn } from '../lib/types'

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

const EVENT_TONE: Record<CallEvent['kind'], string> = {
  stt: 'text-mint',
  tts: 'text-lime-text',
  rag: 'text-soft',
  llm: 'text-lime-text',
  tool: 'text-soft',
  crm: 'text-mint',
  system: 'text-faint',
}

function fmtClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function mergeCitations(prev: Citation[], next: Citation[]): Citation[] {
  const map = new Map(prev.map((c) => [c.docId, c]))
  for (const c of next) map.set(c.docId, c)
  return Array.from(map.values()).slice(-6)
}

const initialSentiment: Sentiment = { score: 0.08, label: 'neutral', trend: [0.08] }
const initialScore: LeadScore = { total: 12, band: 'cold', bant: { budget: 8, authority: 8, need: 8, timeline: 8 } }

export function Console() {
  const toast = useToast()
  const { addCall } = useCalls()

  const [status, setStatus] = useState<'idle' | 'live' | 'ended'>('idle')
  const [turns, setTurns] = useState<Turn[]>([])
  const [agentState, setAgentState] = useState<AgentState>(() => ({ ...opening('en').state, stage: 'greet', turn: 0 }))
  const [score, setScore] = useState<LeadScore>(initialScore)
  const [sentiment, setSentiment] = useState<Sentiment>(initialSentiment)
  const [citations, setCitations] = useState<Citation[]>([])
  const [events, setEvents] = useState<CallEvent[]>([])
  const [thinking, setThinking] = useState(false)
  const [interim, setInterim] = useState('')
  const [lang, setLang] = useState<Lang>('en')
  const [ttsOn, setTtsOn] = useState(true)
  const [micOn, setMicOn] = useState(false)
  const [draft, setDraft] = useState('')
  const [call, setCall] = useState<Call | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [scriptRunning, setScriptRunning] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [agentSpeaking, setAgentSpeaking] = useState(false)
  const [modelOn, setModelOn] = useState(true)
  const [modelInfo, setModelInfo] = useState<{ configured: boolean; model: string } | null>(null)

  const statusRef = useRef(status)
  const stateRef = useRef(agentState)
  const turnsRef = useRef<Turn[]>([])
  const ttsRef = useRef(ttsOn)
  const startedRef = useRef<number | null>(null)
  const scriptToken = useRef(0)
  const micRef = useRef<Recognizer | null>(null)
  const micWanted = useRef(false)
  const langRef = useRef(lang)
  const scroller = useRef<HTMLDivElement>(null)
  const sendRef = useRef<(text: string) => Promise<void>>(() => Promise.resolve())
  const pendingRef = useRef('')
  const flushRef = useRef<number | null>(null)
  const modelOnRef = useRef(true)
  const modelConfiguredRef = useRef(false)
  const modelFailuresRef = useRef(0)

  const stt = useMemo(() => sttSupported(), [])
  const tts = useMemo(() => ttsSupported(), [])

  useEffect(() => {
    statusRef.current = status
  }, [status])
  useEffect(() => {
    ttsRef.current = ttsOn
  }, [ttsOn])
  useEffect(() => {
    langRef.current = lang
  }, [lang])
  useEffect(() => {
    modelOnRef.current = modelOn
  }, [modelOn])

  // Ask the Worker whether a Groq key is configured. No key means the console
  // simply stays on the deterministic policy.
  useEffect(() => {
    let alive = true
    void modelStatus().then((status) => {
      if (!alive) return
      setModelInfo(status)
      modelConfiguredRef.current = status.configured
      if (!status.configured) setModelOn(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const appendTurn = useCallback((turn: Turn) => {
    turnsRef.current = [...turnsRef.current, turn]
    setTurns(turnsRef.current)
  }, [])

  // Call timer
  useEffect(() => {
    if (status !== 'live' || startedRef.current === null) return
    const id = window.setInterval(() => setElapsed((Date.now() - (startedRef.current ?? Date.now())) / 1000), 250)
    return () => window.clearInterval(id)
  }, [status])

  // Keep the transcript pinned to the newest turn.
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, thinking, interim])

  const clearPending = useCallback(() => {
    pendingRef.current = ''
    if (flushRef.current !== null) {
      window.clearTimeout(flushRef.current)
      flushRef.current = null
    }
  }, [])

  // Endpointing: a final transcript is only sent after the caller has been
  // quiet for a moment, so a pause mid-sentence does not cut them off.
  const queueFinal = useCallback((text: string) => {
    pendingRef.current = `${pendingRef.current} ${text}`.replace(/\s+/g, ' ').trim()
    if (flushRef.current !== null) window.clearTimeout(flushRef.current)
    flushRef.current = window.setTimeout(() => {
      flushRef.current = null
      const utterance = pendingRef.current.trim()
      pendingRef.current = ''
      if (utterance.length > 1) void sendRef.current(utterance)
    }, 900)
  }, [])

  const stopMic = useCallback(() => {
    micWanted.current = false
    micRef.current?.abort()
    micRef.current = null
    setInterim('')
    clearPending()
  }, [clearPending])

  const stopVoice = useCallback(() => {
    stopSpeaking()
    setAgentSpeaking(false)
  }, [])

  /*
    Microphone lifecycle. Recognition is suspended while the agent speaks:
    otherwise the microphone transcribes Ada's own voice and the agent answers
    itself. It restarts shortly after she finishes, on language change, and
    whenever the recogniser drops out mid-call.
  */
  useEffect(() => {
    if (!micOn || status !== 'live' || !stt) {
      stopMic()
      return
    }
    micWanted.current = true

    if (agentSpeaking) {
      micRef.current?.abort()
      micRef.current = null
      // Drop anything half-heard before Ada started talking.
      clearPending()
      return
    }

    const rec = createRecognizer({
      lang,
      onPartial: (text) => {
        setInterim(text)
        // Still talking: keep pushing the send window out.
        if (text && pendingRef.current) queueFinal('')
      },
      onFinal: (text) => {
        setInterim('')
        queueFinal(text)
      },
      onError: (error) => {
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          setNotice('Microphone permission was denied. Type instead — the workflow is identical.')
          setMicOn(false)
        } else if (error === 'network') {
          setNotice('Speech recognition needs a network connection in this browser. Typing still works.')
        }
      },
      onEnd: () => {
        if (micWanted.current && statusRef.current === 'live' && micRef.current === rec) {
          window.setTimeout(() => {
            if (micWanted.current && statusRef.current === 'live' && micRef.current === rec) rec?.start()
          }, 300)
        }
      },
    })
    micRef.current = rec
    // Small delay on resume so the tail of the agent's audio is not captured.
    const startTimer = window.setTimeout(() => {
      if (micWanted.current) rec?.start()
    }, 180)
    return () => {
      window.clearTimeout(startTimer)
      micWanted.current = false
      rec?.abort()
      if (micRef.current === rec) micRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micOn, status, lang, stt, agentSpeaking, stopMic, queueFinal])

  useEffect(() => {
    return () => {
      stopSpeaking()
      if (flushRef.current !== null) window.clearTimeout(flushRef.current)
      micWanted.current = false
      micRef.current?.abort()
      scriptToken.current++
    }
  }, [])

  const startCall = useCallback(
    (autoMic = false) => {
      scriptToken.current++
      stopVoice()
      clearPending()
      const initial = opening(langRef.current)
      const now = Date.now()
      startedRef.current = now
      stateRef.current = initial.state
      turnsRef.current = []
      setAgentState(initial.state)
      setScore(scoreFor(initial.state.slots, initial.state.sentiment, []))
      setSentiment(initial.state.sentiment)
      setCitations([])
      setEvents([
        { id: 'ev_connect', at: now, kind: 'system', label: 'call.connected', detail: 'inbound · WebRTC · 16 kHz · consent played', ms: 42 },
      ])
      setCall(null)
      setStatus('live')
      statusRef.current = 'live'
      setElapsed(0)
      setThinking(false)
      setNotice(null)
      appendTurn({ id: 'turn_open', speaker: 'agent', text: initial.text, at: 0, lang: langRef.current, latencyMs: 310 })
      if (autoMic && stt) setMicOn(true)
      if (ttsRef.current) {
        speak(initial.text, langRef.current, {
          onStart: () => setAgentSpeaking(true),
          onEnd: () => setAgentSpeaking(false),
        })
      }
    },
    [appendTurn, stt, stopVoice, clearPending],
  )

  const send = useCallback(
    (raw: string): Promise<void> => {
      const text = raw.trim()
      if (!text || statusRef.current !== 'live') return Promise.resolve()
      setDraft('')
      setInterim('')
      clearPending()
      const base = startedRef.current ?? Date.now()
      appendTurn({ id: `c_${Date.now()}`, speaker: 'caller', text, at: Date.now() - base, lang: stateRef.current.lang })
      setThinking(true)

      return new Promise<void>((resolve) => {
        window.setTimeout(() => {
          const res = respond(stateRef.current, text)
          stateRef.current = res.state
          setAgentState(res.state)
          setScore(res.score)
          setSentiment(res.sentiment)
          setCitations((prev) => mergeCitations(prev, res.citations))
          setEvents((prev) => [...prev, ...res.events].slice(-60))

          const finish = async () => {
            let reply = res.text
            let used: ModelReply | null = null
            let modelMs: number | null = null

            if (modelOnRef.current && modelConfiguredRef.current) {
              const started = performance.now()
              used = await askModel({
                transcript: turnsRef.current.slice(-12).map((t) => ({ speaker: t.speaker, text: t.text })),
                decision: res.text,
                context: res.citations.map((c) => ({ title: c.title, section: c.section, body: c.snippet })),
                lang: res.state.lang,
                stage: res.state.stage,
                slots: res.state.slots,
              })
              modelMs = Math.round(performance.now() - started)
              if (used?.reply) {
                reply = used.reply
                modelFailuresRef.current = 0
              } else {
                modelFailuresRef.current += 1
                if (modelFailuresRef.current >= 2) {
                  setModelOn(false)
                  setNotice('The live model is not responding, so the scripted policy is handling the rest of this call.')
                }
              }
            }

            if (statusRef.current !== 'live') {
              setThinking(false)
              resolve()
              return
            }

            setThinking(false)
            appendTurn({
              id: `a_${Date.now()}`,
              speaker: 'agent',
              text: reply,
              at: Date.now() - (startedRef.current ?? Date.now()),
              lang: res.state.lang,
              citations: res.citations,
              latencyMs: modelMs ?? res.events.find((e) => e.kind === 'llm')?.ms,
            })
            if (used) {
              setEvents((prev) =>
                [
                  ...prev,
                  {
                    id: `ev_model_${Date.now()}`,
                    at: Date.now(),
                    kind: 'llm' as const,
                    label: 'groq.reply',
                    detail: `${used.model} · ${used.intent}${
                      used.sentiment !== null ? ` · ${used.sentiment.toFixed(2)}` : ''
                    }`,
                    ms: modelMs ?? undefined,
                  },
                ].slice(-60),
              )
            }
            if (res.state.lang !== langRef.current) setLang(res.state.lang)
            if (ttsRef.current) {
              speak(reply, res.state.lang, {
                onStart: () => setAgentSpeaking(true),
                onEnd: () => setAgentSpeaking(false),
              })
            }
            resolve()
          }

          void finish()
        }, 430 + Math.random() * 240)
      })
    },
    [appendTurn, clearPending],
  )

  useEffect(() => {
    sendRef.current = send
  }, [send])

  const endCall = useCallback(() => {
    if (statusRef.current !== 'live') return
    scriptToken.current++
    setScriptRunning(false)
    stopVoice()
    stopMic()
    setMicOn(false)
    setThinking(false)
    const now = Date.now()
    const started = startedRef.current ?? now
    const record = buildCall({ state: stateRef.current, turns: turnsRef.current, startedAt: started, endedAt: now })
    setCall(record)
    addCall(record)
    setStatus('ended')
    statusRef.current = 'ended'
    setElapsed((now - started) / 1000)
    toast('Call summarised and saved to analytics')
  }, [addCall, stopMic, stopVoice, toast])

  const reset = useCallback(() => {
    scriptToken.current++
    stopVoice()
    stopMic()
    setMicOn(false)
    setScriptRunning(false)
    setStatus('idle')
    statusRef.current = 'idle'
    setTurns([])
    turnsRef.current = []
    stateRef.current = opening(langRef.current).state
    setAgentState(stateRef.current)
    setScore(initialScore)
    setSentiment(initialSentiment)
    setCitations([])
    setEvents([])
    setCall(null)
    setElapsed(0)
    setThinking(false)
    setNotice(null)
    setDraft('')
  }, [stopMic, stopVoice])

  const runScript = useCallback(async () => {
    if (statusRef.current !== 'live') {
      startCall()
      await wait(900)
    }
    const token = ++scriptToken.current
    setScriptRunning(true)
    for (const line of SCRIPT) {
      if (scriptToken.current !== token || statusRef.current !== 'live') break
      await wait(line.pause)
      if (scriptToken.current !== token || statusRef.current !== 'live') break
      await sendRef.current(line.text)
    }
    setScriptRunning(false)
  }, [startCall])

  const toggleMic = () => {
    if (statusRef.current !== 'live') {
      startCall(true)
      return
    }
    if (!stt) {
      setNotice('This browser has no speech recognition. Chrome, Edge or Safari support it; typing works everywhere.')
      return
    }
    setNotice(null)
    setMicOn((v) => !v)
  }

  const copySummary = async () => {
    if (!call) return
    const text = [
      call.summary.headline,
      '',
      ...call.summary.bullets.map((b) => `• ${b}`),
      '',
      'Next steps:',
      ...call.summary.nextSteps.map((s, i) => `${i + 1}. ${s}`),
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast('Summary copied to clipboard')
    } catch {
      toast('The browser blocked clipboard access')
    }
  }

  const live = status === 'live'
  const caller = agentState.slots
  const callerInitials = (caller.name ?? 'Caller')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative isolate">
      <Container className="pb-20 pt-10 sm:pt-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow tone="lime">Live console · inbound line +1 (415) 555-0142</Eyebrow>
            <h1 className="mt-5 text-[clamp(34px,4.6vw,58px)] leading-[1.03] tracking-[-0.022em]">
              Talk to the <span className="serif-italic text-lime-text">agent.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-muted">
              Speak or type as the caller. The agent qualifies, answers from the knowledge base with citations, handles objections, books a slot and writes the CRM record. Speech stays in your browser; with the live model on, the transcript goes to Groq for the reply.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] tracking-[0.02em] text-faint">
            <span>Speech input {stt ? 'available' : 'unavailable'}</span>
            <span aria-hidden className="hidden h-3 w-px bg-line-2 sm:block" />
            <span>Voice output {tts ? 'on' : 'off'}</span>
            {modelInfo?.configured && (
              <>
                <span aria-hidden className="hidden h-3 w-px bg-line-2 sm:block" />
                <button
                  type="button"
                  onClick={() => setModelOn((v) => !v)}
                  aria-pressed={modelOn}
                  className="text-[11px] tracking-[0.02em] text-faint transition-colors hover:text-fg"
                  title="Groq writes each reply from the retrieved context. Turn it off for the scripted policy."
                >
                  Model {modelOn ? 'on' : 'off'} · Groq
                </button>
              </>
            )}
            {modelInfo && !modelInfo.configured && (
              <>
                <span aria-hidden className="hidden h-3 w-px bg-line-2 sm:block" />
                <span title="No model key is configured on the server, so the scripted policy is handling replies.">Model not configured</span>
              </>
            )}
            <Button variant="outline" size="sm" onClick={reset} aria-label="Reset the console">
              <RotateCcw aria-hidden className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>

        {notice && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-coral/25 bg-coral-soft px-4 py-3 text-[13px] leading-relaxed text-coral">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {notice}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-[20px] border border-line-2 bg-panel shadow-float">
          {/* Console top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-panel-2/60 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-soft">
                {live ? <span className="live-dot" /> : <span className="size-1.5 rounded-full bg-faint" />}
                {live ? 'On call' : status === 'ended' ? 'Call ended' : 'Idle'}
              </span>
              <span className="num text-[12px] text-soft">{fmtClock(elapsed)}</span>
              <span aria-hidden className="hidden h-3 w-px bg-line-2 sm:block" />
              <span className="label hidden text-faint sm:block">16 kHz · mono · opus</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-3" role="group" aria-label="Call language">
                {LANGS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLang(l.id)}
                    aria-pressed={lang === l.id}
                    className={`text-[10px] uppercase tracking-[0.14em] transition-colors ${
                      lang === l.id
                        ? 'text-fg underline decoration-lime decoration-1 underline-offset-4'
                        : 'text-faint hover:text-soft'
                    }`}
                  >
                    {l.id}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setTtsOn((v) => !v)
                  if (ttsOn) stopVoice()
                }}
                className="btn btn-sm btn-ghost"
                aria-pressed={ttsOn}
                title={ttsOn ? 'Mute the agent voice' : 'Unmute the agent voice'}
              >
                {ttsOn ? <Volume2 aria-hidden className="size-4" /> : <VolumeX aria-hidden className="size-4" />}
                <span className="hidden sm:inline">{ttsOn ? 'Voice' : 'Muted'}</span>
              </button>
              <Button
                size="sm"
                variant={live ? 'outline' : 'accent'}
                onClick={live ? endCall : reset}
              >
                {live ? <PhoneOff aria-hidden className="size-3.5" /> : <PhoneCall aria-hidden className="size-3.5" />}
                {live ? 'End call' : 'Reset'}
              </Button>
            </div>
          </div>

          <div className="grid lg:h-[calc(100dvh-360px)] lg:min-h-[540px] lg:grid-cols-[228px_minmax(0,1fr)_300px] xl:grid-cols-[260px_minmax(0,1fr)_360px]">
            {/* ---------------- left rail ---------------- */}
            <div className="border-b border-line p-4 lg:min-h-0 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between">
                <span className="label">Audio</span>
                <span className="num text-[10px] text-faint">{live ? 'streaming' : 'standby'}</span>
              </div>

              <div className="mt-3 flex h-[56px] items-center rounded-[10px] border border-line bg-bg/60 px-3">
                <Waveform active={live && (micOn || thinking)} bars={30} height={32} />
              </div>

              <button
                type="button"
                onClick={toggleMic}
                aria-pressed={micOn}
                className={`mt-3 flex w-full flex-col items-center gap-1.5 rounded-[12px] border px-3 py-3.5 transition-colors ${
                  micOn ? 'border-lime/40 bg-lime-soft' : 'border-line-2 bg-panel-2/50 hover:border-line-2 hover:bg-panel-2'
                }`}
              >
                <span className={`relative flex size-10 items-center justify-center rounded-full ${micOn ? 'bg-lime text-ink' : 'bg-fg/8 text-fg'}`}>
                  {micOn && <span aria-hidden className="absolute inset-0 animate-ping-slow rounded-full bg-lime/40" />}
                  {micOn ? <Mic aria-hidden className="size-4" /> : <MicOff aria-hidden className="size-4" />}
                </span>
                <span className="text-[12.5px] font-medium text-fg">{micOn ? 'Listening' : live ? 'Start microphone' : 'Start a call'}</span>
                <span className="text-[10px] leading-tight text-faint">
                  {micOn && agentSpeaking ? 'paused while Ada speaks' : stt ? 'or type below' : 'typing works everywhere'}
                </span>
              </button>

              <Button variant="accent" size="md" className="mt-2 w-full" onClick={() => void runScript()} disabled={scriptRunning}>
                {scriptRunning ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Play aria-hidden className="size-4" />}
                {scriptRunning ? 'Running…' : 'Play scripted call'}
              </Button>

              <div className="mt-4 rounded-[12px] border border-line bg-bg/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="label">Caller</span>
                  <span className="text-[9px] uppercase tracking-[0.12em] text-faint">{caller.name ? 'enriched' : 'listening'}</span>
                </div>
                <div className="mt-2 space-y-1.5 text-[12px]">
                  <Row label="Name" value={caller.name} />
                  <Row label="Company" value={caller.company} />
                  <Row label="Role" value={caller.role} />
                  <Row label="Team" value={caller.size ? `${caller.size} agents` : undefined} />
                  <Row label="Email" value={caller.email} mono />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-line pt-3 text-[9px] uppercase tracking-[0.1em] text-faint">
                {[
                  ['ASR', '212 ms'],
                  ['Retrieval', '31 ms'],
                  ['Policy', '486 ms'],
                  ['TTS', '94 ms'],
                ].map(([k, v]) => (
                  <span key={k} className="flex items-baseline justify-between gap-1">
                    {k}
                    <span className="num text-[9.5px] tracking-normal text-soft">{v}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* ---------------- transcript ---------------- */}
            <div className="flex h-[68vh] min-h-[460px] flex-col lg:h-auto lg:min-h-0">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5 sm:px-5">
                <span className="label">Transcript · diarised</span>
                <span className="num text-[9.5px] text-faint">VAD · barge-in 118 ms</span>
              </div>

              <div ref={scroller} className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite">
                {turns.length === 0 && (
                  <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                    <div className="flex size-14 items-center justify-center rounded-full border border-line-2 bg-panel-2">
                      <PhoneCall aria-hidden className="size-5 text-lime-text" />
                    </div>
                    <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-soft">
                      Start a call and speak as the buyer, or play the scripted inbound call — a 240-agent retail support team evaluating vendors this quarter.
                    </p>
                    <p className="mt-2 text-[12px] text-faint">The whole workflow completes in about 90 seconds.</p>
                  </div>
                )}

                <div className="space-y-5">
                  {turns.map((turn) => (
                    <div key={turn.id} className={`flex gap-3 ${turn.speaker === 'caller' ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${
                          turn.speaker === 'agent' ? 'border border-lime/30 bg-lime-soft text-lime-text' : 'border border-line-2 bg-panel text-soft'
                        }`}
                      >
                        {turn.speaker === 'agent' ? 'A' : callerInitials || 'C'}
                      </div>
                      <div className={`max-w-[86%] ${turn.speaker === 'caller' ? 'items-end text-right' : ''}`}>
                        <div className={`mb-1.5 flex items-center gap-2 ${turn.speaker === 'caller' ? 'justify-end' : ''}`}>
                          <span className="label text-[9.5px]">
                            {turn.speaker === 'agent' ? 'Ada · AI' : caller.name ?? 'Caller'}
                          </span>
                          <span className="num text-[9.5px] text-faint">{fmtClock(turn.at / 1000)}</span>
                          {turn.latencyMs && <span className="num text-[9.5px] text-faint">· {turn.latencyMs} ms</span>}
                        </div>
                        <div
                          className={`animate-pop rounded-[12px] px-3.5 py-2.5 text-left text-[13.5px] leading-[1.6] ${
                            turn.speaker === 'agent'
                              ? 'rounded-tl-[3px] border border-line bg-bg/70 text-soft'
                              : 'rounded-tr-[3px] border border-line-2 bg-panel-2 text-fg'
                          }`}
                        >
                          {turn.text}
                        </div>
                        {turn.citations && turn.citations.length > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                            {turn.citations.map((c) => (
                              <span key={c.docId} className="inline-flex items-center gap-1.5 text-[10px] text-faint" title={c.section}>
                                <FileText aria-hidden className="size-2.5" />
                                {c.title}
                                <span className="num text-lime-text">{c.score.toFixed(2)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {thinking && (
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 items-center justify-center rounded-full border border-lime/30 bg-lime-soft text-[10px] text-lime-text">A</div>
                      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-line bg-panel-2 px-3.5 py-3">
                        <span className="size-1.5 animate-wave rounded-full bg-lime" style={{ animationDelay: '0ms' }} />
                        <span className="size-1.5 animate-wave rounded-full bg-lime" style={{ animationDelay: '120ms' }} />
                        <span className="size-1.5 animate-wave rounded-full bg-lime" style={{ animationDelay: '240ms' }} />
                        <span className="ml-1 text-[11px] text-faint">retrieving · reasoning</span>
                      </div>
                    </div>
                  )}

                  {interim && (
                    <div className="flex flex-row-reverse gap-3">
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-line-2 bg-panel-2 text-[10px] text-muted">
                        {callerInitials || 'C'}
                      </div>
                      <div className="max-w-[86%] rounded-2xl rounded-tr-md border border-dashed border-line-2 bg-bg/60 px-3.5 py-2.5 text-[13px] italic text-muted">
                        {interim}
                        <span aria-hidden className="ml-1 inline-block h-3 w-px animate-blink bg-lime align-middle" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <form
                className="border-t border-line bg-panel-2/40 p-3 sm:p-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!live) {
                    startCall()
                    return
                  }
                  void send(draft)
                }}
              >
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={live ? 'Type as the caller — ask about price, security, or book a demo…' : 'Press enter to start the call…'}
                    className="field"
                    aria-label="Caller message"
                    disabled={status === 'ended'}
                  />
                  <Button type="submit" size="md" variant="accent" disabled={status === 'ended'} aria-label="Send">
                    {live ? <Send aria-hidden className="size-4" /> : <PhoneCall aria-hidden className="size-4" />}
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[10.5px] text-faint">
                  <span>Try: “What does Growth cost?”</span>
                  <span aria-hidden>·</span>
                  <span>“Security is the blocker”</span>
                  <span aria-hidden>·</span>
                  <span>“Let’s book a demo”</span>
                  <span aria-hidden>·</span>
                  <span>Try Spanish or French</span>
                </div>
              </form>
            </div>

            {/* ---------------- intelligence rail ---------------- */}
            <div className="scroll-thin border-t border-line p-4 sm:p-5 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between">
                <span className="label">Lead qualification</span>
                <span className={`text-[9px] uppercase tracking-[0.14em] ${score.band === 'hot' ? 'text-lime-text' : 'text-faint'}`}>
                  {score.band}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <ScoreRing value={score.total} size={88} label="BANT" tone={score.band === 'cold' ? 'muted' : 'lime'} />
                <div className="flex-1 space-y-2">
                  {(['budget', 'authority', 'need', 'timeline'] as const).map((key) => (
                    <div key={key}>
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="capitalize text-muted">{key}</span>
                        <span className="num text-faint">{score.bant[key]}/25</span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-fg/8">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${score.bant[key] > 18 ? 'bg-lime' : score.bant[key] > 12 ? 'bg-mint' : 'bg-faint'}`}
                          style={{ width: `${(score.bant[key] / 25) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-line bg-bg/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="label">Sentiment</span>
                  <span className={`text-[9px] uppercase tracking-[0.14em] ${sentiment.label === 'negative' ? 'text-coral' : sentiment.label === 'positive' ? 'text-lime-text' : 'text-faint'}`}>
                    {sentiment.label}
                  </span>
                </div>
                <div className="mt-2 h-12">
                  <Sparkline points={sentiment.trend.length > 1 ? sentiment.trend : [0.08, sentiment.score]} tone={sentiment.label === 'negative' ? 'coral' : 'lime'} />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-faint">
                  <span>−1 hostile</span>
                  <span className="num text-soft">{sentiment.score.toFixed(2)}</span>
                  <span>+1 ready</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="label">Retrieved context</span>
                  <span className="num text-[10px] text-faint">{citations.length} chunks</span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {citations.length === 0 && <p className="text-[11.5px] leading-relaxed text-faint">No retrieval yet. Ask a product, pricing or security question.</p>}
                  {citations.slice(-3).reverse().map((c) => (
                    <div key={c.docId} className="rounded-xl border border-line bg-bg/40 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11.5px] leading-tight text-soft">{c.title}</span>
                        <span className="num text-[10px] text-lime-text">{c.score.toFixed(2)}</span>
                      </div>
                      <div className="mt-1 truncate text-[10px] text-faint">{c.section}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-bg/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="label">CRM</span>
                  <span className="text-[9px] uppercase tracking-[0.12em] text-faint">2-way · HubSpot</span>
                </div>
                <div className="mt-2 space-y-1.5 text-[11.5px]">
                  <Row label="Account" value={caller.company} />
                  <Row label="Stage" value={agentState.booking ? 'Discovery booked' : caller.size ? 'Qualified' : 'New'} />
                  <Row label="Owner" value={AE_NAME} />
                  <Row label="Value" value={caller.size ? `$${(caller.size * 12 * 1.4).toLocaleString('en-US')} / yr` : undefined} mono />
                </div>
              </div>

              {agentState.booking ? (
                <div className="mt-4 rounded-2xl border border-lime/30 bg-lime-soft p-3">
                  <div className="flex items-center gap-2 text-[11px] text-lime-text">
                    <CalendarCheck aria-hidden className="size-3.5" />
                    Meeting booked
                  </div>
                  <div className="mt-2 text-[13px] text-fg">
                    {agentState.booking.day} {agentState.booking.date} · {agentState.booking.time}
                  </div>
                  <div className="text-[11px] text-muted">with {agentState.booking.with} · {agentState.booking.tz}</div>
                  <div className="mt-2 flex flex-wrap gap-x-4 text-[9.5px] uppercase tracking-[0.1em] text-lime-text">
                    <span>Invite sent</span>
                    <span>CRM updated</span>
                  </div>
                </div>
              ) : agentState.offered.length > 0 ? (
                <div className="mt-4 rounded-2xl border border-line bg-bg/40 p-3">
                  <div className="label">Held slots</div>
                  <ul className="mt-2 space-y-1 text-[11.5px] text-soft">
                    {agentState.offered.map((slot, i) => (
                      <li key={slot.id} className="flex items-center justify-between gap-2">
                        <span>{i + 1}. {slot.day} {slot.date} · {slot.time}</span>
                        <span className="num text-[10px] text-faint">10m hold</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="label">Event log</span>
                  <span className="num text-[10px] text-faint">{events.length}</span>
                </div>
                <div className="mt-2 max-h-[132px] space-y-1 overflow-hidden font-mono text-[9.5px] leading-relaxed">
                  {events.slice(-7).reverse().map((e) => (
                    <div key={e.id} className="flex items-start justify-between gap-2">
                      <span className={`truncate ${EVENT_TONE[e.kind]}`}>{e.label}</span>
                      <span className="shrink-0 text-faint">{e.ms ? `${e.ms}ms` : ''}</span>
                    </div>
                  ))}
                  {events.length === 0 && <span className="text-faint">waiting for call…</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- summary ---------------- */}
        {call && (
          <section aria-labelledby="summary-title" className="mt-8 animate-rise">
            <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
              <div className="card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Eyebrow tone="lime">Post-call · generated in 1.8 s</Eyebrow>
                    <h2 id="summary-title" className="mt-3 text-[24px] leading-tight tracking-[-0.03em]">{call.summary.headline}</h2>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-lime-text">
                    {call.summary.disposition.replace('_', ' ')}
                  </span>
                </div>

                <ul className="mt-5 space-y-2.5">
                  {call.summary.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-[13.5px] leading-relaxed text-soft">
                      <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-lime" />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[10.5px] uppercase tracking-[0.1em]">
                  {call.summary.objections.map((o) => (
                    <span key={o} className="text-coral">{o}</span>
                  ))}
                  {call.summary.topics.map((t) => (
                    <span key={t} className="text-faint">{t}</span>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Button href="/analytics" variant="accent" size="md">
                    Open call analytics
                    <ArrowRight aria-hidden className="size-4" />
                  </Button>
                  <Button variant="outline" size="md" onClick={() => void copySummary()}>Copy summary</Button>
                  <Button variant="ghost" size="md" onClick={reset}>Start another call</Button>
                </div>
              </div>

              <div className="card p-6">
                <div className="label">Next steps · written to the CRM</div>
                <ol className="mt-4 space-y-3.5">
                  {call.summary.nextSteps.map((s, i) => (
                    <li key={s} className="flex gap-3 text-[13px] leading-relaxed text-soft">
                      <span className="num flex size-5 shrink-0 items-center justify-center rounded-full border border-line-2 text-[10px] text-lime-text">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-4">
                  <MiniStat label="Duration" value={fmtClock(call.durationSec)} />
                  <MiniStat label="Talk ratio" value={`${Math.round(call.talkRatio * 100)}%`} />
                  <MiniStat label="Lead score" value={String(call.score.total)} />
                </div>
                {call.booking && (
                  <div className="mt-4 rounded-xl border border-line bg-bg/40 px-3 py-2.5 text-[11.5px] text-muted">
                    <span className="text-soft">Calendar:</span> {call.booking.day} {call.booking.date}, {call.booking.time} · {call.booking.with}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---------------- explainer ---------------- */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Note icon={<Sparkles className="size-4" />} title="What is real here" body="Speech recognition and synthesis are the browser APIs. Retrieval, scoring, slot filling, booking and summarisation run as code; with the live model on, Groq writes the reply from the same retrieved context. Turn the model off for a fully deterministic run." />
          <Note icon={<Database className="size-4" />} title="What is simulated" body="The policy step is a deterministic sales script, or Groq when the model is on; the CRM and calendar calls write to local state. The architecture page shows where an LLM, a vector index and HubSpot sit in production." />
          <Note icon={<Gauge className="size-4" />} title="Why it demos well" body="No cold starts and no rate limits. Run it with the key for live replies, or switch the model off for a fully scripted pass. The scripted call exercises retrieval, an objection, a booking and the CRM write in one go." />
        </div>
      </Container>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10.5px] text-faint">{label}</span>
      <span className={`truncate text-right text-[11.5px] ${value ? 'text-soft' : 'text-faint'} ${mono ? 'num text-[10.5px]' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label text-[8.5px]">{label}</div>
      <div className="num mt-1 text-[15px] text-fg">{value}</div>
    </div>
  )
}

function Note({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel/50 p-5">
      <div className="flex size-8 items-center justify-center rounded-lg border border-line-2 bg-panel-2 text-lime-text">{icon}</div>
      <h3 className="mt-3.5 text-[14px] font-medium text-fg">{title}</h3>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{body}</p>
    </div>
  )
}
