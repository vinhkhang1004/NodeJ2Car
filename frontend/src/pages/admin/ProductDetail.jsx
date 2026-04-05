import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProductById, deleteProduct } from '../../services/productService';
import {
    ArrowLeft, Pencil, Trash2, Loader2, Package, Tag, DollarSign,
    Boxes, Image, Info, Calendar, User, Hash, ShoppingCart, Plus, Minus
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getFileUrl } from '../../lib/utils';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const { user } = React.useContext(AuthContext);
    const { addToCart } = React.useContext(CartContext);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchProductById(id);
                setProduct(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm(`Xác nhận xoá sản phẩm "${product.name}"?`)) return;
        try {
            setDeleting(true);
            await deleteProduct(id);
            navigate('/admin/products');
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
            <Button asChild className="mt-4 bg-transparent border-slate-700 text-white hover:bg-slate-800" variant="outline">
                <Link to="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Quay lại</Link>
            </Button>
        </div>
    );

    const stockColor = product.stock <= 5 ? 'text-red-400' : product.stock <= 20 ? 'text-yellow-400' : 'text-green-400';

    return (
        <div className="animate-fade-in pb-12 text-white/90">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                        <Link to="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Quay lại</Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">{product.name}</h1>
                        <p className="text-slate-400 text-xs mt-0.5">ID: {product._id}</p>
                    </div>
                </div>
                {(user && user.isAdmin) && (
                    <div className="flex gap-2">
                        <Button asChild variant="outline" className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                            <Link to={`/admin/products/${product._id}/edit`}>
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
                            Xoá sản phẩm
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left — Image & Status */}
                <div className="space-y-6">
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardContent className="pt-6">
                            <img
                                src={getFileUrl(product.imageUrl)}
                                alt={product.name}
                                className="w-full aspect-square object-cover rounded-lg border border-slate-700 mb-4"
                                onError={(e) => { e.target.src = 'https://placehold.co/400x400/27272a/71717a?text=No+Image'; }}
                            />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Trạng thái</span>
                                    {product.isActive ? (
                                        <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">Đang hiển thị</Badge>
                                    ) : (
                                        <Badge className="bg-slate-700/50 text-slate-400 border border-slate-600/50">Đang ẩn</Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">Tồn kho</span>
                                    <span className={`font-bold text-lg ${stockColor}`}>{product.stock}</span>
                                </div>
                                {product.stock <= 5 && (
                                    <p className="text-xs text-red-400 bg-red-950/20 px-3 py-2 rounded-lg border border-red-900/30">
                                        ⚠️ Tồn kho thấp! Cần nhập thêm hàng.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Public Add to Cart - only show if NOT admin or in public route */}
                    {(!user || !user.isAdmin) && (
                        <Card className="bg-[#18181b] border-primary/20 shadow-xl shadow-primary/5">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-1 bg-slate-900 rounded-xl border border-slate-800">
                                        <button 
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="text-xl font-bold">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
                                            disabled={quantity >= product.stock}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            if (quantity > product.stock) {
                                                alert(`Xin lỗi, chỉ có ${product.stock} sản phẩm trong kho.`);
                                                setQuantity(product.stock);
                                                return;
                                            }
                                            addToCart(product, quantity);
                                        }}
                                        disabled={product.stock <= 0}
                                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:translate-y-[-2px]"
                                    >
                                        <ShoppingCart className="mr-2 h-5 w-5" /> 
                                        {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick actions (Admin only) */}
                    {(user && user.isAdmin) && (
                        <Card className="bg-[#18181b] border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white text-sm">Thao tác nhanh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button asChild className="w-full bg-white text-black hover:bg-slate-200">
                                    <Link to={`/admin/products/${product._id}/edit`}>
                                        <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa thông tin
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full bg-transparent border-slate-700 text-white hover:bg-slate-800">
                                    <Link to="/admin/products/create">
                                        <Package className="mr-2 h-4 w-4" /> Thêm sản phẩm mới
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right — Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic info */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                                <Info size={16} /> Thông tin cơ bản
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Row icon={<Package size={14} />} label="Tên sản phẩm" value={product.name} />
                            <Row icon={<Tag size={14} />} label="Danh mục"
                                value={
                                    <Link to={`/admin/categories/${product.category?._id}/edit`} className="text-blue-400 hover:underline">
                                        {product.category?.name || '—'}
                                    </Link>
                                }
                            />
                            <Row icon={<Hash size={14} />} label="Thương hiệu" value={product.brand} />
                            {product.sku && <Row icon={<Hash size={14} />} label="SKU" value={<code className="bg-slate-800 px-2 py-0.5 rounded text-xs">{product.sku}</code>} />}
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                                <Info size={16} /> Mô tả
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                                <DollarSign size={16} /> Giá & Tồn kho
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Row icon={<DollarSign size={14} />} label="Giá bán"
                                value={<span className="text-2xl font-bold text-white">{product.price.toLocaleString('vi-VN')}₫</span>}
                            />
                            <Row icon={<Boxes size={14} />} label="Tồn kho"
                                value={<span className={`text-xl font-bold ${stockColor}`}>{product.stock} sản phẩm</span>}
                            />
                        </CardContent>
                    </Card>

                    {/* Metadata */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                                <Calendar size={16} /> Thông tin hệ thống
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Row icon={<Calendar size={14} />} label="Ngày tạo"
                                value={new Date(product.createdAt).toLocaleString('vi-VN')}
                            />
                            <Row icon={<Calendar size={14} />} label="Cập nhật lần cuối"
                                value={new Date(product.updatedAt).toLocaleString('vi-VN')}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

/** Helper row component */
const Row = ({ icon, label, value }) => (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-800/60 last:border-0">
        <div className="flex items-center gap-2 text-slate-400 text-sm min-w-[140px]">
            {icon}
            {label}
        </div>
        <div className="text-white text-sm font-medium text-right">{value}</div>
    </div>
);

export default ProductDetail;
