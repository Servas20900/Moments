import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react'

export type FormFieldProps = {
  label: string
  error?: string
  help?: string
  required?: boolean
  children: ReactNode
}

const baseInput = 'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-[#c9a24d] focus:border-[#c9a24d]/60'
const errorInput = 'border-rose-400/60 focus:ring-rose-400 focus:border-rose-400/60'

const FormField = ({ label, error, help, required, children }: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-200 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-rose-400 text-sm">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="mt-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          <span>{error}</span>
        </div>
      )}
      {help && !error && <div className="text-xs text-gray-400">{help}</div>}
    </div>
  )
}

type InputFieldBaseProps = Omit<FormFieldProps, 'children'> & InputHTMLAttributes<HTMLInputElement>

export const InputField = ({ label, error, help, required, className = '', ...props }: InputFieldBaseProps) => {
  const classes = [baseInput, error ? errorInput : '', className].filter(Boolean).join(' ')
  return (
    <FormField label={label} error={error} help={help} required={required}>
      <input
        className={classes}
        {...props}
      />
    </FormField>
  )
}

type TextareaFieldBaseProps = Omit<FormFieldProps, 'children'> & TextareaHTMLAttributes<HTMLTextAreaElement>

export const TextareaField = ({ label, error, help, required, className = '', ...props }: TextareaFieldBaseProps) => {
  const classes = [baseInput, 'min-h-[120px]', error ? errorInput : '', className].filter(Boolean).join(' ')
  return (
    <FormField label={label} error={error} help={help} required={required}>
      <textarea
        className={classes}
        {...props}
      />
    </FormField>
  )
}

type SelectFieldBaseProps = Omit<FormFieldProps, 'children'> & SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export const SelectField = ({ label, error, help, required, options, placeholder, className = '', ...props }: SelectFieldBaseProps) => {
  const classes = [baseInput, error ? errorInput : '', className].filter(Boolean).join(' ')
  return (
    <FormField label={label} error={error} help={help} required={required}>
      <select
        className={classes}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}

export type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export const CheckboxField = ({ label, error, className = '', ...props }: CheckboxFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
        <input
          type="checkbox"
          className={['h-4 w-4 accent-[#c9a24d]', className].filter(Boolean).join(' ')}
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && (
        <div className="mt-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default FormField
