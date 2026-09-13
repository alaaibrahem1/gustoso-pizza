import React from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Pizza,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/currency';

interface CartDrawerProps {
  onContinueShopping: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onContinueShopping,
  onProceedToCheckout,
}) => {
  const {
    cart,
    cartCount,
    pricing,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    closeCart();
    onProceedToCheckout();
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs transition-opacity flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCart();
      }}
    >
      <div
        id="cart-drawer-panel"
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 border-l border-stone-200"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#fdfbf7]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-stone-900 font-display">Your Order Cart</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-xs text-stone-500">Fresh from Gustoso stone oven</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={() => clearCart()}
                className="text-xs text-stone-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.id}
                id={`cart-item-row-${item.id}`}
                className="p-4 rounded-2xl border border-stone-200 bg-[#fdfbf7]/80 hover:bg-white transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Item Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Title & Customization Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-sm sm:text-base font-bold text-stone-900 font-display leading-tight truncate">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bundle Label if Offer */}
                    {item.isBundle && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full mt-1">
                        <Tag className="w-3 h-3" />
                        Special Bundle
                      </span>
                    )}

                    {/* Customization pills */}
                    {(item.selectedSize || item.selectedCrust) && (
                      <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-stone-600 font-medium">
                        {item.selectedSize && (
                          <span className="bg-stone-100 px-2 py-0.5 rounded-md">
                            {item.selectedSize.name}
                          </span>
                        )}
                        {item.selectedCrust && (
                          <span className="bg-stone-100 px-2 py-0.5 rounded-md">
                            {item.selectedCrust.name}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Selected Extra Toppings */}
                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                      <div className="mt-1 text-[11px] text-stone-500">
                        <span className="font-semibold text-stone-700">Extra Toppings: </span>
                        {item.selectedToppings.map((t) => t.name).join(', ')}
                      </div>
                    )}

                    {/* Bundle items list */}
                    {item.bundleItems && item.bundleItems.length > 0 && (
                      <div className="mt-1 text-[11px] text-stone-500">
                        <span className="font-semibold text-stone-700">Includes: </span>
                        {item.bundleItems.join(' • ')}
                      </div>
                    )}

                    {/* Special kitchen notes */}
                    {item.specialInstructions && (
                      <p className="mt-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md italic">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Quantity Controls & Price */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-200 rounded-xl bg-white p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-700 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-700 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Pricing Display */}
                  <div className="text-right">
                    <div className="text-xs text-stone-400">
                      {formatPrice(item.unitPrice)} each
                    </div>
                    <div className="text-base font-extrabold text-stone-900 font-display">
                      {formatPrice(item.totalPrice)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty Cart View */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-inner">
                <Pizza className="w-10 h-10 animate-pulse-soft" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-stone-900 font-display">
                  Your cart is hungry!
                </h4>
                <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xs mx-auto">
                  You haven’t added any stone-baked pizzas, loaded sides, or drinks yet.
                </p>
              </div>
              <button
                onClick={() => {
                  closeCart();
                  onContinueShopping();
                }}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                Browse Delicious Menu
              </button>
            </div>
          )}
        </div>

        {/* Footer Order Summary & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-[#fdfbf7] space-y-3">
            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">{formatPrice(pricing.subtotal)}</span>
              </div>

              {pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Promo / Bundle Savings
                  </span>
                  <span>-{formatPrice(pricing.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-500 text-xs">
                <span>Delivery & 15% VAT</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between text-base sm:text-lg font-black text-stone-900 font-display">
                <span>Estimated Total (SAR)</span>
                <span className="text-red-600">{formatPrice(pricing.total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                id="cart-proceed-checkout-btn"
                onClick={handleCheckoutClick}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/25 hover:shadow-red-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  closeCart();
                  onContinueShopping();
                }}
                className="w-full py-2.5 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
