import { FaCheckCircle } from 'react-icons/fa'
import type { Incluido } from '../api/api'

interface IncluidosSelectionProps {
  incluidosGrouped: Record<number, { categoria: { id: number; nombre: string }; incluidos: Incluido[] }>
  selectedIncluidoIds: string[]
  onChange: (selectedIds: string[]) => void
}

const IncluidosSelection = ({ incluidosGrouped, selectedIncluidoIds, onChange }: IncluidosSelectionProps) => {
  const hasIncluidos = Object.keys(incluidosGrouped).length > 0

  if (!hasIncluidos) {
    return null
  }

  const toggleIncluido = (incluidoId: string) => {
    const isSelected = selectedIncluidoIds.includes(incluidoId)
    if (isSelected) {
      onChange(selectedIncluidoIds.filter(id => id !== incluidoId))
    } else {
      onChange([...selectedIncluidoIds, incluidoId])
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Bebidas e Incluidos</h3>
        <p className="text-sm text-gray-600">
          Selecciona tus preferencias de lo que está incluido en tu paquete
        </p>
      </div>

      <div className="space-y-6">
        {Object.values(incluidosGrouped).map((group) => (
          <div key={group.categoria.id} className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
            <h4 className="font-semibold text-gray-800 mb-3 uppercase text-xs tracking-wide">
              {group.categoria.nombre}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.incluidos.map((inc) => {
                const isSelected = selectedIncluidoIds.includes(inc.id)
                return (
                  <button
                    key={inc.id}
                    type="button"
                    onClick={() => toggleIncluido(inc.id)}
                    className={`
                      relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className={`
                      flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                      ${isSelected ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}
                    `}>
                      {isSelected && <FaCheckCircle className="text-white text-sm" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                        {inc.nombre}
                      </p>
                      {inc.descripcion && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {inc.descripcion}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Nota:</strong> Estos elementos ya están incluidos en tu paquete sin costo adicional.
          Selecciona tus preferencias para personalizar tu experiencia.
        </p>
      </div>
    </div>
  )
}

export default IncluidosSelection
