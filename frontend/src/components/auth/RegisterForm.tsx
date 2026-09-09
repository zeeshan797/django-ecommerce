'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/api/authApi';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  date_of_birth: z.string().optional(),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate: registerUser, isPending } = useRegister();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            type="text"
            placeholder="First name"
            {...register('first_name')}
            aria-invalid={!!errors.first_name}
            aria-describedby={errors.first_name ? 'first_name-error' : undefined}
          />
          {errors.first_name && (
            <p id="first_name-error" className="text-sm text-red-500" role="alert">
              {errors.first_name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            type="text"
            placeholder="Last name"
            {...register('last_name')}
            aria-invalid={!!errors.last_name}
            aria-describedby={errors.last_name ? 'last_name-error' : undefined}
          />
          {errors.last_name && (
            <p id="last_name-error" className="text-sm text-red-500" role="alert">
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Choose a username"
          {...register('username')}
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'username-error' : undefined}
        />
        {errors.username && (
          <p id="username-error" className="text-sm text-red-500" role="alert">
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-500" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
<div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            {...register('password')}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 014.243 4.243 3 3 0 01-4.243-4.243zm-4.243 0a3 3 0 014.243 4.243 3 3 0 01-4.243-4.243zm4.524 2.121a3 3 0 01-4.243 4.243 3 3 0 01-4.243-4.243zm-4.243 0a3 3 0 01-4.243-4.243 3 3 0 014.243 4.243zM3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
<div className="flex items-center justify-between">
            <Label htmlFor="password_confirm">Confirm Password</Label>
          </div>
          <div className="relative">
          <Input
            id="password_confirm"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            {...register('password_confirm')}
            aria-invalid={!!errors.password_confirm}
            aria-describedby={errors.password_confirm ? 'password_confirm-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 014.243 4.243 3 3 0 01-4.243-4.243zm-4.243 0a3 3 0 014.243 4.243 3 3 0 01-4.243-4.243zm4.524 2.121a3 3 0 01-4.243 4.243 3 3 0 01-4.243-4.243zm-4.243 0a3 3 0 01-4.243-4.243 3 3 0 014.243 4.243zM3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password_confirm && (
          <p className="text-sm text-red-500" role="alert">
            {errors.password_confirm.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}