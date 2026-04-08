import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Rating from '../components/Rating';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { getFileUrl } from '../lib/utils';
import { 
    Loader2, 
    ChevronRight, 
    ShoppingCart, 
    Zap, 
    ShieldCheck, 
    Info,
    ArrowLeft,
    Check,
    Pencil,
    Trash2,
    Heart
} from 'lucide-react';

const PartDetail = () => {
    const [part, setPart] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { user, wishlist, toggleWishlist } = useContext(AuthContext);

    const isFavorite = wishlist.includes(id);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState(false);

    // Edit review states
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');


    const fetchPart = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/products/${id}`);
            setPart(data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPart();
    }, [id]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setReviewLoading(true);
        try {
            await api.post(`/products/${id}/reviews`, { rating, comment });
            setReviewSuccess(true);
            setRating(0);
            setComment('');
            fetchPart();
        } catch (err) {
            setReviewError(err.response?.data?.message || err.message);
        } finally {
            setReviewLoading(false);
        }
    };

    const deleteReviewHandler = async (reviewId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            try {
                await api.delete(`/products/${id}/reviews/${reviewId}`);
                fetchPart();
            } catch (err) {
                alert(err.response?.data?.message || err.message);
            }
        }
    };

    const updateReviewHandler = async (e, reviewId) => {
        e.preventDefault();
        setReviewLoading(true);
        try {
            await api.put(`/products/${id}/reviews/${reviewId}`, { 
                rating: editRating, 
                comment: editComment 
            });
            setEditingReviewId(null);
            fetchPart();
        } catch (err) {
            setReviewError(err.response?.data?.message || err.message);
        } finally {
            setReviewLoading(false);
        }
    };

    const startEditing = (review) => {
        setEditingReviewId(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };



    // Mock images for gallery effect
    const galleryItems = [
        getFileUrl(part.imageUrl),
        "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop"
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="animate-spin text-blue-900" size={48} />
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl font-black text-red-500 mb-4">Lỗi tải thông tin sản phẩm</h2>
            <p className="text-slate-500 mb-8">{error}</p>
            <Link to="/shop" className="bg-blue-950 text-white px-8 py-3 font-bold">Quay lại cửa hàng</Link>
        </div>
    );

    // Hiển thị giá niêm yết
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(part.price || 0);

    const categoryName = typeof part.category === 'object' ? part.category?.name : part.category;

    return (
        <div className="bg-white pb-24">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-12">
                    <Link to="/" className="hover:text-blue-950 transition-colors">Trang Chủ</Link>
                    <ChevronRight size={12} />
                    <Link to="/shop" className="hover:text-blue-950 transition-colors">{categoryName || 'Sản phẩm'}</Link>
                    <ChevronRight size={12} />
                    <span className="text-blue-950">{part.name}</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Left: Image Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-square bg-slate-50 rounded-sm overflow-hidden border border-slate-100 group">
                            <img 
                                src={galleryItems[activeImage]} 
                                alt={part.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {galleryItems.map((img, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                                        activeImage === idx ? 'border-blue-950 shadow-lg' : 'border-slate-100 opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-10">
                        <div>
                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-[0.3em] bg-blue-50 px-3 py-1 rounded-full mb-6 inline-block">
                                {part.brand || 'Premium Quality'}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-blue-950 leading-tight tracking-tighter uppercase mb-2">
                                {part.name}
                            </h1>
                            <div className="mb-6 flex items-center gap-4">
                                <Rating value={part.rating} text={`${part.numReviews} Đánh giá`} />
                                <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm ${part.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {part.stock > 0 ? 'Sẵn hàng' : 'Hết hàng'}
                                </span>
                            </div>

                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                {part.description} Được thiết kế cho các kỹ sư đam mê tốc độ. Sử dụng hợp kim {categoryName === 'Động Cơ' ? 'titan siêu nhẹ' : 'nhôm hàng không'} giúp giảm trọng lượng và tăng công suất tối ưu.
                            </p>
                        </div>

                        {/* Compatibility Check Mock */}
                        <div className="bg-slate-50 p-6 border border-slate-100 rounded-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Info size={16} className="text-orange-500" />
                                <span className="text-[11px] font-black text-blue-950 uppercase tracking-widest">Kiểm tra tương thích</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <select className="bg-white border border-slate-200 p-3 text-xs font-bold text-slate-400 rounded-sm outline-none">
                                    <option>Hãng xe</option>
                                    <option>Porsche</option>
                                    <option>BMW</option>
                                </select>
                                <select className="bg-white border border-slate-200 p-3 text-xs font-bold text-slate-400 rounded-sm outline-none">
                                    <option>Đời xe</option>
                                    <option>2023</option>
                                    <option>2024</option>
                                </select>
                            </div>
                            <button className="w-full bg-blue-950 text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 hover:bg-blue-900 transition-colors shadow-xl shadow-blue-900/20">
                                Xác nhận phụ tùng
                            </button>
                        </div>

                        {/* Price & CTA */}
                        <div className="pt-4">
                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-4xl font-black text-blue-950 tracking-tighter">{formattedPrice}</span>
                                <span className="text-orange-500 font-black text-xs uppercase tracking-widest">Giá Niêm Yết</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={() => { addToCart(part); navigate('/cart'); }} className="py-5 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-orange-500/30 w-full">
                                    Mua Ngay
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={() => { addToCart(part); alert('Đã thêm vào giỏ hàng!'); }} className="py-5 bg-slate-100 hover:bg-slate-200 text-blue-950 font-black uppercase tracking-[0.2em] text-xs transition-all border border-slate-200 flex-grow flex items-center justify-center gap-2">
                                        <ShoppingCart size={16} /> Thêm Giỏ Hàng
                                    </button>
                                    {user && (
                                        <button 
                                            onClick={() => toggleWishlist(part._id)}
                                            className="w-16 bg-slate-50 border border-slate-200 flex items-center justify-center transition-all hover:bg-white group"
                                            title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                                        >
                                            <Heart className={`transition-all duration-300 ${isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-400 group-hover:text-red-400'}`} size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="mt-6 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
                                Giao hàng miễn phí toàn quốc trong 24h
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-32 pt-24 border-t border-slate-100">
                    <div className="grid lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-1">
                            <h2 className="text-3xl font-black text-blue-950 tracking-tighter uppercase mb-6">Đánh giá khách hàng</h2>
                            <div className="bg-slate-50 p-8 rounded-sm text-center mb-8">
                                <p className="text-5xl font-black text-blue-950 mb-2">{part.rating?.toFixed(1)}</p>
                                <div className="flex justify-center mb-2">
                                    <Rating value={part.rating} />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dựa trên {part.numReviews} lượt đánh giá</p>
                            </div>
                            
                            {/* Write a Review Section */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-blue-950 uppercase tracking-widest">Viết đánh giá của bạn</h3>
                                {reviewSuccess && (
                                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-sm text-xs font-bold border border-emerald-100">
                                        Cảm ơn bạn! Đánh giá đã được gửi thành công.
                                    </div>
                                )}
                                {reviewError && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-sm text-xs font-bold border border-red-100">
                                        {reviewError}
                                    </div>
                                )}
                                
                                {user ? (
                                    <form onSubmit={submitHandler} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số sao</label>
                                            <select 
                                                value={rating} 
                                                onChange={(e) => setRating(e.target.value)}
                                                className="w-full bg-white border border-slate-200 p-3 text-xs font-bold text-blue-950 rounded-sm outline-none focus:border-blue-950 transition-colors"
                                                required
                                            >
                                                <option value="">Chọn mức độ hài lòng...</option>
                                                <option value="1">1 - Rất tệ</option>
                                                <option value="2">2 - Tệ</option>
                                                <option value="3">3 - Bình thường</option>
                                                <option value="4">4 - Tốt</option>
                                                <option value="5">5 - Rất tuyệt vời</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bình luận</label>
                                            <textarea 
                                                rows="4" 
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                                className="w-full bg-white border border-slate-200 p-4 text-xs font-medium text-slate-600 rounded-sm outline-none focus:border-blue-950 transition-colors resize-none"
                                                required
                                            ></textarea>
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={reviewLoading}
                                            className="w-full bg-blue-950 text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 hover:bg-blue-900 transition-colors disabled:opacity-50"
                                        >
                                            {reviewLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-slate-50 p-6 rounded-sm border border-slate-100 text-center">
                                        <p className="text-xs font-bold text-slate-500 mb-4">Vui lòng đăng nhập để viết đánh giá</p>
                                        <Link to="/login" className="text-[10px] font-black text-blue-950 uppercase tracking-widest underline hover:text-orange-500">Đăng nhập ngay</Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            {part.reviews?.length === 0 ? (
                                <div className="bg-slate-50 py-20 rounded-sm flex flex-col items-center justify-center text-center px-6">
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-2">Chưa có đánh giá nào</p>
                                    <p className="text-slate-300 text-sm max-w-xs">Hãy là người đầu tiên sở hữu và đánh giá sản phẩm tuyệt vời này.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {part.reviews?.map((review) => (
                                        <div key={review._id} className="p-8 border border-slate-100 rounded-sm hover:border-slate-200 transition-colors group">
                                            {editingReviewId === review._id ? (
                                                <form onSubmit={(e) => updateReviewHandler(e, review._id)} className="space-y-4">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Số sao mới</label>
                                                        <select 
                                                            value={editRating} 
                                                            onChange={(e) => setEditRating(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 p-3 text-xs font-bold text-blue-950 rounded-sm outline-none focus:border-blue-950 transition-colors"
                                                            required
                                                        >
                                                            <option value="1">1 - Rất tệ</option>
                                                            <option value="2">2 - Tệ</option>
                                                            <option value="3">3 - Bình thường</option>
                                                            <option value="4">4 - Tốt</option>
                                                            <option value="5">5 - Rất tuyệt vời</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bình luận mới</label>
                                                        <textarea 
                                                            rows="4" 
                                                            value={editComment}
                                                            onChange={(e) => setEditComment(e.target.value)}
                                                            className="w-full bg-white border border-slate-200 p-4 text-xs font-medium text-slate-600 rounded-sm outline-none focus:border-blue-950 transition-colors resize-none"
                                                            required
                                                        ></textarea>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            type="submit" 
                                                            className="bg-blue-950 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 hover:bg-blue-900 transition-colors"
                                                        >
                                                            Lưu thay đổi
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setEditingReviewId(null)}
                                                            className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-6 py-3 hover:bg-slate-200 transition-colors"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <p className="text-sm font-black text-blue-950 uppercase tracking-tighter mb-1">{review.name}</p>
                                                            <Rating value={review.rating} />
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                            </span>
                                                            
                                                            {user && (review.user === user._id || user.isAdmin) && (
                                                                <div className="flex gap-3 mt-2">
                                                                    {review.user === user._id && !review.reply && (
                                                                        <button 
                                                                            onClick={() => startEditing(review)}
                                                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                                                            title="Sửa đánh giá"
                                                                        >
                                                                            <Pencil size={14} />
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => deleteReviewHandler(review._id)}
                                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                                        title="Xóa đánh giá"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-500 text-sm leading-relaxed italic mb-4">
                                                        "{review.comment}"
                                                    </p>

                                                    {review.reply && (
                                                        <div className="mt-4 flex gap-3 bg-blue-50/50 p-6 rounded-sm border-l-2 border-orange-500">
                                                            <div className="shrink-0 mt-1">
                                                                <Check size={14} className="text-orange-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-blue-950 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                    Phản hồi từ J2AutoParts
                                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                    <span className="text-slate-400 font-bold lowercase">Official</span>
                                                                </p>
                                                                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                                                    {review.reply}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PartDetail;
