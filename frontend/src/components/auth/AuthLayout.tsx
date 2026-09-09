import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ 
  title, 
  description, 
  children, 
  footer 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ShopVibe
            </span>
          </Link>
        </div>
        <Card className="shadow-lg border-gray-100 rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">{title}</CardTitle>
            {description && (
              <CardDescription className="text-gray-500 text-sm">{description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
          </CardContent>
          {footer && (
            <CardContent className="space-y-4">
              <Separator />
              {footer}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}