import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Star,
  Flame,
  Leaf,
  Check,
  Plus,
  Minus,
  SlidersHorizontal,
  Sparkles,
  Info,
  CheckCircle2,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { Product, PizzaSize, PizzaCrust, Topping } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/currency';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !product) return null;

  const isPizza = product.category === 'pizza';
  const { addToCart, isFavorite, toggleFavorite } = useCart();
  const isFav = isFavorite(product.id);

  // State for customization
  const [selectedSize, setSelectedSize] = useState<PizzaSize>(
    product.sizes?.[0] || { id: 'sm', name: 'Small (10")', inches: 10, slices: 6, priceDelta: 0 }
  );
  const [selectedCrust, setSelectedCrust] = useState<PizzaCrust>(
    product.crusts?.[0] || { id: 'classic', name: 'Classic Hand-Tossed', description: 'Traditional crust', price: 0 }
  );
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [activeToppingTab, setActiveToppingTab] = useState<'all' | 'cheese' | 'meat' | 'veggie' | 'sauce'>('all');
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reset states when product changes
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.crusts && product.crusts.length > 0) {
        setSelectedCrust(product.crusts[0]);
      }
      setSelectedToppings([]);
      setQuantity(1);
      setSpecialInstructions('');
      setIsConfirmed(false);
    }
  }, [product]);

  // Toggle toppings
  const handleToggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  // Calculate live dynamic price
  const unitPrice = useMemo(() => {
    let price = product.basePrice;
    if (isPizza) {
      price += selectedSize.priceDelta;
      price += selectedCrust.price;
      const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
      price += toppingsPrice;
    }
    return Number(price.toFixed(2));
  }, [product, isPizza, selectedSize, selectedCrust, selectedToppings]);

  const totalPrice = useMemo(() => {
    return Number((unitPrice * quantity).toFixed(2));
  }, [unitPrice, quantity]);

  // Filter toppings by tab
  const filteredToppings = useMemo(() => {
    if (!product.toppings) return [];
    if (activeToppingTab === 'all') return product.toppings;
    return product.toppings.filter((t) => t.category === activeToppingTab);
  }, [product, activeToppingTab]);

  const handleConfirm = () => {
    setIsConfirmed(true);
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      basePrice: product.basePrice,
      selectedSize: isPizza ? selectedSize : undefined,
      selectedCrust: isPizza ? selectedCrust : undefined,
      selectedToppings: isPizza ? selectedToppings : [],
      specialInstructions: specialInstructions.trim() || undefined,
      quantity,
      unitPrice,
    });

    setTimeout(() => {
      setIsConfirmed(false);
      onClose();
    }, 350);
  };

  return (
    <div
      id="product-customizer-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="product-customizer-dialog"
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-stone-100 text-stone-700 flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-105"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Product Photo & Visual Presentation */}
          <div className="lg:col-span-5 bg-gradient-to-b from-stone-100 to-stone-50 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-200">
            <div>
              {/* Badges Bar & Favorite Button */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex flex-wrap gap-2">
                  {product.discount && (
                    <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                      {product.discount}% OFF
                    </span>
                  )}
                  {product.isPopular && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                      Best Seller
                    </span>
                  )}
                  {product.isSpicy && (
                    <span className="px-2.5 py-1 rounded-full bg-orange-600 text-white text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Spicy
                    </span>
                  )}
                  {product.isVegetarian && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5" /> Vegetarian
                    </span>
                  )}
                </div>

                <button
                  id={`modal-fav-btn-${product.id}`}
                  onClick={() => toggleFavorite(product.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    isFav
                      ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
                      : 'bg-white text-stone-600 hover:text-red-600 border border-stone-200'
                  }`}
                  aria-label="Toggle Favorite"
                  title={isFav ? 'Remove Favorite' : 'Save to Favorites'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-red-600 text-red-600' : ''}`} />
                </button>
              </div>

              {/* Pizza Image Frame */}
              <div className="relative aspect-square w-full max-w-[320px] mx-auto overflow-hidden rounded-full shadow-2xl shadow-stone-900/20 border-6 border-white ring-1 ring-stone-200 group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:rotate-6 group-hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="mt-6 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
                  {product.name}
                </h2>
                <div className="flex items-center justify-center lg:justify-start gap-3 mt-2">
                  <div className="flex items-center text-amber-500 text-sm font-bold">
                    <Star className="w-4 h-4 fill-amber-400 mr-1" />
                    {product.rating}
                    <span className="text-stone-400 font-normal ml-1">({product.reviews} reviews)</span>
                  </div>
                  {product.calories && (
                    <span className="text-xs font-medium text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
                      🔥 {product.calories} kcal/slice
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Ingredients Tags */}
            <div className="mt-6 pt-4 border-t border-stone-200/80">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                Fresh Chef Ingredients
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {product.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-medium shadow-2xs"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-bold text-stone-900 font-display">
                    {isPizza ? 'Customize Your Pizza' : 'Product Options'}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                  Step-by-step
                </span>
              </div>

              {/* 1. SIZE SELECTION (if pizza) */}
              {isPizza && product.sizes && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-extrabold">
                        1
                      </span>
                      Choose Size
                    </label>
                    <span className="text-xs text-stone-500 font-medium">
                      Selected: {selectedSize.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize.id === size.id;
                      return (
                        <button
                          key={size.id}
                          id={`size-btn-${size.id}`}
                          onClick={() => setSelectedSize(size)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-red-600 bg-red-50/60 ring-2 ring-red-500/30 text-stone-900'
                              : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                          }`}
                        >
                          <div className="text-xs sm:text-sm font-bold">{size.name}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {size.slices} slices
                          </div>
                          <div className="text-xs font-bold text-red-600 mt-1">
                            {size.priceDelta === 0 ? 'Standard' : `+${formatPrice(size.priceDelta)}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. CRUST SELECTION (if pizza) */}
              {isPizza && product.crusts && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-extrabold">
                        2
                      </span>
                      Choose Crust
                    </label>
                    <span className="text-xs text-stone-500 font-medium">
                      {selectedCrust.name}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {product.crusts.map((crust) => {
                      const isSelected = selectedCrust.id === crust.id;
                      return (
                        <div
                          key={crust.id}
                          id={`crust-option-${crust.id}`}
                          onClick={() => setSelectedCrust(crust)}
                          className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'border-red-600 bg-red-50/40 ring-1 ring-red-500 text-stone-900'
                              : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-red-600 bg-red-600 text-white'
                                  : 'border-stone-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-stone-900">{crust.name}</div>
                              <p className="text-xs text-stone-500">{crust.description}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-stone-900 shrink-0">
                            {crust.price === 0 ? 'Free' : `+${formatPrice(crust.price)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. EXTRA TOPPINGS (if pizza) */}
              {isPizza && product.toppings && product.toppings.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-extrabold">
                        3
                      </span>
                      Add Extra Toppings
                    </label>
                    <span className="text-xs text-red-600 font-semibold">
                      {selectedToppings.length} selected
                    </span>
                  </div>

                  {/* Topping Category Pills */}
                  <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
                    {(['all', 'cheese', 'meat', 'veggie', 'sauce'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveToppingTab(tab)}
                        className={`px-3 py-1.5 rounded-full font-medium capitalize whitespace-nowrap cursor-pointer transition-colors ${
                          activeToppingTab === tab
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {tab === 'all' ? 'All Toppings' : tab}
                      </button>
                    ))}
                  </div>

                  {/* Toppings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {filteredToppings.map((topping) => {
                      const isSelected = selectedToppings.some((t) => t.id === topping.id);
                      return (
                        <div
                          key={topping.id}
                          id={`topping-item-${topping.id}`}
                          onClick={() => handleToggleTopping(topping)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'border-red-600 bg-red-50/50 text-stone-900 font-semibold'
                              : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                isSelected
                                  ? 'bg-red-600 border-red-600 text-white'
                                  : 'border-stone-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs">{topping.name}</span>
                          </div>
                          <span className="text-xs text-stone-600 font-bold shrink-0">
                            +{formatPrice(topping.price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Special Instructions Note */}
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Special Kitchen Request (Optional)
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g., Well done crust, light sauce, cut into squares..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>

            {/* Bottom Bar: Quantity & Dynamic Total */}
            <div className="pt-4 border-t border-stone-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-40 cursor-pointer shadow-2xs"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-extrabold text-stone-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 cursor-pointer shadow-2xs"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Total & Action */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 block font-medium">
                      Calculated Total
                    </span>
                    <span className="text-2xl font-black text-stone-900 font-display">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <button
                    id="modal-confirm-customization-btn"
                    onClick={handleConfirm}
                    className={`px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                      isConfirmed
                        ? 'bg-emerald-600 shadow-emerald-600/30'
                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/30 hover:shadow-red-600/40 hover:-translate-y-0.5'
                    }`}
                  >
                    {isConfirmed ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 animate-bounce" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-white" />
                        <span>Add to Cart • {formatPrice(totalPrice)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
