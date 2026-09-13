import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Star, Flame, Leaf } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import { formatPrice } from '../../utils/currency';

interface FavoritesModalProps {
  allProducts: Product[];
  onOpenCustomizer: (product: Product) => void;
  onExploreMenu: () => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  allProducts,
  onOpenCustomizer,
  onExploreMenu,
}) => {
  const { favorites, isFavoritesOpen, closeFavorites, removeFavorite, addToCart } = useCart();

  if (!isFavoritesOpen) return null;

  // Filter products by saved favorite IDs
  const favoriteProducts = allProducts.filter((product) => favorites.includes(product.id));

  // Quick add non-pizza or standard product to cart, or open customizer for pizza
  const handleAddToCartOrCustomize = (product: Product) => {
    if (product.category === 'pizza') {
      closeFavorites();
      onOpenCustomizer(product);
    } else {
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
    }
  };

  return (
    <div
      id="favorites-modal-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs transition-opacity flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeFavorites();
      }}
    >
      <div
        id="favorites-modal-panel"
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 border-l border-stone-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#fdfbf7]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs">
              <Heart className="w-5 h-5 fill-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-stone-900 font-display">Favorite Dishes</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                  {favoriteProducts.length} saved
                </span>
              </div>
              <p className="text-xs text-stone-500">Your personalized cravings shortlist</p>
            </div>
          </div>

          <button
            onClick={closeFavorites}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close favorites"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Favorites List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {favoriteProducts.length > 0 ? (
            favoriteProducts.map((product) => (
              <div
                key={product.id}
                id={`favorite-item-${product.id}`}
                className="p-3.5 sm:p-4 rounded-2xl border border-stone-200 bg-[#fdfbf7]/80 hover:bg-white transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Photo */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm sm:text-base font-bold text-stone-900 font-display truncate">
                        {product.name}
                      </h4>
                      <button
                        onClick={() => removeFavorite(product.id)}
                        className="text-stone-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-stone-900">
                        {formatPrice(product.basePrice)}
                      </span>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {product.rating}
                      </div>
                      {product.isSpicy && (
                        <span className="text-[10px] text-orange-600 flex items-center font-bold">
                          <Flame className="w-3 h-3" /> Spicy
                        </span>
                      )}
                      {product.isVegetarian && (
                        <span className="text-[10px] text-emerald-600 flex items-center font-bold">
                          <Leaf className="w-3 h-3" /> Veg
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-1 mt-1">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 capitalize">
                    Category: <strong>{product.category}</strong>
                  </span>

                  <button
                    onClick={() => handleAddToCartOrCustomize(product)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{product.category === 'pizza' ? 'Customize & Add' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto shadow-inner">
                <Heart className="w-10 h-10 stroke-1" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-stone-900 font-display">
                  No favorites yet
                </h4>
                <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xs mx-auto">
                  Click the heart icon on any pizza, burger, side, or dessert to save your favorites here.
                </p>
              </div>
              <button
                onClick={() => {
                  closeFavorites();
                  onExploreMenu();
                }}
                className="px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Explore Menu
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {favoriteProducts.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-[#fdfbf7] flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Items saved across sessions
            </span>
            <button
              onClick={() => {
                closeFavorites();
                onExploreMenu();
              }}
              className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
            >
              <span>Explore More Dishes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
