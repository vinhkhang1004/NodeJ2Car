import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PartCard from '../components/PartCard';
import { Loader2, Heart, ArrowLeft, ShoppingBag } from 'lucide-react';

const Wishlist = () => {
    const { user, wishlist } = useContext(AuthContext);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/auth/wishlist');
            setWishlistItems(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách yêu thích');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchWishlist();
        }
    }, [user, wishlist]); // Refresh when wishlist context changes

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-32 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                    <Heart size={40} />
                </div>
                <h2 className="text-3xl font-black text-blue-950 uppercase tracking-tighter mb-4">Danh sách yêu thích</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Vui lòng đăng nhập để xem và quản lý những phụ tùng bạn yêu thích.</p>
                <Link to="/login" className="bg-blue-950 text-white px-10 py-4 font-black uppercase tracking-widest text-xs hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20">
                    Đăng nhập ngay
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-32">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 py-20">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-4">
                                <Heart size={12} className="fill-orange-500" />
                                <span>Bộ sưu tập cá nhân</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-blue-950 uppercase tracking-tighter leading-none">
                                Sản phẩm <br /> <span className="text-blue-700">Yêu thích</span>
                            </h1>
                        </div>
                        <div className="pb-2">
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                Bạn có {wishlistItems.length} sản phẩm trong danh sách
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-950 transition-colors mb-12">
                    <ArrowLeft size={14} /> Tiếp tục mua sắm
                </Link>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-950" size={48} />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-8 rounded-sm text-center border border-red-100">
                        <p className="font-bold">{error}</p>
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="bg-slate-50 py-32 rounded-sm border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center mb-8 text-slate-200">
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="text-xl font-black text-blue-950 uppercase tracking-tight mb-3">Chưa có sản phẩm nào</h3>
                        <p className="text-slate-400 text-sm max-w-xs mb-10 leading-relaxed font-medium">
                            Hãy duyệt qua cửa hàng và lưu lại những phụ tùng tuyệt vời nhất cho xế yêu của bạn.
                        </p>
                        <Link to="/shop" className="bg-blue-950 text-white px-10 py-5 font-black uppercase tracking-widest text-[10px] hover:bg-blue-900 transition-all shadow-2xl shadow-blue-900/10">
                            Bắt đầu khám phá
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                        {wishlistItems.map((item) => (
                            <PartCard key={item._id} part={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
