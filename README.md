# Cadence — autonomous AI sales voice agent

A working prototype of an inbound sales voice agent: it answers, qualifies against
BANT, answers product questions from a versioned knowledge base **with citations**,
handles objections, books a meeting, writes the CRM record and produces a post-call
summary with business insight.

The prototype runs in the browser. Speech recognition and synthesis use the Web Speech
APIs; the sales policy is deterministic, so the demo works with no API key and behaves
identically on every machine. Add a Groq key to enable a live model for replies and
per-turn analysis; the deterministic policy stays as the fallback.

```sh
bun install
bun run dev        # http://localhost:5333
bun run typecheck
bun run build
```

## What to look at first

| Route | What it is |
| --- | --- |
| `/` | Overview: problem, capabilities, workflow, grounded answers, architecture teaser, deliverables |
| `/console` | **The demo.** Start a call, speak or type as the buyer, or run the scripted 90-second call |
| `/analytics` | Call log, funnel, sentiment arc, knowledge topics, full transcript and summary per call |
| `/architecture` | System diagram, latency budget, call sequence, prototype→production mapping, failure modes |
| `/business` | Problem, implementation mapping, commercial model, 100k-user plan, security, operations, cost model |

### The 90-second demo script

1. Open `/console` and press **Play scripted call** (or press the mic and speak).
2. Watch, in order: live transcript → retrieval chips with scores → BANT ring rising →
   a price objection → security question → booking → CRM/event log.
3. The call ends and a summary appears; the record is saved to `/analytics`.
4. Open `/analytics` to see the funnel, sentiment arc and the same call in the log.

Try typing `¿Cuánto cuesta el plan Growth?` or `Was kostet Growth?` — the agent detects
the language, switches its reply and its TTS voice, and keeps qualifying.

## How it works

```
mic / typed input
   │  Web Speech recognition (streaming partials)
   ▼
language detection → slot extraction → intent classification
   │
   ├── retrieve(query) ──► knowledge base (8 sections, per-language spoken answers)
   │        └── citations returned with the reply
   ├── objection playbooks (price, contract, incumbent, approval)
   ├── BANT scoring + sentiment arc (per turn)
   └── booking: availability → hold → confirm → invite + CRM upsert
   ▼
reply text → SpeechSynthesis (voice matched to language)
   ▼
post-call: summary, objections, next steps, disposition, talk ratio → localStorage → analytics
```

- **`src/lib/agent.ts`** — the sales policy: language detection, slot filling, intent
  classification, objection handling, scoring, availability, summaries and the scripted
  caller. This is the file to replace with an LLM tool-calling loop in production.
- **`src/lib/knowledge.ts`** — the corpus and `retrieve()`. Each document carries an
  English passage for citations plus a short spoken answer in EN/ES/FR/DE.
- **`src/lib/speech.ts`** — recognition and synthesis adapters, with a typing fallback.
- **`src/lib/model.ts`** — client for the optional Groq endpoint, with a silent fallback.
- **`src/lib/calls.ts`** — call records, seed data and analytics roll-ups.
- **`src/lib/types.ts`** — the `Call` row: caller, score, sentiment, citations, booking,
  turns, events, summary.
- **`src/pages/Console.tsx`** — the console UI and call lifecycle.
- **`src/worker/index.ts`** — health, retrieval API and lead intake.

## Worker routes

| Route | Answers |
| --- | --- |
| `GET /api/health` | `{ ok, service, knowledge }` |
| `GET /api/knowledge/search?q=` | ranked citations (422 under two characters) |
| `POST /api/leads` | normalised lead + score, 422 with field errors |
| `GET /api/agent` | `{ configured, model }` — never exposes the key |
| `POST /api/agent` | grounded reply + analysis from Groq, 503 without a key |

## Live model (optional)

Put a Groq key in `.env` at the project root — never commit it:

```sh
GROQ_API=gsk_your_key_here
GROQ_MODEL=openai/gpt-oss-120b   # optional; must be available to your key
```

The Worker calls Groq's OpenAI-compatible API server-side, so the browser never sees the
key. Each turn sends the deterministic decision, the retrieved passages and the last
twelve turns; the model returns the spoken reply plus its own intent, sentiment and
objection read. If the key is missing, a request fails, or two turns in a row fail, the
console falls back to the scripted policy. The `Model on · Groq` control in the console
header switches between the two. For a deployed Worker, set `GROQ_API` as a secret.

## Requirements coverage

| Requirement | Where it is implemented |
| --- | --- |
| Real-time voice (STT + TTS) | `src/lib/speech.ts`, live console with interim transcripts and barge-in (speech stops on new input) |
| Contextual memory | `AgentState.slots` + `cited` + objections persist across turns; call record stores the full transcript |
| Multilingual | EN / ES / FR / DE language packs, auto-detection, per-language TTS voice |
| Lead qualification + sentiment | BANT scoring, intent classification, per-turn sentiment arc |
| RAG knowledge retrieval | Hybrid lexical retrieval with citations and a no-answer policy at 0.62 confidence |
| Booking + CRM | Availability holds, slot choice, invite, CRM deal with stage/owner/value |
| Summaries + insights | Post-call summary, objections, next steps, disposition, funnel and topic analytics |
| Architecture diagram | `/architecture` (SVG) |
| Business case, scale, security, cost | `/business` |

## Honest limitations

- The policy step is a deterministic script unless the optional Groq model is enabled.
  Retrieval is lexical, not embedding-based; both are swapped behind the same interfaces
  in production.
- Speech recognition depends on the browser (Chrome, Edge, Safari). Firefox falls back to
  typing; the workflow is unchanged.
- CRM, calendar and email are simulated in local state. No data leaves the machine.
- Analytics records live in `localStorage`; "Reset demo data" restores the seed calls.

## Production path

Replace the three stand-ins (ASR, policy, TTS), point retrieval at a pgvector index,
and wire the tool layer to HubSpot/Google Calendar. The architecture page lists the
service choices, latency budget, failure modes and the 100k-user scaling plan; the
business page carries the cost model and security controls.

## Deployment

The app deploys as a Cloudflare Worker with static assets (`wrangler.jsonc`).

1. `npm run deploy` builds and runs `wrangler deploy` (needs `npx wrangler login` once).
2. Set the model key on the Worker once: `npx wrangler secret put GROQ_API`.
3. CI/CD: every push to `main` runs `.github/workflows/ci.yml` (typecheck + build)
   and `.github/workflows/deploy.yml` (build + `wrangler deploy`).

Repository secrets used by the deploy workflow:

| Secret | Where to get it |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Workers Scripts:Edit |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → Account ID |
| `GROQ_API` | Groq console → API keys; also written to the Worker as a secret |
