import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import api from '../services/api';
import PartCard from '../components/PartCard';
import { 
    ChevronRight, 
    Filter, 
    LayoutGrid, 
    List, 
    Search, 
    ChevronLeft,
    X,
    FolderTree
} from 'lucide-react';

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { keyword } = useParams();
    const [parts, setParts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState({ page: 1, pages: 1, total: 0 });
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        brand: searchParams.get('brand') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        page: Number(searchParams.get('page')) || 1
    });

    // Local state for price inputs to avoid immediate re-fetching
    const [localPrice, setLocalPrice] = useState({
        min: searchParams.get('minPrice') || '',
        max: searchParams.get('maxPrice') || ''
    });

    // Fetch dynamic categories and brands
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [catRes, brandRes] = await Promise.all([
                    api.get('/categories?active=true'),
                    api.get('/parts/brands')
                ]);
                setCategories(catRes.data);
                setBrands(brandRes.data);
            } catch (err) {
                console.error('Error fetching metadata:', err);
            }
        };
        fetchMetadata();
    }, []);

    // Sync local filters state whenever URL params change
    useEffect(() => {
        setFilters({
            category: searchParams.get('category') || '',
            brand: searchParams.get('brand') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            page: Number(searchParams.get('page')) || 1
        });
        setLocalPrice({
            min: searchParams.get('minPrice') || '',
            max: searchParams.get('maxPrice') || ''
        });
    }, [searchParams]);

    const applyPriceFilter = () => {
        const updatedFilters = { 
            ...filters, 
            minPrice: localPrice.min, 
            maxPrice: localPrice.max,
            page: 1 
        };
        const cleanParams = {};
        Object.entries(updatedFilters).forEach(([k, v]) => {
            if (v) cleanParams[k] = v;
        });
        setSearchParams(cleanParams);
    };


    useEffect(() => {
        const fetchParts = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (keyword) params.append('keyword', keyword);
                if (filters.category) params.append('category', filters.category);
                if (filters.brand) params.append('brand', filters.brand);
                if (filters.minPrice) params.append('minPrice', filters.minPrice);
                if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
                params.append('page', filters.page);
                params.append('limit', 12);

                // Use the improved /api/products endpoint instead of /api/parts
                const { data } = await api.get(`/products?${params.toString()}`);
                // Map frontend 'parts' state to backend 'products' response
                setParts(data.products || []);
                setMetadata({ page: data.page, pages: data.pages, total: data.total });
            } catch (err) {
                console.error('Error fetching parts:', err);
                setParts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchParts();
    }, [filters, keyword]);

    const handleFilterChange = (key, value) => {
        const updatedFilters = { ...filters, [key]: value, page: 1 };
        // Clean empty filters before setting search params
        const cleanParams = {};
        Object.entries(updatedFilters).forEach(([k, v]) => {
            if (v) cleanParams[k] = v;
        });
        setSearchParams(cleanParams);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    // Helper to get active category name for UI display
    const getCategoryName = (id) => {
        const cat = categories.find(c => c._id === id);
        return cat ? cat.name : 'Tất cả sản phẩm';
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Header / Breadcrumbs */}
            <div className="bg-slate-50 border-b border-slate-100 py-12 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                        <span>Trang Chủ</span>
                        <ChevronRight size={12} />
                        <span className="text-blue-950">Danh Mục Phụ Tùng</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-blue-950 tracking-tighter uppercase mb-2">
                                {keyword ? `Tìm kiếm: ${keyword}` : (filters.category ? getCategoryName(filters.category) : 'Tất cả sản phẩm')}
                            </h1>
                            <p className="text-slate-500 font-medium text-sm max-w-xl">
                                Khám phá kho linh kiện cơ khí chính xác được kiểm định khắt khe theo tiêu chuẩn chuyên gia.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-white border border-slate-200 rounded-sm p-1">
                                <button className="p-2 bg-blue-950 text-white rounded-sm"><LayoutGrid size={16} /></button>
                                <button className="p-2 text-slate-400 hover:text-blue-950 transition-colors"><List size={16} /></button>
                            </div>
                            <select className="bg-white border border-slate-200 rounded-sm py-2 px-4 text-xs font-bold text-blue-950 outline-none uppercase tracking-widest cursor-pointer">
                                <option>Mới nhất</option>
                                <option>Giá: Thấp đến Cao</option>
                                <option>Giá: Cao đến Thấp</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-24 space-y-12">
                            {/* Brand Filter */}
                            <div>
                                <h3 className="text-xs font-black text-blue-950 uppercase tracking-[0.2em] mb-6 flex items-center justify-between border-b border-slate-50 pb-2">
                                    Thương Hiệu
                                    {filters.brand && <button onClick={() => handleFilterChange('brand', '')} className="text-orange-500 normal-case font-black tracking-tight text-[10px]">Xóa</button>}
                                </h3>
                                <div className="space-y-3">
                                    {brands.map(brand => (
                                        <label key={brand} className="flex items-center gap-3 group cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={filters.brand === brand}
                                                onChange={() => handleFilterChange('brand', filters.brand === brand ? '' : brand)}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-950 focus:ring-blue-950" 
                                            />
                                            <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${filters.brand === brand ? 'text-blue-950' : 'text-slate-400 group-hover:text-blue-950'}`}>
                                                {brand}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <h3 className="text-xs font-black text-blue-950 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-2">
                                    Khoảng Giá (VND)
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Từ giá</p>
                                            <input 
                                                type="number" 
                                                placeholder="0"
                                                value={localPrice.min}
                                                onChange={(e) => setLocalPrice({ ...localPrice, min: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Đến giá</p>
                                            <input 
                                                type="number" 
                                                placeholder="Max"
                                                value={localPrice.max}
                                                onChange={(e) => setLocalPrice({ ...localPrice, max: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 p-2 text-[11px] font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={applyPriceFilter}
                                        className="w-full py-3 bg-blue-950 text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-lg shadow-blue-900/10 hover:bg-blue-900 transition-all"
                                    >
                                        Lọc theo giá
                                    </button>
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <h3 className="text-xs font-black text-blue-950 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-2 flex items-center justify-between">
                                    Danh Mục
                                    {filters.category && <button onClick={() => handleFilterChange('category', '')} className="text-orange-500 normal-case font-black tracking-tight text-[10px]">Xóa</button>}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button 
                                            key={cat._id}
                                            onClick={() => handleFilterChange('category', filters.category === cat._id ? '' : cat._id)}
                                            className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
                                                filters.category === cat._id 
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                    {categories.length === 0 && <p className="text-[10px] text-slate-400 font-medium italic">Đang tải danh mục...</p>}
                                </div>
                            </div>

                            <button 
                                onClick={clearFilters}
                                className="w-full py-4 border border-slate-200 text-slate-400 hover:text-blue-950 hover:border-blue-950 transition-all text-[10px] font-black uppercase tracking-[0.2em] rounded-sm"
                            >
                                Thiết lập lại bộ lọc
                            </button>
                        </div>
                    </aside>

                    {/* Mobile Filter Trigger */}
                    <button 
                        onClick={() => setShowMobileFilters(true)}
                        className="lg:hidden flex items-center justify-center gap-2 w-full py-4 bg-blue-950 text-white rounded-sm font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20"
                    >
                        <Filter size={16} /> Bộ lọc & Tìm kiếm
                    </button>

                    {/* Product Grid */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <div key={n} className="bg-slate-50 aspect-[3/4] animate-pulse rounded-xl" />
                                ))}
                            </div>
                        ) : parts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
                                    {parts.map(part => (
                                        <PartCard key={part._id} part={part} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="flex justify-center items-center gap-2 border-t border-slate-100 pt-12">
                                    <button 
                                        onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                                        disabled={filters.page === 1}
                                        className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-sm hover:bg-slate-50 disabled:opacity-20 transition-colors"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    
                                    {metadata.pages > 0 && [...Array(metadata.pages)].map((_, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleFilterChange('page', i + 1)}
                                            className={`w-12 h-12 flex items-center justify-center rounded-sm text-xs font-black transition-all ${
                                                metadata.page === i + 1 
                                                ? 'bg-blue-950 text-white shadow-2xl shadow-blue-900/40 scale-110 z-10' 
                                                : 'text-slate-400 hover:text-blue-950 hover:bg-slate-50 border border-transparent'
                                            }`}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </button>
                                    ))}

                                    <button 
                                        onClick={() => handleFilterChange('page', Math.min(metadata.pages, filters.page + 1))}
                                        disabled={filters.page === metadata.pages}
                                        className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-sm hover:bg-slate-50 disabled:opacity-20 transition-colors"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                <Search className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-blue-950 mb-2 uppercase tracking-tighter">Không tìm thấy sản phẩm</h3>
                                <p className="text-slate-400 font-medium text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                                <button onClick={clearFilters} className="mt-10 px-10 py-5 bg-blue-950 text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl shadow-blue-900/20">Xóa tất cả bộ lọc</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-500">
                        <div className="p-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-xl font-black text-blue-950 uppercase tracking-tighter">Bộ lọc tìm kiếm</h2>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 text-slate-400 hover:text-blue-950"><X size={24} /></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto space-y-12 pr-4 custom-scrollbar">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-2">Thương Hiệu</h3>
                                    <div className="space-y-4">
                                        {brands.map(brand => (
                                            <label key={brand} className="flex items-center gap-4 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={filters.brand === brand}
                                                    onChange={() => handleFilterChange('brand', filters.brand === brand ? '' : brand)}
                                                    className="w-5 h-5 rounded border-slate-300 text-blue-950 focus:ring-blue-950" 
                                                />
                                                <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${filters.brand === brand ? 'text-blue-950' : 'text-slate-400'}`}>
                                                    {brand}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-2">Khoảng Giá (VND)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Từ</p>
                                            <input 
                                                type="number" 
                                                placeholder="0"
                                                value={localPrice.min}
                                                onChange={(e) => setLocalPrice({ ...localPrice, min: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 p-3 text-xs font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Đến</p>
                                            <input 
                                                type="number" 
                                                placeholder="Max"
                                                value={localPrice.max}
                                                onChange={(e) => setLocalPrice({ ...localPrice, max: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 p-3 text-xs font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-2">Danh Mục</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {categories.map(cat => (
                                            <button 
                                                key={cat._id}
                                                onClick={() => handleFilterChange('category', filters.category === cat._id ? '' : cat._id)}
                                                className={`px-5 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    filters.category === cat._id 
                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                                    : 'bg-slate-100 text-slate-500'
                                                }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 mt-auto border-t border-slate-100 grid grid-cols-2 gap-4">
                                <button onClick={clearFilters} className="py-5 border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-sm">Xóa bộ lọc</button>
                                <button onClick={() => setShowMobileFilters(false)} className="py-5 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 rounded-sm">Áp dụng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
