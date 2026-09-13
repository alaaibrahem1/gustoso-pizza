import React from 'react';
import { Pizza, Heart, ArrowUp, Phone, MapPin, Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md">
                <Pizza className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white font-display">
                  Gustoso
                </span>
                <p className="text-[11px] font-medium text-stone-400 tracking-wider uppercase">
                  Artisan Stone-Baked Pizza Co.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 max-w-sm leading-relaxed">
              Crafting authentic 48-hour fermented sourdough pizzas with San Marzano tomatoes,
              whole milk fior di latte, and uncompromised Italian passion.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified 5-Star Health & Hygiene Rating</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('hero')}
                  className="hover:text-red-400 transition-colors cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-red-400 transition-colors cursor-pointer text-left"
                >
                  Food Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-red-400 transition-colors cursor-pointer text-left"
                >
                  Pizza & Kitchen Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('offers')}
                  className="hover:text-red-400 transition-colors cursor-pointer text-left"
                >
                  Special Offers & Deals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-red-400 transition-colors cursor-pointer text-left"
                >
                  Our Heritage & Dough
                </button>
              </li>
            </ul>
          </div>

          {/* Menu Highlights */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Popular Pizzas
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-400">
              <li>Pepperoni Diavola with Hot Honey</li>
              <li>Margherita D.O.P.</li>
              <li>Truffle Wild Mushroom</li>
              <li>Carnivore Meat Lovers</li>
              <li>Quattro Formaggi Bianco</li>
              <li>Loaded Truffle Curly Fries</li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Store & Delivery
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Prince Muhammad Ibn Abd Al Aziz St, Al Olaya, Riyadh, Saudi Arabia</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400 shrink-0" />
                <span>+966 11 488 7888</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-400 shrink-0" />
                <span>orders@gustosopizza.sa</span>
              </p>
              <div className="pt-2 text-xs text-stone-400">
                <span className="block text-white font-semibold">Stone Oven Kitchen Daily:</span>
                <span>12:00 PM – 02:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Micro Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p className="flex items-center gap-1 text-center sm:text-left">
            © {new Date().getFullYear()} Gustoso Pizza Co. All rights reserved. Baked with{' '}
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for pizza lovers.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-stone-400">
              Gluten-free & Vegan crusts available upon request.
            </span>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
