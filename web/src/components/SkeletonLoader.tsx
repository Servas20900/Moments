// Skeleton loader components for loading states

interface SkeletonProps {
  circle?: boolean
  height?: number
  width?: string | number
  className?: string
}

const Skeleton = ({ circle = false, height = 16, width = '100%', className = '' }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse ${circle ? 'rounded-full' : 'rounded'} bg-gradient-to-r from-slate-700 to-slate-600 ${className}`}
      style={{
        height: `${height}px`,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    />
  )
}

interface SkeletonCardProps {
  count?: number
  showImage?: boolean
}

export const SkeletonCard = ({ count = 3, showImage = true }: SkeletonCardProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-4">
          {showImage && (
            <Skeleton height={200} className="w-full" />
          )}
          <Skeleton height={20} width="80%" />
          <Skeleton height={16} width="60%" />
          <div className="space-y-2 pt-2">
            <Skeleton height={12} width="90%" />
            <Skeleton height={12} width="85%" />
          </div>
        </div>
      ))}
    </>
  )
}

interface SkeletonDetailProps {
  showImage?: boolean
}

export const SkeletonDetail = ({ showImage = true }: SkeletonDetailProps) => {
  return (
    <div className="space-y-8">
      {showImage && (
        <Skeleton height={400} className="w-full rounded-xl" />
      )}
      <div className="space-y-4">
        <Skeleton height={32} width="60%" />
        <Skeleton height={20} width="40%" />
        <div className="space-y-3 pt-4">
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="95%" />
          <Skeleton height={16} width="90%" />
        </div>
      </div>
      <div className="space-y-3 pt-4">
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="85%" />
      </div>
      <Skeleton height={48} width="100%" className="rounded-lg mt-8" />
    </div>
  )
}

interface SkeletonGridProps {
  count?: number
  cols?: number
  showImage?: boolean
}

export const SkeletonGrid = ({ count = 6, cols = 3, showImage = true }: SkeletonGridProps) => {
  const gridCols = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'
  
  return (
    <div className={`grid grid-cols-1 ${gridCols} lg:grid-cols-3 gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} count={1} showImage={showImage} />
      ))}
    </div>
  )
}

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton height={40} width="20%" className="rounded" />
          <Skeleton height={40} width="30%" className="rounded" />
          <Skeleton height={40} width="25%" className="rounded" />
          <Skeleton height={40} width="25%" className="rounded" />
        </div>
      ))}
    </div>
  )
}

export default Skeleton
