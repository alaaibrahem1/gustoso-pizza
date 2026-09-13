import React, { useState } from 'react';
import {
  Sparkles,
  Tag,
  Clock,
  Check,
  ArrowRight,
  Copy,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import { Offer, Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/currency';

interface OffersSectionProps {
  offers: Offer[];
  onSelectDealProduct: (product: Product) => void;
  featuredProduct: Product;
}

export const OffersSection: React.FC<OffersSectionProps> = ({
  offers,
  onSelectDealProduct,
  featuredProduct,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { addOfferToCart } = useCart();
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddBundleToCart = (offer: Offer) => {
    addOfferToCart(offer);
    setAddedBundleId(offer.id);
    setTimeout(() => setAddedBundleId(null), 1500);
  };

  return (
    <section
      id="offers-section"
      className="py-16 bg-gradient-to-b from-[#fdfbf7] to-[#f7f3eb] border-t border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Tag className="w-3.5 h-3.5" />
              Special Combo Deals
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
              Curated Bundles & Limited Offers
            </h2>
            <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-xl">
              Save up to 30% with our stone-baked pizza feast bundles designed for family nights,
              parties, and couples.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-semibold text-stone-600 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-2xs">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Updated Daily • Limited Daily Oven Slots</span>
          </div>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {offers.map((offer) => {
            const isCodeCopied = copiedCode === offer.code;
            const isAdded = addedBundleId === offer.id;

            return (
              <div
                key={offer.id}
                id={`offer-card-${offer.id}`}
                className="group bg-white rounded-3xl border border-stone-200 hover:border-red-300 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Image Banner with Badge */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      {offer.badge} ({offer.discountPercent}% OFF)
                    </div>

                    {/* Validity pill */}
                    <div className="absolute bottom-3 left-3 text-xs text-white/90 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{offer.validUntil}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-stone-900 font-display">
                      {offer.title}
                    </h3>
                    <p className="text-xs font-semibold text-red-600 mt-0.5">
                      {offer.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                      {offer.description}
                    </p>

                    {/* What's included checklist */}
                    <div className="mt-4 pt-4 border-t border-stone-100">
                      <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                        Bundle includes:
                      </h4>
                      <ul className="space-y-1.5">
                        {offer.includedItems.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-xs text-stone-700 font-medium"
                          >
                            <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Promo Code & Pricing */}
                <div className="p-6 pt-0">
                  {/* Coupon Code Pill */}
                  <div className="mb-4 bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                        Promo Code
                      </span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-stone-800">
                        {offer.code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      {isCodeCopied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-xs text-stone-400 line-through font-medium block">
                        {formatPrice(offer.originalPrice)}
                      </span>
                      <span className="text-2xl font-black text-stone-900 font-display">
                        {formatPrice(offer.discountedPrice)}
                      </span>
                    </div>

                    <button
                      id={`add-bundle-btn-${offer.id}`}
                      onClick={() => handleAddBundleToCart(offer)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer transform active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 hover:shadow-lg'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 animate-bounce" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
