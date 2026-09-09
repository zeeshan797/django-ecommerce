import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { useAuthStore } from '@/stores/authStore';
import '@/styles/globals.css';

// Eagerly loaded — tiny, fast auth forms
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';

// Lazy-loaded — large pages that don't need to be in the initial bundle
const HomePage        = lazy(() => import('@/pages/Home'));
const ProductListing  = lazy(() => import('@/pages/Products'));
const ProductDetail   = lazy(() => import('@/pages/ProductDetail'));
const CartPage        = lazy(() => import('@/pages/Cart'));
const CheckoutPage    = lazy(() => import('@/pages/Checkout'));
const OrderConfirmation = lazy(() => import('@/pages/OrderConfirmation'));
const ProfilePage     = lazy(() => import('@/pages/Profile'));
const AdminDashboard  = lazy(() => import('@/pages/AdminDashboard'));

function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthInitializer() {
  useAuthStore();
  return null;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';
  return isAuthenticated ? <Navigate to={from} replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Public Store Routes */}
        <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
        <Route path="/products" element={<AppLayout><ProductListing /></AppLayout>} />
        <Route path="/products/:id" element={<AppLayout><ProductDetail /></AppLayout>} />
        <Route path="/cart" element={<AppLayout><CartPage /></AppLayout>} />

        {/* Protected User Routes */}
        <Route path="/checkout" element={<ProtectedRoute><AppLayout><CheckoutPage /></AppLayout></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><AppLayout><OrderConfirmation /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthInitializer />
        <AppRoutes />
        <Toaster position="top-right" richColors />
        <ReactQueryDevtools initialIsOpen={false} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}