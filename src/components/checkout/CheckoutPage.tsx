import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CustomerDetails, PaymentMethod, SaudiDeliveryAddress, Order } from '../../types';
import { CustomerInfoStep } from './CustomerInfoStep';
import { DeliveryStep } from './DeliveryStep';
import { PaymentMethodStep } from './PaymentMethodStep';
import { OrderSummaryCard } from './OrderSummaryCard';
import { validateDeliveryAddress, validateEmail, validateFullName, validateSaudiPhone } from '../../utils/validation';
import { createOrderAsync, createOrder, DEFAULT_PICKUP_LOCATION } from '../../services/orderService';
import { formatPrice } from '../../utils/currency';

interface CheckoutPageProps {
  onOrderPlaced: (order: Order) => void;
  onBackToMenu: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderPlaced,
  onBackToMenu,
}) => {
  const {
    cart,
    pricing,
    appliedCoupon,
    clearCart,
    deliveryMethod,
    setDeliveryMethod,
    showToast,
  } = useCart();

  const { user, isAuthenticated } = useAuth();

  // Form states
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    phone: '',
    email: '',
  });

  const [address, setAddress] = useState<SaudiDeliveryAddress>({
    city: 'Riyadh',
    district: '',
    street: '',
    buildingNumber: '',
    apartmentOrUnit: '',
    notes: '',
  });

  // Autofill user profile when logged in
  useEffect(() => {
    if (user) {
      setCustomer((prev) => ({
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
        if (defaultAddr) {
          setAddress((prev) => ({
            city: prev.city || defaultAddr.city,
            district: prev.district || defaultAddr.district,
            street: prev.street || defaultAddr.street,
            buildingNumber: prev.buildingNumber || defaultAddr.buildingNumber,
            apartmentOrUnit: prev.apartmentOrUnit || defaultAddr.apartmentOrUnit || '',
            notes: prev.notes || defaultAddr.notes || '',
          }));
        }
      }
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field blur validation
  const handleCustomerBlur = (field: keyof CustomerDetails) => {
    const newErrors = { ...errors };
    if (field === 'fullName') {
      const res = validateFullName(customer.fullName);
      if (!res.isValid && res.error) newErrors.fullName = res.error;
      else delete newErrors.fullName;
    } else if (field === 'phone') {
      const res = validateSaudiPhone(customer.phone);
      if (!res.isValid && res.error) newErrors.phone = res.error;
      else delete newErrors.phone;
    } else if (field === 'email') {
      const res = validateEmail(customer.email);
      if (!res.isValid && res.error) newErrors.email = res.error;
      else delete newErrors.email;
    }
    setErrors(newErrors);
  };

  const handleAddressBlur = (field: keyof SaudiDeliveryAddress) => {
    if (deliveryMethod !== 'delivery') return;
    const newErrors = { ...errors };
    if (field === 'city' && !address.city?.trim()) {
      newErrors.city = 'City is required';
    } else if (field === 'district' && !address.district?.trim()) {
      newErrors.district = 'District (حي) is required';
    } else if (field === 'street' && !address.street?.trim()) {
      newErrors.street = 'Street name is required';
    } else if (field === 'buildingNumber' && !address.buildingNumber?.trim()) {
      newErrors.buildingNumber = 'Building number is required';
    } else {
      delete newErrors[field];
    }
    setErrors(newErrors);
  };

  // Validate entire form before submission
  const validateForm = (): boolean => {
    const currentErrors: Record<string, string> = {};

    // Validate customer
    const nameCheck = validateFullName(customer.fullName);
    if (!nameCheck.isValid && nameCheck.error) currentErrors.fullName = nameCheck.error;

    const phoneCheck = validateSaudiPhone(customer.phone);
    if (!phoneCheck.isValid && phoneCheck.error) currentErrors.phone = phoneCheck.error;

    const emailCheck = validateEmail(customer.email);
    if (!emailCheck.isValid && emailCheck.error) currentErrors.email = emailCheck.error;

    // Validate address if delivery
    if (deliveryMethod === 'delivery') {
      const addressCheck = validateDeliveryAddress(address);
      if (!addressCheck.isValid) {
        Object.assign(currentErrors, addressCheck.errors);
      }
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  // Place Order handler
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showToast({
        title: 'Your cart is empty',
        message: 'Please add items to your cart before proceeding to checkout.',
        type: 'warning',
      });
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      showToast({
        title: 'Please complete required fields',
        message: 'Review highlighted fields in the checkout form.',
        type: 'error',
      });
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const elem = document.getElementById(`customer-${firstErrorKey}`) || document.getElementById(`delivery-${firstErrorKey}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elem.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate network request to stone oven kitchen
      await new Promise((resolve) => setTimeout(resolve, 900));

      const normalizedPhone = validateSaudiPhone(customer.phone).normalized || customer.phone;

      // Estimate time: 30-40 mins from now for delivery, 20 mins for pickup
      const now = new Date();
      const minutesToAdd = deliveryMethod === 'delivery' ? 35 : 20;
      const estimatedDate = new Date(now.getTime() + minutesToAdd * 60000);
      const estimatedTimeStr = estimatedDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const order = await createOrderAsync({
        customer: {
          ...customer,
          phone: normalizedPhone,
        },
        items: [...cart],
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        promoCode: appliedCoupon?.code,
        deliveryFee: pricing.deliveryFee,
        vat: pricing.vat,
        total: pricing.total,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? address : undefined,
        pickupLocation: deliveryMethod === 'pickup' ? DEFAULT_PICKUP_LOCATION : undefined,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Paid',
        orderStatus: 'Confirmed',
        estimatedTime: estimatedTimeStr,
      });

      // Clear shopping cart safely
      clearCart(true);

      showToast({
        title: 'Order Confirmed! 🍕',
        message: `Order #${order.orderNumber} sent to stone oven kitchen.`,
        type: 'success',
      });

      onOrderPlaced(order);
    } catch (error) {
      console.error('Failed to create order:', error);
      showToast({
        title: 'Order submission failed',
        message: 'An unexpected error occurred. Your cart has been preserved.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // EMPTY CART STATE (Section 15)
  if (cart.length === 0) {
    return (
      <div id="checkout-empty-cart-state" className="min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 font-display">Your Cart is Empty</h2>
          <p className="text-sm text-stone-500 mt-2 leading-relaxed">
            You don't have any items ready for checkout. Browse our stone-baked pizza menu and hand-crafted sides to get started!
          </p>
          <div className="mt-8">
            <button
              type="button"
              id="empty-cart-start-ordering-btn"
              onClick={onBackToMenu}
              className="w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              Start Ordering Fresh Pizza
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="checkout-page-container" className="min-h-screen bg-stone-50/60 pb-20 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBackToMenu}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer py-1.5 px-3 rounded-xl hover:bg-stone-200/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Menu</span>
          </button>

          <div className="text-right">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Saudi Arabia Checkout
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              15% VAT Compliant (ZATCA)
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
            Checkout & Delivery
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Complete your order details below for rapid stone-oven baking and courier dispatch.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Checkout Steps Form (8 cols on lg) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <CustomerInfoStep
              customer={customer}
              onChange={setCustomer}
              errors={errors}
              onFieldBlur={handleCustomerBlur}
            />

            <DeliveryStep
              deliveryMethod={deliveryMethod}
              onDeliveryMethodChange={setDeliveryMethod}
              address={address}
              onAddressChange={setAddress}
              errors={errors}
              onFieldBlur={handleAddressBlur}
            />

            <PaymentMethodStep
              selectedMethod={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          {/* Right Column: Order Summary & Place Order CTA (4-5 cols on lg) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <OrderSummaryCard
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={isSubmitting}
              isValid={Object.keys(errors).length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
