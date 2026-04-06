import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct, fetchCategories } from '../../services/productService';
import {
    Plus, Pencil, Trash2, Loader2, Search, ChevronLeft, ChevronRight,
    AlertCircle, SlidersHorizontal, PackageX, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFileUrl } from '../../lib/utils';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Filters & pagination
    const [keyword, setKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    const loadCategories = async () => {
        try {
            const { data } = await fetchCategories();
            setCategories(data);
        } catch (_) {}
    };

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (keyword) params.keyword = keyword;
            if (selectedCategory) params.category = selectedCategory;

            const { data } = await fetchProducts(params);
            setProducts(data.products);
            setPages(data.pages);
            setTotal(data.total);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [page, keyword, selectedCategory]);

    useEffect(() => { loadCategories(); }, []);
    useEffect(() => { loadProducts(); }, [loadProducts]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadProducts();
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Xác nhận xoá sản phẩm "${name}"?`)) return;
        try {
            setDeletingId(id);
            await deleteProduct(id);
            setSuccess(`Đã xoá sản phẩm "${name}"`);
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="animate-fade-in pb-12 text-white/90">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Sản phẩm</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Tổng cộng <span className="text-white font-medium">{total}</span> sản phẩm
                    </p>
                </div>
                <Button asChild className="bg-white text-black hover:bg-slate-200">
                    <Link to="/admin/products/create">
                        <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
                    </Link>
                </Button>
            </div>

            {/* Alerts */}
            {error && (
                <Alert variant="destructive" className="mb-4 bg-red-950/30 border-red-900/50 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {success && (
                <Alert className="mb-4 bg-green-950/30 border-green-900/50 text-green-400">
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            {/* Filters */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                    <Input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Tìm kiếm sản phẩm..."
                        className="pl-9 bg-[#18181b] border-slate-700 text-white placeholder:text-slate-600"
                    />
                </div>
                <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v === '__all__' ? '' : v); setPage(1); }}>
                    <SelectTrigger className="w-[200px] bg-[#18181b] border-slate-700 text-white">
                        <SlidersHorizontal className="mr-2 h-4 w-4 text-slate-400" />
                        <SelectValue placeholder="Tất cả danh mục" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-slate-700 text-white">
                        <SelectItem value="__all__">Tất cả danh mục</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button type="submit" variant="outline" className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                    Tìm kiếm
                </Button>
            </form>

            {/* Table */}
            <div className="rounded-xl border border-slate-800 bg-[#18181b] overflow-hidden shadow-xl shadow-black/20">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-white" size={40} />
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 bg-[#27272a]/50 uppercase border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Sản phẩm</th>
                                    <th className="px-6 py-4">Danh mục</th>
                                    <th className="px-6 py-4">Thương hiệu</th>
                                    <th className="px-6 py-4">Giá</th>
                                    <th className="px-6 py-4">Tồn kho</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getFileUrl(product.imageUrl)}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded object-cover border border-slate-700"
                                                    onError={(e) => { e.target.src = 'https://placehold.co/40x44/27272a/71717a?text=?'; }}
                                                />
                                                <div>
                                                    <p className="font-medium text-white leading-tight">{product.name}</p>
                                                    {product.sku && <p className="text-xs text-slate-500">SKU: {product.sku}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full border border-slate-700 text-xs text-slate-300">
                                                {product.category?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">{product.brand}</td>
                                        <td className="px-6 py-4 font-mono text-white">
                                            {product.price.toLocaleString('vi-VN')}₫
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium ${product.stock <= 5 ? 'text-red-400' : product.stock <= 20 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.isActive ? (
                                                <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">Hiển thị</Badge>
                                            ) : (
                                                <Badge className="bg-slate-700/50 text-slate-400 border border-slate-600/50">Ẩn</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="bg-transparent border-slate-700 text-white hover:bg-slate-800 h-8"
                                                >
                                                    <Link to={`/admin/products/${product._id}`}>
                                                        <Eye size={12} className="mr-1" /> Xem
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="bg-transparent border-slate-700 text-white hover:bg-slate-800 h-8"
                                                >
                                                    <Link to={`/admin/products/${product._id}/edit`}>
                                                        <Pencil size={12} className="mr-1" /> Sửa
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={deletingId === product._id}
                                                    onClick={() => handleDelete(product._id, product.name)}
                                                    className="bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/40 h-8"
                                                >
                                                    {deletingId === product._id ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : (
                                                        <><Trash2 size={12} className="mr-1" /> Xoá</>
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <PackageX className="mx-auto mb-3 text-slate-600" size={40} />
                                            <p className="text-slate-500">Không có sản phẩm nào.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
                            <span>Hiển thị trang {page} / {pages} — {total} sản phẩm</span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="h-8 bg-transparent border-slate-700 text-white hover:bg-slate-800 disabled:opacity-30"
                                >
                                    <ChevronLeft size={14} /> Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= pages}
                                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                                    className="h-8 bg-transparent border-slate-700 text-white hover:bg-slate-800 disabled:opacity-30"
                                >
                                    Sau <ChevronRight size={14} />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductList;
