interface EmptyStateProps {
  message: string
}

export const EmptyState = ({ message }: EmptyStateProps) => (
  <div className="p-6">
    <div className="text-center py-8">
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  </div>
)
