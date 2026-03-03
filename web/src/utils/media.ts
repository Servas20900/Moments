type CloudinaryOptions = {
  width?: number
  height?: number
  quality?: number
}

export const cloudinaryUrl = (publicId: string, options: CloudinaryOptions = {}) => {
  const { width = 1400, height, quality = 85 } = options
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim()
  if (!cloudName || !publicId?.trim()) return ''
  const size = height ? `c_fill,g_auto,w_${width},h_${height}` : `c_fill,g_auto,w_${width}`
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${quality}/${size}/${publicId}`
}

export const getCloudinaryCloud = () => {
  return import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || ''
}

export const getCloudinaryUploadPreset = () => {
  return import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'moments_unsigned'
}
