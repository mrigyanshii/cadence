import { LANGS } from './types'
import type { Lang } from './types'

/*
  Browser speech adapters: Web Speech recognition and SpeechSynthesis. Wrapped
  so the console can fall back to typing and still demo the whole workflow.
*/

type RecognitionResultLike = {
  isFinal: boolean
  0: { transcript: string }
}

type RecognitionEventLike = {
  resultIndex: number
  results: { length: number; [index: number]: RecognitionResultLike }
}

type RecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: RecognitionEventLike) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

type RecognitionCtor = new () => RecognitionLike

function ctor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function sttSupported(): boolean {
  return ctor() !== null
}

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export type Recognizer = {
  start: () => void
  stop: () => void
  abort: () => void
}

export function createRecognizer(opts: {
  lang: Lang
  onPartial: (text: string) => void
  onFinal: (text: string) => void
  onError?: (error: string) => void
  onEnd?: () => void
}): Recognizer | null {
  const Ctor = ctor()
  if (!Ctor) return null
  const rec = new Ctor()
  rec.lang = LANGS.find((l) => l.id === opts.lang)?.bcp47 ?? 'en-US'
  rec.continuous = true
  rec.interimResults = true
  rec.maxAlternatives = 1

  rec.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const text = result[0]?.transcript ?? ''
      if (result.isFinal) {
        if (text.trim()) opts.onFinal(text.trim())
      } else {
        interim += text
      }
    }
    opts.onPartial(interim)
  }
  rec.onerror = (e) => {
    // "no-speech" and "aborted" are normal in a continuous loop.
    if (e.error !== 'no-speech' && e.error !== 'aborted') opts.onError?.(e.error)
  }
  rec.onend = () => opts.onEnd?.()

  return {
    start: () => {
      try {
        rec.start()
      } catch {
        /* already running */
      }
    },
    stop: () => rec.stop(),
    abort: () => rec.abort(),
  }
}

let currentUtterance: SpeechSynthesisUtterance | null = null

export function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  if (!ttsSupported()) return null
  const bcp = LANGS.find((l) => l.id === lang)?.bcp47 ?? 'en-US'
  const prefix = bcp.slice(0, 2)
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang.replace('_', '-') === bcp) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
    null
  )
}

export function speak(
  text: string,
  lang: Lang,
  handlers: { onStart?: () => void; onEnd?: () => void } = {},
): void {
  if (!ttsSupported() || !text) return
  stopSpeaking()
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = pickVoice(lang)
  if (voice) utterance.voice = voice
  utterance.lang = LANGS.find((l) => l.id === lang)?.bcp47 ?? 'en-US'
  utterance.rate = 1.02
  utterance.pitch = 1
  utterance.volume = 1
  utterance.onstart = () => handlers.onStart?.()
  utterance.onend = () => {
    if (currentUtterance === utterance) currentUtterance = null
    handlers.onEnd?.()
  }
  utterance.onerror = () => {
    if (currentUtterance === utterance) currentUtterance = null
    handlers.onEnd?.()
  }
  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (!ttsSupported()) return
  currentUtterance = null
  window.speechSynthesis.cancel()
}

export function isSpeaking(): boolean {
  return ttsSupported() && window.speechSynthesis.speaking
}
