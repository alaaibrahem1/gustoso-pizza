import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Award,
  Star,
  MapPin,
  ChevronRight,
  Utensils,
  Flame,
} from 'lucide-react';
import { Product } from '../../types';

interface HeroProps {
  onOrderNow: () => void;
  onExploreMenu: () => void;
  onSelectFeatured: (product: Product) => void;
  featuredPizza: Product;
}

export const Hero: React.FC<HeroProps> = ({
  onOrderNow,
  onExploreMenu,
  onSelectFeatured,
  featuredPizza,
}) => {
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [addressInput, setAddressInput] = useState('');

  return (
    <section
      id="hero-section"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#faf6ef] via-[#fdfbf7] to-[#fdfbf7]"
    >
      {/* Subtle ambient decorative blur blobs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-red-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 right-10 w-[350px] h-[350px] bg-amber-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typography & Order Flow */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs sm:text-sm font-semibold shadow-xs">
              <Flame className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Artisanal 48-Hour Fermented Dough • Stone-Baked at 450°C</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.1] font-display">
              Fresh Pizza. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-amber-600">
                Made Your Way.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Hand-stretched dough, crushed Italian San Marzano tomatoes, and creamy whole-milk fior di
              latte baked in a blistered stone oven. Custom crafted to your exact craving.
            </p>

            {/* Delivery / Pickup Mini Switcher */}
            <div className="max-w-md mx-auto lg:mx-0 bg-white p-2 rounded-2xl border border-stone-200 shadow-sm">
              <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100/80 rounded-xl mb-2">
                <button
                  id="hero-delivery-tab"
                  onClick={() => setOrderType('delivery')}
                  className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    orderType === 'delivery'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  🚀 Delivery (30 min)
                </button>
                <button
                  id="hero-pickup-tab"
                  onClick={() => setOrderType('pickup')}
                  className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    orderType === 'pickup'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  🥡 Store Pickup (15 min)
                </button>
              </div>

              <div className="flex items-center gap-2 px-2 py-1">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <input
                  id="hero-address-input"
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder={
                    orderType === 'delivery'
                      ? 'Enter your street address or zip code...'
                      : 'Find nearest Gustoso branch (Springfield Downtown)'
                  }
                  className="w-full text-xs sm:text-sm bg-transparent border-none text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-0"
                />
                <button
                  onClick={onOrderNow}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                >
                  Find
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-order-now-btn"
                onClick={onOrderNow}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>Order Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-explore-menu-btn"
                onClick={onExploreMenu}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-bold text-base shadow-xs hover:border-stone-300 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-stone-600" />
                <span>Explore Full Menu</span>
              </button>
            </div>

            {/* Promotional Trust Badges */}
            <div className="pt-6 border-t border-stone-200/70 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-700 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">30 Min Delivery</h4>
                  <p className="text-[11px] text-stone-500">Guaranteed piping hot</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Fresh Ingredients</h4>
                  <p className="text-[11px] text-stone-500">100% Organic D.O.P.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200/70 flex items-center justify-center text-red-700 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Best Sellers</h4>
                  <p className="text-[11px] text-stone-500">Top rated in town</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Appetizing Floating Pizza Visual Hero */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Glowing Backdrop Circle */}
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-amber-400/20 via-red-500/20 to-orange-400/10 absolute -z-10 blur-2xl transform scale-110" />

            {/* Circular Ring Frame */}
            <div className="relative group cursor-pointer" onClick={() => onSelectFeatured(featuredPizza)}>
              {/* Pizza Floating Visual */}
              <div className="w-72 h-72 sm:w-96 sm:h-96 lg:w-[420px] lg:h-[420px] relative animate-float transition-transform duration-500 group-hover:scale-105">
                <img
                  src={featuredPizza.image}
                  alt={featuredPizza.name}
                  className="w-full h-full object-cover rounded-full shadow-2xl shadow-stone-900/30 border-8 border-white ring-1 ring-stone-200"
                />

                {/* Floating Hot Steam Badge */}
                <div className="absolute -top-3 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-200/80 shadow-md flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <span className="text-xs font-bold text-stone-900">Hot Stone Oven Baked</span>
                </div>

                {/* Floating Reviews & Rating Badge */}
                <div className="absolute -bottom-4 left-6 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200/80 shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    ★ 4.9
                  </div>
                  <div>
                    <div className="flex text-amber-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-stone-800">12,450+ Happy Reviews</p>
                  </div>
                </div>

                {/* Floating Price & Customization Badge */}
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 bg-stone-900/90 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-stone-700/60 max-w-[170px] hidden sm:block group-hover:bg-red-600 transition-colors">
                  <p className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider group-hover:text-red-100">
                    Chef’s Flagship
                  </p>
                  <p className="text-sm font-bold text-white leading-tight truncate">
                    {featuredPizza.name}
                  </p>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-stone-700">
                    <span className="text-base font-extrabold text-amber-400 group-hover:text-white">
                      ${featuredPizza.basePrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold flex items-center gap-0.5">
                      Customize <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
