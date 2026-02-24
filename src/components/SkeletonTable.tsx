export default function SkeletonTable() {
  return (
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-2 py-2">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
