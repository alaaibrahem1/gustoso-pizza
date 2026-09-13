'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/hero/Hero';
import { Categories } from './components/products/Categories';
import { PizzaMenu } from './components/products/PizzaMenu';
import { OffersSection } from './components/offers/OffersSection';
import { AboutContactSection } from './components/layout/AboutContactSection';
import { Footer } from './components/layout/Footer';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { FavoritesModal } from './components/favorites/FavoritesModal';
import { CompleteOrderModal } from './components/upsell/CompleteOrderModal';
import { ToastContainer } from './components/common/ToastContainer';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderConfirmationView } from './components/orders/OrderConfirmationView';
import { OrderHistoryView } from './components/orders/OrderHistoryView';
import { AccountPage } from './components/account/AccountPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { PRODUCTS, SPECIAL_OFFERS } from './data/menuData';
import { Product, ProductCategory, Order } from './types';
import { getSavedOrders } from './services/orderService';

type ActiveView =
  | 'menu'
  | 'checkout'
  | 'order-confirmation'
  | 'orders'
  | 'account'
  | 'admin';

function AppContent() {
  // Navigation & view tracking
  const [currentView, setCurrentView] = useState<ActiveView>('menu');
  const [activeSection, setActiveSection] = useState('hero');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Category selection for filtering menu
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  // Product detail / customizer modal state
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Featured pizza for hero showcase (Pepperoni Diavola)
  const featuredPizza = PRODUCTS.find((p) => p.id === 'p-1') || PRODUCTS[0];

  const { reorderItems, openCart } = useCart();

  // Scroll to top whenever view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Smooth scroll to section in menu view
  const handleNavigate = (sectionId: string) => {
    if (currentView !== 'menu') {
      setCurrentView('menu');
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    } else {
      scrollToSection(sectionId);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);

    const targetEl =
      sectionId === 'hero'
        ? document.getElementById('hero-section')
        : sectionId === 'categories'
        ? document.getElementById('categories-section')
        : sectionId === 'menu'
        ? document.getElementById('menu-section')
        : sectionId === 'offers'
        ? document.getElementById('offers-section')
        : sectionId === 'about'
        ? document.getElementById('about-section')
        : sectionId === 'contact'
        ? document.getElementById('contact-section')
        : null;

    if (targetEl) {
      const navOffset = 80;
      const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Open customization modal
  const handleOpenCustomizer = (product: Product) => {
    setCustomizingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseCustomizer = () => {
    setIsModalOpen(false);
  };

  // When clicking category card, filter menu and scroll to menu
  const handleCategorySelect = (category: ProductCategory | 'all') => {
    setSelectedCategory(category);
    handleNavigate('menu');
  };

  // Handle Order Placed successfully in checkout
  const handleOrderPlaced = (order: Order) => {
    setSelectedOrder(order);
    setCurrentView('order-confirmation');
  };

  // Handle Reorder action
  const handleReorder = (order: Order) => {
    reorderItems(order.items);
    setCurrentView('menu');
    openCart();
  };

  // Track active section on scroll when in menu view
  useEffect(() => {
    if (currentView !== 'menu') return;

    const handleScroll = () => {
      const sections = ['hero', 'categories', 'menu', 'offers', 'about', 'contact'];
      const scrollY = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(
          section === 'hero'
            ? 'hero-section'
            : section === 'categories'
            ? 'categories-section'
            : section === 'menu'
            ? 'menu-section'
            : section === 'offers'
            ? 'offers-section'
            : section === 'about'
            ? 'about-section'
            : 'contact-section'
        );
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* 1. Sticky Responsive Navbar with live Cart & Favorites badges */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenOrders={() => setCurrentView('orders')}
        onOpenAccount={() => setCurrentView('account')}
        onOpenAdmin={() => setCurrentView('admin')}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content: Switches between Menu, Checkout, Confirmation, Orders History, Account & Admin */}
      <main className="flex-1 pt-18 sm:pt-20">
        {currentView === 'checkout' && (
          <CheckoutPage
            onOrderPlaced={handleOrderPlaced}
            onBackToMenu={() => setCurrentView('menu')}
          />
        )}

        {currentView === 'account' && (
          <AccountPage
            onBackToMenu={() => setCurrentView('menu')}
            onOpenAdmin={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onBackToMenu={() => setCurrentView('menu')}
          />
        )}

        {currentView === 'order-confirmation' && (
          <OrderConfirmationView
            order={selectedOrder || getSavedOrders()[0] || {
              id: 'demo-order',
              orderNumber: 'GST-DEMO-001',
              createdAt: new Date().toISOString(),
              customer: { fullName: 'Demo Customer', phone: '+966501234567', email: 'guest@gustoso.sa' },
              deliveryMethod: 'delivery',
              deliveryAddress: {
                city: 'Riyadh',
                district: 'Al Olaya',
                street: 'King Fahd Rd',
                buildingNumber: '42',
              },
              items: [],
              subtotal: 0,
              discount: 0,
              deliveryFee: 0,
              vat: 0,
              total: 0,
              paymentMethod: 'cash_on_delivery',
              paymentStatus: 'pending',
              orderStatus: 'Confirmed',
              status: 'Confirmed',
              estimatedTime: '~35 mins',
            }}
            onReorder={handleReorder}
            onViewAllOrders={() => setCurrentView('orders')}
            onBackToMenu={() => setCurrentView('menu')}
          />
        )}

        {currentView === 'orders' && (
          <OrderHistoryView
            onSelectOrder={(order) => {
              setSelectedOrder(order);
              setCurrentView('order-confirmation');
            }}
            onReorder={handleReorder}
            onBackToMenu={() => setCurrentView('menu')}
          />
        )}

        {currentView === 'menu' && (
          <>
            {/* 2. Hero Section with stone oven pizza */}
            <Hero
              onOrderNow={() => handleNavigate('menu')}
              onExploreMenu={() => handleNavigate('menu')}
              onSelectFeatured={handleOpenCustomizer}
              featuredPizza={featuredPizza}
            />

            {/* 3. Categories Navigation Grid (Pizzas, Burgers, Sides, Drinks, Desserts, Deals) */}
            <Categories
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />

            {/* 4. Complete Menu with Live Filters, Dietary Tags, Search & Product Cards */}
            <PizzaMenu
              products={PRODUCTS}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onCustomizeProduct={handleOpenCustomizer}
            />

            {/* 5. Special Combo Deals with 1-click Add to Cart */}
            <OffersSection
              offers={SPECIAL_OFFERS}
              onSelectDealProduct={handleOpenCustomizer}
              featuredProduct={featuredPizza}
            />

            {/* 6. Pizzeria Heritage, Oven Info & Contact */}
            <AboutContactSection />
          </>
        )}
      </main>

      {/* 7. Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* 8. Product Details & Pizza Customizer Modal */}
      <ProductDetailModal
        product={customizingProduct}
        isOpen={isModalOpen}
        onClose={handleCloseCustomizer}
      />

      {/* 9. Shopping Cart Drawer */}
      <CartDrawer
        onContinueShopping={() => handleNavigate('menu')}
        onProceedToCheckout={() => setCurrentView('checkout')}
      />

      {/* 10. Favorites / Shortlist Modal */}
      <FavoritesModal
        allProducts={PRODUCTS}
        onOpenCustomizer={handleOpenCustomizer}
        onExploreMenu={() => handleNavigate('menu')}
      />

      {/* 11. "Complete Your Order" Upsell Modal */}
      <CompleteOrderModal />

      {/* 12. Authentication Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 13. Polished Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
