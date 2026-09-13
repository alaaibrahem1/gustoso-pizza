import React, { useState, useEffect } from 'react';
import {
  Clock,
  RotateCcw,
  ExternalLink,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Store,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Order } from '../../types';
import { getSavedOrders } from '../../services/orderService';
import { formatPrice } from '../../utils/currency';
import { useCart } from '../../context/CartContext';

interface OrderHistoryViewProps {
  onSelectOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
  onBackToMenu: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  onSelectOrder,
  onReorder,
  onBackToMenu,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { showToast } = useCart();

  useEffect(() => {
    const loaded = getSavedOrders();
    setOrders(loaded);
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery'].includes(
        order.orderStatus
      );
    }
    if (filter === 'completed') {
      return order.orderStatus === 'Delivered';
    }
    return true;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Out for Delivery':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Preparing':
      case 'Ready':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Confirmed':
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div id="order-history-container" className="min-h-screen bg-stone-50/60 pb-20 pt-6 sm:pt-10">
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
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              View your previous orders, live order tracking, and quick reordering
            </p>
          </div>

          {/* Filter Pills */}
          {orders.length > 0 && (
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === 'active'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === 'completed'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Delivered
              </button>
            </div>
          )}
        </div>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-12 border border-stone-200 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 font-display">No Orders Found Yet</h2>
            <p className="text-sm text-stone-500 max-w-sm mx-auto mt-2 leading-relaxed">
              You haven't placed an artisanal pizza order yet. Explore our authentic menu and enjoy fast delivery in Saudi Arabia.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onBackToMenu}
                className="py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                Explore Pizza Menu
              </button>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center">
            <p className="text-sm text-stone-500">No orders matching this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 hover:border-stone-300 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-stone-900">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        {order.deliveryMethod === 'delivery' ? (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-stone-400" />
                            Delivery to {order.deliveryAddress?.city || 'Saudi Arabia'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-stone-400" />
                            Al Olaya Branch Pickup
                          </span>
                        )}
                        <span>•</span>
                        <span>{order.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-stone-400 block">Total Amount</span>
                      <span className="text-lg font-black text-stone-900 font-display">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Items Thumbnails & List preview */}
                  <div className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {order.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="relative group shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200"
                          />
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-stone-900 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 shrink-0">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order)}
                        className="py-2 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Track / Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onReorder(order)}
                        className="py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
