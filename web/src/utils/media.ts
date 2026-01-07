type CloudinaryOptions = {
  width?: number
  height?: number
  quality?: number
}

export const cloudinaryUrl = (publicId: string, options: CloudinaryOptions = {}) => {
  const { width = 1400, height, quality = 85 } = options
  const size = height ? `c_fill,g_auto,w_${width},h_${height}` : `c_fill,g_auto,w_${width}`
  return `https://res.cloudinary.com/dcwxslhjf/image/upload/f_auto,q_${quality}/${size}/${publicId}`
}
