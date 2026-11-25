import { lazy, Suspense, useEffect, useRef } from 'react'
import type { ComponentType, ReactNode } from 'react'

import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { ToastProvider } from './components/Toast'
import { BRAND } from './content'
import { scrollToHash, useLocation } from './lib/router'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'

const page = <K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) =>
  lazy(() => load().then((m) => ({ default: m[name] })))

const Console = page(() => import('./pages/Console'), 'Console')
const Analytics = page(() => import('./pages/Analytics'), 'Analytics')
const Architecture = page(() => import('./pages/Architecture'), 'Architecture')
const Business = page(() => import('./pages/Business'), 'Business')

type Route = { path: string; title: string; render: () => ReactNode }

const routes: Route[] = [
  { path: '/', title: '', render: () => <Home /> },
  { path: '/console', title: 'Live console', render: () => <Console /> },
  { path: '/analytics', title: 'Call analytics', render: () => <Analytics /> },
  { path: '/architecture', title: 'Architecture', render: () => <Architecture /> },
  { path: '/business', title: 'Business case', render: () => <Business /> },
]

const Blank = () => <div className="min-h-[70vh]" aria-busy="true" />

export function App() {
  const { path, hash } = useLocation()
  const hit = routes.find((r) => r.path === path)
  const main = useRef<HTMLElement>(null)
  const first = useRef(true)
  const title = hit ? hit.title : 'Page not found'

  useEffect(() => {
    document.title = title ? `${title} | ${BRAND.name}` : `${BRAND.name} — ${BRAND.product}`
  }, [title])

  useEffect(() => {
    const isFirst = first.current
    first.current = false
    let raf = 0
    let tries = 0
    const run = () => {
      const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
      if (hash && !target && tries++ < 120) {
        raf = requestAnimationFrame(run)
        return
      }
      scrollToHash(hash, !isFirst)
      if (!isFirst && !hash) (main.current ?? document.getElementById('main'))?.focus({ preventScroll: true })
    }
    run()
    return () => cancelAnimationFrame(raf)
  }, [path, hash])

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main id="main" ref={main} tabIndex={-1} className="flex-1 outline-none">
          <Suspense fallback={<Blank />}>{hit ? hit.render() : <NotFound />}</Suspense>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  )
}
