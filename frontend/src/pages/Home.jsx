import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
    Search, 
    FastForward, 
    Headphones, 
    ShieldCheck, 
    ArrowRight 
} from 'lucide-react';
import PartCard from '../components/PartCard';
import { getFileUrl } from '../lib/utils';

const CATEGORY_IMAGE_MAPPING = {
    'động cơ': 'https://images.unsplash.com/photo-1627581335044-88981f3b2dbf?q=80&w=1200&auto=format&fit=crop',
    'nội thất': 'https://images.unsplash.com/photo-1549402129-efb1338006e8?auto=format&fit=crop&q=80&w=1000',
    'ngoại thất': 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1000',
    'hiệu suất': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000',
    'hiệu xuất': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000',
    'phanh': 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=1000',
    'lốp & mâm': 'https://images.unsplash.com/photo-1550920425-415843b092a9?auto=format&fit=crop&q=80&w=1000'
};

const getCategoryImage = (cat) => {
    if (cat.imageUrl && !cat.imageUrl.includes('No Image')) return getFileUrl(cat.imageUrl);
    
    // Fallback to mapping based on name
    const lowerName = (cat.name || '').toLowerCase();
    return CATEGORY_IMAGE_MAPPING[lowerName] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop';
};

const Home = () => {
    const [parts, setParts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch featured parts and active categories in parallel
                const [partsRes, catsRes] = await Promise.all([
                    api.get('/parts?limit=8'),
                    api.get('/categories?active=true')
                ]);
                
                setParts(partsRes.data.parts || []);
                // Take the first 4 categories for the home grid
                setCategories(catsRes.data.slice(0, 4) || []);
            } catch (err) {
                console.error('Error fetching home data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?keyword=${searchQuery}`);
        }
    };

    const handleCategoryClick = (category) => {
        // Use ID for dynamic categories, or standard name for fallback
        const catValue = category._id || category.name || category;
        navigate(`/shop?category=${catValue}`);
    };

    const imageFallback = (e) => {
        e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000&auto=format&fit=crop';
    };

    return (
        <div className="animate-fade-in pb-0 min-h-screen bg-white">
            {/* 1. Hero Section */}
            <div className="relative bg-[#080b14] text-white overflow-hidden py-32 flex items-center justify-center min-h-[600px]">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={getFileUrl('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop')} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-30 mix-blend-screen"
                        onError={imageFallback}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-[#080b14]/50 to-transparent" />
                </div>
                
                <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
                    <div className="text-[10px] font-bold text-orange-400 tracking-[0.3em] uppercase mb-8 flex items-center justify-center gap-4">
                        <div className="w-12 h-px bg-orange-500/50"></div>
                        Kỹ Thuật Chính Xác
                        <div className="w-12 h-px bg-orange-500/50"></div>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 drop-shadow-2xl uppercase italic">
                        PHỤ TÙNG <br />
                        <span className="text-orange-500">ĐẲNG CẤP</span> <span className="text-white">CHUYÊN GIA</span>
                    </h1>

                    <p className="text-slate-200 text-sm md:text-lg mb-12 max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
                        Nâng tầm trải nghiệm lái xe với những linh kiện hiệu suất cao và phụ tùng thay thế chính hãng hàng đầu thế giới.
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16">
                        <button 
                            onClick={() => navigate('/shop')}
                            className="group bg-white text-[#0f172a] px-10 py-5 rounded-sm font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all duration-500 flex items-center gap-3 shadow-2xl"
                        >
                            Mua Ngay <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => {
                                const el = document.getElementById('categories');
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="bg-transparent border-2 border-white/30 text-white px-10 py-5 rounded-sm font-black text-xs uppercase tracking-widest hover:border-white transition-all duration-300 backdrop-blur-md"
                        >
                            Khám Phá Danh Mục
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative flex items-center bg-white p-1.5 rounded flex-col md:flex-row shadow-2xl shadow-black/50">
                        <div className="flex w-full items-center pl-4 text-slate-400">
                            <Search size={22} className="shrink-0" />
                            <input 
                                type="text" 
                                className="w-full py-4 px-4 bg-transparent outline-none text-slate-800 text-sm md:text-base font-semibold placeholder:text-slate-400 placeholder:font-medium"
                                placeholder="Tìm kiếm theo mã phụ tùng hoặc dòng xe..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="bg-[#f97316] w-full md:w-auto hover:bg-[#ea580c] transition-colors text-white font-black uppercase tracking-widest text-xs py-4 md:py-0 h-full md:h-[52px] px-8 rounded flex items-center justify-center gap-2 whitespace-nowrap">
                            Tìm Kiếm <ArrowRight size={16} />
                        </button>
                    </form>
                </div>
            </div>

            <div id="categories" className="max-w-7xl mx-auto py-24 px-6 md:px-12 bg-white">
                <div className="flex justify-between items-end mb-12">
                    <div className="max-w-xl">
                        <h2 className="text-3xl lg:text-4xl font-black text-blue-950 mb-4 tracking-tight uppercase italic underline decoration-orange-500 decoration-4 underline-offset-8">Danh Mục Kỹ Thuật</h2>
                        <p className="text-slate-500 font-medium leading-relaxed text-sm">Tuyển tập các linh kiện được thiết kế riêng biệt để tối ưu hóa hiệu suất và độ bền cho chiếc xe của bạn.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.length > 0 ? categories.map((cat, idx) => (
                        <div 
                            key={cat._id} 
                            onClick={() => handleCategoryClick(cat)} 
                            className={`relative rounded-2xl overflow-hidden bg-slate-900 group cursor-pointer h-[400px] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20`}
                        >
                            <img 
                                src={getCategoryImage(cat)} 
                                alt={cat.name} 
                                className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000" 
                                onError={imageFallback}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent group-hover:from-orange-600/60 transition-colors duration-700" />
                            <div className="absolute bottom-10 left-10 right-10 text-white z-10">
                                <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2 leading-none">Phân khúc {idx % 2 === 0 ? 'cao cấp' : 'hiệu năng'}</p>
                                <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-tight">{cat.name}</h3>
                                <div className="w-8 h-1 bg-white/30 group-hover:w-full group-hover:bg-white transition-all duration-500 mb-4" />
                                <button className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                    Khám phá ngay <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        // Fallback skeletons if no categories found
                        [1,2,3,4].map(n => (
                            <div key={n} className="bg-slate-100 h-[400px] rounded-2xl animate-pulse" />
                        ))
                    )}
                </div>
            </div>

            <div className="bg-slate-50 py-24 px-6 md:px-12 border-y border-slate-100">
                <div className="max-w-[1440px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                        <div>
                            <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.5em] mb-4">Bộ sưu tập phụ tùng</p>
                            <h2 className="text-5xl md:text-7xl font-black text-blue-950 tracking-tighter uppercase italic">Sản Phẩm <span className="text-slate-300">Nổi Bật</span></h2>
                        </div>
                        <Link 
                            to="/shop" 
                            className="bg-blue-950 text-white px-8 py-4 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all duration-300 shadow-xl shadow-blue-900/10"
                        >
                            Xem tất cả cửa hàng
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                <div key={n} className="bg-white aspect-[3/4] animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {parts.map(part => (
                                <PartCard key={part._id} part={part} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Standards Info Section */}
            <div className="max-w-7xl mx-auto py-32 px-6 md:px-12 bg-white">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="order-2 lg:order-1">
                        <h2 className="text-4xl lg:text-5xl font-black text-[#0f172a] mb-14 leading-[1.1] tracking-tighter uppercase">
                            TIÊU CHUẨN <br/> <span className="text-orange-500">KỸ THUẬT SỐ</span>
                        </h2>
                        
                        <div className="space-y-12">
                            <div className="flex gap-6 group">
                                <div className="w-14 h-14 rounded-xl bg-blue-950 flex items-center justify-center text-white shrink-0 shadow-xl shadow-blue-950/20 group-hover:bg-orange-500 transition-all">
                                    <FastForward size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-blue-950 mb-2">Giao Hàng Hỏa Tốc</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">Chúng tôi hiểu thời gian là vàng. Mạng lưới logistics tối ưu đảm bảo linh kiện đến tay bạn nhanh nhất có thể.</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-6 group">
                                <div className="w-14 h-14 rounded-xl bg-blue-950 flex items-center justify-center text-white shrink-0 shadow-xl shadow-blue-950/20 group-hover:bg-orange-500 transition-all">
                                    <Headphones size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-blue-950 mb-2">Chuyên Gia Hỗ Trợ 24/7</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">Đội ngũ kỹ sư cơ khí luôn sẵn sàng tư vấn kỹ thuật chuyên sâu để bạn nhận đúng mã phụ tùng.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px] lg:h-[600px] order-1 lg:order-2 group">
                        <img 
                            src={getFileUrl('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000&auto=format&fit=crop')} 
                            alt="Engineer checking part" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" 
                            onError={imageFallback}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent"></div>
                    </div>
                </div>
            </div>

            <footer className="bg-white border-t border-slate-200 py-16 px-8">
                <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex justify-between text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>© 2024 J2CAR PRECISION PARTS. ALL RIGHTS RESERVED.</span>
                </div>
            </footer>
        </div>
    );
};

export default Home;
