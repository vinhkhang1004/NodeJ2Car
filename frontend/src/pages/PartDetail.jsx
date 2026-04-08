import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
    Loader2, 
    ChevronRight, 
    ShoppingCart, 
    Zap, 
    ShieldCheck, 
    Wrench,
    CheckCircle2,
    Info,
    ArrowLeft,
    Check
} from 'lucide-react';

const PartDetail = () => {
    const [part, setPart] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const { id } = useParams();

    useEffect(() => {
        const fetchPart = async () => {
            try {
                setLoading(true);
                // Switch to /products/:id for better data and populated categories
                const { data } = await api.get(`/products/${id}`);
                setPart(data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPart();
    }, [id]);

    // Mock images for gallery effect
    const galleryItems = [
        part.imageUrl,
        "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop"
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="animate-spin text-blue-900" size={48} />
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl font-black text-red-500 mb-4">Lỗi tải thông tin sản phẩm</h2>
            <p className="text-slate-500 mb-8">{error}</p>
            <Link to="/shop" className="bg-blue-950 text-white px-8 py-3 font-bold">Quay lại cửa hàng</Link>
        </div>
    );

    const vndPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(part.price * 25000);
    const discountPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(part.price * 25000 * 0.88);

    const categoryName = typeof part.category === 'object' ? part.category?.name : part.category;

    return (
        <div className="bg-white pb-24">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-12">
                    <Link to="/" className="hover:text-blue-950 transition-colors">Trang Chủ</Link>
                    <ChevronRight size={12} />
                    <Link to="/shop" className="hover:text-blue-950 transition-colors">{categoryName || 'Sản phẩm'}</Link>
                    <ChevronRight size={12} />
                    <span className="text-blue-950">{part.name}</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Left: Image Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-square bg-slate-50 rounded-sm overflow-hidden border border-slate-100 group">
                            <img 
                                src={galleryItems[activeImage]} 
                                alt={part.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {galleryItems.map((img, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                                        activeImage === idx ? 'border-blue-950 shadow-lg' : 'border-slate-100 opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-10">
                        <div>
                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-[0.3em] bg-blue-50 px-3 py-1 rounded-full mb-6 inline-block">
                                {part.brand || 'Premium Quality'}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-blue-950 leading-tight tracking-tighter uppercase mb-6">
                                {part.name}
                            </h1>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                {part.description} Được thiết kế cho các kỹ sư đam mê tốc độ. Sử dụng hợp kim {categoryName === 'Động Cơ' ? 'titan siêu nhẹ' : 'nhôm hàng không'} giúp giảm trọng lượng và tăng công suất tối ưu.
                            </p>
                        </div>

                        {/* Compatibility Check Mock */}
                        <div className="bg-slate-50 p-6 border border-slate-100 rounded-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <Info size={16} className="text-orange-500" />
                                <span className="text-[11px] font-black text-blue-950 uppercase tracking-widest">Kiểm tra tương thích</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <select className="bg-white border border-slate-200 p-3 text-xs font-bold text-slate-400 rounded-sm outline-none">
                                    <option>Hãng xe</option>
                                    <option>Porsche</option>
                                    <option>BMW</option>
                                </select>
                                <select className="bg-white border border-slate-200 p-3 text-xs font-bold text-slate-400 rounded-sm outline-none">
                                    <option>Đời xe</option>
                                    <option>2023</option>
                                    <option>2024</option>
                                </select>
                            </div>
                            <button className="w-full bg-blue-950 text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 hover:bg-blue-900 transition-colors shadow-xl shadow-blue-900/20">
                                Xác nhận phụ tùng
                            </button>
                        </div>

                        {/* Price & CTA */}
                        <div className="pt-4">
                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-4xl font-black text-blue-950 tracking-tighter">{discountPrice}</span>
                                <span className="text-xl text-slate-400 line-through font-bold">{vndPrice}</span>
                                <span className="text-orange-500 font-black text-xs uppercase tracking-widest">-12% Giảm</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button className="py-5 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-orange-500/30">
                                    Mua Ngay
                                </button>
                                <button className="py-5 bg-slate-100 hover:bg-slate-200 text-blue-950 font-black uppercase tracking-[0.2em] text-xs transition-all border border-slate-200">
                                    Thêm Giỏ Hàng
                                </button>
                            </div>
                            <p className="mt-6 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
                                Giao hàng miễn phí toàn quốc trong 24h
                            </p>
                        </div>
                    </div>
                </div>

                {/* Technical Details Section */}
                <div className="mt-32 pt-24 border-t border-slate-100">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Column 1: Specs Table */}
                        <div className="lg:col-span-1">
                            <h2 className="text-3xl font-black text-blue-950 tracking-tighter uppercase mb-6">Thông số kỹ thuật</h2>
                            <p className="text-slate-500 text-sm mb-12 leading-relaxed">Mọi chi tiết đều được gia công với dung sai dưới 0.01mm. Đây không chỉ là linh kiện, đây là tác phẩm kỹ thuật.</p>
                            
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        ['Vật liệu', 'Titanium Grade 5'],
                                        ['Trọng lượng', '4.2 kg'],
                                        ['Áp suất cực đại', '35 PSI'],
                                        ['Bảo hành', '36 Tháng']
                                    ].map(([label, val]) => (
                                        <tr key={label} className="group">
                                            <td className="py-4 text-slate-400 font-bold text-[11px] uppercase tracking-wider">{label}</td>
                                            <td className="py-4 text-blue-950 font-black text-right">{val}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Column 2 & 3: Feature Cards */}
                        <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-10 rounded-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-0 bg-blue-900 group-hover:h-full transition-all duration-700" />
                                <Wrench className="text-blue-900 mb-8" size={32} />
                                <h3 className="text-xl font-black text-blue-950 mb-4 uppercase tracking-tighter">CNC Precision</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">Vỏ bọc được phay nguyên khối từ hợp kim nhôm hàng không 6061-T6 bằng máy CNC 5 trục.</p>
                            </div>

                            <div className="bg-blue-950 p-10 rounded-sm text-white relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-0 bg-orange-500 group-hover:h-full transition-all duration-700" />
                                <Zap className="text-orange-500 mb-8" size={32} />
                                <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Low Inertia</h3>
                                <p className="text-blue-200/70 text-sm leading-relaxed">Cánh quạt thiết kế khí động học giúp đạt tốc độ quay tối ưu nhanh hơn 40% so với thế hệ trước.</p>
                            </div>

                            {/* Large Image/Simulation Mock */}
                            <div className="md:col-span-2 bg-slate-50 p-10 rounded-sm border border-slate-100">
                                <h3 className="text-xl font-black text-blue-950 mb-8 uppercase tracking-tighter">Mô phỏng dòng chảy khí động học (CFD)</h3>
                                <div className="h-2 w-full bg-slate-200 rounded-full mb-12 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-900 to-orange-500 w-[85%]" />
                                </div>
                                <div className="grid grid-cols-3 gap-8">
                                    <div>
                                        <p className="text-3xl font-black text-blue-950 mb-2 tracking-tighter">98%</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hiệu suất nén</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-blue-950 mb-2 tracking-tighter">-15°C</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhiệt độ khí nạp</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-orange-500 mb-2 tracking-tighter">+85HP</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Công suất tăng thêm</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartDetail;
