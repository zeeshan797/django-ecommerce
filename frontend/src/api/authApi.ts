import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: {
    phone_number: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    date_of_birth: string | null;
    profile_picture: string | null;
  };
}

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RegisterData) => api.post('/auth/register/', data),
    onSuccess: (response) => {
      const { access, refresh, user } = response.data;
      setAuth({ access, refresh }, user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Registration successful! Welcome!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data: Record<string, string[]> } };
      const message = err.response?.data 
        ? Object.values(err.response.data).flat().join(', ')
        : 'Registration failed';
      toast.error(message);
    },
  });
};

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LoginData) => api.post('/auth/login/', data),
    onSuccess: (response) => {
      const { access, refresh, user } = response.data;
      setAuth({ access, refresh }, user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Welcome back!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data: { detail?: string } } };
      const message = err.response?.data?.detail || 'Invalid credentials';
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.post('/auth/logout/'),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: () => {
      // Even if backend logout fails, clear local auth
      clearAuth();
      queryClient.clear();
    },
  });
};

export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<User>('/auth/profile/').then((res) => res.data),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  
  return useMutation({
    mutationFn: (data: Partial<User>) => api.patch('/auth/profile/', data),
    onSuccess: (response) => {
      const updatedUser = response.data;
      setUser(updatedUser);
      queryClient.setQueryData(['profile'], updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data: Record<string, string[]> } };
      const message = err.response?.data 
        ? Object.values(err.response.data).flat().join(', ')
        : 'Failed to update profile';
      toast.error(message);
    },
  });
};

export const useRefreshToken = () => {
  const { refreshToken, updateTokens, clearAuth } = useAuthStore();
  
  return useMutation({
    mutationFn: () => api.post('/auth/refresh/', { refresh: refreshToken }),
    onSuccess: (response) => {
      const { access } = response.data;
      updateTokens({ access, refresh: response.data.refresh });
    },
    onError: () => {
      clearAuth();
    },
  });
};

export interface Address {
  id: number;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  address_type: 'shipping' | 'billing' | 'both';
  created_at: string;
}

export const useAddresses = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get<Address[] | { results: Address[] }>('/auth/addresses/');
      return Array.isArray(res.data) ? res.data : res.data.results || [];
    },
    enabled: isAuthenticated,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Address, 'id' | 'created_at'>) => api.post('/auth/addresses/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address saved successfully');
    },
    onError: () => {
      toast.error('Failed to save address');
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Address> & { id: number }) => api.patch(`/auth/addresses/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address updated');
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/auth/addresses/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
    onError: () => {
      toast.error('Failed to delete address');
    },
  });
};