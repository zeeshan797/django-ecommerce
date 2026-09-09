import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'bg-blue-50 text-blue-700 border border-blue-200/60',
        secondary: 'bg-slate-100 text-slate-800 border border-slate-200',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
        warning: 'bg-amber-50 text-amber-800 border border-amber-200/60',
        danger: 'bg-rose-50 text-rose-700 border border-rose-200/60',
        outline: 'border border-gray-200 text-gray-700 bg-white',
        dark: 'bg-slate-900 text-white shadow-2xs',
        discount: 'bg-rose-600 text-white shadow-2xs',
        featured: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-2xs',
      },
      size: {
        default: 'px-2.5 py-0.5 text-[11px]',
        sm: 'px-2 py-0.2 text-[10px]',
        lg: 'px-3.5 py-1 text-xs',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </div>
  );
}
