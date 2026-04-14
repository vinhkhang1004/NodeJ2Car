import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { updateProfile, deleteAddress, setDefaultAddress } from '../services/authService';
import { fetchMyOrders } from '../services/orderService';
import { 
    User, Mail, Lock, Loader2, ShoppingBag, 
    ChevronRight, CheckCircle, Clock, Truck, XCircle, AlertCircle,
    Phone, MapPin, Globe, Building, Navigation, Plus, Trash2, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import AddAddressModal from '../components/AddAddressModal';

const Profile = () => {
    const { user, addresses, updateUserInfo, updateAddresses } = useContext(AuthContext);
    const [showAddModal, setShowAddModal] = useState(false);
    const [localAddresses, setLocalAddresses] = useState(addresses || []);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    
    const [password, setPassword] = useState('');

    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    // Sync addresses when context updates
    useEffect(() => {
        setLocalAddresses(addresses || []);
    }, [addresses]);

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

    const handleAddressSaved = (newAddresses) => {
        setLocalAddresses(newAddresses);
        updateAddresses(newAddresses);
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Xóa địa chỉ này?')) return;
        try {
            const { data } = await deleteAddress(addressId);
            setLocalAddresses(data.addresses);
            updateAddresses(data.addresses);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const { data } = await setDefaultAddress(addressId);
            setLocalAddresses(data.addresses);
            updateAddresses(data.addresses);
        } catch (err) {
            console.error(err);
        }
    };

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

                {/* Address Management */}
                <div className="lg:col-span-2">
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
                        <CardHeader className="bg-[#27272a]/30 border-b border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <MapPin size={20} className="text-primary" /> Địa chỉ của tôi
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">
                                        Quản lý địa chỉ giao hàng. Sử dụng bản đồ để chọn vị trí chính xác.
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 font-bold flex items-center gap-2"
                                >
                                    <Plus size={16} /> Thêm địa chỉ
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {localAddresses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 opacity-40">
                                    <MapPin size={56} className="mb-4 text-slate-600" />
                                    <p className="text-slate-400 font-semibold">Chưa có địa chỉ nào được lưu.</p>
                                    <p className="text-slate-600 text-sm mt-1">Nhấn "Thêm địa chỉ" để thêm ngay!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {localAddresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            className={`relative p-5 rounded-2xl border-2 transition-all ${addr.isDefault ? 'border-primary bg-primary/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'}`}
                                        >
                                            {addr.isDefault && (
                                                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-1">
                                                    <Star size={10} fill="currentColor" /> Mặc định
                                                </div>
                                            )}
                                            {addr.label && (
                                                <p className="text-primary font-bold uppercase text-xs tracking-widest mb-2">{addr.label}</p>
                                            )}
                                            <p className="font-bold text-white text-base">{addr.name}</p>
                                            <p className="text-slate-400 text-sm">{addr.phone}</p>
                                            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                                                {addr.address}, {addr.city}
                                                {addr.country && `, ${addr.country}`}
                                            </p>
                                            {addr.lat && (
                                                <p className="text-slate-600 text-[10px] mt-2 font-mono">
                                                    📍 {addr.lat.toFixed(4)}, {addr.lng.toFixed(4)}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-4">
                                                {!addr.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(addr._id)}
                                                        className="text-xs text-slate-500 hover:text-primary transition-colors font-bold flex items-center gap-1"
                                                    >
                                                        <Star size={12} /> Đặt mặc định
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteAddress(addr._id)}
                                                    className="ml-auto text-slate-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-950/30"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Order History */}
                <div className="lg:col-span-3">
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
                        <CardHeader className="bg-[#27272a]/30 border-b border-slate-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-primary" /> Lịch sử đơn hàng
                                </CardTitle>
                                <CardDescription className="text-slate-500">Xem lại các đơn hàng bạn đã mua và trạng thái hiện tại.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingOrders ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                    <ShoppingBag size={56} className="mb-4 text-slate-600" />
                                    <p className="text-slate-400 font-semibold">Bạn chưa có đơn hàng nào.</p>
                                    <Button variant="link" asChild className="mt-2 text-primary">
                                        <Link to="/">Mua sắm ngay</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-[11px] text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-900/30">
                                            <tr>
                                                <th className="px-6 py-4">Mã đơn hàng</th>
                                                <th className="px-6 py-4">Ngày đặt</th>
                                                <th className="px-6 py-4 text-center">Tổng tiền</th>
                                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                                <th className="px-6 py-4 text-center">Thanh toán</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {orders.map((order) => (
                                                <tr key={order._id} className="hover:bg-slate-800/20 transition-colors group">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                                        #{order._id.slice(-8).toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">
                                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-primary">
                                                        {order.totalPrice?.toLocaleString('vi-VN')}₫
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {getStatusBadge(order.status)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {order.isPaid ? (
                                                            <span className="text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">Đã thanh toán</span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs font-bold border border-slate-700 px-2 py-1 rounded">Chưa thanh toán</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {/* Optional: Add Link to order details page if it exists */}
                                                        <span className="text-slate-600 text-xs italic">Chi tiết được gửi qua email</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Address Modal */}
            {showAddModal && (
                <AddAddressModal
                    onClose={() => setShowAddModal(false)}
                    onSaved={handleAddressSaved}
                />
            )}
        </div>
    );
};

export default Profile;
