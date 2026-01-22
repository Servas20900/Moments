import type { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<{
  className?: string
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}>

const Card = ({ className = '', title, subtitle, actions, children }: CardProps) => {
  const base = 'relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] p-6 backdrop-blur'
  return (
    <article className={[base, className].filter(Boolean).join(' ')}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {title && <h3 className="text-lg font-semibold leading-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="grid gap-4">{children}</div>
    </article>
  )
}

export default Card
