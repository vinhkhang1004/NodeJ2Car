import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PartCard from '../components/PartCard';
import api from '../services/api';
import { Loader2, Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
    const { user, wishlist } = useContext(AuthContext);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/auth/wishlist');
                setWishlistItems(data);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchWishlist();
        }
    }, [user, wishlist]);

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-32 text-center">
                <Heart className="mx-auto text-slate-200 mb-6" size={64} />
                <h2 className="text-2xl font-black text-blue-950 uppercase tracking-tighter mb-4">Vui lòng đăng nhập</h2>
                <p className="text-slate-500 mb-10">Bạn cần đăng nhập để xem danh sách sản phẩm yêu thích.</p>
                <Link to="/login" className="bg-blue-950 text-white px-10 py-4 font-black uppercase tracking-widest text-xs rounded-sm shadow-xl shadow-blue-900/20">Đăng nhập ngay</Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 py-16 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 hover:text-blue-950 transition-colors">
                        <ArrowLeft size={12} /> Tiếp tục mua sắm
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-blue-950 tracking-tighter uppercase">Sản phẩm yêu thích</h1>
                    <p className="text-slate-500 font-medium text-sm mt-2">Bộ sưu tập linh kiện mơ ước của bạn ({wishlistItems.length} sản phẩm)</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-blue-950" size={40} />
                    </div>
                ) : wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {wishlistItems.map(item => (
                            <PartCard key={item._id} part={item} />
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                            <Heart className="text-slate-200" size={40} />
                        </div>
                        <h3 className="text-xl font-black text-blue-950 uppercase tracking-tighter mb-2">Danh sách trống</h3>
                        <p className="text-slate-400 font-medium text-sm mb-10">Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</p>
                        <Link to="/shop" className="bg-blue-950 text-white px-10 py-4 font-black uppercase tracking-widest text-xs rounded-sm shadow-xl shadow-blue-900/20 inline-flex items-center gap-2 hover:bg-blue-900 transition-all">
                            <ShoppingBag size={16} /> Khám phá sản phẩm
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
