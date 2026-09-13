import React from 'react';
import { Clock, MapPin, Phone, Mail, Award, Flame, Wheat, HeartHandshake } from 'lucide-react';

export const AboutContactSection: React.FC = () => {
  return (
    <div>
      {/* OUR STORY SECTION */}
      <section id="about-section" className="py-20 bg-white border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Story Visuals */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=80"
                  alt="Artisan Pizza Chef at Gustoso"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
                    Master Pizzaiolo Tradition
                  </span>
                  <p className="text-lg font-bold font-display">
                    "True pizza is an art of patience, volcanic flour, and a roaring fire."
                  </p>
                </div>
              </div>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-stone-900 text-white p-4 rounded-2xl shadow-xl border border-stone-800 max-w-[200px]">
                <div className="text-3xl font-black text-amber-400 font-display">48 hrs</div>
                <p className="text-xs text-stone-300 mt-0.5">
                  Natural sourdough cold fermentation for ultra-light digestion
                </p>
              </div>
            </div>

            {/* Story Text */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                Craft & Heritage
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-display">
                Rooted in Naples, Baked Fresh in Riyadh
              </h2>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Founded by master pizzaiolos, Gustoso was born with a single obsession:
                to bring authentic Neapolitan pizza perfection into homes across Saudi Arabia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-stone-200/80">
                  <Wheat className="w-6 h-6 text-amber-600 mb-2" />
                  <h4 className="text-sm font-bold text-stone-900">Caputo '00' Flour</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Imported directly from Naples for that signature airy, charred cornicione.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-stone-200/80">
                  <Award className="w-6 h-6 text-red-600 mb-2" />
                  <h4 className="text-sm font-bold text-stone-900">San Marzano D.O.P.</h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Hand-crushed tomatoes grown on the volcanic slopes of Mount Vesuvius.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT & HOURS SECTION */}
      <section id="contact-section" className="py-16 bg-[#f7f4ec] border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200/80 text-stone-800 text-xs font-bold uppercase tracking-wider mb-2">
              <HeartHandshake className="w-3.5 h-3.5 text-red-600" />
              Visit Us or Call Ahead
            </div>
            <h2 className="text-3xl font-extrabold text-stone-900 font-display">
              Kitchen Hours & Location
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Stop by our open-concept pizzeria or order for fast contact-free delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Opening Hours */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900 font-display">Opening Hours</h3>
                <div className="mt-4 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between pb-1 border-b border-stone-100">
                    <span className="text-stone-500">Monday – Thursday</span>
                    <span className="font-bold text-stone-800">11:00 AM – 10:30 PM</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-stone-100">
                    <span className="text-stone-500">Friday – Saturday</span>
                    <span className="font-bold text-stone-800">11:00 AM – 11:45 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Sunday</span>
                    <span className="font-bold text-stone-800">12:00 PM – 10:00 PM</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-stone-100 text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Stone Oven currently active
              </div>
            </div>

            {/* Pizzeria Address */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900 font-display">Al Olaya Flagship Branch</h3>
                <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Prince Muhammad Ibn Abd Al Aziz St, Al Olaya <br />
                  Riyadh 12241, Saudi Arabia
                </p>
                <p className="mt-2 text-xs text-stone-500">
                  Valet parking available, indoor stone oven bar & family seating.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-stone-100 text-xs text-stone-600">
                Delivery across Riyadh: <strong>Express insulated fleet</strong> (~30-40 min)
              </div>
            </div>

            {/* Direct Line & Inquiries */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900 font-display">Customer Care & Orders</h3>
                <div className="mt-3 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                    <span className="font-bold">+966 11 488 7888</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>orders@gustosopizza.sa</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-stone-500 leading-relaxed">
                  ZATCA tax compliant with electronic VAT invoices provided for every order.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-stone-100">
                <a
                  href="tel:+966114887888"
                  className="inline-flex items-center justify-center w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Call Kitchen
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
