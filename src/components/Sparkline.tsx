import { cx } from '../lib/cx'

/** A small line/area chart with a zero baseline, used for sentiment arcs. */
export function Sparkline({
  points,
  width = 220,
  height = 56,
  className,
  tone = 'lime',
  showBaseline = true,
}: {
  points: number[]
  width?: number
  height?: number
  className?: string
  tone?: 'lime' | 'coral' | 'mint'
  showBaseline?: boolean
}) {
  const data = points.length > 1 ? points : [0, 0]
  const min = -1
  const max = 1
  const stepX = width / (data.length - 1)
  const y = (v: number) => height - ((v - min) / (max - min)) * height
  const line = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`
  const color = tone === 'coral' ? 'var(--color-coral)' : tone === 'mint' ? 'var(--color-mint)' : 'var(--color-lime)'
  const id = `spark-${tone}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cx('w-full', className)} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showBaseline && <line x1="0" y1={y(0)} x2={width} y2={y(0)} stroke="var(--color-line)" strokeDasharray="2 4" strokeWidth="1" />}
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={y(data[data.length - 1])} r="2.6" fill={color} />
    </svg>
  )
}
