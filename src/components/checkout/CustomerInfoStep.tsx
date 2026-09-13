import React from 'react';
import { User, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { CustomerDetails } from '../../types';

interface CustomerInfoStepProps {
  customer: CustomerDetails;
  onChange: (customer: CustomerDetails) => void;
  errors: Record<string, string>;
  onFieldBlur: (field: keyof CustomerDetails) => void;
}

export const CustomerInfoStep: React.FC<CustomerInfoStepProps> = ({
  customer,
  onChange,
  errors,
  onFieldBlur,
}) => {
  const handleChange = (field: keyof CustomerDetails, value: string) => {
    onChange({
      ...customer,
      [field]: value,
    });
  };

  return (
    <div id="checkout-customer-info-step" className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
          1
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-900 font-display">Customer Information</h3>
          <p className="text-xs text-stone-500">We will use this for delivery updates and your order receipt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label htmlFor="customer-full-name" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="customer-full-name"
              type="text"
              value={customer.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => onFieldBlur('fullName')}
              placeholder="e.g. Abdullah Al-Otaibi"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-hidden ${
                errors.fullName
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 bg-stone-50/30'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.fullName}</span>
            </p>
          )}
        </div>

        {/* Saudi Mobile Phone */}
        <div>
          <label htmlFor="customer-phone" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Saudi Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-xs font-bold text-stone-600 px-1 py-0.5 rounded-sm bg-stone-100 flex items-center gap-1">
                🇸🇦 +966
              </span>
            </div>
            <input
              id="customer-phone"
              type="tel"
              value={customer.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => onFieldBlur('phone')}
              placeholder="50 123 4567"
              className={`w-full pl-22 pr-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-hidden ${
                errors.phone
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 bg-stone-50/30'
              }`}
            />
          </div>
          <div className="mt-1 flex items-center justify-between">
            {errors.phone ? (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            ) : (
              <p className="text-[11px] text-stone-400">Accepts 05XXXXXXXX or 5XXXXXXXX</p>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="customer-email" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="customer-email"
              type="email"
              value={customer.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => onFieldBlur('email')}
              placeholder="abdullah@example.sa"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-hidden ${
                errors.email
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 bg-stone-50/30'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
