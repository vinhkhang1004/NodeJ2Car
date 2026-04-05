import React, { useState, lazy, Suspense } from 'react';
import { addAddress } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    X, MapPin, User, Phone, Building, Globe, 
    Navigation, Tag, Loader2, Map as MapIcon 
} from 'lucide-react';

// Lazy load the map to prevent SSR issues
const MapPicker = lazy(() => import('./MapPicker'));

const AddAddressModal = ({ onClose, onSaved }) => {
    const [formData, setFormData] = useState({
        label: '',
        name: '',
        phone: '',
        address: '',
        city: '',
        country: 'Việt Nam',
        postalCode: '',
        lat: null,
        lng: null,
    });
    const [showMap, setShowMap] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLocationSelect = (data) => {
        setFormData(prev => ({
            ...prev,
            address: data.address || prev.address,
            city: data.city || prev.city,
            country: data.country || prev.country,
            lat: data.lat,
            lng: data.lng,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.address || !formData.city) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        }
        try {
            setSaving(true);
            setError('');
            const { data } = await addAddress(formData);
            onSaved(data.addresses);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-[#09090b] border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-[#09090b] z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MapPin className="text-primary" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Thêm địa chỉ mới</h2>
                            <p className="text-xs text-slate-500">Chọn trên bản đồ hoặc nhập thủ công</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Map Toggle + Map */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowMap(!showMap)}
                            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors mb-4"
                        >
                            <MapIcon size={16} />
                            {showMap ? 'Ẩn bản đồ' : 'Hiển thị bản đồ'}
                        </button>

                        {showMap && (
                            <Suspense fallback={
                                <div className="h-[380px] rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                </div>
                            }>
                                <MapPicker 
                                    onLocationSelect={handleLocationSelect}
                                    defaultPosition={formData.lat ? { lat: formData.lat, lng: formData.lng } : null}
                                />
                            </Suspense>
                        )}

                        {formData.lat && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-success bg-success/10 border border-success/20 rounded-xl px-4 py-2.5">
                                <MapPin size={14} className="flex-shrink-0" />
                                <span>Đã chọn vị trí: {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}</span>
                            </div>
                        )}
                    </div>

                    {/* Address form fields */}
                    <div className="grid grid-cols-1 gap-5">
                        {/* Label */}
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs uppercase tracking-widest">Tên địa chỉ (tuỳ chọn)</Label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <Input
                                    value={formData.label}
                                    onChange={(e) => handleChange('label', e.target.value)}
                                    placeholder='VD: "Nhà", "Công ty", "Nhà bạn gái"...'
                                    className="pl-10 h-11 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs uppercase tracking-widest">Tên người nhận *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                        className="pl-10 h-11 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs uppercase tracking-widest">Số điện thoại *</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="0987xxxxxx"
                                        className="pl-10 h-11 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs uppercase tracking-widest">Địa chỉ chi tiết *</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <Input
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="Số nhà, tên đường, phường..."
                                    className="pl-10 h-11 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* City */}
                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs uppercase tracking-widest">Thành phố *</Label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        placeholder="VD: TP.HCM"
                                        className="pl-10 h-11 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            {/* PostalCode */}
                            <div className="space-y-2">
                                <Label className="text-slate-400 text-xs uppercase tracking-widest">Mã bưu chính</Label>
                                <div className="relative">
                                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <Input
                                        value={formData.postalCode}
                                        onChange={(e) => handleChange('postalCode', e.target.value)}
                                        placeholder="70000"
                                        className="pl-10 h-11 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Country */}
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-xs uppercase tracking-widest">Quốc gia</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <Input
                                    value={formData.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    placeholder="Việt Nam"
                                    className="pl-10 h-11 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-grow border-slate-800 h-12 rounded-2xl font-bold text-slate-400 hover:bg-slate-800"
                        >
                            Huỷ
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="w-[60%] bg-white text-black hover:bg-slate-200 h-12 rounded-2xl font-bold shadow-xl"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : 'Lưu địa chỉ'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAddressModal;
