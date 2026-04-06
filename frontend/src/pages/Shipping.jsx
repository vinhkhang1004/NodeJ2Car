import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import CheckoutSteps from '../components/CheckoutSteps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    User, Phone, MapPin, Building, Globe, Navigation, 
    ArrowRight, CheckCircle, Star, Plus
} from 'lucide-react';

const Shipping = () => {
    const { shippingAddress, saveShippingAddress } = useContext(CartContext);
    const { user, addresses } = useContext(AuthContext);
    const navigate = useNavigate();

    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useManual, setUseManual] = useState(addresses.length === 0);

    const [name, setName] = useState(shippingAddress.name || user?.name || '');
    const [phone, setPhone] = useState(shippingAddress.phone || user?.phone || '');
    const [address, setAddress] = useState(shippingAddress.address || user?.address || '');
    const [city, setCity] = useState(shippingAddress.city || user?.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || user?.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || user?.country || '');

    const handleSelectSaved = (addr) => {
        setSelectedAddressId(addr._id);
        setName(addr.name);
        setPhone(addr.phone);
        setAddress(addr.address);
        setCity(addr.city);
        setCountry(addr.country);
        setPostalCode(addr.postalCode || '');
        setUseManual(false);
    };

    const submitHandler = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        saveShippingAddress({ name, phone, address, city, postalCode, country });
        navigate('/payment');
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            <CheckoutSteps step1 />

            <Card className="bg-[#18181b] border-slate-800 shadow-2xl shadow-black/40 overflow-hidden max-w-2xl mx-auto">
                <CardHeader className="bg-[#27272a]/30 border-b border-slate-800 text-center py-8">
                    <CardTitle className="text-3xl font-bold tracking-tight">Thông tin <span className="text-primary">Giao hàng</span></CardTitle>
                    <p className="text-slate-500 mt-2">Chọn địa chỉ đã lưu hoặc nhập địa chỉ mới.</p>
                </CardHeader>
                <CardContent className="pt-8 px-8 pb-10">

                    {/* Saved Addresses Section */}
                    {addresses.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Địa chỉ đã lưu</h3>
                            <div className="space-y-3">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr._id}
                                        onClick={() => handleSelectSaved(addr)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${selectedAddressId === addr._id && !useManual ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${selectedAddressId === addr._id && !useManual ? 'border-primary' : 'border-slate-700'}`}>
                                            {selectedAddressId === addr._id && !useManual && (
                                                <div className="w-3 h-3 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                {addr.label && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">{addr.label}</span>
                                                )}
                                                {addr.isDefault && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                                                        <Star size={9} fill="currentColor" /> Mặc định
                                                    </span>
                                                )}
                                            </div>
                                            <p className="font-bold text-white">{addr.name} · {addr.phone}</p>
                                            <p className="text-slate-400 text-sm">{addr.address}, {addr.city}, {addr.country}</p>
                                        </div>
                                        {selectedAddressId === addr._id && !useManual && (
                                            <CheckCircle className="text-primary flex-shrink-0 mt-1" size={18} />
                                        )}
                                    </div>
                                ))}

                                {/* Manual entry option */}
                                <div
                                    onClick={() => { setUseManual(true); setSelectedAddressId(null); }}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${useManual ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-800 hover:border-slate-700 border-dashed bg-transparent'}`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${useManual ? 'border-primary' : 'border-slate-700'}`}>
                                        {useManual && <div className="w-3 h-3 rounded-full bg-primary" />}
                                    </div>
                                    <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                        <Plus size={14} /> Nhập địa chỉ mới
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Manual form */}
                    {(useManual || addresses.length === 0) && (
                        <form onSubmit={submitHandler} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-slate-400">Họ và tên người nhận</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-400">Số điện thoại</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0987xxxxxx" className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-400">Địa chỉ cụ thể</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, tên đường..." className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Thành phố</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="VD: Hà Nội" className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-400">Mã bưu chính</Label>
                                    <div className="relative">
                                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="10000" className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-400">Quốc gia</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Việt Nam" className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary rounded-xl" required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-white text-black hover:bg-slate-200 h-14 rounded-2xl font-bold text-lg mt-6 shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]">
                                Tiếp tục thanh toán <ArrowRight size={20} className="ml-2" />
                            </Button>
                        </form>
                    )}

                    {/* Confirm saved address button */}
                    {!useManual && selectedAddressId && (
                        <Button
                            onClick={submitHandler}
                            className="w-full bg-white text-black hover:bg-slate-200 h-14 rounded-2xl font-bold text-lg mt-6 shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Giao đến địa chỉ này <ArrowRight size={20} className="ml-2" />
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Shipping;
