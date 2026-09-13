/**
 * Gustoso API Client
 * Centralizes all communication with the backend API routes.
 */

const TOKEN_STORAGE_KEY = 'gustoso_auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    register: (payload: { name: string; email: string; phone: string; password: string; confirmPassword: string }) =>
      request<{ message: string; token: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload: { email: string; password: string }) =>
      request<{ message: string; token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getMe: () => request<{ user: any }>('/api/auth/me'),
    updateProfile: (payload: { name?: string; phone?: string }) =>
      request<{ message: string; user: any }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  },

  // Addresses
  addresses: {
    list: () => request<any[]>('/api/addresses'),
    create: (address: any) =>
      request<any>('/api/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
      }),
    update: (id: string, address: any) =>
      request<any>(`/api/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(address),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/addresses/${id}`, {
        method: 'DELETE',
      }),
    setDefault: (id: string) =>
      request<any>(`/api/addresses/${id}/default`, {
        method: 'PATCH',
      }),
  },

  // Cart (Database-backed)
  cart: {
    get: () => request<any[]>('/api/cart'),
    addItem: (item: any) =>
      request<any[]>('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify(item),
      }),
    updateQuantity: (id: string, quantity: number) =>
      request<any[]>(`/api/cart/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    removeItem: (id: string) =>
      request<any[]>(`/api/cart/items/${id}`, {
        method: 'DELETE',
      }),
    clear: () =>
      request<{ message: string }>('/api/cart', {
        method: 'DELETE',
      }),
    mergeGuestCart: (guestItems: any[]) =>
      request<any[]>('/api/cart/merge', {
        method: 'POST',
        body: JSON.stringify({ guestItems }),
      }),
    sync: (guestItems: any[]) =>
      request<any[]>('/api/cart/merge', {
        method: 'POST',
        body: JSON.stringify({ guestItems }),
      }),
  },

  // Favorites (Database-backed)
  favorites: {
    list: () => request<string[]>('/api/favorites'),
    getAll: () => request<string[]>('/api/favorites'),
    toggle: (productId: string) =>
      request<{ isFavorited: boolean; favorites: string[] }>('/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }),
    mergeGuestFavorites: (guestFavorites: string[]) =>
      request<string[]>('/api/favorites/merge', {
        method: 'POST',
        body: JSON.stringify({ guestFavorites }),
      }),
  },

  // Orders
  orders: {
    create: (orderData: any) =>
      request<any>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    list: () => request<any[]>('/api/orders'),
    getById: (id: string) => request<any>(`/api/orders/${id}`),
  },

  // Public Menu Endpoints
  menu: {
    getProducts: () => request<any[]>('/api/products'),
    getCategories: () => request<any[]>('/api/categories'),
    getToppings: () => request<any[]>('/api/toppings'),
    getOffers: () => request<any[]>('/api/offers'),
    getCoupons: () => request<any[]>('/api/coupons'),
    validateCoupon: (code: string, subtotal: number) =>
      request<{ valid: boolean; coupon?: any; message?: string }>('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
      }),
  },

  // Admin Endpoints
  admin: {
    getOverview: () =>
      request<{
        totalSales: number;
        todaySales: number;
        totalOrders: number;
        pendingOrders: number;
        completedOrders: number;
        registeredCustomers: number;
        bestSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
      }>('/api/admin/overview'),
    getOrders: (status?: string) =>
      request<any[]>(`/api/admin/orders${status ? `?status=${status}` : ''}`),
    updateOrderStatus: (id: string, status: string) =>
      request<any>(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    getProducts: () => request<any[]>('/api/admin/products'),
    createProduct: (product: any) =>
      request<any>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(product),
      }),
    updateProduct: (id: string, product: any) =>
      request<any>(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      }),
    deleteProduct: (id: string) =>
      request<{ message: string }>(`/api/admin/products/${id}`, {
        method: 'DELETE',
      }),
    getCategories: () => request<any[]>('/api/admin/categories'),
    createCategory: (cat: any) =>
      request<any>('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(cat),
      }),
    updateCategory: (id: string, cat: any) =>
      request<any>(`/api/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cat),
      }),
    deleteCategory: (id: string) =>
      request<{ message: string }>(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      }),
    getToppings: () => request<any[]>('/api/admin/toppings'),
    createTopping: (topping: any) =>
      request<any>('/api/admin/toppings', {
        method: 'POST',
        body: JSON.stringify(topping),
      }),
    updateTopping: (id: string, topping: any) =>
      request<any>(`/api/admin/toppings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(topping),
      }),
    deleteTopping: (id: string) =>
      request<{ message: string }>(`/api/admin/toppings/${id}`, {
        method: 'DELETE',
      }),
    getOffers: () => request<any[]>('/api/admin/offers'),
    createOffer: (offer: any) =>
      request<any>('/api/admin/offers', {
        method: 'POST',
        body: JSON.stringify(offer),
      }),
    updateOffer: (id: string, offer: any) =>
      request<any>(`/api/admin/offers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(offer),
      }),
    deleteOffer: (id: string) =>
      request<{ message: string }>(`/api/admin/offers/${id}`, {
        method: 'DELETE',
      }),
    getCoupons: () => request<any[]>('/api/admin/coupons'),
    createCoupon: (coupon: any) =>
      request<any>('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(coupon),
      }),
    updateCoupon: (id: string, coupon: any) =>
      request<any>(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(coupon),
      }),
    deleteCoupon: (id: string) =>
      request<{ message: string }>(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      }),
    getCustomers: () =>
      request<
        Array<{
          id: string;
          name: string;
          email: string;
          phone: string;
          role: string;
          createdAt: string;
          ordersCount: number;
          totalSpent: number;
        }>
      >('/api/admin/customers'),
  },
};
