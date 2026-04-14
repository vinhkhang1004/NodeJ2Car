import React, { useState, useEffect } from 'react';
import { 
    Tag, Plus, Trash2, Edit, Save, X, Calendar, 
    Hash, DollarSign, Percent, Users, Layout, 
    ChevronRight, AlertCircle, CheckCircle, Search,
    Filter, Clock, ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '../../services/api';

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('Percentage');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [minPurchase, setMinPurchase] = useState(0);
    const [expiryDate, setExpiryDate] = useState('');
    const [usageLimit, setUsageLimit] = useState(100);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isActive, setIsActive] = useState(true);

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCoupons();
        fetchCategories();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/coupons');

            setCoupons(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');

            setCategories(data);
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setCode('');
        setDiscountType('Percentage');
        setDiscountAmount(0);
        setMinPurchase(0);
        setExpiryDate('');
        setUsageLimit(100);
        setSelectedCategories([]);
        setIsActive(true);
        setIsEditing(false);
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        const couponData = {
            code, discountType, discountAmount, minPurchase,
            expiryDate, usageLimit, applicableCategories: selectedCategories,
            isActive
        };

        try {
            if (isEditing) {
                await api.put(`/coupons/${editId}`, couponData);

                setMessage('Cập nhật mã giảm giá thành công');
            } else {
                await api.post('/coupons', couponData);

                setMessage('Thêm mã giảm giá thành công');
            }
            fetchCoupons();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleEdit = (coupon) => {
        setEditId(coupon._id);
        setCode(coupon.code);
        setDiscountType(coupon.discountType);
        setDiscountAmount(coupon.discountAmount);
        setMinPurchase(coupon.minPurchase);
        setExpiryDate(new Date(coupon.expiryDate).toISOString().split('T')[0]);
        setUsageLimit(coupon.usageLimit);
        setSelectedCategories(coupon.applicableCategories.map(c => c._id || c));
        setIsActive(coupon.isActive);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa mã giảm giá này?')) return;
        try {
            await api.delete(`/coupons/${id}`);

            fetchCoupons();
            setMessage('Đã xóa mã giảm giá');
        } catch (err) {
            setError('Không thể xóa mã giảm giá');
        }
    };

    const toggleCategory = (catId) => {
        setSelectedCategories(prev => 
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">
                        QUẢN LÝ <span className="text-primary italic">KHUYẾN MÃI</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Tạo và điều chỉnh các mã giảm giá cho khách hàng.</p>
                </div>
                <Button 
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-6 font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    {showForm ? <><X size={18} className="mr-2" /> Đóng</> : <><Plus size={18} className="mr-2" /> Tạo mã mới</>}
                </Button>
            </div>

            {message && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <CheckCircle size={18} />
                    <span className="text-sm font-bold">{message}</span>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            {showForm && (
                <Card className="bg-[#18181b] border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <CardHeader className="bg-[#27272a]/30 border-b border-slate-800 py-6">
                        <CardTitle className="text-lg flex items-center gap-2 text-white italic">
                            {isEditing ? <Edit size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
                            {isEditing ? 'CẬP NHẬT MÃ GIẢM GIÁ' : 'TẠO MÃ GIẢM GIÁ MỚI'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs font-black uppercase tracking-widest">Mã giảm giá</Label>
                                <Input 
                                    placeholder="VD: GIAM20K, J2CAR50" 
                                    value={code} 
                                    onChange={(e) => setCode(e.target.value)}
                                    className="bg-slate-900 border-slate-800 h-12 text-white font-bold uppercase"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs font-black uppercase tracking-widest">Loại giảm giá</Label>
                                <select 
                                    className="w-full h-12 bg-slate-900 border border-slate-800 rounded-md px-3 text-white font-bold appearance-none focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                >
                                    <option value="Percentage">Phần trăm (%)</option>
                                    <option value="FixedAmount">Số tiền cố định (₫)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs font-black uppercase tracking-widest">Giá trị giảm</Label>
                                <div className="relative">
                                    <Input 
                                        type="number"
                                        value={discountAmount} 
                                        onChange={(e) => setDiscountAmount(e.target.value)}
                                        className="bg-slate-900 border-slate-800 h-12 text-white font-bold pl-10"
                                        required
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                        {discountType === 'Percentage' ? <Percent size={16} /> : <DollarSign size={16} />}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs font-black uppercase tracking-widest">Đơn tối thiểu (₫)</Label>
                                <Input 
                                    type="number"
                                    value={minPurchase} 
                                    onChange={(e) => setMinPurchase(e.target.value)}
                                    className="bg-slate-900 border-slate-800 h-12 text-white font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs font-black uppercase tracking-widest">Hạn sử dụng</Label>
                                <Input 
                                    type="date"
                                    value={expiryDate} 
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    className="bg-slate-900 border-slate-800 h-12 text-white font-bold"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs font-black uppercase tracking-widest">Giới hạn số lượt dùng (Toàn hệ thống)</Label>
                                <Input 
                                    type="number"
                                    value={usageLimit} 
                                    onChange={(e) => setUsageLimit(e.target.value)}
                                    className="bg-slate-900 border-slate-800 h-12 text-white font-bold"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2 lg:col-span-3 space-y-3">
                                <Label className="text-slate-400 text-xs font-black uppercase tracking-widest">Áp dụng cho danh mục (Để trống nếu mọi danh mục)</Label>
                                <div className="flex flex-wrap gap-2 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                                    {categories.map(cat => (
                                        <button
                                            key={cat._id}
                                            type="button"
                                            onClick={() => toggleCategory(cat._id)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                selectedCategories.includes(cat._id)
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'bg-slate-800 text-slate-500 hover:text-white'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <input 
                                    type="checkbox" 
                                    id="isActive" 
                                    checked={isActive} 
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-800 bg-slate-900 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="isActive" className="text-white font-bold cursor-pointer italic">Kích hoạt mã giảm giá này</Label>
                            </div>

                            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-6 border-t border-slate-800">
                                <Button type="button" variant="ghost" onClick={resetForm} className="text-slate-500 hover:text-white hover:bg-slate-800 h-12 px-8 uppercase font-bold text-xs tracking-widest">Hủy bỏ</Button>
                                <Button type="submit" className="bg-white text-black hover:bg-slate-200 h-12 px-10 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all">
                                    {isEditing ? 'Cập nhật ngay' : 'Tạo mã mới'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-[#18181b] border-slate-800 shadow-2xl overflow-hidden">
                <CardHeader className="bg-[#27272a]/30 border-b border-slate-800 flex flex-row items-center justify-between py-6">
                    <CardTitle className="text-lg text-white italic">DANH SÁCH MÃ GIẢM GIÁ</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-slate-900 border-slate-800 text-slate-500 font-bold px-3 py-1">
                            {coupons.length} Mã
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/50 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Mã / Loại</th>
                                    <th className="px-6 py-4">Giá trị giảm</th>
                                    <th className="px-6 py-4">Hiệu lực</th>
                                    <th className="px-6 py-4 text-center">Lượt dùng</th>
                                    <th className="px-6 py-4 text-center">Trạng thái</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center animate-pulse text-slate-600 font-bold italic">Đang tải danh sách...</td>
                                    </tr>
                                ) : coupons.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-slate-600 font-bold italic">Chưa có mã giảm giá nào được tạo</td>
                                    </tr>
                                ) : (
                                    coupons.map((coupon) => (
                                        <tr key={coupon._id} className="hover:bg-slate-900/40 transition-colors group">
                                            <td className="px-6 py-5">
                                                <p className="text-white font-black text-sm tracking-tighter flex items-center gap-2">
                                                    <Tag size={14} className="text-primary" /> {coupon.code}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
                                                    {coupon.discountType === 'Percentage' ? 'Phần trăm' : 'Số tiền cố định'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-white font-bold text-base">
                                                    {coupon.discountType === 'Percentage' ? `${coupon.discountAmount}%` : `${coupon.discountAmount.toLocaleString('vi-VN')}₫`}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                                                    Min: {coupon.minPurchase.toLocaleString('vi-VN')}₫
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-slate-300 text-xs font-bold flex items-center gap-1.5">
                                                    <Calendar size={12} className="text-slate-600" />
                                                    {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                                                </p>
                                                <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
                                                    {new Date(coupon.expiryDate) < new Date() ? 'Hết hạn' : 'Đang còn hạn'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <p className="text-white font-bold">{coupon.usedCount} / {coupon.usageLimit}</p>
                                                <div className="w-20 h-1 bg-slate-800 rounded-full mx-auto mt-2 overflow-hidden">
                                                    <div 
                                                        className="h-full bg-primary transition-all duration-500" 
                                                        style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                {coupon.isActive ? (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Hoạt động</span>
                                                ) : (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Tạm dừng</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleEdit(coupon)}
                                                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                                                    >
                                                        <Edit size={14} />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(coupon._id)}
                                                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CouponManagement;
