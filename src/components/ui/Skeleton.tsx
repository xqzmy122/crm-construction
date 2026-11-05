export const SkeletonRows = ({ rows = 5 }: { rows?: number }) => (
  <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
    {Array.from({ length: rows }, (_, index) => (
      <div
        key={index}
        className="border-b border-line px-4 py-3 last:border-0"
      >
        <div className="h-3.5 w-1/3 rounded bg-bg" />
        <div className="mt-2 h-3 w-1/2 rounded bg-bg" />
      </div>
    ))}
  </div>
)
