import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
    Plus, Package, Users, ShoppingBag, DollarSign,
    TrendingUp, TrendingDown, ArrowRight, Loader2,
    AlertTriangle, CheckCircle, Clock, Truck, XCircle,
    BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const formatVND = (n) => {
    if (!n) return '0₫';
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ₫`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} tr₫`;
    return n.toLocaleString('vi-VN') + '₫';
};

const pct = (current, last) => {
    if (!last) return current > 0 ? 100 : 0;
    return Math.round(((current - last) / last) * 100);
};

const StatCard = ({ icon: Icon, title, value, subValue, trend, color }) => {
    const up = trend >= 0;
    return (
        <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20 overflow-hidden relative group hover:border-slate-700 transition-all">
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${color} blur-[80px] -z-0`} />
            <CardContent className="pt-6 pb-5 relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-800/60 border border-slate-700`}>
                        <Icon size={22} className="text-slate-300" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${up ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                        {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {up ? '+' : ''}{trend}%
                    </div>
                </div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
                {subValue && <p className="text-slate-500 text-xs mt-2">{subValue}</p>}
            </CardContent>
        </Card>
    );
};

const OrderStatusBadge = ({ status }) => {
    const map = {
        'Processing': { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
        'Shipped':    { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',       icon: Truck },
        'Delivered':  { color: 'bg-green-500/10 text-green-400 border-green-500/20',    icon: CheckCircle },
        'Cancelled':  { color: 'bg-red-500/10 text-red-400 border-red-500/20',          icon: XCircle },
    };
    const cfg = map[status] || { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Clock };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${cfg.color}`}>
            <Icon size={11} /> {status}
        </span>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#09090b] border border-slate-800 rounded-xl px-4 py-3 shadow-2xl text-xs">
                <p className="text-slate-400 mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="text-white font-bold">{formatVND(p.value)}</p>
                ))}
            </div>
        );
    }
    return null;
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [productStats, setProductStats] = useState({ totalProducts: 0, totalUsers: 0, totalCategories: 0, lowStockProducts: 0 });
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orderRes, productRes] = await Promise.all([
                    api.get('/orders/dashboard'),
                    api.get('/products/admin/stats'),
                ]);
                setStats(orderRes.data);
                setProductStats(productRes.data);
            } catch (err) {
                console.error('Dashboard error:', err);
                setApiError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center space-y-4">
                <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                <p className="text-slate-500 text-sm">Đang tải dữ liệu...</p>
            </div>
        </div>
    );

    if (apiError) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="bg-red-950/30 border border-red-900/50 rounded-2xl px-8 py-6 text-center max-w-md">
                <AlertTriangle className="text-red-400 mx-auto mb-3" size={40} />
                <p className="text-red-400 font-bold text-lg mb-2">Không thể tải Dashboard</p>
                <p className="text-red-500 text-sm font-mono">{apiError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-white text-black rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        </div>
    );

    const revTrend = pct(stats?.thisMonthRevenue || 0, stats?.lastMonthRevenue || 0);
    const orderTrend = pct(stats?.thisMonthOrders || 0, stats?.lastMonthOrders || 0);

    const chartData = (() => {
        const raw = stats?.revenueByDay || [];
        const map = {};
        raw.forEach(d => { map[d._id] = d; });
        const result = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            result.push({
                name: `${d.getDate()}/${d.getMonth() + 1}`,
                revenue: map[key]?.revenue || 0,
                orders: map[key]?.orders || 0,
            });
        }
        return result;
    })();

<<<<<<< Updated upstream
=======
    const handleExportRevenue = () => {
        const dataToExport = chartData.map(d => ({
            'Ngày': d.name,
            'Doanh thu (VNĐ)': d.revenue,
            'Số đơn hàng': d.orders
        }));

        const totalRevenue = dataToExport.reduce((acc, curr) => acc + curr['Doanh thu (VNĐ)'], 0);
        const totalOrders = dataToExport.reduce((acc, curr) => acc + curr['Số đơn hàng'], 0);

        dataToExport.push({
            'Ngày': 'TỔNG CỘNG (30 ngày)',
            'Doanh thu (VNĐ)': totalRevenue,
            'Số đơn hàng': totalOrders
        });

        exportToExcel(dataToExport, `Bao_cao_doanh_thu_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}`, 'DoanhThu');
    };

>>>>>>> Stashed changes
    const statusMap = {};
    (stats?.statusCounts || []).forEach(s => { statusMap[s._id] = s.count; });

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Bảng điều khiển <span className="text-primary">Quản trị</span></h1>
                    <p className="text-slate-500 mt-1 text-sm">Tổng quan hoạt động của cửa hàng J2 Auto Parts</p>
                </div>
                <div className="flex gap-3">
<<<<<<< Updated upstream
=======
                    <Button
                        onClick={handleExportRevenue}
                        variant="outline"
                        className="border-green-600/50 bg-transparent text-green-400 hover:bg-green-600/10 rounded-xl h-10"
                    >
                        <FileSpreadsheet size={16} className="mr-2" /> Xuất doanh thu
                    </Button>
>>>>>>> Stashed changes
                    <Button onClick={() => navigate('/admin/orders')} variant="outline" className="border-slate-700 bg-transparent text-white hover:bg-slate-800 rounded-xl h-10">
                        <ShoppingBag size={16} className="mr-2" /> Đơn hàng
                    </Button>
                    <Button onClick={() => navigate('/admin/products/create')} className="bg-white text-black hover:bg-slate-200 rounded-xl h-10 font-bold shadow-xl shadow-white/5">
                        <Plus size={16} className="mr-2" /> Thêm sản phẩm
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={DollarSign} title="Doanh thu tháng này" value={formatVND(stats?.thisMonthRevenue)} subValue={`Tổng: ${formatVND(stats?.totalRevenue)}`} trend={revTrend} color="bg-primary/20" />
                <StatCard icon={ShoppingBag} title="Đơn hàng tháng này" value={stats?.thisMonthOrders ?? 0} subValue={`Tổng: ${stats?.totalOrders ?? 0} đơn`} trend={orderTrend} color="bg-blue-500/20" />
                <StatCard icon={Package} title="Sản phẩm" value={productStats.totalProducts} subValue={productStats.lowStockProducts > 0 ? `⚠ ${productStats.lowStockProducts} sắp hết hàng` : `${productStats.totalCategories} danh mục`} trend={0} color="bg-purple-500/20" />
                <StatCard icon={Users} title="Khách hàng" value={productStats.totalUsers} subValue="Tổng tài khoản đăng ký" trend={0} color="bg-green-500/20" />
            </div>

            {/* Revenue Chart + Order Status */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 bg-[#18181b] border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
                    <CardHeader className="border-b border-slate-800/50 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white flex items-center gap-2 text-lg">
                                    <BarChart3 size={18} className="text-primary" /> Doanh thu 30 ngày qua
                                </CardTitle>
                                <CardDescription className="text-slate-500 mt-1">Biểu đồ doanh thu theo ngày</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 px-2 pb-2">
                        <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
                                    <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}tr` : v} width={40} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" dot={false} activeDot={{ r: 5, fill: '#f97316', stroke: '#09090b', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
                    <CardHeader className="border-b border-slate-800/50 pb-4">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            <ShoppingBag size={18} className="text-primary" /> Trạng thái đơn hàng
                        </CardTitle>
                        <CardDescription className="text-slate-500">Phân loại toàn bộ đơn</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                        {[
                            { label: 'Đang xử lý', key: 'Processing', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
                            { label: 'Đang giao',  key: 'Shipped',    color: 'bg-blue-500',   textColor: 'text-blue-400'   },
                            { label: 'Đã giao',    key: 'Delivered',  color: 'bg-green-500',  textColor: 'text-green-400'  },
                            { label: 'Đã hủy',     key: 'Cancelled',  color: 'bg-red-500',    textColor: 'text-red-400'    },
                        ].map(({ label, key, color, textColor }) => {
                            const val = statusMap[key] || 0;
                            const total = stats?.totalOrders || 1;
                            const pctVal = Math.round((val / total) * 100);
                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-slate-400 text-sm">{label}</span>
                                        <span className={`font-bold text-sm ${textColor}`}>{val}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pctVal}%`, transition: 'width 1s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                        {stats?.totalOrders === 0 && (
                            <p className="text-slate-600 text-sm text-center py-8">Chưa có đơn hàng nào</p>
                        )}
                        <div className="pt-2">
                            <Link to="/admin/orders" className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                                Xem tất cả đơn hàng <ArrowRight size={14} />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
                <CardHeader className="border-b border-slate-800/50 bg-[#27272a]/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white text-lg">Đơn hàng gần đây</CardTitle>
                            <CardDescription className="text-slate-500">5 đơn hàng mới nhất</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')} className="border-slate-700 bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl">
                            Xem tất cả <ArrowRight size={14} className="ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                            <ShoppingBag size={56} className="mb-4 text-slate-600" />
                            <p className="text-slate-400">Chưa có đơn hàng nào</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[11px] text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-900/30">
                                    <tr>
                                        <th className="px-6 py-4">Mã đơn</th>
                                        <th className="px-6 py-4">Khách hàng</th>
                                        <th className="px-6 py-4 text-center">Tổng tiền</th>
                                        <th className="px-6 py-4 text-center">Trạng thái</th>
                                        <th className="px-6 py-4 text-center">Ngày đặt</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {stats.recentOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-slate-800/20 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs text-slate-400">#{order._id.slice(-8).toUpperCase()}</td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-white font-medium">{order.user?.name || 'N/A'}</p>
                                                    <p className="text-slate-500 text-xs">{order.user?.email || ''}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-primary">{order.totalPrice?.toLocaleString('vi-VN')}₫</td>
                                            <td className="px-6 py-4 text-center"><OrderStatusBadge status={order.status} /></td>
                                            <td className="px-6 py-4 text-center text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')} className="text-slate-500 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all rounded-xl">
                                                    Chi tiết <ArrowRight size={14} className="ml-1" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Thêm sản phẩm',    icon: Package,     to: '/admin/products/create', color: 'from-primary/20 to-primary/5'      },
                    { label: 'Quản lý đơn hàng', icon: ShoppingBag, to: '/admin/orders',           color: 'from-blue-500/20 to-blue-500/5'    },
                    { label: 'Quản lý sản phẩm', icon: Package,     to: '/admin/products',         color: 'from-purple-500/20 to-purple-500/5' },
                    { label: 'Quản lý danh mục', icon: BarChart3,   to: '/admin/categories',       color: 'from-green-500/20 to-green-500/5'  },
                ].map(({ label, icon: Icon, to, color }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-slate-800 bg-gradient-to-br ${color} hover:border-slate-700 hover:scale-[1.02] transition-all group shadow-lg shadow-black/20`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-700/50 transition-colors">
                            <Icon size={20} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-300 text-center leading-tight">{label}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
