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

      {!value ? (
        <div
          className={`admin-form__image-upload-zone ${isDragging ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <div className="admin-form__loading" style={{ borderBottom: 'none' }}>
                Subiendo imagen...
              </div>
            </>
          ) : (
            <>
              <div className="admin-form__image-upload-icon">
                <FaImage />
              </div>
              <div className="admin-form__image-upload-text">
                <div className="admin-form__image-upload-title">Arrastra tu imagen aquí</div>
                <div className="admin-form__image-upload-subtitle">
                  o haz clic para seleccionar (JPG, PNG, WebP - Máximo 5MB)
                </div>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            disabled={isUploading}
            aria-label="Subir imagen"
          />
        </div>
      ) : (
        <div className="admin-form__image-preview">
          <div className="admin-form__image-preview-container">
            <img src={value} alt="Preview" />
          </div>
          <div className="admin-form__image-preview-actions">
            <button
              type="button"
              className="admin-form__image-remove-btn"
              onClick={() => onChange('')}
              disabled={isUploading}
              aria-label="Eliminar imagen"
            >
              <FaTrash style={{ marginRight: '6px' }} />
              Eliminar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="admin-form__error">
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
