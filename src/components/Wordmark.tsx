import { Link } from '@tanstack/react-router'

export function Wordmark({ to = '/' }: { to?: '/' | '/app' }) {
  return (
    <Link to={to} className="wordmark" aria-label="Flow home">
      <span className="wordmark-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      Flow
    </Link>
  )
}
