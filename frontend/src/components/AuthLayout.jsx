import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Main split area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Side - Banner */}
        <div className="hidden md:flex md:w-[45%] lg:w-[45%] bg-[#0f172a] relative overflow-hidden flex-col justify-center p-12 lg:p-16 text-white min-h-[600px]">
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000&auto=format&fit=crop" 
                    alt="Engine" 
                    className="w-full h-full object-cover opacity-20 mix-blend-screen mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-blue-950/80 to-[#0a0f1c]/90" />
            </div>
            
            <div className="relative z-10 w-full max-w-md mx-auto">
                <h1 className="text-5xl lg:text-6xl font-black italic tracking-tighter mb-6 text-white drop-shadow-2xl">
                    DIGITAL<span className="font-sans font-black tracking-normal ml-1">ENGINEER</span>
                </h1>
                <p className="text-blue-100/80 text-base md:text-lg mb-16 leading-relaxed">
                    Kỹ thuật chính xác gặp gỡ hiệu suất vượt trội. Truy cập vào kho phụ tùng cao cấp dành cho những chuyên gia hàng đầu.
                </p>
                
                <div className="flex gap-10 border-t border-white/10 pt-8 mt-12">
                    <div>
                        <div className="text-4xl font-bold mb-1">500k+</div>
                        <div className="text-[10px] text-blue-300 font-bold tracking-widest uppercase">Linh kiện có sẵn</div>
                    </div>
                    <div className="w-px bg-white/10"></div>
                    <div>
                        <div className="text-4xl font-bold mb-1">24/7</div>
                        <div className="text-[10px] text-blue-300 font-bold tracking-widest uppercase">Hỗ trợ kỹ thuật</div>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-8 left-12 lg:left-16 z-10 flex items-center gap-4 text-[10px] tracking-[0.2em] text-blue-400 uppercase font-bold">
                <div className="w-8 h-[2px] bg-blue-500"></div>
                Precision Parts Authority
            </div>
        </div>
        
        {/* Right Side - Form Container */}
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 bg-white relative">
            <div className="w-full max-w-[420px] mx-auto">
                <Outlet />
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#f8fafc] border-t border-slate-200 py-16 px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div className="md:col-span-1">
                <h3 className="font-black text-slate-900 mb-4 text-base">Digital Engineer</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                    Precision parts for technical excellence in the automotive industry.
                </p>
            </div>
            <div>
                <h4 className="font-black text-slate-900 mb-6 text-[11px] tracking-widest">RESOURCES</h4>
                <ul className="space-y-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Technical Specs</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Warranty</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-black text-slate-900 mb-6 text-[11px] tracking-widest">LEGAL</h4>
                <ul className="space-y-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Terms of Use</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-black text-slate-900 mb-6 text-[11px] tracking-widest">LOGISTICS</h4>
                <ul className="space-y-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Shipping</a></li>
                    <li><a href="#" className="hover:text-orange-500 transition-colors">Returns</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2024 DIGITAL ENGINEER PRECISION PARTS. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
