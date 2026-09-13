import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import { AddOnItem, CartItem, DiscountCoupon, Offer, Product, ToastMessage } from '../types';
import {
  calculateCompletePricing,
  calculateItemTotal,
  DEFAULT_DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  generateCustomizationSignature,
  PricingBreakdown,
} from '../utils/pricing';
import { ACTIVE_COUPONS } from '../data/menuData';
import { api } from '../services/api';

const STORAGE_KEYS = {
  CART: 'gustoso_cart_items_v3',
  FAVORITES: 'gustoso_favorite_ids_v3',
  COUPON: 'gustoso_applied_coupon_v3',
  DELIVERY_METHOD: 'gustoso_delivery_method_v3',
};

interface CartContextType {
  // Safe mounting
  isMounted: boolean;

  // Cart Items & Actions
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  vat: number;
  estimatedTotal: number;
  pricing: PricingBreakdown;
  deliveryMethod: 'delivery' | 'pickup';
  setDeliveryMethod: (method: 'delivery' | 'pickup') => void;

  // Coupon
  appliedCoupon: DiscountCoupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Drawer state
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Cart operations
  addToCart: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  addOfferToCart: (offer: Offer) => void;
  addAddOnToCart: (addon: AddOnItem) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: (silent?: boolean) => void;
  reorderItems: (items: CartItem[]) => void;

  // Favorites
  favorites: string[];
  favoritesCount: number;
  isFavoritesOpen: boolean;
  openFavorites: () => void;
  closeFavorites: () => void;
  toggleFavorites: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  removeFavorite: (productId: string) => void;

  // Upsell ("Complete Your Order") Modal
  isUpsellOpen: boolean;
  lastAddedPizza: CartItem | null;
  closeUpsell: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const isLoadedFromStorageRef = useRef<boolean>(false);

  // Cart State (Initialized safely with SSR defaults)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethodState] = useState<'delivery' | 'pickup'>('delivery');
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Favorites State (Safe SSR default)
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Upsell State
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [lastAddedPizza, setLastAddedPizza] = useState<CartItem | null>(null);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Safe client-side storage initialization on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      const savedMethod = localStorage.getItem(STORAGE_KEYS.DELIVERY_METHOD);
      if (savedMethod === 'pickup' || savedMethod === 'delivery') {
        setDeliveryMethodState(savedMethod);
      }

