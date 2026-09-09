import { Button } from '@/components/ui/button';
import { PackageOpen, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLink?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-16 px-6 bg-white rounded-2xl border border-gray-200/80 shadow-xs max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100/60 shadow-2xs">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1.5 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
