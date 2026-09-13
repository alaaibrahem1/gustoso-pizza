import { CartItem, PizzaCrust, PizzaSize, Topping } from '../types';

/**
 * ============================================================================
 * GUSTOSO PIZZA CO. - CENTRALIZED PRICING & VAT ENGINE (SAUDI ARABIA / ZATCA)
 * ============================================================================
 *
 * Configurable Constants:
 * - VAT Rate: 15% (Kingdom of Saudi Arabia standard VAT)
 * - Standard Delivery Fee: 15 SAR
 * - Free Delivery Threshold: 150 SAR
 *
 * Order of Calculation:
 * 1. Calculate Gross Subtotal: sum of all item line prices (Unit Price × Quantity)
 * 2. Calculate Discounts: promo code discount + bundle deal savings
 * 3. Calculate Net Amount: Subtotal - Discounts (floored at 0)
 * 4. Calculate Delivery Fee:
 *    - If Delivery Method is 'pickup': 0 SAR
 *    - If Net Amount >= 150 SAR (Free Delivery Threshold): 0 SAR
 *    - Otherwise: 15 SAR
 * 5. Calculate VAT (15%):
 *    - In accordance with Saudi ZATCA VAT regulations, 15% VAT applies to
 *      net taxable goods and delivery service.
 *      VAT = (Net Amount + Delivery Fee) * 0.15
 * 6. Final Total:
 *    - Final Total = Net Amount + Delivery Fee + VAT
 * ============================================================================
 */

export const DEFAULT_VAT_RATE = 0.15; // 15%
export const DEFAULT_DELIVERY_FEE = 15; // 15 SAR
export const FREE_DELIVERY_THRESHOLD = 150; // 150 SAR

export interface PricingBreakdown {
  subtotal: number;
  discount: number;
  netSubtotal: number;
  deliveryFee: number;
  vatRate: number;
  vat: number;
  total: number;
  isFreeDelivery: boolean;
  amountNeededForFreeDelivery: number;
}

/**
 * Calculates the unit price for a customized pizza or standard product.
 */
export function calculateUnitPrice(
  basePrice: number,
  size?: PizzaSize,
  crust?: PizzaCrust,
  toppings: Topping[] = []
): number {
  let total = basePrice;

  if (size) {
    total += size.priceDelta;
  }

  if (crust) {
    total += crust.price;
  }

  if (toppings.length > 0) {
    const toppingsSum = toppings.reduce((acc, topping) => acc + topping.price, 0);
    total += toppingsSum;
  }

  return Number(total.toFixed(2));
}

/**
 * Calculates the total price for a given unit price and quantity.
 */
export function calculateItemTotal(unitPrice: number, quantity: number): number {
  return Number((unitPrice * Math.max(1, quantity)).toFixed(2));
}

/**
 * Calculates the subtotal of all items in the cart.
 */
export function calculateCartSubtotal(items: CartItem[]): number {
  const sum = items.reduce((acc, item) => acc + item.totalPrice, 0);
  return Number(sum.toFixed(2));
}

/**
 * Calculates the delivery fee based on delivery method, subtotal, and threshold.
 */
export function calculateDeliveryFee(
  subtotalAfterDiscount: number,
  deliveryMethod: 'delivery' | 'pickup' = 'delivery',
  fee: number = DEFAULT_DELIVERY_FEE,
  threshold: number = FREE_DELIVERY_THRESHOLD
): number {
  if (deliveryMethod === 'pickup') return 0;
  if (subtotalAfterDiscount <= 0) return 0;
  if (subtotalAfterDiscount >= threshold) return 0;
  return fee;
}

/**
 * Calculates the total discount amount for the cart based on active coupon.
 */
export function calculateCartDiscount(
  subtotal: number,
  coupon?: { type: 'percent' | 'fixed'; value: number; minOrder: number } | null
): number {
  if (!coupon || subtotal < coupon.minOrder) return 0;

  let discount = 0;
  if (coupon.type === 'percent') {
    discount = (subtotal * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  return Number(Math.min(discount, subtotal).toFixed(2));
}

/**
 * Centralized complete order pricing calculator with 15% VAT and delivery logic.
 */
export function calculateCompletePricing(params: {
  items: CartItem[];
  deliveryMethod?: 'delivery' | 'pickup';
  coupon?: { type: 'percent' | 'fixed'; value: number; minOrder: number } | null;
  vatRate?: number;
  baseDeliveryFee?: number;
  freeDeliveryThreshold?: number;
}): PricingBreakdown {
  const {
    items,
    deliveryMethod = 'delivery',
    coupon = null,
    vatRate = DEFAULT_VAT_RATE,
    baseDeliveryFee = DEFAULT_DELIVERY_FEE,
    freeDeliveryThreshold = FREE_DELIVERY_THRESHOLD,
  } = params;

  const subtotal = calculateCartSubtotal(items);
  const discount = calculateCartDiscount(subtotal, coupon);
  const netSubtotal = Number(Math.max(0, subtotal - discount).toFixed(2));

  const deliveryFee = calculateDeliveryFee(
    netSubtotal,
    deliveryMethod,
    baseDeliveryFee,
    freeDeliveryThreshold
  );

  const isFreeDelivery = deliveryMethod === 'pickup' || deliveryFee === 0;
  const amountNeededForFreeDelivery =
    deliveryMethod === 'delivery' && !isFreeDelivery
      ? Number(Math.max(0, freeDeliveryThreshold - netSubtotal).toFixed(2))
      : 0;

  // 15% VAT on net taxable amount + delivery fee
  const taxableBase = netSubtotal > 0 ? netSubtotal + deliveryFee : 0;
  const vat = Number((taxableBase * vatRate).toFixed(2));

  // Final Total
  const total = Number((taxableBase + vat).toFixed(2));

  return {
    subtotal,
    discount,
    netSubtotal,
    deliveryFee,
    vatRate,
    vat,
    total,
    isFreeDelivery,
    amountNeededForFreeDelivery,
  };
}

/**
 * Helper to generate a unique customization signature for comparison.
 */
export function generateCustomizationSignature(
  productId: string,
  size?: PizzaSize,
  crust?: PizzaCrust,
  toppings: Topping[] = [],
  specialInstructions: string = ''
): string {
  const sizePart = size ? size.id : 'default-size';
  const crustPart = crust ? crust.id : 'default-crust';
  const toppingsPart = toppings
    .map((t) => t.id)
    .sort()
    .join(',');
  const instructionsPart = specialInstructions.trim().toLowerCase();

  return `${productId}__${sizePart}__${crustPart}__[${toppingsPart}]__${instructionsPart}`;
}
