import React from 'react';
import {
  Star,
  Flame,
  Leaf,
  Sparkles,
  SlidersHorizontal,
  Plus,
  Heart,
  ShoppingBag,
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/currency';

interface ProductCardProps {
  product: Product;
  onCustomize: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onCustomize }) => {
  const isPizza = product.category === 'pizza';
  const { isFavorite, toggleFavorite, addToCart, isMounted } = useCart();
  const isFav = isMounted ? isFavorite(product.id) : false;

  const handleQuickAddNonPizza = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      basePrice: product.basePrice,
      selectedToppings: [],
      quantity: 1,
      unitPrice: product.basePrice,
    });
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-3xl border border-stone-200/90 hover:border-red-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden transform hover:-translate-y-1"
    >
      {/* Product Image Box */}
      <div
        className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => onCustomize(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient Overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

        {/* Badges Bar (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          {product.discount && (
            <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {product.discount}% OFF
            </span>
          )}
          {product.isPopular && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              ★ Best Seller
            </span>
          )}
          {product.isSpicy && (
            <span className="px-2.5 py-1 rounded-full bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-0.5">
              <Flame className="w-3 h-3 fill-current" />
              Spicy
            </span>
          )}
          {product.isVegetarian && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-0.5">
              <Leaf className="w-3 h-3 fill-current" />
              Veg
            </span>
          )}
        </div>

        {/* Heart / Favorite Button (Top Right) */}
        <button
          id={`fav-btn-${product.id}`}
          onClick={handleHeartClick}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
            isFav
              ? 'bg-white text-red-600 shadow-md scale-105'
              : 'bg-black/30 hover:bg-white text-white hover:text-red-600'
          }`}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-red-600 text-red-600' : ''}`} />
        </button>

        {/* Rating Pill (Bottom Right) */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-stone-900 shadow-sm flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{product.rating}</span>
          <span className="text-stone-400 text-[10px] font-normal">({product.reviews})</span>
        </div>

        {/* Quick prep time badge */}
        {product.prepTimeMinutes && (
          <div className="absolute bottom-3 left-3 text-[11px] text-white/90 font-medium drop-shadow-sm">
            ⚡ {product.prepTimeMinutes} mins
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title and Category */}
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onCustomize(product)}
              className="text-lg font-bold text-stone-900 font-display hover:text-red-600 transition-colors cursor-pointer leading-snug"
            >
              {product.name}
            </h3>
          </div>

          {/* Short Description */}
          <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Key Ingredients tags */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {product.ingredients.slice(0, 3).map((ingredient, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium"
                >
                  {ingredient}
                </span>
              ))}
              {product.ingredients.length > 3 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md text-stone-400 font-medium">
                  +{product.ingredients.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Price & Actions */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
              {isPizza ? 'From' : 'Price'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-stone-900 font-display">
                {formatPrice(product.basePrice)}
              </span>
              {product.oldPrice && (
                <span className="text-xs text-stone-400 line-through font-medium">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          </div>

          {isPizza ? (
            <button
              id={`customize-btn-${product.id}`}
              onClick={() => onCustomize(product)}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer transform active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                id={`details-btn-${product.id}`}
                onClick={() => onCustomize(product)}
                className="px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                title="View details"
              >
                Details
              </button>
              <button
                id={`quick-add-btn-${product.id}`}
                onClick={handleQuickAddNonPizza}
                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer transform active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
