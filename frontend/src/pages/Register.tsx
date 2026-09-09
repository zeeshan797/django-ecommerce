import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Join us and start shopping today"
      footer={
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}