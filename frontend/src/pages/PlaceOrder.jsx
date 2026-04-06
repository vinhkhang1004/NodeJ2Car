import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import CheckoutSteps from '../components/CheckoutSteps';
import { createOrder } from '../services/orderService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFileUrl } from '../lib/utils';
import { 
    MapPin, CreditCard, ShoppingBag, 
    ChevronRight, Loader2, AlertCircle, CheckCircle 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PlaceOrder = () => {
    const navigate = useNavigate();
    const { 
        cartItems, shippingAddress, paymentMethod, 
        cartTotal, clearCart 
    } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Calc prices
    const itemsPrice = cartTotal;
    const shippingPrice = itemsPrice > 1000000 ? 0 : 30000; // Free over 1M
    const taxPrice = 0; // VAT included in prices usually
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    useEffect(() => {
        if (!paymentMethod) {
            navigate('/payment');
        }
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [paymentMethod, cartItems, navigate]);

    const placeOrderHandler = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.quantity,
                    image: item.imageUrl,
                    price: item.price,
                    product: item._id
                })),
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            };

            const { data } = await createOrder(orderData);
            clearCart();
            navigate(`/order-success/${data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
            <CheckoutSteps step1 step2 step3 />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Left Side: Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shipping Info */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl overflow-hidden">
                        <CardHeader className="bg-[#27272a]/30 border-b border-slate-800 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <MapPin size={20} className="text-primary" /> Thông tin giao hàng
                            </CardTitle>
                            <Link to="/shipping" className="text-xs text-slate-500 hover:text-primary transition-colors">Thay đổi</Link>
                        </CardHeader>
                        <CardContent className="pt-6 text-slate-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Người nhận</p>
                                    <p className="font-bold text-lg">{shippingAddress.name}</p>
                                    <p className="text-slate-400">{shippingAddress.phone}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Địa chỉ</p>
                                    <p>{shippingAddress.address}</p>
                                    <p>{shippingAddress.city}, {shippingAddress.country}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl overflow-hidden">
                        <CardHeader className="bg-[#27272a]/30 border-b border-slate-800 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <CreditCard size={20} className="text-primary" /> Phương thức thanh toán
                            </CardTitle>
                            <Link to="/payment" className="text-xs text-slate-500 hover:text-primary transition-colors">Thay đổi</Link>
                        </CardHeader>
                        <CardContent className="pt-6 font-bold text-slate-300">
                            {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : paymentMethod}
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card className="bg-[#18181b] border-slate-800 shadow-xl overflow-hidden">
                        <CardHeader className="bg-[#27272a]/30 border-b border-slate-800">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ShoppingBag size={20} className="text-primary" /> Sản phẩm trong đơn
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-800">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="p-6 flex items-center gap-6 group hover:bg-slate-900/40 transition-colors">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex-shrink-0">
                                            <img 
                                                src={getFileUrl(item.imageUrl)} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = 'https://placehold.co/400x400/27272a/71717a?text=No+Image'; }}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-slate-200 line-clamp-1">{item.name}</h4>
                                            <p className="text-sm text-slate-500">{item.quantity} x {item.price.toLocaleString('vi-VN')}₫</p>
                                        </div>
                                        <div className="text-right font-mono font-bold text-white">
                                            {(item.quantity * item.price).toLocaleString('vi-VN')}₫
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="bg-[#18181b] border-slate-800 shadow-2xl border-primary/20 bg-primary/5 sticky top-24 overflow-hidden">
                        <CardHeader className="bg-primary/10 border-b border-primary/20 py-6">
                            <CardTitle className="text-2xl font-black text-center tracking-tighter uppercase italic">
                                Tổng cộng <span className="text-primary text-3xl">đơn hàng</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 px-6 pb-8">
                            {error && (
                                <Alert variant="destructive" className="mb-6 bg-red-950/30 border-red-900/50 text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-slate-400">
                                    <span>Tạm tính</span>
                                    <span className="font-mono text-slate-200">{itemsPrice.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Phí giao hàng</span>
                                    <span className="font-mono text-slate-200">
                                        {shippingPrice === 0 ? <span className="text-success font-bold uppercase text-[10px] bg-success/10 px-2 py-1 rounded">Miễn phí</span> : `${shippingPrice.toLocaleString('vi-VN')}₫`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Thuế (VAT)</span>
                                    <span className="font-mono text-slate-200">0₫</span>
                                </div>
                                
                                <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                                    <span className="font-bold text-xl uppercase tracking-tighter">Tổng tiền</span>
                                    <div className="text-right">
                                        <div className="text-4xl font-mono font-black text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                            {totalPrice.toLocaleString('vi-VN')}₫
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                onClick={placeOrderHandler}
                                disabled={cartItems.length === 0 || loading}
                                className="w-full bg-white text-black hover:bg-slate-200 h-16 rounded-2xl font-black text-xl shadow-xl shadow-white/5 transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>
                                        XÁC NHẬN ĐẶT HÀNG
                                        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                            
                            <p className="text-center text-slate-500 text-[10px] mt-6 leading-relaxed opacity-50 uppercase tracking-widest font-medium">
                                Bằng cách nhấn đặt hàng, bạn đồng ý với <br /> điều khoản dịch vụ của J2Car.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;
