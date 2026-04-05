import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrderById, updateOrderStatus, deliverOrder } from '../../services/orderService';
import { 
    Loader2, ArrowLeft, Package, User, MapPin, CreditCard, 
    Calendar, CheckCircle, Clock, Truck, XCircle, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFileUrl } from '../../lib/utils';

const OrderInfo = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const { data } = await fetchOrderById(id);
            setOrder(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrder();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        try {
            setUpdating(true);
            await updateOrderStatus(id, newStatus);
            loadOrder();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeliver = async () => {
        if (!window.confirm('Xác nhận đã giao hàng thành công?')) return;
        try {
            setUpdating(true);
            await deliverOrder(id);
            loadOrder();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin text-white" size={48} />
        </div>
    );

    if (!order) return (
        <Alert variant="destructive" className="max-w-xl mx-auto mt-12 bg-red-950/30 border-red-900/50 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Không tìm thấy đơn hàng'}</AlertDescription>
        </Alert>
    );

    return (
        <div className="animate-fade-in pb-12 text-white/90">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                        <Link to="/admin/orders">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                           Đơn hàng #{order._id.substring(18).toUpperCase()}
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Đặt lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Select disabled={updating} value={order.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px] bg-[#18181b] border-slate-700 text-white">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#18181b] border-slate-700 text-white">
                            <SelectItem value="Processing">Chờ xử lý</SelectItem>
                            <SelectItem value="Shipped">Đang giao</SelectItem>
                            <SelectItem value="Delivered">Đã giao</SelectItem>
                            <SelectItem value="Cancelled">Đã huỷ</SelectItem>
                        </SelectContent>
                    </Select>
                    {!order.isDelivered && (
                        <Button
                            onClick={handleDeliver}
                            disabled={updating || order.status === 'Cancelled'}
                            className="bg-primary hover:bg-primary/90 text-white"
                        >
                            <Truck size={14} className="mr-2" /> Đã giao hàng
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Order Items & Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Items */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader className="border-b border-slate-800/50">
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <Package size={18} /> Sản phẩm đơn hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/20 border border-slate-800/50">
                                        <img 
                                            src={getFileUrl(item.image)} 
                                            alt={item.name} 
                                            className="w-16 h-16 rounded-lg object-cover border border-slate-800"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{item.name}</p>
                                            <p className="text-slate-500 text-xs">SKU: {item.product?.sku || 'N/A'}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-mono">{item.qty} x {item.price.toLocaleString('vi-VN')}₫</div>
                                            <div className="text-success font-bold">{(item.qty * item.price).toLocaleString('vi-VN')}₫</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader>
                            <CardTitle className="text-white text-base">Tổng kết tài chính</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-slate-400">
                                <span>Tiền hàng</span>
                                <span className="text-white font-mono">{order.itemsPrice.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Phí vận chuyển</span>
                                <span className="text-white font-mono">{order.shippingPrice.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                                <span className="font-bold text-lg text-white">Tổng cộng</span>
                                <span className="text-2xl font-bold text-primary font-mono">{order.totalPrice.toLocaleString('vi-VN')}₫</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Customer & Status */}
                <div className="space-y-8">
                    {/* Customer Info */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader className="border-b border-slate-800/50">
                            <CardTitle className="text-white text-base flex items-center gap-2">
                                <User size={16} /> Khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Họ tên</p>
                                <p className="text-white font-medium">{order.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Email</p>
                                <p className="text-white">{order.user?.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader className="border-b border-slate-800/50">
                            <CardTitle className="text-white text-base flex items-center gap-2">
                                <MapPin size={16} /> Địa chỉ giao hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                           <div>
                               <p className="text-slate-300 mb-1 leading-relaxed">{order.shippingAddress?.address}</p>
                               <p className="text-slate-300 font-medium">{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                           </div>
                           <div className="pt-4 border-t border-slate-800/50">
                               <p className="text-slate-400 text-xs mb-1">Số điện thoại</p>
                               <p className="text-white font-mono">{order.shippingAddress?.phone}</p>
                           </div>
                        </CardContent>
                    </Card>

                    {/* Payment Status */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader className="border-b border-slate-800/50">
                            <CardTitle className="text-white text-base flex items-center gap-2">
                                <CreditCard size={16} /> Thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Phương thức</span>
                                <Badge variant="secondary" className="bg-slate-800 text-slate-300">{order.paymentMethod}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Trạng thái</span>
                                {order.isPaid ? (
                                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Đã thanh toán</Badge>
                                ) : (
                                    <Badge className="bg-slate-800 text-slate-500">Chưa thanh toán</Badge>
                                )}
                            </div>
                            {order.paidAt && (
                                <p className="text-[10px] text-slate-500 text-right mt-1">Lúc: {new Date(order.paidAt).toLocaleString('vi-VN')}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Delivery Status */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader className="border-b border-slate-800/50">
                            <CardTitle className="text-white text-base flex items-center gap-2">
                                <Calendar size={16} /> Giao hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Trạng thái</span>
                                {order.isDelivered ? (
                                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Đã giao hàng</Badge>
                                ) : (
                                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Đang chờ</Badge>
                                )}
                            </div>
                            {order.deliveredAt && (
                                <p className="text-[10px] text-slate-500 text-right mt-1">Lúc: {new Date(order.deliveredAt).toLocaleString('vi-VN')}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OrderInfo;
