import { CartItem, Order, UserProfile, DiscountCoupon } from '../types';

const STORAGE_KEYS = {
  CART: 'gustoso_cart_v1',
  FAVORITES: 'gustoso_favorites_v1',
  USER: 'gustoso_user_v1',
  ORDERS: 'gustoso_orders_v1',
  ACTIVE_COUPON: 'gustoso_coupon_v1',
};

const DEFAULT_USER: UserProfile = {
  id: 'usr_guest_01',
  name: 'Marco Rossi',
  email: 'marco.rossi@example.com',
  phone: '+1 (555) 234-5678',
  crustPoints: 340,
  savedAddresses: [
    {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      buildingOrApt: 'Apt 4B',
      notes: 'Ring buzzer #4, leave at door if no answer',
    },
    {
      street: '120 Market Street, Suite 300',
      city: 'Springfield',
      buildingOrApt: 'Floor 3',
      notes: 'Office reception',
    },
  ],
  createdAt: '2026-01-15T10:00:00.000Z',
};

// Initial seed orders for rich experience right out of the box!
const SEED_ORDERS: Order[] = [
  {
    id: 'ord-seed-1',
    orderNumber: 'GUS-98214',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    customer: {
      name: 'Marco Rossi',
      phone: '+1 (555) 234-5678',
      email: 'marco.rossi@example.com',
    },
    deliveryType: 'delivery',
    address: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      buildingOrApt: 'Apt 4B',
      notes: 'Ring buzzer #4',
    },
    scheduleTime: 'asap',
    paymentMethod: 'apple_pay',
    paymentStatus: 'paid',
    items: [
      {
        id: 'item-seed-1',
        productId: 'p-1',
        name: 'Pepperoni Diavola',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900&auto=format&fit=crop&q=80',
        category: 'pizza',
        basePrice: 15.99,
        selectedSize: { id: 'lg', name: 'Large (14")', inches: 14, slices: 10, priceDelta: 8.5 },
        selectedCrust: { id: 'stuffed', name: 'Mozzarella Stuffed Crust', description: 'Stuffed with mozzarella', price: 3.5 },
        selectedToppings: [
          { id: 'hot-honey', name: 'Spicy Chili Hot Honey', price: 1.5, category: 'sauce' },
        ],
        quantity: 1,
        unitPrice: 29.49,
        totalPrice: 29.49,
      },
      {
        id: 'item-seed-2',
        productId: 's-1',
        name: 'Loaded Truffle Parmesan Curly Fries',
        image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=900&auto=format&fit=crop&q=80',
        category: 'sides',
        basePrice: 6.99,
        selectedToppings: [],
        quantity: 1,
        unitPrice: 6.99,
        totalPrice: 6.99,
      },
    ],
    subtotal: 36.48,
    discount: 5.0,
    discountCode: 'PIZZA20',
    deliveryFee: 3.99,
    tax: 2.92,
    total: 38.39,
    status: 'delivered',
    estimatedDeliveryTime: '30 mins',
    rider: {
      name: 'Leonardo S.',
      phone: '+1 (555) 891-2345',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
  },
];

export const storageService = {
  getCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCart(cart: CartItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  },

  getFavorites(): string[] {
    if (typeof window === 'undefined') return ['p-1', 'p-3', 's-1'];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : ['p-1', 'p-3', 's-1'];
    } catch {
      return ['p-1', 'p-3', 's-1'];
    }
  },

  saveFavorites(favIds: string[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favIds));
    } catch (e) {
      console.error('Failed to save favorites to storage', e);
    }
  },

  getUser(): UserProfile {
    if (typeof window === 'undefined') return DEFAULT_USER;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  saveUser(user: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to storage', e);
    }
  },

  getOrders(): Order[] {
    if (typeof window === 'undefined') return SEED_ORDERS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : SEED_ORDERS;
    } catch {
      return SEED_ORDERS;
    }
  },

  saveOrders(orders: Order[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to storage', e);
    }
  },

  getActiveCoupon(): DiscountCoupon | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_COUPON);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveActiveCoupon(coupon: DiscountCoupon | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (coupon) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_COUPON, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_COUPON);
      }
    } catch (e) {
      console.error('Failed to save coupon to storage', e);
    }
  },
};
