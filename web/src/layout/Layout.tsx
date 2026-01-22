import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  variant?: 'default' | 'wide' | 'narrow'
  noPadding?: boolean
}

/**
 * Layout component con Tailwind - Estructura consistente para todas las páginas
 * 
 * @param variant - 'default' (max-w-6xl), 'wide' (max-w-7xl), 'narrow' (max-w-4xl)
 * @param noPadding - Remueve padding vertical (útil para páginas con hero sections)
 */
export default function Layout({ children, variant = 'default', noPadding = false }: LayoutProps) {
  const maxWidthClass = {
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
    narrow: 'max-w-4xl',
  }[variant]

  const paddingClass = noPadding ? '' : 'py-12 sm:py-16 lg:py-20'

  return (
    <div className={`mx-auto ${maxWidthClass} ${paddingClass} px-4 sm:px-6 lg:px-8`}>
      {children}
    </div>
  )
}

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
}

/**
 * Header estandarizado para páginas - Sigue el patrón de About.tsx
 */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-12 space-y-4 lg:mb-16">
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">
          {eyebrow}
        </span>
      )}
      <h1 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-3xl text-sm text-gray-300 sm:text-base">
          {description}
        </p>
      )}
    </header>
  )
}

interface SectionProps {
  children: ReactNode
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Section wrapper para contenido con spacing consistente
 */
export function Section({ children, spacing = 'md', className = '' }: SectionProps) {
  const spacingClass = {
    sm: 'space-y-6',
    md: 'space-y-8',
    lg: 'space-y-12',
  }[spacing]

  return (
    <section className={`${spacingClass} ${className}`.trim()}>
      {children}
    </section>
  )
}
