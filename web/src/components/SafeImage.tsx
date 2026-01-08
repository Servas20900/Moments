import { useMemo, useState } from 'react'
import type { ImgHTMLAttributes } from 'react'
import { cloudinaryUrl } from '../utils/media'

type SafeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  publicId?: string
  fallbackColor?: string
  transformWidth?: number
  transformHeight?: number
  width?: number | string
  height?: number | string
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
    return (
      <div
        className={['image-fallback', className].filter(Boolean).join(' ')}
        style={{ background: fallbackColor }}
        role="img"
        aria-label={alt}
      />
    )
  }

  return (
    <img
      className={className}
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={props.width ?? transformWidth}
      height={props.height ?? transformHeight}
      onError={() => setHasError(true)}
      {...props}
    />
  )
}

export default SafeImage
