import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  CartItem,
  Product,
  Order,
  OrderStatus,
  UserProfile,
  DiscountCoupon,
  ToastMessage,
  DeliveryAddress,
} from '../types';
import { storageService } from '../services/storageService';
import { ACTIVE_COUPONS, PRODUCTS } from '../data/menuData';

export type AppRoute =
  | 'home'
  | 'menu'
  | 'offers'
  | 'favorites'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'account'
  | 'admin'
  | 'about'
  | 'contact';

interface AppContextType {
  // Navigation & Route
  currentRoute: AppRoute;
  routeParam: string | null;
  navigate: (route: AppRoute, param?: string) => void;

  // Cart
  cart: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  deliveryType: 'delivery' | 'pickup';
  setDeliveryType: (type: 'delivery' | 'pickup') => void;
  activeCoupon: DiscountCoupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Pricing breakdown
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  total: number;

  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Product Customizer Modal
  customizingProduct: Product | null;
  openCustomizer: (product: Product) => void;
  closeCustomizer: () => void;

  // Quick Search Modal
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // User & Authentication (Mocked / Local state)
  currentUser: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addSavedAddress: (address: DeliveryAddress) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  // Orders & Tracking
  orders: Order[];
  activeOrder: Order | null;
  placeOrder: (orderPayload: {
    customer: { name: string; phone: string; email: string };
    deliveryType: 'delivery' | 'pickup';
    address?: DeliveryAddress;
    scheduleTime: 'asap' | string;
    paymentMethod: 'card' | 'cod' | 'apple_pay' | 'google_pay';
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  viewOrderTracking: (orderId: string) => void;
  reorder: (order: Order) => void;

  // Toast System
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper for parsing initial URL path
function parseUrlPath(): { route: AppRoute; param: string | null } {
  if (typeof window === 'undefined') return { route: 'home', param: null };
  const path = window.location.pathname.replace(/^\//, '').split('/');
  const segment = path[0]?.toLowerCase() || '';

  if (segment === 'menu') return { route: 'menu', param: path[1] || null };
  if (segment === 'offers') return { route: 'offers', param: null };
  if (segment === 'favorites') return { route: 'favorites', param: null };
  if (segment === 'cart') return { route: 'cart', param: null };
  if (segment === 'checkout') return { route: 'checkout', param: null };
  if (segment === 'order-confirmation' || segment === 'orders') {
    return { route: 'order-confirmation', param: path[1] || null };
  }
  if (segment === 'account') return { route: 'account', param: null };
  if (segment === 'admin') return { route: 'admin', param: null };
  if (segment === 'about') return { route: 'about', param: null };
  if (segment === 'contact') return { route: 'contact', param: null };

  return { route: 'home', param: null };
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseUrlPath().route);
  const [routeParam, setRouteParam] = useState<string | null>(() => parseUrlPath().param);

  // Cart & Orders State
  const [cart, setCart] = useState<CartItem[]>(() => storageService.getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [activeCoupon, setActiveCoupon] = useState<DiscountCoupon | null>(() => storageService.getActiveCoupon());

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => storageService.getFavorites());

  // Modals
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storageService.getUser());

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => storageService.getOrders());
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    const all = storageService.getOrders();
    return all.length > 0 ? all[0] : null;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Keep URL synced with route
  const navigate = (route: AppRoute, param?: string) => {
    setCurrentRoute(route);
    setRouteParam(param || null);

    let path = '/';
    if (route !== 'home') {
      path = `/${route}${param ? `/${param}` : ''}`;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({ route, param }, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser popstate (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const { route, param } = parseUrlPath();
      setCurrentRoute(route);
      setRouteParam(param);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync Cart to LocalStorage
  useEffect(() => {
    storageService.saveCart(cart);
  }, [cart]);

  // Sync Favorites to LocalStorage
  useEffect(() => {
    storageService.saveFavorites(favorites);
  }, [favorites]);

  // Sync Orders to LocalStorage
  useEffect(() => {
    storageService.saveOrders(orders);
  }, [orders]);

  // Sync User to LocalStorage
  useEffect(() => {
    storageService.saveUser(currentUser);
  }, [currentUser]);

  // Sync Coupon
  useEffect(() => {
    storageService.saveActiveCoupon(activeCoupon);
  }, [activeCoupon]);

  // Toast Helper
  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const addToCart = (itemData: Omit<CartItem, 'id' | 'totalPrice'>) => {
    const calculatedUnitPrice = itemData.unitPrice;
    const itemTotal = Number((calculatedUnitPrice * itemData.quantity).toFixed(2));

    // Check if an identical customized item exists (matching productId, size, crust, and toppings)
    const existingIndex = cart.findIndex((i) => {
      const sameProduct = i.productId === itemData.productId;
      const sameSize = i.selectedSize?.id === itemData.selectedSize?.id;
      const sameCrust = i.selectedCrust?.id === itemData.selectedCrust?.id;
      const toppingIds1 = (i.selectedToppings || []).map((t) => t.id).sort().join(',');
      const toppingIds2 = (itemData.selectedToppings || []).map((t) => t.id).sort().join(',');
      const sameToppings = toppingIds1 === toppingIds2;
      return sameProduct && sameSize && sameCrust && sameToppings;
    });

    if (existingIndex > -1) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + itemData.quantity;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        totalPrice: Number((updated[existingIndex].unitPrice * newQty).toFixed(2)),
      };
      setCart(updated);
    } else {
      const newItem: CartItem = {
        ...itemData,
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        totalPrice: itemTotal,
      };
      setCart((prev) => [...prev, newItem]);
    }

    showToast({
      title: `${itemData.name} added to cart! 🍕`,
      message: `${itemData.quantity}x ${itemData.selectedSize ? itemData.selectedSize.name : ''}`,
      type: 'success',
      actionLabel: 'View Cart',
      onAction: () => setIsCartOpen(true),
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: Number((item.unitPrice * newQty).toFixed(2)),
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (itemId: string) => {
    const item = cart.find((i) => i.id === itemId);
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    if (item) {
      showToast({
        title: 'Item removed',
        message: `${item.name} removed from your cart`,
        type: 'info',
      });
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // Coupons
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = ACTIVE_COUPONS.find((c) => c.code === cleanCode);

    if (!found) {
      return { success: false, message: 'Invalid coupon code. Try "PIZZA20" or "GUSTOSO10".' };
    }

    const currentSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    if (currentSubtotal < found.minOrder) {
      return {
        success: false,
        message: `Order must be at least $${found.minOrder.toFixed(2)} to use code ${found.code}.`,
      };
    }

    setActiveCoupon(found);
    showToast({
      title: `Coupon applied: ${found.code}! 🎉`,
      message: found.description,
      type: 'success',
    });
    return { success: true, message: `Coupon applied: ${found.description}` };
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    showToast({
      title: 'Coupon removed',
      type: 'info',
    });
  };

  // Pricing calculations
  const subtotal = useMemo(() => {
    return Number(cart.reduce((acc, item) => acc + item.totalPrice, 0).toFixed(2));
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!activeCoupon) return 0;
    if (subtotal < activeCoupon.minOrder) return 0;

    if (activeCoupon.type === 'percent') {
      return Number(((subtotal * activeCoupon.value) / 100).toFixed(2));
    }
    return Number(Math.min(activeCoupon.value, subtotal).toFixed(2));
  }, [subtotal, activeCoupon]);

  const deliveryFee = useMemo(() => {
    if (deliveryType === 'pickup') return 0;
    if (activeCoupon?.code === 'FREESHIP' && subtotal >= 20) return 0;
    return 3.99;
  }, [deliveryType, activeCoupon, subtotal]);

  const taxAmount = useMemo(() => {
    const taxable = Math.max(0, subtotal - discountAmount);
    return Number((taxable * 0.0825).toFixed(2));
  }, [subtotal, discountAmount]);

  const total = useMemo(() => {
    return Number(Math.max(0, subtotal - discountAmount + deliveryFee + taxAmount).toFixed(2));
  }, [subtotal, discountAmount, deliveryFee, taxAmount]);

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Favorites operations
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      const product = PRODUCTS.find((p) => p.id === productId);

      showToast({
        title: exists ? 'Removed from favorites' : 'Saved to favorites ❤️',
        message: product?.name,
        type: exists ? 'info' : 'success',
      });

      return updated;
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  // User Profile
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
    showToast({
      title: 'Profile updated',
      type: 'success',
    });
  };

  const addSavedAddress = (address: DeliveryAddress) => {
    setCurrentUser((prev) => ({
      ...prev,
      savedAddresses: [...prev.savedAddresses, address],
    }));
    showToast({
      title: 'Address saved',
      type: 'success',
    });
  };

  // Orders & Checkout
  const placeOrder = async (orderPayload: {
    customer: { name: string; phone: string; email: string };
    deliveryType: 'delivery' | 'pickup';
    address?: DeliveryAddress;
    scheduleTime: 'asap' | string;
    paymentMethod: 'card' | 'cod' | 'apple_pay' | 'google_pay';
  }): Promise<Order> => {
    const randomOrderNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `GUS-${randomOrderNum}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customer: orderPayload.customer,
      deliveryType: orderPayload.deliveryType,
      address: orderPayload.address,
      scheduleTime: orderPayload.scheduleTime,
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: orderPayload.paymentMethod === 'cod' ? 'pending' : 'paid',
      items: [...cart],
      subtotal,
      discount: discountAmount,
      discountCode: activeCoupon?.code,
      deliveryFee,
      tax: taxAmount,
      total,
      status: 'confirmed',
      estimatedDeliveryTime: orderPayload.deliveryType === 'delivery' ? '30-40 mins' : '15-20 mins',
      rider: {
        name: 'Matteo V.',
        phone: '+1 (555) 392-8811',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      },
    };

    // Update loyalty points
    const earnedPoints = Math.round(total * 2);
    setCurrentUser((prev) => ({
      ...prev,
      crustPoints: prev.crustPoints + earnedPoints,
    }));

    // Update state
    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    setActiveCoupon(null);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated = { ...order, status };
          if (activeOrder?.id === orderId) {
            setActiveOrder(updated);
          }
          return updated;
        }
        return order;
      }),
    );

    showToast({
      title: `Order status updated: ${status.toUpperCase()}`,
      type: 'info',
    });
  };

  const viewOrderTracking = (orderId: string) => {
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      setActiveOrder(found);
      navigate('order-confirmation', orderId);
    }
  };

  const reorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        productId: item.productId,
        name: item.name,
        image: item.image,
        category: item.category,
        basePrice: item.basePrice,
        selectedSize: item.selectedSize,
        selectedCrust: item.selectedCrust,
        selectedToppings: item.selectedToppings,
        specialInstructions: item.specialInstructions,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    });
    setIsCartOpen(true);
    showToast({
      title: 'Previous order items added to cart! 🛒',
      type: 'success',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        routeParam,
        navigate,
        cart,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        deliveryType,
        setDeliveryType,
        activeCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        deliveryFee,
        taxAmount,
        total,
        favorites,
        toggleFavorite,
        isFavorite,
        customizingProduct,
        openCustomizer: (product: Product) => setCustomizingProduct(product),
        closeCustomizer: () => setCustomizingProduct(null),
        isSearchOpen,
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        searchQuery,
        setSearchQuery,
        currentUser,
        updateUserProfile,
        addSavedAddress,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        orders,
        activeOrder,
        placeOrder,
        updateOrderStatus,
        viewOrderTracking,
        reorder,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
