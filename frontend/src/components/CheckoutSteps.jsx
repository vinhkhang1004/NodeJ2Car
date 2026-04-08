import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, Truck, CreditCard, ClipboardCheck } from 'lucide-react';

const CheckoutSteps = ({ step1, step2, step3 }) => {
    return (
        <div className="flex items-center justify-center mb-16 max-w-2xl mx-auto px-4">
            {/* Step 1: Shipping */}
            <div className="flex flex-col items-center">
                <Link to="/shipping" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-110' : 'bg-slate-100 text-slate-400'}`}>
                    {step1 ? <Check size={20} /> : <Truck size={20} />}
                </Link>
                <span className={`text-[10px] mt-4 font-black uppercase tracking-[0.2em] ${step1 ? 'text-blue-950' : 'text-slate-400'}`}>Giao hàng</span>
            </div>

            <div className={`flex-grow h-[2px] mx-4 self-center -mt-8 transition-colors ${step1 && step2 ? 'bg-orange-500' : 'bg-slate-100'}`}></div>

            {/* Step 2: Payment */}
            <div className="flex flex-col items-center">
                {step1 ? (
                    <Link to="/payment" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step2 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-110' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                        {step2 ? <Check size={20} /> : <CreditCard size={20} />}
                    </Link>
                ) : (
                   <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200">
                        <CreditCard size={20} />
                    </div>
                )}
                <span className={`text-[10px] mt-4 font-black uppercase tracking-[0.2em] ${step2 ? 'text-blue-950' : 'text-slate-400'}`}>Thanh toán</span>
            </div>

            <div className={`flex-grow h-[2px] mx-4 self-center -mt-8 transition-colors ${step2 && step3 ? 'bg-orange-500' : 'bg-slate-100'}`}></div>

            {/* Step 3: Place Order */}
            <div className="flex flex-col items-center">
                {step2 ? (
                    <Link to="/placeorder" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step3 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-110' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                         <ClipboardCheck size={20} />
                    </Link>
                ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200">
                        <ClipboardCheck size={20} />
                    </div>
                )}
                <span className={`text-[10px] mt-4 font-black uppercase tracking-[0.2em] ${step3 ? 'text-blue-950' : 'text-slate-400'}`}>Đặt hàng</span>
            </div>
        </div>
    );
};

export default CheckoutSteps;
