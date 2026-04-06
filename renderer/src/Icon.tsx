import type { ReactElement } from 'react'

export function Icon({
  children,
  size = 16,
  className,
}: {
  children: ReactElement
  size?: number
  className?: string
}) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      {children}
    </span>
  )
}
