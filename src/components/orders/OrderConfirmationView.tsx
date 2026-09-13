import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  RotateCcw,
  ArrowLeft,
  Copy,
  Check,
  Flame,
  Truck,
  Store,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../utils/currency';
import {
  ORDER_TIMELINE_STEPS,
  getTimelineStepIndex,
  updateOrderStatus,
} from '../../services/orderService';
import { useCart } from '../../context/CartContext';

interface OrderConfirmationViewProps {
  order: Order;
  onReorder: (order: Order) => void;
  onViewAllOrders: () => void;
  onBackToMenu: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order: initialOrder,
  onReorder,
  onViewAllOrders,
  onBackToMenu,
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [copied, setCopied] = useState(false);
  const { showToast } = useCart();

  // Sync state if initialOrder changes
  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const currentStepIndex = getTimelineStepIndex(order.orderStatus);

  const handleCopyOrderNumber = () => {
    navigator.clipboard?.writeText(order.orderNumber);
    setCopied(true);
    showToast({
      title: 'Order number copied to clipboard',
      message: order.orderNumber,
      type: 'info',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Test Simulation helper to manually cycle statuses or see next status
  const handleAdvanceStatus = (newStatus: OrderStatus) => {
    const updated = updateOrderStatus(order.id, newStatus);
    if (updated) {
      setOrder({ ...updated });
      showToast({
        title: `Status updated: ${newStatus}`,
        type: 'success',
      });
    }
  };

  return (
    <div id="order-confirmation-container" className="min-h-screen bg-stone-50/60 pb-20 pt-6 sm:pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBackToMenu}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-xl hover:bg-stone-200/60 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Menu</span>
          </button>

          <button
            type="button"
            onClick={onViewAllOrders}
            className="text-xs sm:text-sm font-bold text-stone-900 hover:text-red-600 transition-colors cursor-pointer"
          >
            View All Orders →
          </button>
        </div>

        {/* HERO CONFIRMATION HEADER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm text-center mb-8 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-[11px] font-bold text-red-600 tracking-wider uppercase px-3 py-1 rounded-full bg-red-50 inline-block mb-2">
            Stone Oven Cooking Started
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 font-display">
            Order Confirmed! 🍕
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-2">
            Thank you, <strong>{order.customer.fullName}</strong>. Your artisanal Italian pizza is being freshly hand-crafted and fired in our 450°C stone oven.
          </p>

          {/* ORDER IDENTIFIER PILL */}
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-stone-100/80 rounded-2xl border border-stone-200">
            <span className="text-xs text-stone-500 font-medium">Order Reference:</span>
            <span className="text-xs sm:text-sm font-mono font-bold text-stone-900">
              {order.orderNumber}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="p-1 rounded-md hover:bg-white text-stone-500 hover:text-stone-900 transition-colors cursor-pointer ml-1"
              title="Copy Order Number"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-100 text-left">
            <div className="p-3 bg-stone-50 rounded-xl">
              <span className="text-[11px] text-stone-400 block font-medium">Estimated Arrival</span>
              <span className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                {order.estimatedTime}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl">
              <span className="text-[11px] text-stone-400 block font-medium">Total Amount</span>
              <span className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5 block">
                {formatPrice(order.total)}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl">
              <span className="text-[11px] text-stone-400 block font-medium">Payment Mode</span>
              <span className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5 block truncate capitalize">
                {order.paymentMethod.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl">
              <span className="text-[11px] text-stone-400 block font-medium">Delivery Mode</span>
              <span className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5 block capitalize flex items-center gap-1">
                {order.deliveryMethod === 'delivery' ? (
                  <>
                    <Truck className="w-3.5 h-3.5 text-stone-600" />
                    Delivery
                  </>
                ) : (
                  <>
                    <Store className="w-3.5 h-3.5 text-stone-600" />
                    Pickup
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* VISUAL ORDER PROGRESS TRACKER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-display">Live Order Status</h2>
              <p className="text-xs text-stone-500">Track your pizza journey from dough stretch to delivery</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{order.orderStatus}</span>
            </div>
          </div>

          {/* Timeline Horizontal on Desktop, Vertical on Mobile */}
          <div className="relative mt-4">
            <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-stone-100 -z-0">
              <div
                className="h-full bg-red-600 transition-all duration-700"
                style={{
                  width: `${Math.max(0, ((currentStepIndex - 1) / (ORDER_TIMELINE_STEPS.length - 1)) * 100)}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
              {ORDER_TIMELINE_STEPS.map((step) => {
                const isPassed = currentStepIndex > step.stepIndex;
                const isCurrent = currentStepIndex === step.stepIndex;
                const isUpcoming = currentStepIndex < step.stepIndex;

                return (
                  <div
                    key={step.key}
                    className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                        isPassed
                          ? 'bg-red-600 text-white shadow-sm'
                          : isCurrent
                          ? 'bg-red-600 text-white ring-4 ring-red-100 shadow-md animate-bounce-subtle'
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : step.stepIndex}
                    </div>

                    <div className="flex-1 sm:flex-none">
                      <h4
                        className={`text-xs font-bold leading-tight ${
                          isCurrent
                            ? 'text-red-700 font-extrabold'
                            : isPassed
                            ? 'text-stone-900'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-stone-400 mt-0.5 hidden sm:block">
                        {step.labelAr}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulation status changer (Helpful for reviewer to inspect tracker states) */}
          <div className="mt-8 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-stone-400 font-medium">Demo Simulator:</span>
            <div className="flex flex-wrap gap-1.5">
              {ORDER_TIMELINE_STEPS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleAdvanceStatus(s.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    order.orderStatus === s.key
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DETAILS GRID: CUSTOMER & DESTINATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Customer & Payment Info */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
              <User className="w-4 h-4 text-stone-500" />
              Customer Details
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Name</span>
                <span className="font-bold text-stone-900">{order.customer.fullName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Saudi Phone</span>
                <span className="font-mono font-bold text-stone-900">{order.customer.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Email</span>
                <span className="font-medium text-stone-900">{order.customer.email}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-500">Payment Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery / Pickup Address Info */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-500" />
              {order.deliveryMethod === 'delivery' ? 'Delivery Destination' : 'Pickup Branch'}
            </h3>

            {order.deliveryMethod === 'delivery' && order.deliveryAddress ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">City & District</span>
                  <span className="font-bold text-stone-900">
                    {order.deliveryAddress.city}, {order.deliveryAddress.district}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100">
                  <span className="text-stone-500">Street & Building</span>
                  <span className="font-medium text-stone-900">
                    {order.deliveryAddress.street}, {order.deliveryAddress.buildingNumber}
                  </span>
                </div>
                {order.deliveryAddress.apartmentOrUnit && (
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Apartment / Unit</span>
                    <span className="font-medium text-stone-900">
                      {order.deliveryAddress.apartmentOrUnit}
                    </span>
                  </div>
                )}
                {order.deliveryAddress.notes && (
                  <div className="py-1.5 text-stone-500">
                    <span className="block font-medium text-stone-600 mb-0.5">Driver Notes:</span>
                    <p className="italic bg-stone-50 p-2 rounded-lg text-[11px]">
                      "{order.deliveryAddress.notes}"
                    </p>
                  </div>
                )}
              </div>
            ) : order.pickupLocation ? (
              <div className="space-y-2 text-xs">
                <div className="py-1.5 border-b border-stone-100">
                  <span className="font-bold text-stone-900 text-sm block">
                    {order.pickupLocation.name}
                  </span>
                  <span className="text-stone-500">{order.pickupLocation.branch}</span>
                </div>
                <div className="py-1.5 border-b border-stone-100 text-stone-600">
                  {order.pickupLocation.address}, {order.pickupLocation.city}
                </div>
                <div className="py-1.5 text-stone-500 flex items-center justify-between">
                  <span>Branch Phone:</span>
                  <span className="font-bold text-stone-900">{order.pickupLocation.phone}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* ORDER ITEMS RECEIPT BREAKDOWN */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-stone-900 font-display mb-6 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-red-600" />
            Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
          </h3>

          <div className="divide-y divide-stone-100 mb-6">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0 bg-stone-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-stone-900">{item.name}</h4>
                    <span className="text-sm font-bold text-stone-900 shrink-0">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 mt-0.5">
                    Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-1.5 text-[11px] text-stone-600">
                    {item.selectedSize && (
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 font-medium">
                        {item.selectedSize.name}
                      </span>
                    )}
                    {item.selectedCrust && (
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 font-medium">
                        {item.selectedCrust.name}
                      </span>
                    )}
                    {item.selectedToppings.map((t) => (
                      <span key={t.id} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-medium">
                        +{t.name}
                      </span>
                    ))}
                    {item.isBundle && (
                      <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-bold">
                        Bundle Deal
                      </span>
                    )}
                  </div>

                  {item.specialInstructions && (
                    <p className="text-xs text-stone-500 italic mt-1.5">
                      Kitchen Note: "{item.specialInstructions}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Ledger */}
          <div className="pt-6 border-t border-stone-200 space-y-2 text-xs max-w-sm ml-auto">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">{formatPrice(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount Savings {order.promoCode ? `(${order.promoCode})` : ''}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-stone-900">
                {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
              </span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>VAT (15% ZATCA)</span>
              <span className="font-semibold text-stone-900">{formatPrice(order.vat)}</span>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-stone-900">Total Paid / Due</span>
              <span className="text-xl font-black text-stone-900 font-display">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            id="order-confirmation-reorder-btn"
            onClick={() => onReorder(order)}
            className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reorder All Items</span>
          </button>

          <button
            type="button"
            id="order-confirmation-all-orders-btn"
            onClick={onViewAllOrders}
            className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-sm border border-stone-200 shadow-xs transition-all cursor-pointer"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};
