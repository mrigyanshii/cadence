import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cx } from '../lib/cx'
import { Link } from '../lib/router'

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <span aria-hidden className="relative flex h-7 w-7 items-center justify-center rounded-[9px] border border-line-2 bg-panel-2">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M3 12h.01" />
          <path d="M7.5 8.5v7" />
          <path d="M12 5v14" />
          <path d="M16.5 8v8" />
          <path d="M21 10.5v3" />
        </svg>
      </span>
      {!compact && (
        <span className="font-serif text-[20px] leading-none tracking-[-0.01em] text-fg">
          Cadence<span className="text-lime">.</span>
        </span>
      )}
    </span>
  )
}

export function Eyebrow({ children, className, tone = 'muted' }: { children: ReactNode; className?: string; tone?: 'muted' | 'lime' }) {
  return (
    <span className={cx('label inline-flex items-center gap-2.5', tone === 'lime' && 'text-lime-text', className)}>
      <span aria-hidden className={cx('h-px w-5', tone === 'lime' ? 'bg-lime' : 'bg-faint')} />
      {children}
    </span>
  )
}

export function Chip({ children, tone = 'default', className }: { children: ReactNode; tone?: 'default' | 'lime' | 'coral' | 'mint'; className?: string }) {
  const map = { default: '', lime: 'chip-lime', coral: 'chip-coral', mint: 'chip-mint' } as const
  return <span className={cx('chip', map[tone], className)}>{children}</span>
}

export function SectionHead({
  index,
  eyebrow,
  title,
  lede,
  align = 'left',
  className,
}: {
  index?: string
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div className={cx('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {(index || eyebrow) && (
        <div className={cx('mb-5 flex items-center gap-4', align === 'center' && 'justify-center')}>
          {index && <span className="num text-[11px] text-faint">{index}</span>}
          {index && <span aria-hidden className="h-px w-8 bg-line-2" />}
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        </div>
      )}
      <h2 className="text-[clamp(30px,3.9vw,50px)] leading-[1.06] font-normal tracking-[-0.02em] text-fg">{title}</h2>
      {lede && <p className="mt-5 max-w-2xl text-[15.5px] leading-[1.65] text-muted">{lede}</p>}
    </div>
  )
}

export function Stat({ value, unit, label, note }: { value: string; unit?: string; label: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-[clamp(32px,3.4vw,44px)] leading-none tracking-[-0.01em] text-fg">{value}</span>
        {unit && <span className="label text-faint">{unit}</span>}
      </div>
      <div className="text-[13px] leading-snug text-soft">{label}</div>
      {note && <div className="text-[11.5px] leading-snug text-faint">{note}</div>}
    </div>
  )
}

type ButtonProps = {
  variant?: 'accent' | 'paper' | 'outline' | 'ghost' | 'coral'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  children: ReactNode
  className?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

export function Button({ variant = 'accent', size = 'md', href, children, className, ...rest }: ButtonProps) {
  const classes = cx('btn', `btn-${size}`, `btn-${variant}`, className)
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}

export function Rule({ className }: { className?: string }) {
  return <div aria-hidden className={cx('rule', className)} />
}
