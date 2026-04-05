import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import { fetchMyOrders } from '../services/orderService';
import { 
    User, Mail, Lock, Loader2, ShoppingBag, 
    ChevronRight, CheckCircle, Clock, Truck, XCircle, AlertCircle,
    Phone, MapPin, Globe, Building, Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
    const { user, updateUserInfo } = useContext(AuthContext);
    
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [city, setCity] = useState(user?.city || '');
    const [country, setCountry] = useState(user?.country || '');
    const [postalCode, setPostalCode] = useState(user?.postalCode || '');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const { data } = await fetchMyOrders();
                setOrders(data);
            } catch (err) {
                console.error('Failed to load orders', err);
            } finally {
                setLoadingOrders(false);
            }
        };
        loadOrders();
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setUpdatingProfile(true);
            const { data } = await updateProfile({ 
                name, 
                email, 
                phone, 
                address, 
                city, 
                country, 
                postalCode, 
                password 
            });
            updateUserInfo(data);
            setMessage('Cập nhật thông tin thành công!');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setUpdatingProfile(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Processing':
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20"><Clock size={10} className="mr-1" /> Chờ xử lý</Badge>;
            case 'Shipped':
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Truck size={10} className="mr-1" /> Đang giao</Badge>;
            case 'Delivered':
                return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20"><CheckCircle size={10} className="mr-1" /> Đã giao</Badge>;
            case 'Cancelled':
                return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20"><XCircle size={10} className="mr-1" /> Đã huỷ</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="animate-fade-in pb-20 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-10 tracking-tight text-white">Tài khoản của <span className="text-primary">bạn</span></h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Form */}
                <div className="lg:col-span-1">
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20 overflow-hidden h-fit sticky top-24">
                        <CardHeader className="bg-[#27272a]/30 border-b border-slate-800">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <User size={20} className="text-primary" /> Thông tin cá nhân
                            </CardTitle>
                            <CardDescription className="text-slate-500">Cập nhật thông tin tài khoản và mật khẩu.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {message && (
                                <Alert className="mb-4 bg-green-950/30 border-green-900/50 text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}
                            {error && (
                                <Alert variant="destructive" className="mb-4 bg-red-950/30 border-red-900/50 text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={submitHandler} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-400">Họ và tên</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <Input 
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-400">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <Input 
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-800 mt-6">
                                    <h3 className="text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Thông tin giao hàng</h3>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-slate-400 text-xs">Số điện thoại</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <Input 
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="VD: 0987654321"
                                                className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-slate-400 text-xs">Địa chỉ chi tiết</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <Input 
                                                id="address"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="Số nhà, tên đường..."
                                                className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city" className="text-slate-400 text-xs">Thành phố</Label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <Input 
                                                    id="city"
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    placeholder="VD: Hà Nội"
                                                    className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="postal" className="text-slate-400 text-xs">Mã bưu chính</Label>
                                            <div className="relative">
                                                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <Input 
                                                    id="postal"
                                                    value={postalCode}
                                                    onChange={(e) => setPostalCode(e.target.value)}
                                                    placeholder="10000"
                                                    className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country" className="text-slate-400 text-xs">Quốc gia</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <Input 
                                                id="country"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                placeholder="VD: Việt Nam"
                                                className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-800 mt-6">
                                    <h3 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wider">Đổi mật khẩu</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pass" className="text-slate-400 text-xs">Mật khẩu mới</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <Input 
                                                    id="pass"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Nhập mật khẩu mới"
                                                    className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPass" className="text-slate-400 text-xs">Xác nhận mật khẩu mới</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <Input 
                                                    id="confirmPass"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Xác nhận lại mật khẩu"
                                                    className="pl-10 bg-slate-900/50 border-slate-800 focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full bg-white text-black hover:bg-slate-200 mt-6 h-12 font-bold"
                                    disabled={updatingProfile}
                                >
                                    {updatingProfile ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Cập nhật thông tin
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders History */}
                <div className="lg:col-span-2 space-y-6">
                     <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
                        <CardHeader className="bg-[#27272a]/30 border-b border-slate-800">
                             <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <ShoppingBag size={20} className="text-primary" /> Lịch sử đơn hàng
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">Các giao dịch bạn đã thực hiện.</CardDescription>
                                </div>
                                <Badge className="bg-slate-800 text-slate-400">{orders.length} đơn hàng</Badge>
                             </div>
                        </CardHeader>
                        <CardContent className="pt-0 px-0">
                            {loadingOrders ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                </div>
                            ) : orders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-900/50 text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">Mã đơn</th>
                                                <th className="px-6 py-4 text-center">Ngày đặt</th>
                                                <th className="px-6 py-4 text-center">Tổng tiền</th>
                                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {orders.map((order) => (
                                                <tr key={order._id} className="hover:bg-slate-800/20 transition-colors group">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                                        #{order._id.substring(18).toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-slate-300">
                                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-success">
                                                        {order.totalPrice.toLocaleString('vi-VN')}₫
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {getStatusBadge(order.status)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {/* Link to order details (can be built later if needed) */}
                                                        <span className="text-slate-600 group-hover:text-primary transition-colors cursor-pointer">
                                                            <ChevronRight size={18} />
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                    <ShoppingBag size={64} className="mb-4" />
                                    <p>Bạn chưa có đơn hàng nào.</p>
                                    <Link to="/" className="text-primary hover:underline mt-2">Bắt đầu mua sắm ngay</Link>
                                </div>
                            )}
                        </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
