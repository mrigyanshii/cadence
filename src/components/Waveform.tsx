import { cx } from '../lib/cx'

const HEIGHTS = [0.22, 0.44, 0.7, 0.38, 0.86, 0.55, 0.3, 0.62, 0.95, 0.48, 0.72, 0.34, 0.58, 0.9, 0.42, 0.66, 0.28, 0.78, 0.52, 0.36, 0.84, 0.46, 0.68, 0.32, 0.6, 0.92, 0.4, 0.74, 0.5, 0.26, 0.64, 0.88, 0.44, 0.7, 0.34, 0.56, 0.8, 0.3, 0.62, 0.46, 0.9, 0.38, 0.72, 0.54, 0.28, 0.66, 0.82, 0.42]

/**
 * A bar waveform. `active` animates the bars like live audio; otherwise they
 * sit at a low idle level. Purely decorative, so it is hidden from the a11y tree.
 */
export function Waveform({
  active = false,
  bars = 40,
  className,
  tone = 'lime',
  height = 44,
}: {
  active?: boolean
  bars?: number
  className?: string
  tone?: 'lime' | 'coral' | 'muted'
  height?: number
}) {
  const color = tone === 'coral' ? 'bg-coral' : tone === 'muted' ? 'bg-faint' : 'bg-lime'
  return (
    <div aria-hidden className={cx('flex items-center gap-[3px]', className)} style={{ height }}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = HEIGHTS[i % HEIGHTS.length]
        return (
          <span
            key={i}
            className={cx('w-[2px] shrink-0 rounded-full transition-opacity', color, active ? 'opacity-90' : 'opacity-35')}
            style={{
              height: `${Math.max(6, h * 100)}%`,
              transformOrigin: 'center',
              animation: active ? `wave ${(900 + (i % 7) * 110) / 1000}s ease-in-out ${(i % 11) * 0.07}s infinite` : undefined,
            }}
          />
        )
      })}
    </div>
  )
}
