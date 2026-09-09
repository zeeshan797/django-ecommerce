import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart } from '@/api/storeApi';

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  setCart: (cart: Cart) => void;
  addItem: (item: any) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  totalItems: number;
  totalPrice: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      error: null,
      
      setCart: (cart) => set({ cart }),
      
      addItem: (item) => set((state) => {
        if (!state.cart) return state;
        const existingItem = state.cart.items.find(i => i.product_id === item.product_id);
        
        if (existingItem) {
          return {
            cart: {
              ...state.cart,
              items: state.cart.items.map(i =>
                i.product_id === item.product_id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            },
          };
        }
        
        return {
          cart: {
            ...state.cart,
            items: [...state.cart.items, { ...item, id: Date.now() }],
          },
        };
      }),
      
      updateQuantity: (itemId, quantity) => set((state) => {
        if (!state.cart) return state;
        if (quantity <= 0) {
          return {
            cart: {
              ...state.cart,
              items: state.cart.items.filter(i => i.id !== itemId),
            },
          };
        }
        
        return {
          cart: {
            ...state.cart,
            items: state.cart.items.map(i =>
              i.id === itemId ? { ...i, quantity } : i
            ),
          },
        };
      }),
      
      removeItem: (itemId) => set((state) => {
        if (!state.cart) return state;
        return {
          cart: {
            ...state.cart,
            items: state.cart.items.filter(i => i.id !== itemId),
          },
        };
      }),
      
      clearCart: () => set({ cart: null }),
      
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Computed
      get totalItems() {
        return get().cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
      },
      
      get totalPrice() {
        return get().cart?.items.reduce((sum, item) => sum + item.total_price, 0) || 0;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);