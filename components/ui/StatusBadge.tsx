export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    const baseStyles = 'rounded-full font-medium';
    const sizeStyles = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };

    const statusStyles = {
      pending: 'bg-amber-100 text-amber-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      'out-of-stock': 'bg-gray-100 text-gray-800',
      available: 'bg-emerald-100 text-emerald-800'
    };

    return `${baseStyles} ${sizeStyles[size]} ${statusStyles[status.toLowerCase()] || statusStyles.pending}`;
  };

  return (
    <span className={getStatusStyles()}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
