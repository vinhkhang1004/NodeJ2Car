import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    fetchProductById, createProduct, updateProduct, fetchCategories, uploadImage
} from '../../services/productService';
import { Loader2, ArrowLeft, Save, Package, DollarSign, Boxes, Image, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // Form state
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState(0);
    const [imageUrl, setImageUrl] = useState('');
    const [brand, setBrand] = useState('');
    const [sku, setSku] = useState('');
    const [isActive, setIsActive] = useState(true);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    // Load categories for dropdown
    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchCategories();
                setCategories(data);
            } catch (_) {}
        };
        load();
    }, []);

    // Load product for edit
    useEffect(() => {
        if (isEditMode) {
            const load = async () => {
                try {
                    const { data } = await fetchProductById(id);
                    setName(data.name);
                    setCategoryId(data.category?._id || '');
                    setPrice(data.price);
                    setDescription(data.description);
                    setStock(data.stock);
                    setImageUrl(data.imageUrl);
                    setBrand(data.brand);
                    setSku(data.sku || '');
                    setIsActive(data.isActive);
                } catch (err) {
                    setError(err.response?.data?.message || err.message);
                } finally {
                    setLoading(false);
                }
            };
            load();
        }
    }, [id, isEditMode]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        if (!categoryId) {
            setError('Vui lòng chọn danh mục');
            return;
        }
        try {
            setSaving(true);
            const payload = {
                name,
                category: categoryId,
                price: Number(price),
                description,
                stock: Number(stock),
                imageUrl,
                brand,
                sku: sku || undefined,
                isActive,
            };
            if (isEditMode) {
                await updateProduct(id, payload);
            } else {
                await createProduct(payload);
            }
            navigate('/admin/products');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        try {
            const res = await uploadImage(formData);
            setImageUrl(res.data.image);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="animate-fade-in pb-12 max-w-4xl mx-auto text-white/90">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" asChild className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                    <Link to="/admin/products">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {isEditMode ? 'Cập nhật thông tin sản phẩm' : 'Điền đầy đủ thông tin sản phẩm'}
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6 bg-red-950/30 border-red-900/50 text-red-400">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={submitHandler} className="space-y-6">
                {/* Basic Info */}
                <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2 text-base">
                            <Package size={16} /> Thông tin cơ bản
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="name" className="text-slate-300">
                                Tên sản phẩm <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="VD: Lọc dầu động cơ Toyota"
                                required
                                className="bg-[#09090b] border-slate-700 text-white placeholder:text-slate-600"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">
                                Danh mục <span className="text-red-400">*</span>
                            </Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger className="bg-[#09090b] border-slate-700 text-white">
                                    <SelectValue placeholder="– Chọn danh mục –" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#18181b] border-slate-700 text-white">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Brand */}
                        <div className="space-y-2">
                            <Label htmlFor="brand" className="text-slate-300">
                                Thương hiệu <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="brand"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                placeholder="VD: Bosch, Toyota, Denso"
                                required
                                className="bg-[#09090b] border-slate-700 text-white placeholder:text-slate-600"
                            />
                        </div>

                        {/* SKU */}
                        <div className="space-y-2">
                            <Label htmlFor="sku" className="text-slate-300">SKU (tuỳ chọn)</Label>
                            <Input
                                id="sku"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                placeholder="VD: TOY-OIL-001"
                                className="bg-[#09090b] border-slate-700 text-white placeholder:text-slate-600"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description" className="text-slate-300">
                                Mô tả <span className="text-red-400">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Mô tả chi tiết về sản phẩm..."
                                required
                                className="bg-[#09090b] border-slate-700 text-white placeholder:text-slate-600"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing & Inventory */}
                <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2 text-base">
                            <DollarSign size={16} /> Giá & Tồn kho
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-slate-300">
                                Giá (VNĐ) <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="1000"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                className="bg-[#09090b] border-slate-700 text-white"
                            />
                            {price > 0 && (
                                <p className="text-xs text-slate-500">{Number(price).toLocaleString('vi-VN')}₫</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock" className="text-slate-300 flex items-center gap-2">
                                <Boxes size={14} /> Số lượng tồn kho <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                required
                                className="bg-[#09090b] border-slate-700 text-white"
                            />
                            {stock <= 5 && stock >= 0 && (
                                <p className="text-xs text-red-400">⚠️ Tồn kho thấp!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Image */}
                <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2 text-base">
                            <Image size={16} /> Hình ảnh
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">
                                Hình ảnh sản phẩm <span className="text-red-400">*</span>
                            </Label>
                            
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    id="image-product-upload"
                                    accept="image/*"
                                    onChange={uploadFileHandler}
                                    disabled={uploading}
                                    className="bg-[#09090b] border-slate-700 text-slate-300 file:bg-slate-800 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 file:hover:bg-slate-700 cursor-pointer"
                                />
                                {uploading && <Loader2 className="animate-spin text-slate-400" size={18} />}
                            </div>

                        </div>
                        {imageUrl && (
                            <div className="mt-4 relative inline-block">
                                <img
                                    src={imageUrl.startsWith('/') ? `http://localhost:5000${imageUrl}` : imageUrl}
                                    alt="preview"
                                    className="w-32 h-32 object-cover rounded-lg border border-slate-700 shadow-md"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                                <p className="text-xs text-slate-500 mt-1 truncate max-w-[128px]" title={imageUrl}>{imageUrl}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Status */}
                <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-white">Hiển thị sản phẩm</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {isActive ? 'Sản phẩm đang được hiển thị cho khách hàng' : 'Sản phẩm đang được ẩn'}
                                </p>
                            </div>
                            <Switch checked={isActive} onCheckedChange={setIsActive} />
                        </div>
                    </CardContent>
                </Card>

                <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-white text-black hover:bg-slate-200 font-semibold py-6 text-base"
                >
                    {saving ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang lưu...</>
                    ) : (
                        <><Save className="mr-2 h-5 w-5" /> {isEditMode ? 'Lưu thay đổi' : 'Tạo sản phẩm'}</>
                    )}
                </Button>
            </form>
        </div>
    );
};

export default ProductEdit;
