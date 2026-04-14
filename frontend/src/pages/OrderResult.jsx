import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, ShoppingBag, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderResult = () => {
    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('success'); // 'success' or 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        
        // VNPAY: vnp_ResponseCode === '00' is success
        const vnpResponseCode = queryParams.get('vnp_ResponseCode');
        
        // MoMo: resultCode === '0' is success
        const momoResultCode = queryParams.get('resultCode');

        if (vnpResponseCode && vnpResponseCode !== '00') {
            setStatus('error');
            setMessage('Thanh toán qua VNPAY không thành công hoặc đã bị hủy.');
        } else if (momoResultCode && momoResultCode !== '0') {
            setStatus('error');
            setMessage('Thanh toán qua MoMo không thành công hoặc đã bị hủy.');
        }

        // Simple delay for "processing" feel
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [location]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                <Loader2 className="animate-spin text-primary mb-8" size={80} />
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-400">Đang xác nhận đơn hàng...</h2>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-20 text-center animate-fade-in px-6">
            <div className="relative inline-block mb-10 group">
                <div className={`absolute inset-0 ${status === 'success' ? 'bg-primary/20' : 'bg-red-500/20'} blur-3xl rounded-full scale-150 animate-pulse`}></div>
                <div className={`relative ${status === 'success' ? 'bg-primary' : 'bg-red-600'} text-white w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ${status === 'success' ? 'shadow-primary/40' : 'shadow-red-900/40'} border-4 border-[#09090b]`}>
                    {status === 'success' ? <CheckCircle size={64} className="animate-bounce" /> : <XCircle size={64} />}
                </div>
                {status === 'success' && (
                    <div className="absolute -top-2 -right-2 bg-success text-white p-2 rounded-lg shadow-xl shadow-success/20 rotate-12 scale-110">
                        <Sparkles size={20} />
                    </div>
                )}
            </div>

            <h1 className="text-6xl font-black mb-4 tracking-tighter leading-none italic uppercase">
                {status === 'success' ? (
                    <>Đặt hàng <span className="text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Thành công!</span></>
                ) : (
                    <>Thanh toán <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">Thất bại</span></>
                )}
            </h1>
            
            <p className="text-slate-400 text-xl font-medium mb-10 max-w-xl mx-auto leading-relaxed uppercase tracking-widest text-[14px]">
                {status === 'success' 
                    ? 'Cảm ơn bạn đã tin tưởng J2Car. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao tới.'
                    : (message || 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng kiểm tra lại ví của bạn hoặc liên hệ hỗ trợ.')
                }
            </p>

            <div className="bg-[#18181b] p-10 rounded-[40px] border border-slate-800 shadow-2xl mb-12 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 text-slate-900 group-hover:text-primary/10 transition-colors pointer-events-none">
                    <ShoppingBag size={200} />
                </div>
                
                <div className="relative z-10">
                    <p className="text-slate-500 uppercase tracking-widest font-bold text-xs mb-3">Mã định danh đơn hàng</p>
                    <p className="text-3xl font-mono font-black text-slate-200 tracking-tight break-all mb-4">#{id?.toUpperCase()}</p>
                    <div className={`h-1 w-20 ${status === 'success' ? 'bg-primary' : 'bg-red-600'} mx-auto rounded-full mb-8`}></div>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-10 italic">
                        {status === 'success' ? (
                            <>
                                Thông tin chi tiết đơn hàng đã được gửi tới email của bạn. <br />
                                Vui lòng theo dõi trạng thái tại mục <strong>Lịch sử đơn hàng</strong>.
                            </>
                        ) : (
                            <>
                                Đơn hàng của bạn đã được khởi tạo nhưng chưa được thanh toán. <br />
                                Bạn có thể thử thanh toán lại trong mục <strong>Cá nhân</strong>.
                            </>
                        )}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild className="bg-white text-black hover:bg-slate-200 h-16 rounded-2xl font-black px-10 text-lg shadow-xl shadow-white/5 transition-transform hover:scale-[1.05] active:scale-[0.95]">
                            <Link to="/profile">{status === 'success' ? 'XEM ĐƠN HÀNG' : 'ĐẾN TRANG CÁ NHÂN'} <ArrowRight size={20} className="ml-2" /> </Link>
                        </Button>
                        <Button variant="outline" asChild className="border-slate-800 h-16 rounded-2xl font-black px-10 text-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                            <Link to="/">{status === 'success' ? 'TIẾP TỤC MUA SẮM' : 'QUAY LẠI TRANG CHỦ'}</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-600 font-bold uppercase tracking-widest text-[10px] opacity-40">
                <ShoppingBag size={14} /> J2CAR OFFICIAL STORE • EST. 2024
            </div>
        </div>
    );
};

export default OrderResult;

