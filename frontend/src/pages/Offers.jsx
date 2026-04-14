import React, { useState, useEffect } from 'react';
import { 
    Tag, Ticket, Copy, CheckCircle, Clock, 
    Zap, Gem, Gift, Sparkles, ChevronRight,
    AlertCircle, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Offers = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const { data } = await api.get('/coupons/public');

                setCoupons(data);
            } catch (err) {
                console.error('Error fetching coupons:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white selection:bg-primary/30">
            {/* Hero Section */}
            <div className="relative overflow-hidden pt-32 pb-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6 animate-fade-in">
                        <Zap size={14} className="fill-primary" /> Siêu ưu đãi hôm nay
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-6 leading-[0.9]">
                        TRUNG TÂM <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                            ƯU ĐÃI J2CAR
                        </span>
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                        Săn ngay các mã giảm giá cực hot để tối ưu chi phí bảo trì và nâng cấp xế yêu của bạn. 
                        Áp dụng ngay cho mọi đơn hàng từ hôm nay!
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 pb-32">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 rounded-3xl bg-slate-900/50 animate-pulse border border-slate-800" />
                        ))}
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/20 rounded-[40px] border border-slate-800/50 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} className="text-slate-700" />
                        </div>
                        <h2 className="text-2xl font-black uppercase italic text-slate-400">Hiện tại chưa có mã giảm giá mới</h2>
                        <p className="text-slate-600 mt-2">Vui lòng quay lại sau để săn các ưu đãi khủng từ J2Car.</p>
                        <Button asChild className="mt-8 rounded-full bg-white text-black hover:bg-slate-200">
                            <Link to="/shop">TIẾP TỤC MUA SẮM</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {coupons.map((coupon) => (
                            <div 
                                key={coupon._id}
                                className="group relative overflow-hidden rounded-[32px] bg-[#18181b] border border-slate-800 hover:border-primary/50 transition-all duration-500 shadow-2xl hover:shadow-primary/10 flex flex-col"
                            >
                                {/* Coupon Design Left Edge */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#09090b] rounded-r-full border-r border-t border-b border-slate-800 z-10" />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#09090b] rounded-l-full border-l border-t border-b border-slate-800 z-10" />

                                <CardContent className="p-8 pt-10 flex-grow relative">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                            {coupon.discountType === 'Percentage' ? 'GIẢM THEO %' : 'GIẢM TRỰC TIẾP'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                            <Clock size={12} /> HSD: {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>

                                    <h3 className="text-6xl font-black italic tracking-tighter mb-2 group-hover:text-primary transition-colors">
                                        {coupon.discountType === 'Percentage' ? `${coupon.discountAmount}%` : `${(coupon.discountAmount / 1000).toLocaleString()}K`}
                                    </h3>
                                    
                                    <p className="text-slate-400 text-sm font-medium mb-8 leading-snug">
                                        Giảm tối đa cho đơn hàng từ <span className="text-white font-bold">{coupon.minPurchase.toLocaleString('vi-VN')}₫</span>. Áp dụng cho danh mục được chỉ định.
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-slate-800/50 border-dashed relative">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group/code transition-all hover:border-primary/30">
                                                <span className="font-mono text-xl font-black tracking-[4px] text-white">{coupon.code}</span>
                                                <button 
                                                    onClick={() => copyToClipboard(coupon.code)}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-primary"
                                                >
                                                    {copiedCode === coupon.code ? <CheckCircle size={20} className="text-emerald-500" /> : <Copy size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                        {copiedCode === coupon.code && (
                                            <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-in slide-in-from-bottom-1 fade-in">
                                                Đã copy thành công!
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                                
                                <div className="bg-slate-900/50 px-8 py-4 flex items-center justify-between border-t border-slate-800 overflow-hidden">
                                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Còn lại: <span className="text-white">{coupon.usageLimit - coupon.usedCount} lượt dùng</span>
                                     </div>
                                     <Link 
                                        to="/shop" 
                                        className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 group/btn"
                                     >
                                        Dùng ngay <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                                     </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
                    <div className="p-8 rounded-[32px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                        <Gem className="text-primary mb-4" size={32} />
                        <h4 className="font-black italic uppercase tracking-tighter text-xl mb-2">Ưu đãi độc quyền</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">Cập nhật liên tục các mã giảm giá dành riêng cho thành viên J2Car.</p>
                    </div>
                    <div className="p-8 rounded-[32px] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                        <Sparkles className="text-emerald-400 mb-4" size={32} />
                        <h4 className="font-black italic uppercase tracking-tighter text-xl mb-2">Áp dụng dễ dàng</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">Chỉ cần sao chép mã và dán vào phần thanh toán để nhận giảm giá ngay.</p>
                    </div>
                    <div className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20">
                        <Gift className="text-indigo-400 mb-4" size={32} />
                        <h4 className="font-black italic uppercase tracking-tighter text-xl mb-2">Miễn phí giao hàng</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">Kết hợp mã giảm giá với ưu đãi Freeship cho đơn từ 1.000.000₫.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Offers;
