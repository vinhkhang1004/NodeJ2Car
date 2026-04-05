import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import CheckoutSteps from '../components/CheckoutSteps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, MapPin, Building, Globe, Navigation, ArrowRight } from 'lucide-react';

const Shipping = () => {
    const { shippingAddress, saveShippingAddress } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Pre-fill from existing shippingAddress OR user profile
    const [name, setName] = useState(shippingAddress.name || user?.name || '');
    const [phone, setPhone] = useState(shippingAddress.phone || user?.phone || '');
    const [address, setAddress] = useState(shippingAddress.address || user?.address || '');
    const [city, setCity] = useState(shippingAddress.city || user?.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || user?.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || user?.country || '');

    const submitHandler = (e) => {
        e.preventDefault();
        saveShippingAddress({ name, phone, address, city, postalCode, country });
        navigate('/payment');
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            <CheckoutSteps step1 />

            <Card className="bg-[#18181b] border-slate-800 shadow-2xl shadow-black/40 overflow-hidden max-w-2xl mx-auto">
                <CardHeader className="bg-[#27272a]/30 border-b border-slate-800 text-center py-8">
                    <CardTitle className="text-3xl font-bold tracking-tight">Thông tin <span className="text-primary">Giao hàng</span></CardTitle>
                    <p className="text-slate-500 mt-2">Vui lòng kiểm tra kỹ địa chỉ để nhận hàng nhanh nhất.</p>
                </CardHeader>
                <CardContent className="pt-10 px-8 pb-10">
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-400">Họ và tên người nhận</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <Input 
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nguyễn Văn A"
                                    className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary transition-all rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-400">Số điện thoại</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <Input 
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="0987xxxxxx"
                                    className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary transition-all rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-slate-400">Địa chỉ cụ thể</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <Input 
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Số nhà, tên đường..."
                                    className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary transition-all rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-slate-400">Thành phố</Label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input 
                                        id="city"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="VD: Hà Nội"
                                        className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary transition-all rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postal" className="text-slate-400">Mã bưu chính</Label>
                                <div className="relative">
                                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <Input 
                                        id="postal"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        placeholder="10000"
                                        className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary transition-all rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country" className="text-slate-400">Quốc gia</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <Input 
                                    id="country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="Việt Nam"
                                    className="pl-10 h-12 bg-slate-900/50 border-slate-800 focus:border-primary transition-all rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-white text-black hover:bg-slate-200 h-14 rounded-2xl font-bold text-lg mt-8 shadow-xl shadow-white/5 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                            Tiếp tục thanh toán <ArrowRight size={20} className="ml-2" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Shipping;
