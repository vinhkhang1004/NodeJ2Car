import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchCategoryById, createCategory, updateCategory, uploadImage } from '../../services/productService';
import { Loader2, ArrowLeft, Save, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

const CategoryEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
// No longer using imageUrl locally since it is not needed
    const [isActive, setIsActive] = useState(true);
    const [slugPreview, setSlugPreview] = useState('');

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    // Auto-compute slug preview from name
    useEffect(() => {
        setSlugPreview(
            name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
        );
    }, [name]);

    useEffect(() => {
        if (isEditMode) {
            const load = async () => {
                try {
                    const { data } = await fetchCategoryById(id);
                    setName(data.name);
                    setDescription(data.description || '');

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
        try {
            setSaving(true);
            const payload = { name, description, isActive };
            if (isEditMode) {
                await updateCategory(id, payload);
            } else {
                await createCategory(payload);
            }
            navigate('/admin/categories');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };



    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="animate-fade-in pb-12 max-w-2xl mx-auto text-white/90">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" asChild className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                    <Link to="/admin/categories">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        {isEditMode ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {isEditMode ? 'Cập nhật thông tin danh mục' : 'Điền thông tin để thêm danh mục mới'}
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6 bg-red-950/30 border-red-900/50 text-red-400">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Tag size={18} /> Thông tin danh mục
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submitHandler} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">
                                Tên danh mục <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="VD: Phụ tùng động cơ"
                                required
                                className="bg-[#09090b] border-slate-700 text-white placeholder:text-slate-600"
                            />
                            {slugPreview && (
                                <p className="text-xs text-slate-500">
                                    Slug: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{slugPreview}</code>
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-300">Mô tả</Label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Mô tả ngắn về danh mục này..."
                                className="bg-[#09090b] border-slate-700 text-white placeholder:text-slate-600"
                            />
                        </div>



                        {/* Status Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                            <div>
                                <p className="text-sm font-medium text-white">Trạng thái hoạt động</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {isActive ? 'Danh mục đang hiển thị cho khách hàng' : 'Danh mục đang bị tạm ẩn'}
                                </p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-white text-black hover:bg-slate-200 font-semibold"
                        >
                            {saving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> {isEditMode ? 'Lưu thay đổi' : 'Tạo danh mục'}</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CategoryEdit;
