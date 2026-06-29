import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
    Loader2, ChevronRight, ShoppingBag, Calendar, CreditCard, 
    Truck, CheckCircle2, Clock, XCircle, FileText, ArrowLeft,
    Phone, Mail, MapPin, User, Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFileUrl } from '../lib/utils';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
                setError('');
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh] bg-slate-950/20">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    if (error || !order) return (
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl font-black text-red-500 mb-4">Lỗi tải thông tin đơn hàng</h2>
            <p className="text-slate-400 mb-8">{error || 'Không tìm thấy thông tin đơn hàng này.'}</p>
            <Link to="/profile" className="bg-primary text-white px-8 py-3 rounded-xl font-bold">Quay lại trang cá nhân</Link>
        </div>
    );

    const getStatusLabel = (status) => {
        switch (status) {
            case 'Processing': return 'Đang xử lý';
            case 'Shipped': return 'Đang giao hàng';
            case 'Delivered': return 'Đã giao thành công';
            case 'Cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const isCancelled = order.status === 'Cancelled';
    const currentStep = isCancelled ? -1 : 
                        order.status === 'Delivered' ? 4 : 
                        order.status === 'Shipped' ? 3 : 
                        (order.status === 'Processing' || order.isPaid) ? 2 : 1;

    return (
        <div className="animate-fade-in pb-20 max-w-5xl mx-auto px-6 mt-8">
            {/* Print Invoice Style Hook */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body {
                        background-color: white !important;
                        color: black !important;
                    }
                    header, nav, footer, button, a, .no-print {
                        display: none !important;
                    }
                    .print-container {
                        display: block !important;
                        padding: 20px !important;
                        color: black !important;
                        background: white !important;
                    }
                    .print-border {
                        border: 1px solid #000 !important;
                        border-radius: 0px !important;
                        box-shadow: none !important;
                        background: white !important;
                    }
                    .print-text-dark {
                        color: black !important;
                    }
                }
            `}} />

            {/* Breadcrumbs (no-print) */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8 no-print">
                <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                <ChevronRight size={10} />
                <Link to="/profile" className="hover:text-primary transition-colors">Tài khoản</Link>
                <ChevronRight size={10} />
                <span className="text-slate-300">Chi tiết đơn hàng #{order._id.slice(-8).toUpperCase()}</span>
            </div>

            {/* Main Area */}
            <div className="print-container">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 no-print">
                    <div className="flex items-center gap-3">
                        <Link to="/profile" className="p-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 transition-colors text-slate-400 hover:text-white">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                Chi tiết đơn hàng <span className="text-primary">#{order._id.slice(-8).toUpperCase()}</span>
                            </h1>
                            <p className="text-slate-500 text-sm">Đặt ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button 
                            onClick={handlePrint}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold flex items-center gap-2 px-5 w-full sm:w-auto shadow-lg shadow-emerald-950/20"
                        >
                            <Printer size={16} /> Tải hóa đơn (PDF)
                        </Button>
                    </div>
                </div>

                {/* Printable Invoice Header (Hidden in Screen, Visible in Print) */}
                <div className="hidden print:block mb-10 border-b pb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black text-black tracking-tight uppercase">J2AUTOPARTS</h1>
                            <p className="text-xs text-gray-500">Phụ Tùng Ô Tô Chính Hãng & Đồ Chơi Xe Cao Cấp</p>
                            <p className="text-xs text-gray-500 mt-2">Địa chỉ: 123 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội</p>
                            <p className="text-xs text-gray-500">Hotline: 1900 6789 | Website: j2car.com</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold uppercase text-black">HÓA ĐƠN BÁN HÀNG</h2>
                            <p className="text-sm font-mono text-gray-600 mt-1">Số: #{order._id.toUpperCase()}</p>
                            <p className="text-xs text-gray-500">Ngày lập: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>
                </div>

                {/* Step Progress / Tracking Timeline */}
                {!isCancelled ? (
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20 mb-8 overflow-hidden print-border no-print">
                        <CardHeader className="bg-[#27272a]/20 border-b border-slate-800/50 pb-4">
                            <CardTitle className="text-white text-base flex items-center gap-2">
                                <Truck size={16} className="text-primary" /> Hành trình đơn hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 pb-8 px-6">
                            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                                {/* Connection Line */}
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 hidden md:block z-0" />
                                <div 
                                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 hidden md:block z-0 transition-all duration-1000" 
                                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                />

                                {/* Step 1: Placed */}
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                                        currentStep >= 1 ? 'bg-primary border-slate-900 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                                    }`}>
                                        <Calendar size={18} />
                                    </div>
                                    <p className="text-xs font-bold text-white mt-3 uppercase tracking-wider">Đặt hàng thành công</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>

                                {/* Step 2: Confirmed/Paid */}
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                                        currentStep >= 2 ? 'bg-primary border-slate-900 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                                    }`}>
                                        <CreditCard size={18} />
                                    </div>
                                    <p className="text-xs font-bold text-white mt-3 uppercase tracking-wider">Xác nhận / Đã thanh toán</p>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        {order.isPaid ? new Date(order.paidAt).toLocaleDateString('vi-VN') : 'Đang xử lý'}
                                    </p>
                                </div>

                                {/* Step 3: Shipped */}
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                                        currentStep >= 3 ? 'bg-primary border-slate-900 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                                    }`}>
                                        <Truck size={18} />
                                    </div>
                                    <p className="text-xs font-bold text-white mt-3 uppercase tracking-wider">Đang vận chuyển</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{order.status === 'Shipped' || order.status === 'Delivered' ? 'Đang giao' : 'Chờ vận chuyển'}</p>
                                </div>

                                {/* Step 4: Delivered */}
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                                        currentStep >= 4 ? 'bg-emerald-500 border-slate-900 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                                    }`}>
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <p className="text-xs font-bold text-white mt-3 uppercase tracking-wider">Giao hàng thành công</p>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        {order.isDelivered ? new Date(order.deliveredAt).toLocaleDateString('vi-VN') : 'Đang chờ giao'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-red-900/50 bg-red-950/10 shadow-xl mb-8 overflow-hidden print-border">
                        <CardContent className="py-6 flex items-center gap-4 text-red-400">
                            <XCircle size={32} className="shrink-0" />
                            <div>
                                <h3 className="font-bold text-lg">ĐƠN HÀNG ĐÃ BỊ HỦY</h3>
                                <p className="text-sm opacity-80 mt-0.5">Đơn hàng này không thể xử lý tiếp tục do đã được cập nhật trạng thái hủy bỏ.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 2-Column Info: Products and Shipping Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Products list (2 cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-[#18181b] border-slate-800 shadow-xl overflow-hidden print-border">
                            <CardHeader className="bg-[#27272a]/20 border-b border-slate-800/50">
                                <CardTitle className="text-white text-base uppercase tracking-wider print-text-dark">Sản phẩm đã mua</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-800/50">
                                    {order.orderItems?.map((item) => (
                                        <div key={item._id} className="flex gap-4 p-5 hover:bg-slate-900/20 transition-colors">
                                            {/* Thumbnail (no-print) */}
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 no-print">
                                                <img 
                                                    src={getFileUrl(item.imageUrl || item.product?.imageUrl)} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Part'; }}
                                                />
                                            </div>
                                            {/* Details */}
                                            <div className="flex-grow min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-white font-bold text-sm truncate print-text-dark">{item.name}</h4>
                                                    <p className="text-slate-500 text-xs mt-0.5 font-mono">SKU: {item.sku || item.product?.sku || 'N/A'}</p>
                                                </div>
                                                <div className="flex justify-between items-baseline mt-2">
                                                    <p className="text-xs text-slate-400 print-text-dark">{item.price?.toLocaleString('vi-VN')}₫ x {item.qty}</p>
                                                    <p className="text-sm font-bold text-primary print-text-dark">{(item.price * item.qty)?.toLocaleString('vi-VN')}₫</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Summary Billing */}
                        <Card className="bg-[#18181b] border-slate-800 shadow-xl overflow-hidden print-border">
                            <CardHeader className="bg-[#27272a]/20 border-b border-slate-800/50">
                                <CardTitle className="text-white text-base uppercase tracking-wider print-text-dark">Chi tiết thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3 text-sm">
                                <div className="flex justify-between text-slate-400 print-text-dark">
                                    <span>Tạm tính</span>
                                    <span>{order.itemsPrice?.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="flex justify-between text-slate-400 print-text-dark">
                                    <span>Phí giao hàng</span>
                                    <span>{order.shippingPrice === 0 ? 'Miễn phí' : `${order.shippingPrice?.toLocaleString('vi-VN')}₫`}</span>
                                </div>
                                {order.discountPrice > 0 && (
                                    <div className="flex justify-between text-emerald-400 print-text-dark">
                                        <span>Giảm giá {order.coupon?.code ? `(Mã: ${order.coupon.code})` : ''}</span>
                                        <span>-{order.discountPrice?.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                )}
                                <div className="h-px bg-slate-800 my-4" />
                                <div className="flex justify-between text-base font-black text-white print-text-dark">
                                    <span>TỔNG CỘNG</span>
                                    <span className="text-xl text-primary print-text-dark">{order.totalPrice?.toLocaleString('vi-VN')}₫</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Shipping and Billing Info (1 col) */}
                    <div className="space-y-6">
                        <Card className="bg-[#18181b] border-slate-800 shadow-xl overflow-hidden print-border">
                            <CardHeader className="bg-[#27272a]/20 border-b border-slate-800/50">
                                <CardTitle className="text-white text-base uppercase tracking-wider print-text-dark">Người nhận hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4 text-sm">
                                <div className="flex items-start gap-3 text-slate-300 print-text-dark">
                                    <User size={16} className="text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-slate-500 text-xs">Họ và tên</p>
                                        <p className="font-bold">{order.shippingAddress?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-slate-300 print-text-dark">
                                    <Phone size={16} className="text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-slate-500 text-xs">Số điện thoại</p>
                                        <p className="font-bold">{order.shippingAddress?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-slate-300 print-text-dark">
                                    <Mail size={16} className="text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-slate-500 text-xs">Email nhận thông báo</p>
                                        <p className="font-bold break-all">{order.shippingAddress?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-slate-300 print-text-dark">
                                    <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-slate-500 text-xs">Địa chỉ giao hàng</p>
                                        <p className="font-bold leading-relaxed">
                                            {order.shippingAddress?.address}, {order.shippingAddress?.city}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment summary card */}
                        <Card className="bg-[#18181b] border-slate-800 shadow-xl overflow-hidden print-border">
                            <CardHeader className="bg-[#27272a]/20 border-b border-slate-800/50">
                                <CardTitle className="text-white text-base uppercase tracking-wider print-text-dark">Thông tin đơn hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4 text-sm">
                                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                                    <span className="text-slate-500">Mã đơn hàng:</span>
                                    <span className="font-mono text-xs">#{order._id.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                                    <span className="text-slate-500">Phương thức:</span>
                                    <span className="font-bold uppercase">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                                    <span className="text-slate-500">Trạng thái xử lý:</span>
                                    <Badge variant="outline" className={`${
                                        order.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                        {getStatusLabel(order.status)}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                                    <span className="text-slate-500">Trạng thái tiền:</span>
                                    {order.isPaid ? (
                                        <span className="text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded text-xs">Đã thanh toán</span>
                                    ) : (
                                        <span className="text-slate-400 font-bold border border-slate-800 px-2 py-0.5 rounded text-xs">Chưa thanh toán</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Printable Invoice Footer (Visible only in Print) */}
                <div className="hidden print:block mt-16 pt-8 border-t border-dashed">
                    <div className="grid grid-cols-2 text-center text-xs">
                        <div>
                            <p className="font-bold uppercase">Người nhận hàng</p>
                            <p className="text-gray-400 italic">(Ký, ghi rõ họ tên)</p>
                            <div className="h-20" />
                            <p className="font-bold">{order.shippingAddress?.name}</p>
                        </div>
                        <div>
                            <p className="font-bold uppercase">Nhân viên bán hàng</p>
                            <p className="text-gray-400 italic">(Ký, đóng dấu)</p>
                            <div className="h-20" />
                            <p className="font-bold">J2AutoParts Store</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
