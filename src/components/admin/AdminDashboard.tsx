import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  ShoppingBag,
  Pizza,
  FolderTree,
  Flame,
  Ticket,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronRight,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { formatSAR } from '../../utils/currency';

interface AdminDashboardProps {
  onBackToMenu: () => void;
}

type AdminTab =
  | 'overview'
  | 'orders'
  | 'products'
  | 'categories'
  | 'toppings'
  | 'offers'
  | 'coupons'
  | 'customers';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToMenu }) => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { showToast } = useCart();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Loading & Data states
  const [overview, setOverview] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [isToppingModalOpen, setIsToppingModalOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState<any | null>(null);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    categoryId: '',
    basePrice: 45,
    isPopular: false,
    isFeatured: false,
    isAvailable: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  });

  const [toppingForm, setToppingForm] = useState({
    name: '',
    category: 'CHEESE',
    price: 5,
    isAvailable: true,
  });

  const [offerForm, setOfferForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    originalPrice: 120,
    discountedPrice: 89,
    isActive: true,
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minimumOrder: 50,
    maximumDiscount: 50,
    usageLimit: 100,
    isActive: true,
  });

  // Fetch data on activeTab change
  useEffect(() => {
    if (isAdmin) {
      loadTabData(activeTab);
    }
  }, [isAdmin, activeTab, orderFilter]);

  const loadTabData = async (tab: AdminTab) => {
    setIsLoading(true);
    try {
      if (tab === 'overview') {
        const data = await api.admin.getOverview();
        setOverview(data);
      } else if (tab === 'orders') {
        const data = await api.admin.getOrders(orderFilter);
        setOrders(data);
      } else if (tab === 'products') {
        const [pData, cData] = await Promise.all([
          api.admin.getProducts(),
          api.admin.getCategories(),
        ]);
        setProducts(pData);
        setCategories(cData);
      } else if (tab === 'categories') {
        const data = await api.admin.getCategories();
        setCategories(data);
      } else if (tab === 'toppings') {
        const data = await api.admin.getToppings();
        setToppings(data);
      } else if (tab === 'offers') {
        const data = await api.admin.getOffers();
        setOffers(data);
      } else if (tab === 'coupons') {
        const data = await api.admin.getCoupons();
        setCoupons(data);
      } else if (tab === 'customers') {
        const data = await api.admin.getCustomers();
        setCustomers(data);
      }
    } catch (err: any) {
      showToast({
        title: 'Error loading data',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Authorization Check
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-stone-900 mb-2">
          Access Denied
        </h2>
        <p className="text-xs text-stone-600 mb-6 leading-relaxed">
          The Gustoso Administration Dashboard requires <strong>ADMIN</strong> credentials.
          Please log in with an administrator account to access this panel.
        </p>
        <button
          onClick={onBackToMenu}
          className="px-6 py-2.5 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
        >
          Return to Gustoso Menu
        </button>
      </div>
    );
  }

  // Handle Order Status update
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, status);
      showToast({
        title: 'Order Status Updated',
        message: `Order marked as ${status}`,
        type: 'success',
      });
      loadTabData('orders');
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: status });
      }
    } catch (err: any) {
      showToast({
        title: 'Update Failed',
        message: err.message,
        type: 'error',
      });
    }
  };

  // Handle Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.admin.updateProduct(editingProduct.id, productForm);
        showToast({ title: 'Product Updated', type: 'success' });
      } else {
        await api.admin.createProduct(productForm);
        showToast({ title: 'Product Created', type: 'success' });
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadTabData('products');
    } catch (err: any) {
      showToast({ title: 'Action Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.admin.deleteProduct(id);
      showToast({ title: 'Product Deleted', type: 'info' });
      loadTabData('products');
    } catch (err: any) {
      showToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  // Handle Category Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.admin.updateCategory(editingCategory.id, categoryForm);
        showToast({ title: 'Category Updated', type: 'success' });
      } else {
        await api.admin.createCategory(categoryForm);
        showToast({ title: 'Category Created', type: 'success' });
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      loadTabData('categories');
    } catch (err: any) {
      showToast({ title: 'Action Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Products in this category must be reassigned first.')) return;
    try {
      await api.admin.deleteCategory(id);
      showToast({ title: 'Category Deleted', type: 'info' });
      loadTabData('categories');
    } catch (err: any) {
      showToast({ title: 'Delete Blocked', message: err.message, type: 'error' });
    }
  };

  // Handle Topping Save
  const handleSaveTopping = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTopping) {
        await api.admin.updateTopping(editingTopping.id, toppingForm);
        showToast({ title: 'Topping Updated', type: 'success' });
      } else {
        await api.admin.createTopping(toppingForm);
        showToast({ title: 'Topping Created', type: 'success' });
      }
      setIsToppingModalOpen(false);
      setEditingTopping(null);
      loadTabData('toppings');
    } catch (err: any) {
      showToast({ title: 'Action Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeleteTopping = async (id: string) => {
    if (!confirm('Delete this topping?')) return;
    try {
      await api.admin.deleteTopping(id);
      showToast({ title: 'Topping Deleted', type: 'info' });
      loadTabData('toppings');
    } catch (err: any) {
      showToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  // Handle Offer Save
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOffer) {
        await api.admin.updateOffer(editingOffer.id, offerForm);
        showToast({ title: 'Deal Updated', type: 'success' });
      } else {
        await api.admin.createOffer(offerForm);
        showToast({ title: 'Deal Created', type: 'success' });
      }
      setIsOfferModalOpen(false);
      setEditingOffer(null);
      loadTabData('offers');
    } catch (err: any) {
      showToast({ title: 'Action Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Delete this special deal?')) return;
    try {
      await api.admin.deleteOffer(id);
      showToast({ title: 'Deal Deleted', type: 'info' });
      loadTabData('offers');
    } catch (err: any) {
      showToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  // Handle Coupon Save
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await api.admin.updateCoupon(editingCoupon.id, couponForm);
        showToast({ title: 'Coupon Updated', type: 'success' });
      } else {
        await api.admin.createCoupon(couponForm);
        showToast({ title: 'Coupon Created', type: 'success' });
      }
      setIsCouponModalOpen(false);
      setEditingCoupon(null);
      loadTabData('coupons');
    } catch (err: any) {
      showToast({ title: 'Action Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.admin.deleteCoupon(id);
      showToast({ title: 'Coupon Deleted', type: 'info' });
      loadTabData('coupons');
    } catch (err: any) {
      showToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-12">
      {/* Top Admin Header */}
      <div className="bg-stone-900 text-white px-4 sm:px-6 lg:px-8 py-4 border-b border-stone-800 sticky top-16 sm:top-18 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMenu}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
                  Gustoso Administration Console
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black uppercase tracking-wider">
                  KSA Admin
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Connected to PostgreSQL & Prisma ORM • Centralized 15% VAT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadTabData(activeTab)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <div className="text-right text-xs hidden md:block">
              <span className="text-stone-400">Logged as: </span>
              <span className="font-bold text-amber-400">{user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6 border-b border-stone-200 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
            { id: 'products', label: 'Products', icon: Pizza },
            { id: 'categories', label: 'Categories', icon: FolderTree },
            { id: 'toppings', label: 'Toppings', icon: CheckCircle },
            { id: 'offers', label: 'Deals & Combos', icon: Flame },
            { id: 'coupons', label: 'Coupons', icon: Ticket },
            { id: 'customers', label: 'Customers', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {overview ? (
              <>
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Total Sales (SAR)
                    </p>
                    <p className="text-2xl font-extrabold text-stone-900 mt-1">
                      {formatSAR(overview.totalSales)}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      15% VAT Included
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Today's Sales
                    </p>
                    <p className="text-2xl font-extrabold text-stone-900 mt-1">
                      {formatSAR(overview.todaySales)}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1">Live from midnight</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Total Orders
                    </p>
                    <p className="text-2xl font-extrabold text-stone-900 mt-1">
                      {overview.totalOrders}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-1">Across all branches</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Pending / Active
                    </p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">
                      {overview.pendingOrders}
                    </p>
                    <p className="text-[10px] text-amber-600 font-semibold mt-1">In kitchen / transit</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs col-span-2 lg:col-span-1">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Registered Customers
                    </p>
                    <p className="text-2xl font-extrabold text-stone-900 mt-1">
                      {overview.registeredCustomers}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">Active customer accounts</p>
                  </div>
                </div>

                {/* Best Selling Products */}
                <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-500" />
                    Best-Selling Pizzas & Items
                  </h2>

                  <div className="divide-y divide-stone-100">
                    {overview.bestSellingProducts?.map((item: any, idx: number) => (
                      <div key={idx} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 text-xs font-black flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-stone-800">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-6 text-xs">
                          <span className="text-stone-500">{item.quantity} orders</span>
                          <span className="font-extrabold text-stone-900">
                            {formatSAR(item.revenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-stone-500">Loading overview metrics...</div>
            )}
          </div>
        )}

        {/* Tab 2: Orders Management */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            {/* Filters Bar */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-stone-500 uppercase">Filter:</span>
                {[
                  { label: 'All', value: '' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Confirmed', value: 'CONFIRMED' },
                  { label: 'Preparing', value: 'PREPARING' },
                  { label: 'Ready', value: 'READY' },
                  { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
                  { label: 'Delivered', value: 'DELIVERED' },
                  { label: 'Cancelled', value: 'CANCELLED' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setOrderFilter(f.value)}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                      orderFilter === f.value
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-600">
                  <thead className="bg-stone-50 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Total (SAR)</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                          No orders matching filter.
                        </td>
                      </tr>
                    ) : (
                      orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-stone-900">
                            {ord.orderNumber}
                          </td>
                          <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                            {new Date(ord.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-stone-900">
                              {ord.customerSnapshot?.fullName || ord.customerSnapshot?.name || 'Guest'}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              {ord.customerSnapshot?.phone}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-stone-700">
                              {ord.deliveryMethod}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-stone-900">
                            {formatSAR(ord.total)}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              className={`text-xs font-bold uppercase rounded-lg px-2 py-1 border cursor-pointer ${
                                ord.orderStatus === 'DELIVERED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : ord.orderStatus === 'CANCELLED'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PREPARING">PREPARING</option>
                              <option value="READY">READY</option>
                              <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                              title="View Order Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Products Management */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display text-stone-900">
                Menu Products ({products.length})
              </h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    slug: '',
                    description: '',
                    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900',
                    categoryId: categories[0]?.id || '',
                    basePrice: 45,
                    isPopular: false,
                    isFeatured: false,
                    isAvailable: true,
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Base Price</th>
                    <th className="px-4 py-3">Flags</th>
                    <th className="px-4 py-3">Available</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => {
                    const cat = categories.find((c) => c.id === p.categoryId);
                    return (
                      <tr key={p.id} className="hover:bg-stone-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-bold text-stone-900">{p.name}</div>
                              <div className="text-[11px] text-stone-400">{p.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-700">
                          {cat?.name || p.categoryId}
                        </td>
                        <td className="px-4 py-3 font-bold text-stone-900">
                          {formatSAR(p.basePrice)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {p.isPopular && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                POPULAR
                              </span>
                            )}
                            {p.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                                FEATURED
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={async () => {
                              await api.admin.updateProduct(p.id, { isAvailable: !p.isAvailable });
                              loadTabData('products');
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase cursor-pointer ${
                              p.isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {p.isAvailable ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  name: p.name,
                                  slug: p.slug,
                                  description: p.description,
                                  image: p.image,
                                  categoryId: p.categoryId,
                                  basePrice: p.basePrice,
                                  isPopular: p.isPopular,
                                  isFeatured: p.isFeatured,
                                  isAvailable: p.isAvailable,
                                });
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Categories Management */}
        {activeTab === 'categories' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display text-stone-900">
                Categories ({categories.length})
              </h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', slug: '', description: '', image: '' });
                  setIsCategoryModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-stone-900">{cat.name}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryForm({
                            name: cat.name,
                            slug: cat.slug,
                            description: cat.description || '',
                            image: cat.image || '',
                          });
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1 text-stone-500 hover:text-stone-900"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-stone-400 mb-1">slug: {cat.slug}</p>
                  <p className="text-xs text-stone-600">{cat.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Toppings Management */}
        {activeTab === 'toppings' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display text-stone-900">
                Toppings & Extras ({toppings.length})
              </h2>
              <button
                onClick={() => {
                  setEditingTopping(null);
                  setToppingForm({ name: '', category: 'CHEESE', price: 5, isAvailable: true });
                  setIsToppingModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Topping</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">Topping Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price (SAR)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {toppings.map((top) => (
                    <tr key={top.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-bold text-stone-900">{top.name}</td>
                      <td className="px-4 py-3 font-medium text-stone-600">{top.category}</td>
                      <td className="px-4 py-3 font-extrabold text-stone-900">
                        {formatSAR(top.price)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            await api.admin.updateTopping(top.id, { isAvailable: !top.isAvailable });
                            loadTabData('toppings');
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase cursor-pointer ${
                            top.isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {top.isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingTopping(top);
                              setToppingForm({
                                name: top.name,
                                category: top.category,
                                price: top.price,
                                isAvailable: top.isAvailable,
                              });
                              setIsToppingModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTopping(top.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Deals & Offers Management */}
        {activeTab === 'offers' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display text-stone-900">
                Combo Deals & Special Offers ({offers.length})
              </h2>
              <button
                onClick={() => {
                  setEditingOffer(null);
                  setOfferForm({
                    name: '',
                    slug: '',
                    description: '',
                    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900',
                    originalPrice: 120,
                    discountedPrice: 89,
                    isActive: true,
                  });
                  setIsOfferModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Deal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((deal) => (
                <div key={deal.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">{deal.name}</h3>
                      <p className="text-xs text-stone-500">{deal.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingOffer(deal);
                          setOfferForm({
                            name: deal.name,
                            slug: deal.slug,
                            description: deal.description || '',
                            image: deal.image || '',
                            originalPrice: deal.originalPrice,
                            discountedPrice: deal.discountedPrice,
                            isActive: deal.isActive,
                          });
                          setIsOfferModalOpen(true);
                        }}
                        className="p-1 text-stone-500 hover:text-stone-900"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(deal.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-sm font-extrabold text-stone-900">
                      {formatSAR(deal.discountedPrice)}
                    </span>
                    <span className="text-xs text-stone-400 line-through">
                      {formatSAR(deal.originalPrice)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold uppercase">
                      Save {deal.discountPercentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Coupons Management */}
        {activeTab === 'coupons' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-display text-stone-900">
                Promo Coupons ({coupons.length})
              </h2>
              <button
                onClick={() => {
                  setEditingCoupon(null);
                  setCouponForm({
                    code: '',
                    discountType: 'PERCENTAGE',
                    discountValue: 15,
                    minimumOrder: 50,
                    maximumDiscount: 50,
                    usageLimit: 100,
                    isActive: true,
                  });
                  setIsCouponModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Coupon</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3">Min Order</th>
                    <th className="px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-mono font-bold text-stone-900">{c.code}</td>
                      <td className="px-4 py-3">{c.discountType}</td>
                      <td className="px-4 py-3 font-bold text-stone-900">
                        {c.discountType === 'PERCENTAGE'
                          ? `${c.discountValue}%`
                          : formatSAR(c.discountValue)}
                      </td>
                      <td className="px-4 py-3">{formatSAR(c.minimumOrder)}</td>
                      <td className="px-4 py-3">
                        {c.timesUsed || 0} / {c.usageLimit || '∞'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingCoupon(c);
                              setCouponForm({
                                code: c.code,
                                discountType: c.discountType,
                                discountValue: c.discountValue,
                                minimumOrder: c.minimumOrder,
                                maximumDiscount: c.maximumDiscount || 50,
                                usageLimit: c.usageLimit || 100,
                                isActive: c.isActive,
                              });
                              setIsCouponModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 8: Customers Management */}
        {activeTab === 'customers' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-base font-bold font-display text-stone-900">
              Registered Customer Accounts ({customers.length})
            </h2>

            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Orders Placed</th>
                    <th className="px-4 py-3">Total Spent (SAR)</th>
                    <th className="px-4 py-3">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-stone-900">{cust.name}</div>
                        <div className="text-[11px] text-stone-400">{cust.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            cust.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {cust.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">{cust.phone}</td>
                      <td className="px-4 py-3 font-bold text-stone-900">{cust.ordersCount}</td>
                      <td className="px-4 py-3 font-extrabold text-stone-900">
                        {formatSAR(cust.totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-stone-400">
                        {new Date(cust.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold font-display text-stone-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProductForm({
                      ...productForm,
                      name: val,
                      slug: editingProduct ? productForm.slug : val.toLowerCase().replace(/\s+/g, '-'),
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Base Price (SAR)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={productForm.basePrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, basePrice: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Image URL</label>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={productForm.isPopular}
                    onChange={(e) => setProductForm({ ...productForm, isPopular: e.target.checked })}
                  />
                  Popular
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                  />
                  Available
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold font-display text-stone-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      name: e.target.value,
                      slug: editingCategory ? categoryForm.slug : e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topping Modal */}
      {isToppingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold font-display text-stone-900 mb-4">
              {editingTopping ? 'Edit Topping' : 'Add Topping'}
            </h3>
            <form onSubmit={handleSaveTopping} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={toppingForm.name}
                  onChange={(e) => setToppingForm({ ...toppingForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Category</label>
                <select
                  value={toppingForm.category}
                  onChange={(e) => setToppingForm({ ...toppingForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                >
                  <option value="CHEESE">CHEESE</option>
                  <option value="MEAT">MEAT</option>
                  <option value="VEGGIE">VEGGIE</option>
                  <option value="SAUCE">SAUCE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Price (SAR)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={toppingForm.price}
                  onChange={(e) => setToppingForm({ ...toppingForm, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="top-avail-check"
                  checked={toppingForm.isAvailable}
                  onChange={(e) => setToppingForm({ ...toppingForm, isAvailable: e.target.checked })}
                />
                <label htmlFor="top-avail-check" className="text-xs">
                  Available in Kitchen
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsToppingModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase"
                >
                  Save Topping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-bold font-mono text-stone-900">
                  {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-stone-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Customer Snapshot */}
              <div className="bg-stone-50 p-3 rounded-xl">
                <p className="font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Customer Details Snapshot
                </p>
                <p className="font-semibold text-stone-900">
                  {selectedOrder.customerSnapshot?.fullName || selectedOrder.customerSnapshot?.name}
                </p>
                <p className="text-stone-600">{selectedOrder.customerSnapshot?.phone}</p>
                <p className="text-stone-600">{selectedOrder.customerSnapshot?.email}</p>
              </div>

              {/* Delivery Address Snapshot */}
              {selectedOrder.deliveryAddressSnapshot && (
                <div className="bg-stone-50 p-3 rounded-xl">
                  <p className="font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Delivery Address Snapshot
                  </p>
                  <p className="font-semibold text-stone-900">
                    {selectedOrder.deliveryAddressSnapshot.street},{' '}
                    Building {selectedOrder.deliveryAddressSnapshot.buildingNumber}
                  </p>
                  <p className="text-stone-600">
                    {selectedOrder.deliveryAddressSnapshot.district},{' '}
                    {selectedOrder.deliveryAddressSnapshot.city}
                  </p>
                  {selectedOrder.deliveryAddressSnapshot.apartmentOrUnit && (
                    <p className="text-stone-500">
                      Unit: {selectedOrder.deliveryAddressSnapshot.apartmentOrUnit}
                    </p>
                  )}
                  {selectedOrder.deliveryAddressSnapshot.notes && (
                    <p className="text-stone-400 italic">
                      Note: {selectedOrder.deliveryAddressSnapshot.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Items Breakdown */}
              <div>
                <p className="font-bold text-stone-700 uppercase tracking-wider mb-2">Order Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-stone-200 bg-white flex items-start justify-between"
                    >
                      <div>
                        <p className="font-bold text-stone-900">
                          {item.quantity}x {item.productName || item.name}
                        </p>
                        {item.selectedSize && (
                          <p className="text-[11px] text-stone-500">
                            Size: {item.selectedSize.name}
                          </p>
                        )}
                        {item.selectedCrust && (
                          <p className="text-[11px] text-stone-500">
                            Crust: {item.selectedCrust.name}
                          </p>
                        )}
                        {item.selectedToppings?.length > 0 && (
                          <p className="text-[11px] text-stone-500">
                            Toppings:{' '}
                            {item.selectedToppings.map((t: any) => t.name).join(', ')}
                          </p>
                        )}
                        {item.specialInstructions && (
                          <p className="text-[11px] text-amber-600 font-medium">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-stone-900">
                        {formatSAR(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-3 space-y-1 text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatSAR(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({selectedOrder.discountCode || 'Promo'})</span>
                    <span>-{formatSAR(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatSAR(selectedOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>15% Saudi VAT</span>
                  <span>{formatSAR(selectedOrder.vat)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-stone-900 border-t pt-2">
                  <span>Total Amount</span>
                  <span>{formatSAR(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
