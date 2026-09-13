import { Order, OrderStatus, PaymentMethod, PaymentStatus, PickupLocation, SaudiDeliveryAddress, CartItem } from '../types';
import { api } from './api';

const ORDERS_STORAGE_KEY = 'gustoso_orders_history_v3';

export const DEFAULT_PICKUP_LOCATION: PickupLocation = {
  name: 'Gustoso Artisanal Pizzeria',
  branch: 'Al Olaya Flagship Branch',
  address: 'Building 42, King Fahd Road, Al Olaya District',
  city: 'Riyadh',
  estimatedPrepMinutes: 20,
  instructions: 'Please head to the pickup counter inside the restaurant and show your order number to the barista.',
  phone: '+966 11 456 7890',
};

/**
 * Generates an authentic order number.
 * Example: GST-20260910-4821
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateSegment = `${year}${month}${day}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return `GST-${dateSegment}-${randomSuffix}`;
}

/**
 * Retrieves all saved orders from local storage.
 */
export function getSavedOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const orders: Order[] = JSON.parse(raw);
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error('Failed to parse saved orders from localStorage:', error);
    return [];
  }
}

/**
 * Retrieves a single order by either its internal ID or orderNumber.
 */
export function getOrderById(orderIdOrNumber: string): Order | null {
  const orders = getSavedOrders();
  const found = orders.find(
    (o) => o.id === orderIdOrNumber || o.orderNumber.toLowerCase() === orderIdOrNumber.toLowerCase()
  );
  return found || null;
}

/**
 * Saves a new order to backend database API and updates localStorage cache.
 */
export async function createOrderAsync(
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>
): Promise<Order> {
  let createdDbOrder: any = null;
  try {
    // Attempt backend persistence
    createdDbOrder = await api.orders.create({
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      deliveryFee: orderData.deliveryFee || 0,
      vat: orderData.vat || 0,
      total: orderData.total,
      deliveryMethod: orderData.deliveryMethod,
      customerSnapshot: orderData.customer,
      deliveryAddressSnapshot: orderData.deliveryAddress,
      pickupLocationSnapshot: orderData.pickupLocation,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus,
      discountCode: orderData.promoCode,
      notes: orderData.deliveryAddress?.notes,
    });
  } catch (err) {
    console.warn('Backend API order creation failed or running offline, using local fallback:', err);
  }

  const orderNumber = createdDbOrder?.orderNumber || generateOrderNumber();
  const id = createdDbOrder?.id || `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = createdDbOrder?.createdAt || new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id,
    orderNumber,
    createdAt,
    status: orderData.orderStatus,
  };

  const currentOrders = getSavedOrders();
  const updated = [newOrder, ...currentOrders.filter((o) => o.id !== newOrder.id)];

  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save order to localStorage:', err);
  }

  return newOrder;
}

/**
 * Saves a new order to localStorage and returns it (synchronous fallback).
 */
export function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
  const orderNumber = generateOrderNumber();
  const id = `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id,
    orderNumber,
    createdAt,
    status: orderData.orderStatus, // ensure alias is populated
  };

  const currentOrders = getSavedOrders();
  const updated = [newOrder, ...currentOrders];

  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save order to localStorage:', err);
  }

  // Fire and forget backend persist if possible
  api.orders
    .create({
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      deliveryFee: orderData.deliveryFee || 0,
      vat: orderData.vat || 0,
      total: orderData.total,
      deliveryMethod: orderData.deliveryMethod,
      customerSnapshot: orderData.customer,
      deliveryAddressSnapshot: orderData.deliveryAddress,
      pickupLocationSnapshot: orderData.pickupLocation,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus,
      discountCode: orderData.promoCode,
      notes: orderData.deliveryAddress?.notes,
    })
    .catch((e) => console.warn('Background sync of order to DB failed:', e));

  return newOrder;
}

/**
 * Updates the status of an existing order.
 */
export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const orders = getSavedOrders();
  const index = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
  if (index === -1) return null;

  orders[index].orderStatus = status;
  orders[index].status = status;

  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to update order status in localStorage:', err);
  }

  return orders[index];
}

/**
 * Order status timeline step configuration
 */
export interface StatusStep {
  key: OrderStatus;
  label: string;
  labelAr: string;
  description: string;
  stepIndex: number;
}

export const ORDER_TIMELINE_STEPS: StatusStep[] = [
  {
    key: 'Confirmed',
    label: 'Order Confirmed',
    labelAr: 'تم تأكيد الطلب',
    description: 'Your order has been received by our stone oven kitchen.',
    stepIndex: 1,
  },
  {
    key: 'Preparing',
    label: 'Kitchen Preparing',
    labelAr: 'جاري التحضير بالفرن',
    description: 'Fresh dough hand-stretched & artisanal toppings layered.',
    stepIndex: 2,
  },
  {
    key: 'Ready',
    label: 'Oven Blistered & Packed',
    labelAr: 'جاهز ومعبأ',
    description: 'Baked at 450°C and packed into thermal heat-retaining box.',
    stepIndex: 3,
  },
  {
    key: 'Out for Delivery',
    label: 'Out for Delivery',
    labelAr: 'خرج للتوصيل',
    description: 'Your courier is en route with your piping hot pizza.',
    stepIndex: 4,
  },
  {
    key: 'Delivered',
    label: 'Delivered',
    labelAr: 'تم التوصيل بنجاح',
    description: 'Buon appetito! Enjoy your Gustoso feast.',
    stepIndex: 5,
  },
];

/**
 * Helper to get active step index (1-based)
 */
export function getTimelineStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'Pending':
      return 0;
    case 'Confirmed':
      return 1;
    case 'Preparing':
      return 2;
    case 'Ready':
      return 3;
    case 'Out for Delivery':
      return 4;
    case 'Delivered':
      return 5;
    case 'Cancelled':
      return -1;
    default:
      return 1;
  }
}
