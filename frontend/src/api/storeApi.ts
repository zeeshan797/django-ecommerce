import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_main: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: Category;
  category_id: number;
  description: string;
  price: string;
  compare_price: string | null;
  is_active: boolean;
  is_featured: boolean;
  stock: number;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
  discount_percentage: number;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface CartItem {
  id: number;
  product: Product;
  product_id: number;
  quantity: number;
  total_price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface Order {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  order_notes: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  discount_amount: string;
  tax_amount: string;
  shipping_amount: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  usage_limit: number | null;
  usage_limit_per_user: number;
  minimum_order_amount: string;
}

export interface CouponValidationResponse {
  valid: boolean;
  code?: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  final_amount?: number;
  error?: string;
}

// Product API
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<any>('/categories/').then(res => {
      if (Array.isArray(res.data)) return res.data as Category[];
      if (Array.isArray(res.data?.results)) return res.data.results as Category[];
      return [] as Category[];
    }),
  });
};

export const useProducts = (params?: {
  category?: string;
  search?: string;
  ordering?: string;
  min_price?: number;
  max_price?: number;
  featured?: boolean;
  availability?: string;
  rating?: string | number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.get<ProductsResponse>('/products/', { params }).then(res => res.data),
  });
};

export const useProduct = (idOrSlug: string | number) => {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => api.get<Product>(`/products/${idOrSlug}/`).then(res => res.data),
    enabled: !!idOrSlug,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get<any>('/products/', { params: { featured: true } }).then(res => {
      if (Array.isArray(res.data)) return res.data as Product[];
      if (Array.isArray(res.data?.results)) return res.data.results as Product[];
      return [] as Product[];
    }),
  });
};

// Cart API
export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get<Cart>('/cart/').then(res => res.data),
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) => 
      api.post('/cart/add-item/', { product_id: productId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) => 
      api.patch(`/cart/item/${itemId}/`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: number) => api.delete(`/cart/item/${itemId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.delete('/cart/clear/'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Orders API
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get<any>('/orders/').then(res => {
      if (Array.isArray(res.data)) return res.data as Order[];
      if (Array.isArray(res.data?.results)) return res.data.results as Order[];
      return [] as Order[];
    }),
  });
};

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get<Order>(`/orders/${id}/`).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      address_line_1: string;
      address_line_2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
      order_notes?: string;
      coupon_id?: number;
    }) => api.post('/orders/from-cart/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.post(`/orders/${id}/cancel/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// Coupons API
export const useValidateCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { code: string; order_amount: number }) => 
      api.post('/coupons/validate/', data),
    onSuccess: (response) => {
      queryClient.setQueryData(['coupon-validation', response.data.code], response.data);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/orders/${id}/status/`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCoupons = () => {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const res = await api.get<any>('/coupons/');
      return Array.isArray(res.data) ? res.data : (res.data.results || []);
    },
  });
};

// Payments API
export const useProcessCOD = () => {
  return useMutation({
    mutationFn: (orderId: number) => api.post('/payments/process-cod/', { order_id: orderId }),
  });
};

// Reviews API
export const useProductReviews = (productId: number) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => api.get(`/products/${productId}/reviews/`).then(res => res.data),
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { product: number; rating: number; comment: string }) => 
      api.post('/reviews/', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.product] });
    },
  });
};

// ─── Admin: Users ───────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  profile?: { phone_number?: string; city?: string; country?: string };
  date_joined?: string;
}

export const useAdminUsers = () =>
  useQuery({
    queryKey: ['admin-users'],
    queryFn: () =>
      api.get<any>('/auth/users/').then(res =>
        Array.isArray(res.data) ? res.data : (res.data.results ?? [])
      ),
  });

// ─── Admin: Product CRUD ─────────────────────────────────────────────────────

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => api.post('/products/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData | Record<string, any> }) => {
      const isForm = data instanceof FormData;
      return api.patch(`/products/${id}/`, data, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
};

// ─── Admin: Category CRUD ────────────────────────────────────────────────────

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; is_active?: boolean }) =>
      api.post('/categories/', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) =>
      api.patch(`/categories/${id}/`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
};

// ─── Admin: Coupon CRUD ───────────────────────────────────────────────────────

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Coupon>) => api.post('/coupons/', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Coupon> }) =>
      api.patch(`/coupons/${id}/`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/coupons/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });
};