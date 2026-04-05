import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import CheckoutSteps from '../components/CheckoutSteps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, DollarSign, CreditCard, Wallet } from 'lucide-react';

const Payment = () => {
    const { shippingAddress, paymentMethod, savePaymentMethod } = useContext(CartContext);
    const navigate = useNavigate();

    // Redirect if no shipping address
    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping');
        }
    }, [shippingAddress, navigate]);

    const [method, setMethod] = useState(paymentMethod || 'COD');

    const submitHandler = (e) => {
        e.preventDefault();
        savePaymentMethod(method);
        navigate('/placeorder');
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            <CheckoutSteps step1 step2 />

            <div className="max-w-2xl mx-auto">
                <Card className="bg-[#18181b] border-slate-800 shadow-2xl shadow-black/40 overflow-hidden">
                    <CardHeader className="bg-[#27272a]/30 border-b border-slate-800 text-center py-8">
                        <CardTitle className="text-3xl font-bold tracking-tight">Phương thức <span className="text-primary">Thanh toán</span></CardTitle>
                        <CardDescription className="text-slate-500 mt-2">Chọn cách thức bạn muốn thanh toán đơn hàng này.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-10 px-8 pb-10">
                        <form onSubmit={submitHandler} className="space-y-6">
                            
                            <div className="grid grid-cols-1 gap-4">
                                {/* COD Option */}
                                <div 
                                    onClick={() => setMethod('COD')}
                                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-6 ${method === 'COD' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 grayscale'}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === 'COD' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        <DollarSign size={24} />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-lg">Thanh toán khi nhận hàng (COD)</h3>
                                        <p className="text-slate-500 text-sm">Trả bằng tiền mặt khi shipper giao hàng tới.</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === 'COD' ? 'border-primary' : 'border-slate-700'}`}>
                                        {method === 'COD' && <div className="w-3 h-3 rounded-full bg-primary" />}
                                    </div>
                                </div>

                                {/* Online Payment (Placeholder) */}
                                <div 
                                    className="p-6 rounded-2xl border-2 border-slate-800 bg-slate-900/10 opacity-40 cursor-not-allowed flex items-center gap-6 relative overflow-hidden"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center">
                                        <Wallet size={24} />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-lg">Chuyển khoản / Ví điện tử</h3>
                                        <p className="text-slate-500 text-sm">Đang bảo trì...</p>
                                    </div>
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-700"></div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-8">
                                <Button 
                                    variant="outline" 
                                    onClick={() => navigate('/shipping')}
                                    className="flex-grow border-slate-800 h-14 rounded-2xl font-bold text-slate-400 hover:bg-slate-800 transition-all"
                                >
                                    <ArrowLeft size={20} className="mr-2" /> Quay lại
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="w-[60%] bg-white text-black hover:bg-slate-200 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-white/5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Tiếp tục <ArrowRight size={20} className="ml-2" />
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Payment;
