/*
  Client adapter for the optional live model. The Worker holds the key; this
  module only knows the request and response contract, and returns null on any
  failure so the deterministic policy can take over silently.
*/

export type ModelTurn = { speaker: 'agent' | 'caller'; text: string }
export type ModelContext = { title: string; section: string; body: string }

export type ModelStatus = { configured: boolean; model: string }

export type ModelReply = {
  reply: string
  intent: string
  sentiment: number | null
  objection: string | null
  model: string
}

export async function modelStatus(): Promise<ModelStatus> {
  try {
    const res = await fetch('/api/agent', { headers: { accept: 'application/json' } })
    if (!res.ok) return { configured: false, model: '' }
    const data = (await res.json()) as Partial<ModelStatus>
    return {
      configured: data.configured === true,
      model: typeof data.model === 'string' ? data.model : '',
    }
  } catch {
    return { configured: false, model: '' }
  }
}

export async function askModel(
  input: {
    transcript: ModelTurn[]
    decision: string
    context: ModelContext[]
    lang: string
    stage: string
    slots: Record<string, unknown>
  },
  timeoutMs = 7000,
): Promise<ModelReply | null> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    })
    if (!res.ok) return null
    const data = (await res.json()) as Partial<ModelReply>
    if (typeof data.reply !== 'string' || !data.reply.trim()) return null
    return {
      reply: data.reply.trim(),
      intent: typeof data.intent === 'string' ? data.intent : 'unknown',
      sentiment: typeof data.sentiment === 'number' ? data.sentiment : null,
      objection: typeof data.objection === 'string' ? data.objection : null,
      model: typeof data.model === 'string' ? data.model : 'groq',
    }
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}
