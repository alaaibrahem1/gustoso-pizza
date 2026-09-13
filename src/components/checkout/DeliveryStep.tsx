import React from 'react';
import {
  Truck,
  Store,
  MapPin,
  Building,
  Navigation,
  FileText,
  Clock,
  PhoneCall,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { SaudiDeliveryAddress } from '../../types';
import { DEFAULT_PICKUP_LOCATION } from '../../services/orderService';
import { formatPrice } from '../../utils/currency';
import { DEFAULT_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '../../utils/pricing';

interface DeliveryStepProps {
  deliveryMethod: 'delivery' | 'pickup';
  onDeliveryMethodChange: (method: 'delivery' | 'pickup') => void;
  address: SaudiDeliveryAddress;
  onAddressChange: (address: SaudiDeliveryAddress) => void;
  errors: Record<string, string>;
  onFieldBlur: (field: keyof SaudiDeliveryAddress) => void;
}

const SAUDI_CITIES = [
  { id: 'riyadh', name: 'Riyadh (الرياض)', available: true },
  { id: 'jeddah', name: 'Jeddah (جدة)', available: true },
  { id: 'dammam', name: 'Dammam (الدمام)', available: true },
  { id: 'khobar', name: 'Al Khobar (الخبر)', available: true },
  { id: 'makkah', name: 'Mecca (مكة المكرمة)', available: true },
  { id: 'madinah', name: 'Medina (المدينة المنورة)', available: true },
];

const POPULAR_RIYADH_DISTRICTS = [
  'Al Olaya (العليا)',
  'Al Malqa (الملقا)',
  'Al Nakheel (النخيل)',
  'Hittin (حطين)',
  'Al Yasmin (الياسمين)',
  'Al Sulaimaniyah (السليمانية)',
  'Al Mohammadiyah (المحمدية)',
  'Al Sahafa (الصحافة)',
];

export const DeliveryStep: React.FC<DeliveryStepProps> = ({
  deliveryMethod,
  onDeliveryMethodChange,
  address,
  onAddressChange,
  errors,
  onFieldBlur,
}) => {
  const handleAddressField = (field: keyof SaudiDeliveryAddress, value: string) => {
    onAddressChange({
      ...address,
      [field]: value,
    });
  };

  return (
    <div id="checkout-delivery-step" className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
          2
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-900 font-display">Delivery Method & Destination</h3>
          <p className="text-xs text-stone-500">Choose home delivery across KSA or direct stone-oven restaurant pickup</p>
        </div>
      </div>

      {/* Delivery vs Pickup Toggle Pills */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-stone-100 rounded-2xl mb-6">
        <button
          type="button"
          id="select-delivery-method-btn"
          onClick={() => onDeliveryMethodChange('delivery')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            deliveryMethod === 'delivery'
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80 font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Truck className={`w-4 h-4 ${deliveryMethod === 'delivery' ? 'text-red-600' : 'text-stone-400'}`} />
          <span>Doorstep Delivery</span>
        </button>

        <button
          type="button"
          id="select-pickup-method-btn"
          onClick={() => onDeliveryMethodChange('pickup')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            deliveryMethod === 'pickup'
              ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80 font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Store className={`w-4 h-4 ${deliveryMethod === 'pickup' ? 'text-red-600' : 'text-stone-400'}`} />
          <span>Restaurant Pickup (Free)</span>
        </button>
      </div>

      {/* DELIVERY FORM */}
      {deliveryMethod === 'delivery' ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Standard delivery: <strong>{formatPrice(DEFAULT_DELIVERY_FEE)}</strong> • Free on orders over{' '}
                <strong>{formatPrice(FREE_DELIVERY_THRESHOLD)}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label htmlFor="delivery-city" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <select
                id="delivery-city"
                value={address.city}
                onChange={(e) => handleAddressField('city', e.target.value)}
                onBlur={() => onFieldBlur('city')}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all bg-white focus:outline-hidden ${
                  errors.city
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                    : 'border-stone-200 focus:border-stone-400 bg-stone-50/30'
                }`}
              >
                <option value="">Select City in Saudi Arabia</option>
                {SAUDI_CITIES.map((city) => (
                  <option key={city.id} value={city.name.split(' (')[0]}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.city}</span>
                </p>
              )}
            </div>

            {/* District */}
            <div>
              <label htmlFor="delivery-district" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                District / حي <span className="text-red-500">*</span>
              </label>
              <input
                id="delivery-district"
                type="text"
                list="popular-districts"
                value={address.district}
                onChange={(e) => handleAddressField('district', e.target.value)}
                onBlur={() => onFieldBlur('district')}
                placeholder="e.g. Al Olaya / العليا"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-hidden ${
                  errors.district
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                    : 'border-stone-200 focus:border-stone-400 bg-stone-50/30'
                }`}
              />
              <datalist id="popular-districts">
                {POPULAR_RIYADH_DISTRICTS.map((dist, idx) => (
                  <option key={idx} value={dist.split(' (')[0]} />
                ))}
              </datalist>
              {errors.district && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.district}</span>
                </p>
              )}
            </div>

            {/* Street */}
            <div>
              <label htmlFor="delivery-street" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Street Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Navigation className="w-4 h-4" />
                </div>
                <input
                  id="delivery-street"
                  type="text"
                  value={address.street}
                  onChange={(e) => handleAddressField('street', e.target.value)}
                  onBlur={() => onFieldBlur('street')}
                  placeholder="e.g. King Fahd Road / Prince Sultan St"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-hidden ${
                    errors.street
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                      : 'border-stone-200 focus:border-stone-400 bg-stone-50/30'
                  }`}
                />
              </div>
              {errors.street && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.street}</span>
                </p>
              )}
            </div>

            {/* Building Number & Apartment */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="delivery-building" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Building # <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    id="delivery-building"
                    type="text"
                    value={address.buildingNumber}
                    onChange={(e) => handleAddressField('buildingNumber', e.target.value)}
                    onBlur={() => onFieldBlur('buildingNumber')}
                    placeholder="Bldg 42"
                    className={`w-full pl-9 pr-3 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-hidden ${
                      errors.buildingNumber
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                        : 'border-stone-200 focus:border-stone-400 bg-stone-50/30'
                    }`}
                  />
                </div>
                {errors.buildingNumber && (
                  <p className="mt-1.5 text-[11px] text-red-600">{errors.buildingNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="delivery-unit" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Apt / Villa (Opt)
                </label>
                <input
                  id="delivery-unit"
                  type="text"
                  value={address.apartmentOrUnit || ''}
                  onChange={(e) => handleAddressField('apartmentOrUnit', e.target.value)}
                  placeholder="Apt 302"
                  className="w-full px-3 py-3 rounded-xl border border-stone-200 text-sm font-medium transition-all focus:outline-hidden focus:border-stone-400 bg-stone-50/30"
                />
              </div>
            </div>

            {/* Additional Delivery Instructions */}
            <div className="sm:col-span-2">
              <label htmlFor="delivery-notes" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Delivery Instructions for Driver (Optional)
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-3.5 text-stone-400 pointer-events-none">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  id="delivery-notes"
                  rows={2}
                  value={address.notes || ''}
                  onChange={(e) => handleAddressField('notes', e.target.value)}
                  placeholder="e.g. Ring doorbell, second floor on the left, leave at security desk"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium transition-all focus:outline-hidden focus:border-stone-400 bg-stone-50/30 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PICKUP DETAILS */
        <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">
                Pickup Branch
              </span>
              <h4 className="text-base font-bold text-stone-900 font-display">
                {DEFAULT_PICKUP_LOCATION.name} • {DEFAULT_PICKUP_LOCATION.branch}
              </h4>
              <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{DEFAULT_PICKUP_LOCATION.address}, {DEFAULT_PICKUP_LOCATION.city}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-200/80">
            <div className="flex items-center gap-2.5 text-xs text-stone-700">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block">Estimated Prep Time</span>
                <span className="text-stone-500">~{DEFAULT_PICKUP_LOCATION.estimatedPrepMinutes} mins from order</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-stone-700">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block">Restaurant Phone</span>
                <span className="text-stone-500">{DEFAULT_PICKUP_LOCATION.phone}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200/80 text-xs text-stone-600 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{DEFAULT_PICKUP_LOCATION.instructions}</span>
          </div>
        </div>
      )}
    </div>
  );
};
