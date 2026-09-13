import React from 'react';
import { Banknote, CreditCard, ShieldCheck, AlertCircle, Check, Smartphone } from 'lucide-react';
import { PaymentMethod } from '../../types';

interface PaymentMethodStepProps {
  selectedMethod: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  selectedMethod,
  onChange,
}) => {
  return (
    <div id="checkout-payment-step" className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
          3
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-900 font-display">Payment Method</h3>
          <p className="text-xs text-stone-500">Select how you would like to pay for your artisanal order</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* OPTION 1: Cash on Delivery / Pay on Arrival (PRIMARY FUNCTIONAL METHOD) */}
        <label
          htmlFor="payment-cod"
          onClick={() => onChange('cash_on_delivery')}
          className={`block p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedMethod === 'cash_on_delivery'
              ? 'border-stone-900 bg-stone-50/60 shadow-xs ring-1 ring-stone-900/10'
              : 'border-stone-200 hover:border-stone-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMethod === 'cash_on_delivery'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-stone-900">Cash or Card on Delivery</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    Instant
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Pay directly to the courier via cash or wireless POS terminal (Mada / Credit Card).
                </p>
              </div>
            </div>

            <div className="pt-0.5">
              <input
                id="payment-cod"
                type="radio"
                name="paymentMethod"
                value="cash_on_delivery"
                checked={selectedMethod === 'cash_on_delivery'}
                onChange={() => onChange('cash_on_delivery')}
                className="w-4 h-4 text-stone-900 border-stone-300 focus:ring-stone-900"
              />
            </div>
          </div>
        </label>

        {/* OPTION 2: Credit / Debit Card (Mada, Visa, Mastercard) */}
        <div
          onClick={() => onChange('card')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedMethod === 'card'
              ? 'border-stone-900 bg-stone-50/60 shadow-xs'
              : 'border-stone-200 hover:border-stone-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMethod === 'card'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-stone-900">Mada / Credit Card</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                    <span>Mada</span> • <span>Visa</span> • <span>Mastercard</span>
                  </div>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Saudi Mada debit cards and international credit cards supported.
                </p>
              </div>
            </div>

            <div className="pt-0.5">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={selectedMethod === 'card'}
                onChange={() => onChange('card')}
                className="w-4 h-4 text-stone-900 border-stone-300 focus:ring-stone-900"
              />
            </div>
          </div>

          {selectedMethod === 'card' && (
            <div className="mt-4 pt-4 border-t border-stone-200/80 animate-in fade-in duration-200">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Phase 5 Gateway Notice</span>
                  <span>
                    Live bank payment gateway (Moyasar/Tap/HyperPay) connects in Phase 5. In this phase, placing order with card is verified through our mock payment pipeline!
                  </span>
                </div>
              </div>

              {/* Mock Card Input Preview */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    disabled
                    placeholder="4000 1234 5678 9010 (Mada / Visa)"
                    value="•••• •••• •••• 4242"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100/70 text-xs text-stone-600 font-mono"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    disabled
                    value="12 / 28"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100/70 text-xs text-stone-600 font-mono"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    disabled
                    value="CVC •••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100/70 text-xs text-stone-600 font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* OPTION 3: Apple Pay */}
        <div
          onClick={() => onChange('apple_pay')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedMethod === 'apple_pay'
              ? 'border-stone-900 bg-stone-50/60 shadow-xs'
              : 'border-stone-200 hover:border-stone-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMethod === 'apple_pay'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-stone-900">Apple Pay</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800">
                    Touch ID / Face ID
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Fast, frictionless checkout with Apple Pay on supported Apple devices.
                </p>
              </div>
            </div>

            <div className="pt-0.5">
              <input
                type="radio"
                name="paymentMethod"
                value="apple_pay"
                checked={selectedMethod === 'apple_pay'}
                onChange={() => onChange('apple_pay')}
                className="w-4 h-4 text-stone-900 border-stone-300 focus:ring-stone-900"
              />
            </div>
          </div>

          {selectedMethod === 'apple_pay' && (
            <div className="mt-4 pt-4 border-t border-stone-200/80 animate-in fade-in duration-200">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Phase 5 Gateway Notice</span>
                  <span>
                    Apple Pay Merchant Certificate connects in Phase 5. Mock order flow will approve this order smoothly for testing!
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full py-3 bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs opacity-90">
                  <Smartphone className="w-4 h-4" />
                  <span>Pay with Apple Pay (Mock Demo Mode)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-stone-400 text-xs justify-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>All orders protected with end-to-end encrypted order protocol</span>
      </div>
    </div>
  );
};
