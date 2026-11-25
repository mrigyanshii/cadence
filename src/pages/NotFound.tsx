import { Container } from '../components/Container'
import { Button, Eyebrow } from '../components/ui'

export function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col justify-center py-24">
      <Eyebrow tone="lime">404 · no route</Eyebrow>
      <h1 className="mt-6 max-w-2xl text-[clamp(40px,6vw,76px)] leading-[1.03] tracking-[-0.022em]">
        This line is not <span className="serif-italic text-lime-text">connected.</span>
      </h1>
      <p className="mt-5 max-w-md text-[16px] leading-relaxed text-muted">
        The page you asked for is not part of the prototype. The console, the analytics, the architecture and the business case are all one click away.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/" variant="accent">Back to overview</Button>
        <Button href="/console" variant="outline">Open the live console</Button>
      </div>
    </Container>
  )
}
