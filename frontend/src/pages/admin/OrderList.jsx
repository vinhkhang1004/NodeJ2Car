import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { fetchOrders } from '../../services/orderService';
import { Loader2, Eye, ShoppingBag, Clock, CheckCircle, Truck, XCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '../../lib/exportExcel';
=======
import { fetchOrders, exportOrders } from '../../services/orderService';
import { Loader2, Eye, ShoppingBag, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';
>>>>>>> 1af2c8a1056c28e359c2704c7eb80fc7a056958d
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const { data } = await fetchOrders();
                setOrders(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

<<<<<<< HEAD
    const handleExportOrders = () => {
        const dataToExport = orders.map(order => ({
            'ID Đơn hàng': order._id,
            'Khách hàng': order.shippingAddress?.name || order.user?.name || 'Ẩn danh',
            'Số điện thoại': order.shippingAddress?.phone || '',
            'Địa chỉ': `${order.shippingAddress?.address}, ${order.shippingAddress?.city}`,
            'Ngày đặt': new Date(order.createdAt).toLocaleDateString('vi-VN'),
            'Tổng tiền': order.totalPrice,
            'Trạng thái': order.status === 'Processing' ? 'Đang xử lý' : 
                         order.status === 'Shipped' ? 'Đang giao' :
                         order.status === 'Delivered' ? 'Đã giao' : 
                         order.status === 'Cancelled' ? 'Đã hủy' : order.status,
            'Thanh toán': order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'
        }));

        exportToExcel(dataToExport, `Danh_sach_don_hang_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}`, 'DonHang');
    };

=======
    const handleExportOrders = async () => {
        try {
            await exportOrders();
        } catch (error) {
            console.error('Lỗi xuất file:', error);
        }
    };
>>>>>>> 1af2c8a1056c28e359c2704c7eb80fc7a056958d
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Processing':
                return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"><Clock size={12} className="mr-1" /> Đang xử lý</Badge>;
            case 'Shipped':
                return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20"><Truck size={12} className="mr-1" /> Đang giao</Badge>;
            case 'Delivered':
                return <Badge className="bg-green-500/10 text-green-400 border-green-500/20"><CheckCircle size={12} className="mr-1" /> Đã giao</Badge>;
            case 'Cancelled':
                return <Badge className="bg-red-500/10 text-red-400 border-red-500/20"><XCircle size={12} className="mr-1" /> Đã hủy</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="animate-fade-in pb-12 text-white/90">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Quản lý đơn hàng</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Tổng cộng <span className="text-white font-medium">{orders.length}</span> đơn hàng
                    </p>
                </div>
<<<<<<< HEAD
                <div className="flex gap-2">
                    <Button 
                        onClick={handleExportOrders} 
                        variant="outline" 
                        className="border-green-600/50 bg-transparent text-green-400 hover:bg-green-600/10"
                    >
                        <FileSpreadsheet size={16} className="mr-2" /> Xuất Excel Đơn Hàng
                    </Button>
                </div>
=======
                <Button onClick={handleExportOrders} variant="outline" className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                    Xuất Hóa Đơn Excel
                </Button>
>>>>>>> 1af2c8a1056c28e359c2704c7eb80fc7a056958d
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6 bg-red-950/30 border-red-900/50 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-white" size={40} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 bg-[#27272a]/50 uppercase border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Mã đơn hàng</th>
                                    <th className="px-6 py-4">Khách hàng</th>
                                    <th className="px-6 py-4">Ngày đặt</th>
                                    <th className="px-6 py-4">Tổng tiền</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4">Thanh toán</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                            #{order._id.substring(18).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{order.user?.name}</div>
                                            <div className="text-xs text-slate-500">{order.shippingAddress?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-success">
                                            {order.totalPrice.toLocaleString('vi-VN')}₫
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.isPaid ? (
                                                <Badge variant="outline" className="text-green-400 border-green-500/20 bg-green-500/5">Đã thanh toán</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-500 border-slate-700 bg-slate-800/50">Chưa thanh toán</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="bg-transparent border-slate-700 text-white hover:bg-slate-800 h-8"
                                            >
                                                <Link to={`/admin/orders/${order._id}`}>
                                                    <Eye size={12} className="mr-1" /> Chi tiết
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <ShoppingBag className="mx-auto mb-3 text-slate-600 opacity-20" size={40} />
                                            <p className="text-slate-500">Chưa có đơn hàng nào.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default OrderList;
