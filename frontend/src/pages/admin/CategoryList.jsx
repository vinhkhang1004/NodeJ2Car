import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCategories, deleteCategory } from '../../services/productService';
import { Plus, Pencil, Trash2, Loader2, Tag, AlertCircle, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const loadCategories = async () => {
        try {
            setLoading(true);
            const { data } = await fetchCategories();
            setCategories(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCategories(); }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Xác nhận xoá danh mục "${name}"?`)) return;
        try {
            setDeletingId(id);
            await deleteCategory(id);
            setSuccess(`Đã xoá danh mục "${name}"`);
            setCategories((prev) => prev.filter((c) => c._id !== id));
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
                    <h1 className="text-3xl font-bold tracking-tight text-white">Danh mục</h1>
                    <p className="text-slate-400 text-sm mt-1">Quản lý tất cả danh mục sản phẩm</p>
                </div>
                <Button asChild className="bg-white text-black hover:bg-slate-200">
                    <Link to="/admin/categories/create">
                        <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
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

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-[#18181b] border-slate-800">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-slate-400 text-xs mb-1">Tổng danh mục</p>
                        <p className="text-2xl font-bold text-white">{categories.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#18181b] border-slate-800">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-slate-400 text-xs mb-1">Đang hoạt động</p>
                        <p className="text-2xl font-bold text-green-400">{categories.filter(c => c.isActive).length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#18181b] border-slate-800">
                    <CardContent className="pt-4 pb-4">
                        <p className="text-slate-400 text-xs mb-1">Tạm ẩn</p>
                        <p className="text-2xl font-bold text-slate-400">{categories.filter(c => !c.isActive).length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-800 bg-[#18181b] overflow-hidden shadow-xl shadow-black/20">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-white" size={40} />
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 bg-[#27272a]/50 uppercase border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Tên danh mục</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Mô tả</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ngày tạo</th>
                                <th className="px-6 py-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {categories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {cat.imageUrl ? (
                                                <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded object-cover border border-slate-700" />
                                            ) : (
                                                <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center">
                                                    <Tag size={14} className="text-slate-400" />
                                                </div>
                                            )}
                                            <span className="font-medium text-white">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">{cat.slug}</code>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">
                                        {cat.description || '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {cat.isActive ? (
                                            <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20">
                                                <ToggleRight size={12} className="mr-1" /> Hoạt động
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-slate-700/50 text-slate-400 border border-slate-600/50">
                                                <ToggleLeft size={12} className="mr-1" /> Tạm ẩn
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-xs">
                                        {new Date(cat.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="bg-transparent border-slate-700 text-white hover:bg-slate-800 h-8"
                                            >
                                                <Link to={`/admin/categories/${cat._id}`}>
                                                    <Eye size={12} className="mr-1" /> Xem
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="bg-transparent border-slate-700 text-white hover:bg-slate-800 h-8"
                                            >
                                                <Link to={`/admin/categories/${cat._id}/edit`}>
                                                    <Pencil size={12} className="mr-1" /> Sửa
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={deletingId === cat._id}
                                                onClick={() => handleDelete(cat._id, cat.name)}
                                                className="bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/40 h-8"
                                            >
                                                {deletingId === cat._id ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <><Trash2 size={12} className="mr-1" /> Xoá</>
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        Chưa có danh mục nào. Tạo danh mục đầu tiên!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CategoryList;
