import React, { useState, useEffect } from 'react';
import {
  Pizza,
  Phone,
  Clock,
  Menu as MenuIcon,
  X,
  Flame,
  ShoppingBag,
  Heart,
  ReceiptText,
  User as UserIcon,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenOrders?: () => void;
  onOpenAccount?: () => void;
  onOpenAdmin?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenOrders,
  onOpenAccount,
  onOpenAdmin,
  onOpenAuth,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { cartCount, favoritesCount, openCart, openFavorites } = useCart();
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Safe mounting hook to avoid SSR/client hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use safe defaults until client-side hydration has completed
  const safeCartCount = isMounted ? cartCount : 0;
  const safeFavoritesCount = isMounted ? favoritesCount : 0;
  const safeIsAuthenticated = isMounted ? isAuthenticated : false;
  const safeIsAdmin = isMounted ? isAdmin : false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#fdfbf7]/95 backdrop-blur-md shadow-xs border-b border-stone-200/80 py-2.5'
          : 'bg-[#fdfbf7] border-b border-stone-100 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <Pizza className="w-6 h-6 animate-pulse-soft" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-stone-900 font-display">
                  Gustoso
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold uppercase tracking-wider">
                  KSA
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-500 tracking-wider uppercase">
                Artisan Stone-Baked Pizza
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: 'hero', label: 'Home' },
              { id: 'categories', label: 'Categories' },
              { id: 'menu', label: 'Menu' },
              { id: 'offers', label: 'Special Offers', badge: 'Hot' },
              { id: 'about', label: 'Our Story' },
              { id: 'contact', label: 'Contact & Hours' },
            ].map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all relative flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-red-700 font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-black tracking-wider uppercase">
                      <Flame className="w-2.5 h-2.5" />
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: My Orders, Favorites, Cart & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Admin Quick Action Button (Visible if user is ADMIN) */}
            {safeIsAdmin && onOpenAdmin && (
              <button
                id="nav-admin-btn"
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                title="Gustoso Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin</span>
              </button>
            )}

            {/* My Orders Button */}
            {onOpenOrders && (
              <button
                id="nav-orders-btn"
                onClick={onOpenOrders}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-red-600 bg-stone-100/80 hover:bg-red-50 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                title="My Orders & Live Tracker"
              >
                <ReceiptText className="w-3.5 h-3.5 text-stone-600" />
                <span>Orders</span>
              </button>
            )}

            {/* User Account / Sign In Button */}
            {safeIsAuthenticated ? (
              <button
                id="nav-account-btn"
                onClick={onOpenAccount}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                title="My Profile & Saved Addresses"
              >
                <div className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                id="nav-signin-btn"
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Favorites Icon Button */}
            <button
              id="nav-favorites-btn"
              onClick={openFavorites}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-100 hover:bg-red-50 hover:text-red-600 text-stone-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              aria-label="View Favorites"
              title="Saved Favorites"
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${safeFavoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`}
              />
              {safeFavoritesCount > 0 && (
                <span
                  id="nav-favorites-counter"
                  className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-600 text-white font-extrabold text-[10px] sm:text-[11px] flex items-center justify-center border-2 border-white shadow-xs"
                >
                  {safeFavoritesCount}
                </span>
              )}
            </button>

            {/* Cart Icon Button */}
            <button
              id="nav-cart-btn"
              onClick={openCart}
              className="relative px-3 sm:px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
              aria-label="Open Cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold hidden sm:inline">Cart</span>
              <span
                id="nav-cart-counter"
                className={`text-xs font-black px-1.5 py-0.5 rounded-full ${
                  safeCartCount > 0 ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-400'
                }`}
              >
                {safeCartCount}
              </span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:bg-stone-100 focus:outline-none lg:hidden cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden bg-[#fdfbf7] border-b border-stone-200 px-4 pt-3 pb-6 space-y-2 mt-2 shadow-xl animate-in slide-in-from-top duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs text-stone-500">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Kitchen Open Now
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              +966 11 488 7888
            </span>
          </div>

          <div className="flex flex-col space-y-1 pt-1">
            {[
              { id: 'hero', label: 'Home' },
              { id: 'categories', label: 'Categories' },
              { id: 'menu', label: 'Pizza & Kitchen Menu' },
              { id: 'offers', label: 'Special Offers & Bundles' },
              { id: 'about', label: 'Our Story & Kitchen' },
              { id: 'contact', label: 'Contact & Opening Hours' },
            ].map((link) => (
              <button
                key={link.id}
                id={`mobile-nav-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === link.id
                    ? 'bg-red-50 text-red-600 font-semibold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Quick shortcuts inside mobile menu */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200">
            {safeIsAuthenticated ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenAccount) onOpenAccount();
                }}
                className="py-2.5 px-3 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-stone-600" />
                <span>My Account</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenAuth) onOpenAuth();
                }}
                className="py-2.5 px-3 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}

            {safeIsAdmin && onOpenAdmin ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin Panel</span>
              </button>
            ) : onOpenOrders ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenOrders();
                }}
                className="py-2.5 px-3 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <ReceiptText className="w-3.5 h-3.5 text-stone-600" />
                <span>Orders</span>
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openFavorites();
              }}
              className="py-2.5 px-2 rounded-xl bg-white border border-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span>Favorites ({safeFavoritesCount})</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openCart();
              }}
              className="py-2.5 px-2 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-red-400" />
              <span>Cart ({safeCartCount})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
