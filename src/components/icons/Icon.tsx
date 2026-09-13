import { icons, type IconName, type IconVariant } from './svg'

const VARIANT_FALLBACK: IconVariant[] = ['outlined', 'filled']

type IconProps = {
  name: IconName
  variant?: IconVariant
  size?: number
  className?: string
  title?: string
}

export function Icon({
  name,
  variant = 'outlined',
  size = 20,
  className,
  title,
}: IconProps) {
  const paths = icons[name]
  const ds =
    paths[variant] ??
    VARIANT_FALLBACK.map((key) => paths[key]).find((value) => value?.length) ??
    []

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {ds.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export type { IconName, IconVariant }
