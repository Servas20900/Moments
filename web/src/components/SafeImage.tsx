import { useMemo, useState } from 'react'
import type { ImgHTMLAttributes } from 'react'
import { cloudinaryUrl } from '../utils/media'

type SafeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  publicId?: string
  fallbackColor?: string
  transformWidth?: number
  transformHeight?: number
}

const SafeImage = ({
  publicId,
  src,
  alt,
  className = '',
  fallbackColor = 'linear-gradient(135deg, #161720, #0b0c10)',
  transformWidth = 1200,
  transformHeight,
  ...props
}: SafeImageProps) => {
  const [hasError, setHasError] = useState(false)

  const resolvedSrc = useMemo(() => {
    if (publicId) {
      return cloudinaryUrl(publicId, { width: transformWidth, height: transformHeight })
    }
    return src
  }, [publicId, src, transformHeight, transformWidth])

  if (!resolvedSrc || hasError) {
    return <div className={['image-fallback', className].join(' ')} style={{ background: fallbackColor }} aria-label={alt} />
  }

  return (
    <img
      className={className}
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      {...props}
    />
  )
}

export default SafeImage
