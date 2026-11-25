// Strips files the Sites uploader refuses (hidden files and source maps)
// from the build output, so `deploy.json` can point straight at dist/.
// Source map comments must go too: deleting a .map while leaving the
// `sourceMappingURL` line makes Wrangler's deploy validation fail.
import { readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

function stripMapComment(path) {
  if (!/\.(js|mjs|cjs|css)$/.test(path)) return
  const code = readFileSync(path, 'utf8')
  const stripped = code
    .replace(/^\/\/# sourceMappingURL=.*$/gm, '')
    .replace(/\/\*# sourceMappingURL=[^*]*\*\/\s*$/gm, '')
  if (stripped !== code) writeFileSync(path, stripped)
}

function clean(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (name.startsWith('.') || name.endsWith('.map')) {
      rmSync(path, { recursive: true, force: true })
      continue
    }
    if (statSync(path).isDirectory()) {
      clean(path)
      continue
    }
    stripMapComment(path)
  }
}

clean(fileURLToPath(new URL('../dist', import.meta.url)))
