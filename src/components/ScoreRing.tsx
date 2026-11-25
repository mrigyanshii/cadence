import { cx } from '../lib/cx'

/** A single-value ring used for the live lead score. */
export function ScoreRing({
  value,
  size = 96,
  label,
  sublabel,
  tone = 'lime',
  className,
}: {
  value: number
  size?: number
  label?: string
  sublabel?: string
  tone?: 'lime' | 'coral' | 'muted'
  className?: string
}) {
  const stroke = Math.max(3, Math.round(size / 15))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const dash = (clamped / 100) * circumference
  const color = tone === 'coral' ? 'var(--color-coral)' : tone === 'muted' ? 'var(--color-faint)' : 'var(--color-lime)'

  return (
    <div className={cx('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 700ms cubic-bezier(0.22, 1, 0.36, 1), stroke 300ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="num leading-none text-fg"
          style={{ fontSize: size >= 80 ? 22 : size >= 60 ? 16 : 13 }}
        >
          {Math.round(value)}
        </span>
        {label && size >= 64 && <span className="label mt-1.5 text-[8.5px] text-faint">{label}</span>}
        {sublabel && <span className="mt-0.5 text-[10px] text-lime-text">{sublabel}</span>}
      </div>
    </div>
  )
}
