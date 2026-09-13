import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Leaf,
  Sparkles,
  ArrowUpDown,
  Utensils,
  X,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { ProductCard } from './ProductCard';

interface PizzaMenuProps {
  products: Product[];
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (category: ProductCategory | 'all') => void;
  onCustomizeProduct: (product: Product) => void;
}

type DietaryFilter = 'all' | 'popular' | 'vegetarian' | 'spicy' | 'offers';
type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating';

export const PizzaMenu: React.FC<PizzaMenuProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onCustomizeProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category Filter
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        // Dietary / Tag Filter
        if (dietaryFilter === 'popular' && !product.isPopular) return false;
        if (dietaryFilter === 'vegetarian' && !product.isVegetarian) return false;
        if (dietaryFilter === 'spicy' && !product.isSpicy) return false;
        if (dietaryFilter === 'offers' && !product.discount) return false;

        // Search Query (matches name, ingredients, or description)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = product.name.toLowerCase().includes(q);
          const matchesDesc = product.description.toLowerCase().includes(q);
          const matchesIngredients = product.ingredients.some((i) => i.toLowerCase().includes(q));
          if (!matchesName && !matchesDesc && !matchesIngredients) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default: popularity / featured
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.reviews || 0) - (a.reviews || 0);
      });
  }, [products, selectedCategory, dietaryFilter, searchQuery, sortBy]);

  return (
    <section id="menu-section" className="py-16 bg-[#fdfbf7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Utensils className="w-3.5 h-3.5" />
            Fresh From The Stone Oven
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
            Artisanal Pizza & Kitchen Menu
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed">
            Every pizza is hand-stretched to order, baked on stone at 450°C, and topped with
            premium fresh ingredients.
          </p>
        </div>

        {/* Search, Filter Pills & Sort Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="menu-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pizzas by name, toppings, San Marzano sauce..."
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
                Sort:
              </span>
              <select
                id="menu-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs sm:text-sm font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated ★</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Quick Dietary Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-stone-100 text-xs">
            <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider shrink-0 mr-1">
              Filter:
            </span>

            {[
              { id: 'all', label: 'All Items' },
              { id: 'popular', label: 'Best Sellers', icon: Sparkles },
              { id: 'vegetarian', label: 'Vegetarian', icon: Leaf },
              { id: 'spicy', label: 'Spicy & Hot', icon: Flame },
              { id: 'offers', label: 'Special Discounts' },
            ].map((pill) => {
              const Icon = pill.icon;
              const isSelected = dietaryFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  id={`filter-pill-${pill.id}`}
                  onClick={() => setDietaryFilter(pill.id as DietaryFilter)}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {pill.label}
                </button>
              );
            })}

            {/* Active Category Chip indicator */}
            {selectedCategory !== 'all' && (
              <button
                onClick={() => onSelectCategory('all')}
                className="ml-auto text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
              >
                Category: <span className="capitalize font-bold">{selectedCategory}</span> (Clear ×)
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6 text-xs text-stone-500">
          <span>
            Showing <strong className="text-stone-900 font-bold">{filteredProducts.length}</strong> delicious items
          </span>
          {searchQuery && (
            <span>
              Searching for: "<strong className="text-stone-900">{searchQuery}</strong>"
            </span>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCustomize={onCustomizeProduct}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-display">No menu items found</h3>
            <p className="text-stone-500 text-sm mt-1.5">
              We couldn’t find anything matching your search or filters. Try adjusting your search term
              or select another category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDietaryFilter('all');
                onSelectCategory('all');
              }}
              className="mt-6 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Reset Filters & Show All
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
