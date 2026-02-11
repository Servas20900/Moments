import { useState } from 'react'
import { FaTrash, FaPlus } from 'react-icons/fa'
import Button from '../Button'
import { InputField } from '../FormField'

interface ListItemInputProps {
  label: string
  required?: boolean
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  error?: string
  description?: string
}

export default function ListItemInput({
  label,
  required = false,
  items,
  onChange,
  placeholder = 'Ej: Aire acondicionado',
  error,
  description,
}: ListItemInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addItem = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (!items.includes(trimmed)) {
      onChange([...items, trimmed])
      setInputValue('')
    }
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-white">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      </div>

      {description && <p className="text-xs text-gray-400">{description}</p>}

      {/* Input y botón para agregar items */}
      <div className="flex gap-2">
        <InputField
          label=""
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center justify-center rounded-lg border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-amber-300 transition hover:border-amber-300/60 hover:bg-amber-400/20 disabled:opacity-50"
          disabled={!inputValue.trim()}
          title="Agregar item (Enter)"
        >
          <FaPlus size={16} />
        </button>
      </div>

      {/* Lista de items */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No hay items agregados. Escribe uno y presiona Enter o haz clic en el botón +</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 group hover:bg-white/10 transition"
              >
                <span className="text-sm text-gray-100 truncate">
                  <span className="text-amber-300/70 mr-2">•</span>
                  {item}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="inline-flex items-center justify-center rounded-md p-1 text-gray-400 transition opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
                  title="Eliminar"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="text-xs text-gray-400">
        {items.length === 0 ? 'Sin items' : `${items.length} item${items.length !== 1 ? 's' : ''}`}
      </div>

      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
