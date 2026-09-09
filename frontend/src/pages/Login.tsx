import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your account to continue shopping"
      footer={
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}