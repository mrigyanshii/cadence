import { BRAND, FOOTER } from '../content'
import { Link } from '../lib/router'
import { Container } from './Container'
import { Logo } from './ui'

export function Footer() {
  return (
    <footer className="surface-night relative border-t border-line">
      <Container className="py-14">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-muted">{FOOTER.blurb}</p>
            <p className="mt-6 flex items-center gap-2 text-[12.5px] text-faint">
              <span className="live-dot" aria-hidden />
              Prototype running locally · deterministic by default
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER.columns.map((col) => (
              <div key={col.title}>
                <div className="label mb-4">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-[13.5px] text-soft transition-colors hover:text-lime-text">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-[12px] text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>{FOOTER.legal}</span>
          <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>{BRAND.email}</span>
            <span aria-hidden className="hidden h-3 w-px bg-line-2 sm:block" />
            <span>Architecture · Business case · Working prototype</span>
          </span>
        </div>
      </Container>
    </footer>
  )
}
