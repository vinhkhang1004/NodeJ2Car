import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchCategoryById, deleteCategory } from '../../services/productService';
import {
    ArrowLeft, Pencil, Trash2, Loader2, Tag, Calendar,
    User, ToggleLeft, ToggleRight, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '../../services/api';

const CategoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchCategoryById(id);
                setCategory(data);
                // Load products in this category
                const res = await api.get('/products', { params: { category: id, limit: 5 } });
                setProducts(res.data.products || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm(`Xác nhận xoá danh mục "${category.name}"?`)) return;
        try {
            setDeleting(true);
            await deleteCategory(id);
            navigate('/admin/categories');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setDeleting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin text-white" size={48} />
        </div>
    );

    if (error) return (
        <div className="max-w-xl mx-auto mt-12">
            <Alert variant="destructive" className="bg-red-950/30 border-red-900/50 text-red-400">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button asChild className="mt-4" variant="outline">
                <Link to="/admin/categories"><ArrowLeft className="mr-2 h-4 w-4" /> Quay lại</Link>
            </Button>
        </div>
    );

    return (
        <div className="animate-fade-in pb-12 text-white/90">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                        <Link to="/admin/categories"><ArrowLeft className="mr-2 h-4 w-4" /> Quay lại</Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Tag size={20} /> {category.name}
                        </h1>
                        <code className="text-slate-500 text-xs">/{category.slug}</code>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline" className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                        <Link to={`/admin/categories/${category._id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={deleting}
                        onClick={handleDelete}
                        className="bg-red-950/50 border border-red-900/50 text-red-400 hover:bg-red-900/50"
                    >
                        {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Xoá danh mục
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left */}
                <div className="space-y-6">
                    {/* Image & Status */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardContent className="pt-6">
                            {category.imageUrl ? (
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="w-full aspect-video object-cover rounded-lg border border-slate-700 mb-4"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="w-full aspect-video bg-slate-800 rounded-lg border border-slate-700 mb-4 flex items-center justify-center">
                                    <Tag size={40} className="text-slate-600" />
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Trạng thái</span>
                                {category.isActive ? (
                                    <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">
                                        <ToggleRight size={12} className="mr-1" /> Hoạt động
                                    </Badge>
                                ) : (
                                    <Badge className="bg-slate-700/50 text-slate-400 border border-slate-600/50">
                                        <ToggleLeft size={12} className="mr-1" /> Tạm ẩn
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <Card className="bg-[#18181b] border-slate-800">
                        <CardContent className="pt-6">
                            <div className="text-center py-4">
                                <div className="text-4xl font-bold text-white mb-1">{products.length}</div>
                                <div className="text-slate-400 text-sm">sản phẩm trong danh mục này</div>
                                <Button asChild className="mt-4 w-full bg-white text-black hover:bg-slate-200" size="sm">
                                    <Link to={`/admin/products?category=${category._id}`}>
                                        <Package className="mr-2 h-4 w-4" /> Xem tất cả sản phẩm
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Info */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader>
                            <CardTitle className="text-white text-base">Thông tin danh mục</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InfoRow label="Tên danh mục" value={category.name} />
                            <InfoRow label="Slug"
                                value={<code className="bg-slate-800 px-2 py-1 rounded text-slate-300 text-xs">{category.slug}</code>}
                            />
                            <InfoRow label="Mô tả"
                                value={category.description ? (
                                    <p className="text-slate-300 leading-relaxed">{category.description}</p>
                                ) : (
                                    <span className="text-slate-500 italic">Không có mô tả</span>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* System info */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader>
                            <CardTitle className="text-white text-base flex items-center gap-2">
                                <Calendar size={16} /> Thông tin hệ thống
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InfoRow label="Ngày tạo" value={new Date(category.createdAt).toLocaleString('vi-VN')} />
                            <InfoRow label="Cập nhật lần cuối" value={new Date(category.updatedAt).toLocaleString('vi-VN')} />
                            {category.createdBy && (
                                <InfoRow label="Tạo bởi" value={
                                    <span className="flex items-center gap-1">
                                        <User size={12} /> {category.createdBy.name}
                                    </span>
                                } />
                            )}
                        </CardContent>
                    </Card>

                    {/* Products preview */}
                    {products.length > 0 && (
                        <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                            <CardHeader>
                                <CardTitle className="text-white text-base">
                                    Sản phẩm gần đây
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {products.map((p) => (
                                        <Link
                                            key={p._id}
                                            to={`/admin/products/${p._id}`}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-colors"
                                        >
                                            <img
                                                src={p.imageUrl?.startsWith('/') ? `http://localhost:5000${p.imageUrl}` : p.imageUrl}
                                                alt={p.name}
                                                className="w-10 h-10 rounded object-cover border border-slate-700"
                                                onError={(e) => { e.target.src = 'https://placehold.co/40x40/27272a/71717a?text=?'; }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{p.name}</p>
                                                <p className="text-slate-400 text-xs">{p.price.toLocaleString('vi-VN')}₫</p>
                                            </div>
                                            <span className={`text-xs font-medium ${p.stock <= 5 ? 'text-red-400' : 'text-green-400'}`}>
                                                {p.stock} sp
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 py-2 border-b border-slate-800/60 last:border-0">
        <span className="text-slate-400 text-sm min-w-[160px]">{label}</span>
        <div className="text-white text-sm font-medium sm:text-right">{value}</div>
    </div>
);

export default CategoryDetail;
