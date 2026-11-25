import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

import { NAV } from '../content'
import { cx } from '../lib/cx'
import { isCurrent, Link, useLocation } from '../lib/router'
import { Button, Logo } from './ui'

export function Nav() {
  const { path } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [path])

  return (
    <header
      className={cx(
        'surface-night sticky top-0 z-50 border-b border-line transition-colors duration-300',
        scrolled ? 'bg-bg/92 backdrop-blur-xl' : 'bg-bg',
      )}
    >
      <div className="grid h-[72px] w-full grid-cols-[auto_1fr_auto] items-center gap-6 px-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Cadence home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center justify-center gap-8 text-[13px] lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link" aria-current={isCurrent(item.href, path, { exact: true }) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <Button href="/console" size="sm" variant="accent" className="hidden sm:inline-flex">
            Open console
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Button>

          <button
            type="button"
            className="btn btn-sm btn-ghost lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-bg px-5 pb-6 pt-3 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between border-b border-line py-3.5 text-[15px] text-soft"
              >
                {item.label}
                <ArrowUpRight aria-hidden className="size-4 text-faint" />
              </Link>
            ))}
          </nav>
          <Button href="/console" variant="accent" size="md" className="mt-5 w-full">
            Open the live console
          </Button>
        </div>
      )}
    </header>
  )
}