      const savedCoupon = localStorage.getItem(STORAGE_KEYS.COUPON);
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }

      const savedFavs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      } else {
        setFavorites(['p-1', 'p-2']);
      }
    } catch (e) {
      console.error('Failed to load initial data from storage', e);
      setFavorites(['p-1', 'p-2']);
    } finally {
      isLoadedFromStorageRef.current = true;
    }
  }, []);

  // Persist Cart (only after storage has been loaded on client)
  useEffect(() => {
    if (!isLoadedFromStorageRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
    // Sync to backend DB if logged in
    if (typeof window !== 'undefined' && localStorage.getItem('gustoso_auth_token')) {
      api.cart.sync(cart).catch((err) => {
        console.warn('Backend cart sync note:', err.message);
      });
    }
  }, [cart]);

  // Persist Favorites (only after storage has been loaded on client)
  useEffect(() => {
    if (!isLoadedFromStorageRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to persist favorites', e);
    }
  }, [favorites]);

  // Initial Sync from backend if logged in
  useEffect(() => {
    const token = localStorage.getItem('gustoso_auth_token');
    if (token) {
      // Sync favorites
      api.favorites
        .getAll()
        .then((remoteFavs) => {
          if (Array.isArray(remoteFavs) && remoteFavs.length > 0) {
            setFavorites((prev) => Array.from(new Set([...prev, ...remoteFavs])));
          }
        })
        .catch(() => {});

      // Sync cart
      api.cart
        .get()
        .then((remoteCart) => {
          if (Array.isArray(remoteCart) && remoteCart.length > 0) {
            setCart((localCart) => {
              // Merge local items with remote items by signature
              const merged = [...remoteCart];
              localCart.forEach((localItem) => {
                const targetSig = generateCustomizationSignature(
                  localItem.productId,
                  localItem.selectedSize,
                  localItem.selectedCrust,
                  localItem.selectedToppings,
                  localItem.specialInstructions
                );
                const exists = merged.some((m) => {
                  const mSig = generateCustomizationSignature(
                    m.productId,
                    m.selectedSize,
                    m.selectedCrust,
                    m.selectedToppings,
                    m.specialInstructions
                  );
                  return mSig === targetSig;
                });
                if (!exists) {
                  merged.push(localItem);
                }
              });
              return merged;
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  // Persist Delivery Method
  const setDeliveryMethod = (method: 'delivery' | 'pickup') => {
    setDeliveryMethodState(method);
    try {
      localStorage.setItem(STORAGE_KEYS.DELIVERY_METHOD, method);
    } catch {}
  };

  // Persist Coupon
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(STORAGE_KEYS.COUPON, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(STORAGE_KEYS.COUPON);
      }
    } catch {}
  }, [appliedCoupon]);

  // Toast Helpers
  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Coupon Actions
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = ACTIVE_COUPONS.find((c) => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return { success: false, message: 'Invalid promo code. Please check and try again.' };
    }

    const currentSubtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
    if (currentSubtotal < found.minOrder) {
      return {
        success: false,
        message: `This promo requires a minimum order of ${found.minOrder} SAR.`,
      };
    }

    setAppliedCoupon(found);
    showToast({
      title: `Promo code ${found.code} applied!`,
      message: found.description,
      type: 'success',
    });

    return { success: true, message: `Promo code ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    if (appliedCoupon) {
      const oldCode = appliedCoupon.code;
      setAppliedCoupon(null);
      showToast({
        title: 'Promo removed',
        message: `Code ${oldCode} was removed`,
        type: 'info',
      });
    }
  };

  // Add customized or standard item to cart
  const addToCart = (itemData: Omit<CartItem, 'id' | 'totalPrice'>) => {
    const targetSig = generateCustomizationSignature(
      itemData.productId,
      itemData.selectedSize,
      itemData.selectedCrust,
      itemData.selectedToppings,
      itemData.specialInstructions
    );

    let newlyCreatedItem: CartItem;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => {
        const itemSig = generateCustomizationSignature(
          item.productId,
          item.selectedSize,
          item.selectedCrust,
          item.selectedToppings,
          item.specialInstructions
        );
        return itemSig === targetSig;
      });

      if (existingIndex > -1) {
        const copy = [...prev];
        const updatedQty = copy[existingIndex].quantity + itemData.quantity;
        const updatedItem = {
          ...copy[existingIndex],
          quantity: updatedQty,
          totalPrice: calculateItemTotal(copy[existingIndex].unitPrice, updatedQty),
        };
        copy[existingIndex] = updatedItem;
        newlyCreatedItem = updatedItem;
        return copy;
      } else {
        const newItem: CartItem = {
          ...itemData,
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          totalPrice: calculateItemTotal(itemData.unitPrice, itemData.quantity),
        };
        newlyCreatedItem = newItem;
        return [...prev, newItem];
      }
    });

    showToast({
      title: `Added ${itemData.name} to cart`,
      message: itemData.selectedSize ? `${itemData.selectedSize.name}` : undefined,
      type: 'success',
    });

    // If item is a pizza, trigger the "Complete Your Order" upsell modal
    if (itemData.category === 'pizza') {
      setTimeout(() => {
        setLastAddedPizza(newlyCreatedItem);
        setIsUpsellOpen(true);
      }, 400);
    }
  };

  // Add bundle offer directly to cart
  const addOfferToCart = (offer: Offer) => {
    const bundleItem: CartItem = {
      id: `bundle-${offer.id}-${Date.now()}`,
      productId: offer.id,
      name: offer.title,
      image: offer.image,
      category: 'deals',
      basePrice: offer.originalPrice,
      selectedToppings: [],
      quantity: 1,
      unitPrice: offer.discountedPrice,
      totalPrice: offer.discountedPrice,
      isBundle: true,
      originalPrice: offer.originalPrice,
      discountPercent: offer.discountPercent,
      bundleItems: offer.includedItems,
    };

    setCart((prev) => [...prev, bundleItem]);

    showToast({
      title: `Deal added: ${offer.title}`,
      message: `You saved ${offer.discountPercent}%!`,
      type: 'success',
    });
  };

  // Add add-on directly to cart
  const addAddOnToCart = (addon: AddOnItem) => {
    addToCart({
      productId: addon.id,
      name: addon.name,
      image: addon.image,
      category: addon.category === 'wings' || addon.category === 'sauces' ? 'sides' : addon.category,
      basePrice: addon.price,
      selectedToppings: [],
      quantity: 1,
      unitPrice: addon.price,
    });
  };

  // Update item quantity
  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const copy: CartItem[] = [];
      for (const item of prev) {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          if (newQty > 0) {
            copy.push({
              ...item,
              quantity: newQty,
              totalPrice: calculateItemTotal(item.unitPrice, newQty),
            });
          }
        } else {
          copy.push(item);
        }
      }
      return copy;
    });
  };

  // Remove specific line item from cart
  const removeFromCart = (itemId: string) => {
    const item = cart.find((i) => i.id === itemId);
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    if (item) {
      showToast({
        title: `Removed ${item.name}`,
        type: 'info',
      });
    }
  };

  // Clear entire cart
  const clearCart = (silent: boolean = false) => {
    setCart([]);
    setAppliedCoupon(null);
    if (!silent) {
      showToast({
        title: 'Cart cleared',
        message: 'All items removed from your cart',
        type: 'info',
      });
    }
  };

  // Reorder previous items
  const reorderItems = (items: CartItem[]) => {
    if (!items || items.length === 0) return;

    // Generate fresh unique IDs for reordered items
    const freshItems: CartItem[] = items.map((item) => ({
      ...item,
      id: `reorder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      totalPrice: calculateItemTotal(item.unitPrice, item.quantity),
    }));

    setCart((prev) => [...prev, ...freshItems]);
    setIsCartOpen(true);

    showToast({
      title: 'Previous order items added to cart! 🍕',
      message: `${items.length} items ready for checkout`,
      type: 'success',
    });
  };

  // Centralized pricing calculation with 15% VAT & delivery fee
  const pricing = useMemo(() => {
    return calculateCompletePricing({
      items: cart,
      deliveryMethod,
      coupon: appliedCoupon,
    });
  }, [cart, deliveryMethod, appliedCoupon]);

  const subtotal = pricing.subtotal;
  const discount = pricing.discount;
  const deliveryFee = pricing.deliveryFee;
  const vat = pricing.vat;
  const estimatedTotal = pricing.total;

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Favorites logic
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];

      showToast({
        title: exists ? 'Removed from favorites' : 'Saved to favorites ❤️',
        type: exists ? 'info' : 'success',
      });

      if (localStorage.getItem('gustoso_auth_token')) {
        api.favorites.toggle(productId).catch((err) => {
          console.warn('Backend favorite sync note:', err.message);
        });
      }

      return updated;
    });
  };

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
    showToast({
      title: 'Removed from favorites',
      type: 'info',
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);
  const favoritesCount = favorites.length;

  return (
    <CartContext.Provider
      value={{
        isMounted,
        cart,
        cartCount,
        subtotal,
        discount,
        deliveryFee,
        vat,
        estimatedTotal,
        pricing,
        deliveryMethod,
        setDeliveryMethod,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        addToCart,
        addOfferToCart,
        addAddOnToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        reorderItems,
        favorites,
        favoritesCount,
        isFavoritesOpen,
        openFavorites: () => setIsFavoritesOpen(true),
        closeFavorites: () => setIsFavoritesOpen(false),
        toggleFavorites: () => setIsFavoritesOpen((prev) => !prev),
        toggleFavorite,
        isFavorite,
        removeFavorite,
        isUpsellOpen,
        lastAddedPizza,
        closeUpsell: () => setIsUpsellOpen(false),
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
