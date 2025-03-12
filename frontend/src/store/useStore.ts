import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface User {
  email: string;
  role: 'user' | 'admin';
}

interface Store {
  cart: CartItem[];
  isCartOpen: boolean;
  isDarkMode: boolean;
  searchQuery: string;
  user: User | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCart: () => void;
  toggleDarkMode: () => void;
  setSearchQuery: (query: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      cart: [],
      isCartOpen: false,
      isDarkMode: false,
      searchQuery: '',
      user: null,
      addToCart: (product) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        })),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'mercados-mi-punto-store',
    }
  )
);