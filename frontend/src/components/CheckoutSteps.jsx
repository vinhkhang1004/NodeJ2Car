import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, Truck, CreditCard, ClipboardCheck } from 'lucide-react';

const CheckoutSteps = ({ step1, step2, step3 }) => {
    return (
        <div className="flex items-center justify-center mb-12 max-w-2xl mx-auto">
            {/* Step 1: Shipping */}
            <div className="flex flex-col items-center">
                <Link to="/shipping" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step1 ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-slate-800 text-slate-500'}`}>
                    {step1 ? <Check size={20} /> : <Truck size={20} />}
                </Link>
                <span className={`text-xs mt-3 font-bold uppercase tracking-widest ${step1 ? 'text-primary' : 'text-slate-500'}`}>Giao hàng</span>
            </div>

            <div className={`flex-grow h-[2px] mx-4 self-center -mt-6 transition-colors ${step1 && step2 ? 'bg-primary' : 'bg-slate-800'}`}></div>

            {/* Step 2: Payment */}
            <div className="flex flex-col items-center">
                {step1 ? (
                    <Link to="/payment" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step2 ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                        {step2 ? <Check size={20} /> : <CreditCard size={20} />}
                    </Link>
                ) : (
                   <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700">
                        <CreditCard size={20} />
                    </div>
                )}
                <span className={`text-xs mt-3 font-bold uppercase tracking-widest ${step2 ? 'text-primary' : 'text-slate-500'}`}>Thanh toán</span>
            </div>

            <div className={`flex-grow h-[2px] mx-4 self-center -mt-6 transition-colors ${step2 && step3 ? 'bg-primary' : 'bg-slate-800'}`}></div>

            {/* Step 3: Place Order */}
            <div className="flex flex-col items-center">
                {step2 ? (
                    <Link to="/placeorder" className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step3 ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                         <ClipboardCheck size={20} />
                    </Link>
                ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700">
                        <ClipboardCheck size={20} />
                    </div>
                )}
                <span className={`text-xs mt-3 font-bold uppercase tracking-widest ${step3 ? 'text-primary' : 'text-slate-500'}`}>Đặt hàng</span>
            </div>
        </div>
    );
};

export default CheckoutSteps;
