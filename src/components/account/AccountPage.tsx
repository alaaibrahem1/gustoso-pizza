import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  MapPin,
  Clock,
  LogOut,
  Plus,
  Trash2,
  Check,
  Shield,
  Phone,
  Mail,
  Receipt,
  ArrowRight,
  Repeat,
  Sparkles,
  AlertCircle,
  Home,
  Briefcase,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { formatSAR } from '../../utils/currency';
import { Order } from '../../types';

interface AccountPageProps {
  onBackToMenu: () => void;
  onOpenAdmin?: () => void;
  onSelectOrder?: (order: Order) => void;
  onReorder?: (order: Order) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onBackToMenu,
  onOpenAdmin,
  onSelectOrder,
  onReorder,
}) => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { showToast } = useCart();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  // New Address Form
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    city: 'Riyadh',
    district: '',
    street: '',
    buildingNumber: '',
    apartmentOrUnit: '',
    notes: '',
    isDefault: false,
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Refresh profile values if user updates
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [user]);

  // Load addresses when on addresses tab
  useEffect(() => {
    if (isAuthenticated && activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [isAuthenticated, activeTab]);

  // Load orders when on orders tab
  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      fetchOrders();
    }
  }, [isAuthenticated, activeTab]);

  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const data = await api.addresses.list();
      setAddresses(data);
    } catch (err: any) {
      console.error('Failed to load addresses:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const data = await api.orders.list();
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      await updateProfile({ name, phone });
      showToast({
        title: 'Profile Updated',
        message: 'Your contact information was updated successfully.',
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Update Failed',
        message: err.message || 'Could not update profile',
        type: 'error',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.district || !newAddress.street || !newAddress.buildingNumber) {
      showToast({
        title: 'Missing information',
        message: 'Please fill in district, street, and building number.',
        type: 'error',
      });
      return;
    }

    try {
      setIsSavingAddress(true);
      await api.addresses.create(newAddress);
      showToast({
        title: 'Address Saved',
        message: 'Your delivery address has been saved to your account.',
        type: 'success',
      });
      setShowAddAddressModal(false);
      setNewAddress({
        label: 'Home',
        city: 'Riyadh',
        district: '',
        street: '',
        buildingNumber: '',
        apartmentOrUnit: '',
        notes: '',
        isDefault: false,
      });
      fetchAddresses();
    } catch (err: any) {
      showToast({
        title: 'Save Failed',
        message: err.message || 'Could not save address',
        type: 'error',
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.addresses.delete(id);
      showToast({
        title: 'Address Deleted',
        message: 'Address removed from your account',
        type: 'info',
      });
      fetchAddresses();
    } catch (err: any) {
      showToast({
        title: 'Delete Failed',
        message: err.message || 'Could not delete address',
        type: 'error',
      });
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await api.addresses.setDefault(id);
      showToast({
        title: 'Default Address Updated',
        message: 'This address is now set as your primary delivery address.',
        type: 'success',
      });
      fetchAddresses();
    } catch (err: any) {
      showToast({
        title: 'Action Failed',
        message: err.message || 'Could not update default address',
        type: 'error',
      });
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-stone-900 mb-2">
          Customer Account
        </h2>
        <p className="text-sm text-stone-600 mb-6">
          Please sign in to view your profile, manage saved delivery addresses, and track past orders.
        </p>
        <button
          id="account-back-to-menu-btn"
          onClick={onBackToMenu}
          className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Notice Banner if user is ADMIN */}
      {user.role === 'ADMIN' && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                Administrator Privileges Active
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black uppercase">
                  Admin
                </span>
              </h3>
              <p className="text-xs text-stone-600">
                You have full access to manage products, categories, orders, toppings, and store analytics.
              </p>
            </div>
          </div>
          {onOpenAdmin && (
            <button
              id="account-go-to-admin-btn"
              onClick={onOpenAdmin}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
            >
              <span>Open Admin Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Account Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center text-2xl font-bold font-display shadow-md">
            {user.name ? user.name.charAt(0).toUpperCase() : 'G'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display text-stone-900">{user.name}</h1>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  user.role === 'ADMIN'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                {user.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                {user.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="account-logout-btn"
            onClick={() => {
              logout();
              showToast({ title: 'Signed Out', message: 'You have been logged out.', type: 'info' });
              onBackToMenu();
            }}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-stone-200 mb-6 gap-2">
        <button
          id="account-tab-profile"
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'profile'
              ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Info</span>
        </button>

        <button
          id="account-tab-addresses"
          onClick={() => setActiveTab('addresses')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'addresses'
              ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses</span>
        </button>

        <button
          id="account-tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'orders'
              ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Order History</span>
        </button>
      </div>

      {/* Tab 1: Profile Info */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-xl">
          <h2 className="text-base font-bold font-display text-stone-900 mb-4">
            Personal Information
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-stone-400 mt-1">Email is tied to your account authentication.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Saudi Mobile (+966)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <button
              id="account-save-profile-btn"
              type="submit"
              disabled={isUpdatingProfile}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold font-display text-stone-900">
                Delivery Addresses
              </h2>
              <p className="text-xs text-stone-500">
                Save your home, office, and frequent delivery locations in Saudi Arabia for fast checkout.
              </p>
            </div>
            <button
              id="account-add-address-btn"
              onClick={() => setShowAddAddressModal(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Address</span>
            </button>
          </div>

          {isLoadingAddresses ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading saved addresses...
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
              <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">No saved addresses yet</p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Add your Riyadh or Jeddah address to automatically fill in delivery details during checkout.
              </p>
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-xs relative ${
                    addr.isDefault ? 'border-red-500 ring-2 ring-red-500/10' : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
                        {addr.label === 'Work' ? (
                          <Briefcase className="w-4 h-4" />
                        ) : (
                          <Home className="w-4 h-4" />
                        )}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        {addr.label || 'Home'}
                      </span>
                    </div>

                    {addr.isDefault ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Default
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-[11px] text-stone-500 hover:text-red-600 font-medium cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-bold text-stone-800">
                    {addr.street}, Building {addr.buildingNumber}
                  </p>
                  <p className="text-xs text-stone-600">
                    {addr.district}, {addr.city}
                  </p>
                  {addr.apartmentOrUnit && (
                    <p className="text-xs text-stone-500">Unit / Apt: {addr.apartmentOrUnit}</p>
                  )}
                  {addr.notes && (
                    <p className="text-[11px] text-stone-400 italic mt-1">Note: {addr.notes}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-stone-400 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Order History */}
      {activeTab === 'orders' && (
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold font-display text-stone-900">
              Your Orders
            </h2>
            <p className="text-xs text-stone-500">
              View your past order details, track statuses, and reorder your favorite meals.
            </p>
          </div>

          {isLoadingOrders ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading order history...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
              <Receipt className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">No orders placed yet</p>
              <p className="text-xs text-stone-500 mt-1">
                Explore our stone-baked pizza menu and enjoy hot delivery across Saudi Arabia.
              </p>
              <button
                onClick={onBackToMenu}
                className="mt-4 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-stone-900 font-mono">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.orderStatus || ord.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500">
                      Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.deliveryMethod}
                    </p>

                    <p className="text-xs font-medium text-stone-700">
                      {ord.items?.map((i: any) => `${i.quantity}x ${i.productName || i.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-stone-900">
                        {formatSAR(ord.total)}
                      </div>
                      <div className="text-[10px] text-stone-400">15% VAT Included</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onSelectOrder && (
                        <button
                          onClick={() => onSelectOrder(ord)}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
                        >
                          View Details
                        </button>
                      )}
                      {onReorder && (
                        <button
                          onClick={() => onReorder(ord)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Repeat className="w-3 h-3" />
                          <span>Reorder</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold font-display text-stone-900 mb-1">
              Add Delivery Address
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter address details according to Saudi National Address format.
            </p>

            <form onSubmit={handleCreateAddress} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Label
                  </label>
                  <select
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work / Office</option>
                    <option value="Villa">Villa</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <select
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  >
                    <option value="Riyadh">Riyadh (الرياض)</option>
                    <option value="Jeddah">Jeddah (جدة)</option>
                    <option value="Dammam">Dammam (الدمام)</option>
                    <option value="Khobar">Al Khobar (الخبر)</option>
                    <option value="Mecca">Mecca (مكة)</option>
                    <option value="Medina">Medina (المدينة)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al Olaya"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Street Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. King Fahd Rd"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Building Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4231"
                    value={newAddress.buildingNumber}
                    onChange={(e) => setNewAddress({ ...newAddress, buildingNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Apartment / Unit
                  </label>
                  <input
                    type="text"
                    placeholder="Optional (e.g. Apt 4B)"
                    value={newAddress.apartmentOrUnit}
                    onChange={(e) => setNewAddress({ ...newAddress, apartmentOrUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Delivery Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring bell, leave with security"
                  value={newAddress.notes}
                  onChange={(e) => setNewAddress({ ...newAddress, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="make-default-checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded border-stone-300"
                />
                <label htmlFor="make-default-checkbox" className="text-xs text-stone-700 font-medium">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-600 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isSavingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
