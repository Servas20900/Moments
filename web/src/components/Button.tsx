import type { ButtonHTMLAttributes } from 'react'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
  size?: 'md' | 'lg'
}

const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) => {
  const classes = ['btn', `btn-${variant}`, `btn-${size}`, className].filter(Boolean).join(' ')
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
