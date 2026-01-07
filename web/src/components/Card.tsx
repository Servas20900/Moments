import type { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<{
  className?: string
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}>

const Card = ({ className = '', title, subtitle, actions, children }: CardProps) => {
  return (
    <article className={['card', className].filter(Boolean).join(' ')}>
      {(title || actions) && (
        <header className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      <div className="card__body">{children}</div>
    </article>
  )
}

export default Card
