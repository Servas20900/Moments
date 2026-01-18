import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react'

export type FormFieldProps = {
  label: string
  error?: string
  help?: string
  required?: boolean
  children: ReactNode
}

const FormField = ({ label, error, help, required, children }: FormFieldProps) => {
  return (
    <div className="admin-form__group">
      {label && (
        <label className="admin-form__label">
          <span className="admin-form__label-text">
            {label}
            {required && <span className="admin-form__required">*</span>}
          </span>
        </label>
      )}
      {children}
      {error && (
        <div className="admin-form__error">
          <span>{error}</span>
        </div>
      )}
      {help && !error && <div className="admin-form__help">{help}</div>}
    </div>
  )
}

type InputFieldBaseProps = Omit<FormFieldProps, 'children'> & InputHTMLAttributes<HTMLInputElement>

export const InputField = ({ label, error, help, required, className = '', ...props }: InputFieldBaseProps) => {
  return (
    <FormField label={label} error={error} help={help} required={required}>
      <input
        className={`${error ? 'error' : ''} ${className}`.trim()}
        {...props}
      />
    </FormField>
  )
}

type TextareaFieldBaseProps = Omit<FormFieldProps, 'children'> & TextareaHTMLAttributes<HTMLTextAreaElement>

export const TextareaField = ({ label, error, help, required, className = '', ...props }: TextareaFieldBaseProps) => {
  return (
    <FormField label={label} error={error} help={help} required={required}>
      <textarea
        className={`${error ? 'error' : ''} ${className}`.trim()}
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
  return (
    <FormField label={label} error={error} help={help} required={required}>
      <select
        className={`${error ? 'error' : ''} ${className}`.trim()}
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
    <div className="admin-form__group">
      <label className="admin-form__checkbox">
        <input
          type="checkbox"
          className={className}
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && (
        <div className="admin-form__error">
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default FormField
