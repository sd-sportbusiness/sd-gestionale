import { create } from 'zustand';
import type { CartItem, AppliedDiscount } from '../types';

interface CartState {
  cart: CartItem[];
  selectedCustomerId: string;
  selectedPriceListId: string;
  cartDiscounts: AppliedDiscount[];

  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  setCart: (cart: CartItem[]) => void;
  setCustomerId: (id: string) => void;
  setPriceListId: (id: string) => void;
  addCartDiscount: (discount: AppliedDiscount) => void;
  removeCartDiscount: (code: string) => void;
  addProductDiscount: (productId: string, discount: AppliedDiscount) => void;
  removeProductDiscount: (productId: string, code: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  selectedCustomerId: '',
  selectedPriceListId: '',
  cartDiscounts: [],

  addToCart: (item) =>
    set((state) => {
      const existingIndex = state.cart.findIndex(
        (cartItem) => cartItem.product.id === item.product.id
      );

      if (existingIndex >= 0) {
        const updatedCart = [...state.cart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1,
        };
        return { cart: updatedCart };
      }

      return { cart: [...state.cart, item] };
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { cart: state.cart.filter((item) => item.product.id !== productId) };
      }

      return {
        cart: state.cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      };
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),

  setCart: (cart) => set({ cart }),

  setCustomerId: (id) => set({ selectedCustomerId: id }),

  setPriceListId: (id) => set({ selectedPriceListId: id }),

  addCartDiscount: (discount) =>
    set((state) => {
      const exists = state.cartDiscounts.some((d) => d.code === discount.code);
      if (exists) return state;
      return { cartDiscounts: [...state.cartDiscounts, discount] };
    }),

  removeCartDiscount: (code) =>
    set((state) => ({
      cartDiscounts: state.cartDiscounts.filter((d) => d.code !== code),
    })),

  addProductDiscount: (productId, discount) =>
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.product.id === productId) {
          const discounts = item.discounts || [];
          const exists = discounts.some((d) => d.code === discount.code);
          if (exists) return item;
          return { ...item, discounts: [...discounts, discount] };
        }
        return item;
      }),
    })),

  removeProductDiscount: (productId, code) =>
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.product.id === productId && item.discounts) {
          return {
            ...item,
            discounts: item.discounts.filter((d) => d.code !== code),
          };
        }
        return item;
      }),
    })),

  clearCart: () =>
    set((state) => ({
      cart: [],
      selectedCustomerId: '',
      cartDiscounts: [],
      selectedPriceListId: state.selectedPriceListId,
    })),
}));
