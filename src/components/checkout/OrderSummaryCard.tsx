import React, { useState } from 'react';
import { Tag, Sparkles, X, Check, ChevronDown, ChevronUp, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/currency';
import { FREE_DELIVERY_THRESHOLD } from '../../utils/pricing';

interface OrderSummaryCardProps {
  onPlaceOrder: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  onPlaceOrder,
  isSubmitting,
  isValid,
}) => {
  const {
    cart,
    pricing,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    deliveryMethod,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponError(null);
    const res = applyCoupon(couponCodeInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCodeInput('');
    }
  };

  const freeDeliveryProgress = Math.min(
    100,
    Math.round((pricing.netSubtotal / FREE_DELIVERY_THRESHOLD) * 100)
  );

  return (
    <div
      id="checkout-order-summary"
      className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden sticky top-24"
    >
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="flex items-center gap-2 text-stone-900 font-bold text-sm"
        >
          <ShoppingBag className="w-4 h-4 text-red-600" />
          <span>Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
          {isMobileExpanded ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </button>
        <span className="font-bold text-stone-900 text-base">{formatPrice(pricing.total)}</span>
      </div>

      {/* Main Container - Collapsible on Mobile, Always visible on Desktop */}
      <div className={`${isMobileExpanded ? 'block' : 'hidden'} lg:block p-6 sm:p-7 space-y-6`}>
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <h3 className="text-lg font-bold text-stone-900 font-display">Order Summary</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
            {cart.reduce((s, i) => s + i.quantity, 0)} items
          </span>
        </div>

        {/* Free Delivery Bar (If Delivery Method is 'delivery') */}
        {deliveryMethod === 'delivery' && (
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              {pricing.isFreeDelivery ? (
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Unlocked FREE Delivery!
                </span>
              ) : (
                <span className="text-stone-600 font-medium">
                  Add <strong>{formatPrice(pricing.amountNeededForFreeDelivery)}</strong> more for{' '}
                  <strong className="text-emerald-700">FREE Delivery</strong>
                </span>
              )}
              <span className="text-[11px] font-bold text-stone-400">{freeDeliveryProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="max-h-60 overflow-y-auto space-y-3.5 pr-1 divide-y divide-stone-100">
          {cart.map((item) => (
            <div key={item.id} className="pt-3.5 first:pt-0 flex items-start gap-3 text-xs">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0 bg-stone-100"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-stone-900 truncate">{item.name}</h4>
                  <span className="font-bold text-stone-900 shrink-0">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>

                <p className="text-stone-500 text-[11px] mt-0.5">
                  Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                </p>

                {/* Customizations tags */}
                <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-stone-500">
                  {item.selectedSize && (
                    <span className="px-1.5 py-0.5 rounded bg-stone-100 font-medium">
                      {item.selectedSize.name}
                    </span>
                  )}
                  {item.selectedCrust && (
                    <span className="px-1.5 py-0.5 rounded bg-stone-100 font-medium">
                      {item.selectedCrust.name}
                    </span>
                  )}
                  {item.selectedToppings.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-medium">
                      +{item.selectedToppings.length} toppings
                    </span>
                  )}
                  {item.isBundle && (
                    <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-bold">
                      Bundle Deal
                    </span>
                  )}
                </div>

                {item.specialInstructions && (
                  <p className="text-[10px] text-stone-400 italic mt-1 truncate">
                    Note: "{item.specialInstructions}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Promo Code Input */}
        <div className="pt-3 border-t border-stone-100">
          {appliedCoupon ? (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">{appliedCoupon.code}</span>
                  <span className="text-[11px] text-emerald-700">{appliedCoupon.description}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                title="Remove Coupon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => {
                    setCouponCodeInput(e.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  placeholder="Promo Code (e.g. GUSTOSO10)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium uppercase tracking-wider focus:outline-hidden focus:border-stone-400 bg-stone-50/50"
                />
                <button
                  type="submit"
                  disabled={!couponCodeInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-[11px] text-red-600 pl-1">{couponError}</p>
              )}
            </form>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="pt-4 border-t border-stone-100 space-y-2.5 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">{formatPrice(pricing.subtotal)}</span>
          </div>

          {pricing.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Discount Savings
              </span>
              <span>-{formatPrice(pricing.discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-stone-600">
            <span>
              Delivery Fee {deliveryMethod === 'pickup' ? '(Self Pickup)' : ''}
            </span>
            <span className="font-semibold">
              {pricing.deliveryFee === 0 ? (
                <span className="text-emerald-600 font-bold uppercase tracking-wider">FREE</span>
              ) : (
                formatPrice(pricing.deliveryFee)
              )}
            </span>
          </div>

          <div className="flex justify-between text-stone-600">
            <span className="flex items-center gap-1">
              VAT (15% ZATCA)
            </span>
            <span className="font-semibold text-stone-900">{formatPrice(pricing.vat)}</span>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-bold text-stone-900">Total Due</span>
              <p className="text-[10px] text-stone-400">All prices include 15% VAT</p>
            </div>
            <span className="text-xl sm:text-2xl font-black text-stone-900 font-display">
              {formatPrice(pricing.total)}
            </span>
          </div>
        </div>

        {/* Place Order CTA Button */}
        <button
          id="checkout-place-order-button"
          type="button"
          disabled={isSubmitting}
          onClick={onPlaceOrder}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            isSubmitting
              ? 'bg-stone-600 cursor-wait'
              : 'bg-red-600 hover:bg-red-700 active:scale-[0.99] shadow-red-600/20'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending Order to Stone Oven...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Place Order • {formatPrice(pricing.total)}</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-stone-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Guaranteed hot & fresh delivery or on the house</span>
        </p>
      </div>
    </div>
  );
};
