import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Loader2, 
    Star, 
    MessageSquare, 
    Trash2, 
    Search, 
    Filter, 
    CheckCircle2, 
    XCircle,
    CornerDownRight,
    Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Rating from '../../components/Rating';

const ReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, positive, neutral, negative
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/parts/admin/reviews');
            setReviews(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleReply = async (partId, reviewId) => {
        if (!replyText.trim()) return;
        setActionLoading(true);
        try {
            await api.post(`/parts/${partId}/reviews/${reviewId}/reply`, { reply: replyText });
            setReplyingId(null);
            setReplyText('');
            fetchReviews();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (partId, reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xoá đánh giá này? Hành động này sẽ thay đổi điểm trung bình của sản phẩm.')) return;
        setActionLoading(true);
        try {
            await api.delete(`/parts/${partId}/reviews/${reviewId}`);
            fetchReviews();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredReviews = reviews.filter(review => {
        if (filter === 'positive') return review.rating >= 4;
        if (filter === 'neutral') return review.rating === 3;
        if (filter === 'negative') return review.rating <= 2;
        return true;
    });

    return (
        <div className="animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Quản lý đánh giá</h1>
                    <p className="text-slate-500 text-sm">Lắng nghe và phản hồi ý kiến từ khách hàng</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'positive', label: 'Tốt (4-5★)' },
                        { id: 'neutral', label: 'Bình thường' },
                        { id: 'negative', label: 'Tiêu cực (1-2★)' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setFilter(item.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                filter === item.id 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-8 bg-red-950/20 border-red-900/50 text-red-500">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredReviews.length === 0 ? (
                        <div className="text-center py-24 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                            <MessageSquare className="mx-auto text-slate-700 mb-4 opacity-20" size={48} />
                            <p className="text-slate-500 font-bold">Không tìm thấy đánh giá nào khớp với bộ lọc.</p>
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <Card key={review._id} className="bg-[#18181b] border-slate-800 group hover:border-slate-700 transition-all overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary font-black uppercase shadow-inner">
                                                        {review.name.substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-bold leading-none mb-1">{review.name}</h3>
                                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                                            Sản phẩm: <span className="text-slate-300">{review.partName}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Rating value={review.rating} />
                                                    <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-slate-800 pl-4 py-1">
                                                        "{review.comment}"
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-900 px-2 py-1 rounded">
                                                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                                <div className="flex items-center gap-2 mt-auto">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-9 gap-2 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                                                        onClick={() => {
                                                            setReplyingId(review._id);
                                                            setReplyText(review.reply || '');
                                                        }}
                                                    >
                                                        <MessageSquare size={14} />
                                                        {review.reply ? 'Sửa phản hồi' : 'Phản hồi'}
                                                    </Button>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm" 
                                                        className="h-9 w-9 p-0 bg-red-950/30 text-red-500 border-red-900/50 hover:bg-red-900/50"
                                                        onClick={() => handleDelete(review.partId, review._id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reply Section */}
                                        {(review.reply || replyingId === review._id) && (
                                            <div className="mt-6 pt-6 border-t border-slate-800/50">
                                                {replyingId === review._id ? (
                                                    <div className="space-y-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                                            <CornerDownRight size={12} /> Phản hồi từ J2AutoParts
                                                        </div>
                                                        <textarea
                                                            placeholder="Nhập nội dung phản hồi khách hàng..."
                                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 outline-none focus:border-primary transition-all resize-none h-24"
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="text-slate-500"
                                                                onClick={() => setReplyingId(null)}
                                                            >
                                                                Huỷ
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                className="gap-2"
                                                                disabled={actionLoading}
                                                                onClick={() => handleReply(review.partId, review._id)}
                                                            >
                                                                <Send size={14} />
                                                                {actionLoading ? 'Đang gửi...' : 'Gửi phản hồi'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : review.reply ? (
                                                    <div className="flex gap-3 bg-primary/5 p-4 rounded-xl border border-primary/20">
                                                        <CornerDownRight className="text-primary mt-1 shrink-0" size={16} />
                                                        <div>
                                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                                                                Phản hồi của bạn
                                                            </p>
                                                            <p className="text-slate-300 text-xs leading-relaxed">
                                                                {review.reply}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewList;
