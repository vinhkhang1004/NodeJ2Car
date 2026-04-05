import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PartEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const isEditMode = id !== undefined;

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [imageUrl, setImageUrl] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [stock, setStock] = useState(0);
    const [description, setDescription] = useState('');

    const [loading, setLoading] = useState(isEditMode);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            const fetchPart = async () => {
                try {
                    const { data } = await api.get(`/parts/${id}`);
                    setName(data.name);
                    setPrice(data.price);
                    setImageUrl(data.imageUrl);
                    setBrand(data.brand);
                    setCategory(data.category);
                    setStock(data.stock);
                    setDescription(data.description);
                    setLoading(false);
                } catch (err) {
                    setError(err.response?.data?.message || err.message);
                    setLoading(false);
                }
            };
            fetchPart();
        }
    }, [id, isEditMode]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoadingUpdate(true);
            const partData = {
                name,
                price,
                imageUrl,
                brand,
                category,
                stock,
                description,
            };
            
            if (isEditMode) {
                await api.put(`/parts/${id}`, partData);
            } else {
                await api.post(`/parts`, partData);
            }
            
            setLoadingUpdate(false);
            navigate('/admin/parts');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoadingUpdate(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="animate-fade-in pb-12 max-w-4xl mx-auto text-white/90">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" asChild className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                    <Link to="/admin/parts">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    {isEditMode ? 'Chỉnh sửa linh kiện' : 'Thêm linh kiện mới'}
                </h1>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6 bg-red-950/30 border-red-900/50 text-red-500">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20">
                <CardContent className="pt-6">
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-400">Tên linh kiện</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="bg-[#09090b] border-slate-700 text-white" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brand" className="text-slate-400">Thương hiệu</Label>
                                <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required className="bg-[#09090b] border-slate-700 text-white" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-slate-400">Giá bán ($)</Label>
                                <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} required className="bg-[#09090b] border-slate-700 text-white" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-slate-400">Danh mục</Label>
                                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="bg-[#09090b] border-slate-700 text-white" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock" className="text-slate-400">Số lượng tồn kho</Label>
                                <Input id="stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} required className="bg-[#09090b] border-slate-700 text-white" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imageUrl" className="text-slate-400">Đường dẫn ảnh (URL)</Label>
                                <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required className="bg-[#09090b] border-slate-700 text-white" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-400">Mô tả chi tiết</Label>
                            <Textarea 
                                id="description"
                                rows={5}
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                required
                                className="bg-[#09090b] border-slate-700 text-white"
                            />
                        </div>

                        <Button type="submit" disabled={loadingUpdate} className="w-full sm:w-auto bg-white text-black hover:bg-slate-200">
                            {loadingUpdate ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> {isEditMode ? 'Lưu thay đổi' : 'Tạo linh kiện'}</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PartEdit;
