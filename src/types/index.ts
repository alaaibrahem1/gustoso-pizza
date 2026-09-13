export type ProductCategory = 'pizza' | 'burgers' | 'sides' | 'drinks' | 'desserts' | 'deals';

export interface PizzaSize {
  id: 'sm' | 'md' | 'lg';
  name: string;
  inches: number;
  slices: number;
  priceDelta: number;
}

export interface PizzaCrust {
  id: 'classic' | 'thin' | 'stuffed' | 'italian';
  name: string;
  description: string;
  price: number;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  category: 'cheese' | 'meat' | 'veggie' | 'sauce';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  category: ProductCategory;
  basePrice: number;
  sizes?: PizzaSize[];
  crusts?: PizzaCrust[];
  toppings?: Topping[];
  rating: number;
  reviews: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  discount?: number; // percentage
  oldPrice?: number;
  available: boolean;
  ingredients: string[];
  calories?: number;
  prepTimeMinutes?: number;
}

export interface AddOnItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: 'sides' | 'wings' | 'sauces' | 'drinks' | 'desserts';
  available: boolean;
  calories?: number;
}

export interface CartItem {
  id: string; // unique item instance id
  productId: string;
  name: string;
  image: string;
  category: ProductCategory;
  basePrice: number;
  selectedSize?: PizzaSize;
  selectedCrust?: PizzaCrust;
  selectedToppings: Topping[];
  specialInstructions?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isBundle?: boolean;
  originalPrice?: number;
  discountPercent?: number;
  bundleItems?: string[];
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  validUntil: string;
  code: string;
  image: string;
  includedItems: string[];
  productIdsToBundle: string[];
}

// ---------------------------------------------------------------------------
// ORDER & CHECKOUT DATA MODELS (PHASE 3)
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Cash on Delivery'
  | 'pending'
  | 'paid'
  | 'failed';

export type PaymentMethod =
  | 'cash_on_delivery'
  | 'card'
  | 'apple_pay'
  | 'cod'
  | 'google_pay';

export type PaymentMethodType = PaymentMethod; // alias for compatibility

export interface CustomerDetails {
  fullName?: string;
  name?: string; // alias
  phone: string;
  email: string;
}

export interface SaudiDeliveryAddress {
  city: string;
  district?: string;
  street: string;
  buildingNumber?: string;
  buildingOrApt?: string;
  apartmentOrUnit?: string;
  notes?: string;
}

export type DeliveryAddress = SaudiDeliveryAddress; // alias for compatibility

export interface PickupLocation {
  name: string;
  branch: string;
  address: string;
  city: string;
  estimatedPrepMinutes: number;
  instructions: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. GST-20260910-4821
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  discountCode?: string;
  deliveryFee: number;
  vat?: number;
  tax?: number;
  total: number;
  deliveryMethod?: 'delivery' | 'pickup';
  deliveryType?: 'delivery' | 'pickup';
  deliveryAddress?: SaudiDeliveryAddress;
  address?: SaudiDeliveryAddress;
  pickupLocation?: PickupLocation;
  scheduleTime?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus?: OrderStatus;
  status?: OrderStatus; // alias
  createdAt: string;
  estimatedTime?: string;
  estimatedDeliveryTime?: string;
  rider?: {
    name: string;
    phone: string;
    photo: string;
  };
}

export interface DiscountCoupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  description: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  crustPoints: number;
  savedAddresses: SaudiDeliveryAddress[];
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}
