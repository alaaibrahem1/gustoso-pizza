import React from 'react';
import { Pizza, Beef, UtensilsCrossed, Wine, CakeSlice, Tag, Sparkles } from 'lucide-react';
import { ProductCategory } from '../../types';

interface CategoryItem {
  id: ProductCategory;
  name: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'pizza', name: 'Artisan Pizza', count: 8, icon: Pizza, description: 'Handcrafted stone-baked pizzas' },
  { id: 'burgers', name: 'Smash Burgers', count: 2, icon: Beef, description: 'Brioche Wagyu & Crispy Chicken' },
  { id: 'sides', name: 'Sides & Wings', count: 5, icon: UtensilsCrossed, description: 'Truffle fries, wings & mozzarella' },
  { id: 'drinks', name: 'Italian Drinks', count: 3, icon: Wine, description: 'San Pellegrino & sodas' },
  { id: 'desserts', name: 'Dolci & Gelato', count: 3, icon: CakeSlice, description: 'Nutella calzone & cannoli' },
  { id: 'deals', name: 'Combo Deals', count: 3, icon: Tag, description: 'Family & couples special packs' },
];

interface CategoriesProps {
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (category: ProductCategory | 'all') => void;
}

export const Categories: React.FC<CategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section id="categories-section" className="py-12 bg-[#fdfbf7] border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Explore Our Kitchen
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-display">
              Browse by Category
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('all')}
            className={`mt-3 sm:mt-0 text-xs sm:text-sm font-bold px-4 py-2 rounded-full transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300'
            }`}
          >
            Show All Menu (21 items)
          </button>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                id={`category-card-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`relative p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-gradient-to-b from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25 ring-2 ring-red-500 scale-[1.02]'
                    : 'bg-white hover:bg-stone-50 border border-stone-200/80 hover:border-stone-300 text-stone-900 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Icon Circle */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-red-50 text-red-600 group-hover:bg-red-100'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div>
                  <h3
                    className={`font-bold text-sm sm:text-base leading-snug font-display ${
                      isSelected ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <p
                    className={`text-xs mt-0.5 ${
                      isSelected ? 'text-red-100' : 'text-stone-500'
                    }`}
                  >
                    {cat.count} items
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
