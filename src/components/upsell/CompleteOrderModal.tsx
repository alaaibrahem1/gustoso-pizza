import React, { useState } from 'react';
import { X, Sparkles, Plus, Check, ArrowRight, Pizza } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { UPSELL_SUGGESTIONS } from '../../data/addOnsData';
import { AddOnItem } from '../../types';
import { formatPrice } from '../../utils/currency';

export const CompleteOrderModal: React.FC = () => {
  const { isUpsellOpen, lastAddedPizza, closeUpsell, addAddOnToCart, openCart } = useCart();
  const [addedAddOnIds, setAddedAddOnIds] = useState<string[]>([]);

  if (!isUpsellOpen || !lastAddedPizza) return null;

  const handleAddAddOn = (addon: AddOnItem) => {
    addAddOnToCart(addon);
    setAddedAddOnIds((prev) => [...prev, addon.id]);
  };

  const handleGoToCart = () => {
    closeUpsell();
    openCart();
  };

  return (
    <div
      id="upsell-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeUpsell();
      }}
    >
      <div
        id="upsell-modal-dialog"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200 p-6"
      >
        {/* Close Button */}
        <button
          onClick={closeUpsell}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Pizza Added confirmation */}
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Pizza className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              <Sparkles className="w-3 h-3" />
              Pizza Added to Cart!
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-display">
              Complete Your Feast?
            </h3>
            <p className="text-xs text-stone-500">
              Pizzaiolo recommendations that pair naturally with your {lastAddedPizza.name}.
            </p>
          </div>
        </div>

        {/* Add-ons Recommendations list */}
        <div className="mt-4 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {UPSELL_SUGGESTIONS.map((addon) => {
            const isAdded = addedAddOnIds.includes(addon.id);

            return (
              <div
                key={addon.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-stone-200 hover:border-red-200 bg-[#fdfbf7] transition-all gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img
                      src={addon.image}
                      alt={addon.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                      {addon.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1">
                      {addon.description}
                    </p>
                    <span className="text-xs font-black text-red-600 mt-0.5 block">
                      +{formatPrice(addon.price)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddAddOn(addon)}
                  disabled={isAdded}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-100 text-emerald-700 cursor-default'
                      : 'bg-stone-900 hover:bg-red-600 text-white shadow-xs'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <button
            onClick={closeUpsell}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            No thanks, keep browsing
          </button>

          <button
            onClick={handleGoToCart}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
