import type { ButtonHTMLAttributes } from 'react'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
  size?: 'md' | 'lg'
}

const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) => {
  const base = 'inline-flex items-center justify-center rounded-full font-semibold tracking-tight transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg,#0b0c10)] disabled:opacity-60 disabled:cursor-not-allowed'
  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base'
  }
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-gradient-to-br from-[#c9a24d] to-[#e0bc6a] text-[#0b0c10] shadow-[0_12px_30px_rgba(201,162,77,0.35)] hover:-translate-y-[1px] hover:shadow-[0_18px_34px_rgba(224,188,106,0.45)] focus-visible:ring-[#c9a24d]',
    ghost: 'bg-white/10 border border-white/20 text-white hover:border-white/30 hover:bg-white/20 focus-visible:ring-[#c9a24d]'
  }

  const classes = [base, sizes[size], variants[variant], className].filter(Boolean).join(' ')

  return (
    <button
      className={classes}
      {...props}
      type={props.type || 'button'}
    >
      {children}
    </button>
  )
}

export default Button
