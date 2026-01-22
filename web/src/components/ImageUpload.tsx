import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { FaImage, FaTrash } from 'react-icons/fa'

export type ImageUploadProps = {
  label?: string
  value?: string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<string>
  error?: string
  required?: boolean
}

const ImageUpload = ({ label = 'Cargar imagen', value, onChange, onUpload, error, required = false }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }

    setIsUploading(true)
    try {
      const url = await onUpload(file)
      onChange(url)
    } catch (err) {
      alert('Error al subir la imagen')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const zoneBase = 'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/15 bg-white/5 px-4 py-8 text-center transition cursor-pointer'
  const zoneDragging = 'border-amber-300/60 bg-amber-500/5'
  const zoneDisabled = 'pointer-events-none opacity-70'

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-200 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-rose-400 text-sm">*</span>}
        </label>
      )}

      {!value ? (
        <div
          className={[zoneBase, isDragging ? zoneDragging : '', isUploading ? zoneDisabled : ''].filter(Boolean).join(' ')}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="text-sm text-gray-300">Subiendo imagen...</div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80">
                <FaImage />
              </div>
              <div className="space-y-1">
                <div className="text-base font-semibold text-white">Arrastra tu imagen aquí</div>
                <div className="text-sm text-gray-400">o haz clic para seleccionar (JPG, PNG, WebP - Máximo 5MB)</div>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            disabled={isUploading}
            aria-label="Subir imagen"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="overflow-hidden rounded-lg border border-white/10">
            <img src={value} alt="Preview" className="w-full max-h-56 object-cover" />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition hover:border-white/30 hover:bg-white/20"
              onClick={() => onChange('')}
              disabled={isUploading}
              aria-label="Eliminar imagen"
            >
              <FaTrash size={14} />
              Eliminar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
