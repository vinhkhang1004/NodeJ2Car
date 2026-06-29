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
    FolderTree,
    Camera,
    UploadCloud
} from 'lucide-react';

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { keyword } = useParams();
    const [parts, setParts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    
    // AI Image Scan states
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiFile, setAiFile] = useState(null);
    const [aiPreview, setAiPreview] = useState('');
    const [aiScanning, setAiScanning] = useState(false);
    const [aiScanLabel, setAiScanLabel] = useState('');
    const [loading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState({ page: 1, pages: 1, total: 0 });
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Compatibility metadata
    const [compatData, setCompatData] = useState({ brands: [], modelsByBrand: {}, years: [] });
    const [vinInput, setVinInput] = useState(searchParams.get('vin') || '');
    const [decodedVehicle, setDecodedVehicle] = useState(null);
    const [vinLoading, setVinLoading] = useState(false);
    const [vinError, setVinError] = useState('');

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        brand: searchParams.get('brand') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        carBrand: searchParams.get('carBrand') || '',
        carModel: searchParams.get('carModel') || '',
        carYear: searchParams.get('carYear') || '',
        partType: searchParams.get('partType') || '',
        vin: searchParams.get('vin') || '',
        page: Number(searchParams.get('page')) || 1
    });

    // Local state for price inputs to avoid immediate re-fetching
    const [localPrice, setLocalPrice] = useState({
        min: searchParams.get('minPrice') || '',
        max: searchParams.get('maxPrice') || ''
    });

    // Fetch dynamic categories, brands, and compatibilities
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [catRes, brandRes, compatRes] = await Promise.all([
                    api.get('/categories?active=true'),
                    api.get('/parts/brands'),
                    api.get('/products/compatibilities')
                ]);
                setCategories(catRes.data);
                setBrands(brandRes.data);
                setCompatData(compatRes.data || { brands: [], modelsByBrand: {}, years: [] });
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
            carBrand: searchParams.get('carBrand') || '',
            carModel: searchParams.get('carModel') || '',
            carYear: searchParams.get('carYear') || '',
            partType: searchParams.get('partType') || '',
            vin: searchParams.get('vin') || '',
            page: Number(searchParams.get('page')) || 1
        });
        setLocalPrice({
            min: searchParams.get('minPrice') || '',
            max: searchParams.get('maxPrice') || ''
        });
        if (searchParams.get('vin')) {
            setVinInput(searchParams.get('vin'));
        }
    }, [searchParams]);

    // Handle VIN decoding if present in URL on load/change
    useEffect(() => {
        const vin = searchParams.get('vin');
        if (vin) {
            const loadVin = async () => {
                try {
                    const { data } = await api.get(`/products/decode-vin/${vin}`);
                    setDecodedVehicle(data);
                } catch (e) {
                    setDecodedVehicle(null);
                }
            };
            loadVin();
        } else {
            setDecodedVehicle(null);
        }
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

    const handleVinSearch = async (e) => {
        e.preventDefault();
        setVinError('');
        setVinLoading(true);
        setDecodedVehicle(null);
        if (!vinInput || vinInput.trim().length < 10) {
            setVinError('Số VIN phải tối thiểu 10 ký tự');
            setVinLoading(false);
            return;
        }
        try {
            const { data } = await api.get(`/products/decode-vin/${vinInput.trim()}`);
            setDecodedVehicle(data);
            
            // Auto-filter based on decoded vehicle
            const updatedFilters = {
                ...filters,
                vin: vinInput.trim(),
                carBrand: data.make || '',
                carModel: data.model || '',
                carYear: data.year || '',
                page: 1
            };
            const cleanParams = {};
            Object.entries(updatedFilters).forEach(([k, v]) => {
                if (v) cleanParams[k] = v;
            });
            setSearchParams(cleanParams);
        } catch (err) {
            setVinError(err.response?.data?.message || 'Không tìm thấy thông tin số VIN này');
            handleFilterChange('vin', vinInput.trim());
        } finally {
            setVinLoading(false);
        }
    };

    const clearVinSearch = () => {
        setVinInput('');
        setDecodedVehicle(null);
        setVinError('');
        const updatedFilters = {
            ...filters,
            vin: '',
            carBrand: '',
            carModel: '',
            carYear: '',
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
            if (aiScanLabel) return;
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (keyword) params.append('keyword', keyword);
                if (filters.category) params.append('category', filters.category);
                if (filters.brand) params.append('brand', filters.brand);
                if (filters.minPrice) params.append('minPrice', filters.minPrice);
                if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
                if (filters.carBrand) params.append('carBrand', filters.carBrand);
                if (filters.carModel) params.append('carModel', filters.carModel);
                if (filters.carYear) params.append('carYear', filters.carYear);
                if (filters.partType) params.append('partType', filters.partType);
                if (filters.vin) params.append('vin', filters.vin);
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
    }, [filters, keyword, aiScanLabel]);

    const handleFilterChange = (key, value) => {
        const updatedFilters = { 
            ...filters, 
            [key]: value, 
            page: key === 'page' ? value : 1,
            ...(key === 'carBrand' ? { carModel: '' } : {}) 
        };
        // Clean empty filters before setting search params
        const cleanParams = {};
        Object.entries(updatedFilters).forEach(([k, v]) => {
            if (v) cleanParams[k] = v;
        });
        setSearchParams(cleanParams);
    };

    const clearFilters = () => {
        setVinInput('');
        setDecodedVehicle(null);
        setVinError('');
        setSearchParams({});
    };

    // Helper to get active category name for UI display
    const getCategoryName = (idOrName) => {
        const cat = categories.find(c => c._id === idOrName || c.name === idOrName || c.slug === idOrName);
        return cat ? cat.name : (idOrName || 'Tất cả sản phẩm');
    };

    const handleAiImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAiFile(file);
            setAiPreview(URL.createObjectURL(file));
        }
    };

    const handleAiScan = async () => {
        if (!aiFile) return;
        setAiScanning(true);
        setTimeout(async () => {
            try {
                const formData = new FormData();
                formData.append('image', aiFile);

                const { data } = await api.post('/upload/scan-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                setAiScanLabel(data.detectedLabel);
                setParts(data.products || []);
                setMetadata({ page: 1, pages: 1, total: data.products?.length || 0 });
                setIsAiModalOpen(false);
                setAiFile(null);
                setAiPreview('');
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || 'Lỗi nhận diện hình ảnh');
            } finally {
                setAiScanning(false);
            }
        }, 2000);
    };

    const clearAiScan = () => {
        setAiScanLabel('');
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
                            <button 
                                onClick={() => setIsAiModalOpen(true)}
                                className="bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/10 h-10 no-print"
                            >
                                <Camera size={12} /> Quét ảnh AI
                            </button>
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
                            {/* AI Search Card */}
                            <div className="bg-[#18181b] border border-slate-800 p-5 rounded-2xl relative overflow-hidden group shadow-lg shadow-black/20 no-print">
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <Camera size={14} className="text-[#f97316]" /> Tìm bằng AI
                                </h3>
                                <p className="text-slate-500 text-[10px] leading-relaxed mb-4 font-medium">Chụp hoặc tải ảnh phụ tùng lên để quét và nhận diện tự động.</p>
                                <button 
                                    onClick={() => setIsAiModalOpen(true)}
                                    className="w-full py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                                >
                                    <Camera size={12} /> Bật Camera quét
                                </button>
                            </div>

                            {/* VIN Lookup */}
                            <div>
                                <h3 className="text-xs font-black text-blue-950 uppercase tracking-[0.2em] mb-6 flex items-center justify-between border-b border-slate-50 pb-2">
                                    Tra cứu VIN
                                    {(filters.vin || decodedVehicle) && (
                                        <button onClick={clearVinSearch} className="text-orange-500 normal-case font-black tracking-tight text-[10px]">Xóa</button>
                                    )}
                                </h3>
                                <form onSubmit={handleVinSearch} className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength="17"
                                            placeholder="Nhập 17 ký tự VIN..."
                                            value={vinInput}
                                            onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                                            className="w-full bg-slate-50 border border-slate-100 p-2.5 pr-8 text-[11px] font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors uppercase"
                                        />
                                        <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-950">
                                            <Search size={14} />
                                        </button>
                                    </div>
                                    {vinError && <p className="text-[10px] text-red-500 font-medium">{vinError}</p>}
                                    {vinLoading && <p className="text-[10px] text-slate-400 animate-pulse font-medium">Đang giải mã VIN...</p>}
                                    {decodedVehicle && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-sm p-3">
                                            <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">Đã khớp xe</p>
                                            <p className="text-xs font-bold text-blue-950 mt-1">{decodedVehicle.make} {decodedVehicle.model} {decodedVehicle.year}</p>
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Car Fitment Filter */}
                            <div>
                                <h3 className="text-xs font-black text-blue-950 uppercase tracking-[0.2em] mb-6 flex items-center justify-between border-b border-slate-50 pb-2">
                                    Tương thích xe
                                    {(filters.carBrand || filters.carModel || filters.carYear) && (
                                        <button onClick={() => {
                                            handleFilterChange('carBrand', '');
                                            handleFilterChange('carModel', '');
                                            handleFilterChange('carYear', '');
                                        }} className="text-orange-500 normal-case font-black tracking-tight text-[10px]">Xóa</button>
                                    )}
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hãng xe</p>
                                        <select
                                            value={filters.carBrand}
                                            onChange={(e) => handleFilterChange('carBrand', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 p-2.5 text-[11px] font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors uppercase cursor-pointer"
                                        >
                                            <option value="">-- Tất cả hãng --</option>
                                            {compatData.brands.map(brand => (
                                                <option key={brand} value={brand}>{brand}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dòng xe</p>
                                        <select
                                            value={filters.carModel}
                                            onChange={(e) => handleFilterChange('carModel', e.target.value)}
                                            disabled={!filters.carBrand}
                                            className="w-full bg-slate-50 border border-slate-100 p-2.5 text-[11px] font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors uppercase cursor-pointer disabled:opacity-50"
                                        >
                                            <option value="">-- Tất cả dòng --</option>
                                            {filters.carBrand && compatData.modelsByBrand[filters.carBrand]?.map(model => (
                                                <option key={model} value={model}>{model}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Năm sản xuất</p>
                                        <select
                                            value={filters.carYear}
                                            onChange={(e) => handleFilterChange('carYear', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 p-2.5 text-[11px] font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors uppercase cursor-pointer"
                                        >
                                            <option value="">-- Tất cả năm --</option>
                                            {compatData.years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Part Type Origin Filter */}
                            <div>
                                <h3 className="text-xs font-black text-blue-950 uppercase tracking-[0.2em] mb-6 flex items-center justify-between border-b border-slate-50 pb-2">
                                    Nguồn gốc
                                    {filters.partType && (
                                        <button onClick={() => handleFilterChange('partType', '')} className="text-orange-500 normal-case font-black tracking-tight text-[10px]">Xóa</button>
                                    )}
                                </h3>
                                <div className="space-y-3">
                                    {['OEM', 'OES', 'Aftermarket'].map(type => (
                                        <label key={type} className="flex items-center gap-3 group cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.partType === type}
                                                onChange={() => handleFilterChange('partType', filters.partType === type ? '' : type)}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-950 focus:ring-blue-950"
                                            />
                                            <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${filters.partType === type ? 'text-blue-950' : 'text-slate-400 group-hover:text-blue-950'}`}>
                                                {type}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

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
                                    {categories.map(cat => {
                                        const isCatActive = filters.category === cat._id || filters.category === cat.name || filters.category === cat.slug;
                                        return (
                                            <button 
                                                key={cat._id}
                                                onClick={() => handleFilterChange('category', isCatActive ? '' : cat._id)}
                                                className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    isCatActive 
                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                            >
                                                {cat.name}
                                            </button>
                                        );
                                    })}
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
                        {aiScanLabel && (
                            <div className="mb-6 bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center justify-between no-print animate-fade-in">
                                <div className="flex items-center gap-3 text-orange-800">
                                    <Camera size={18} className="text-orange-500 animate-pulse" />
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-wider text-orange-950">Đang xem kết quả quét AI</p>
                                        <p className="text-[11px] font-medium mt-0.5">Nhãn đã nhận diện: <strong>{aiScanLabel}</strong></p>
                                    </div>
                                </div>
                                <button 
                                    onClick={clearAiScan}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                                >
                                    Xóa bộ lọc AI
                                </button>
                            </div>
                        )}
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
                                {/* AI Search Card - Mobile */}
                                <div className="bg-[#18181b] border border-slate-800 p-5 rounded-2xl relative overflow-hidden group shadow-lg shadow-black/20 no-print">
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <Camera size={14} className="text-[#f97316]" /> Tìm bằng AI
                                    </h3>
                                    <p className="text-slate-500 text-[10px] leading-relaxed mb-4 font-medium">Chụp hoặc tải ảnh phụ tùng lên để quét và nhận diện tự động.</p>
                                    <button 
                                        onClick={() => { setShowMobileFilters(false); setIsAiModalOpen(true); }}
                                        className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                                    >
                                        <Camera size={12} /> Bật Camera quét
                                    </button>
                                </div>

                                {/* VIN Lookup - Mobile */}
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-2 flex items-center justify-between">
                                        Tra cứu VIN
                                        {(filters.vin || decodedVehicle) && (
                                            <button onClick={clearVinSearch} className="text-orange-500 normal-case font-black tracking-tight text-[10px]">Xóa</button>
                                        )}
                                    </h3>
                                    <form onSubmit={handleVinSearch} className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                maxLength="17"
                                                placeholder="Nhập 17 ký tự VIN..."
                                                value={vinInput}
                                                onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                                                className="w-full bg-slate-50 border border-slate-100 p-3 pr-10 text-xs font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors uppercase"
                                            />
                                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-950">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                        {vinError && <p className="text-[10px] text-red-500 font-medium">{vinError}</p>}
                                        {vinLoading && <p className="text-[10px] text-slate-400 animate-pulse font-medium">Đang giải mã VIN...</p>}
                                        {decodedVehicle && (
                                            <div className="bg-blue-50 border border-blue-100 rounded-sm p-3">
                                                <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">Đã khớp xe</p>
                                                <p className="text-xs font-bold text-blue-950 mt-1">{decodedVehicle.make} {decodedVehicle.model} {decodedVehicle.year}</p>
                                            </div>
                                        )}
                                    </form>
                                </div>

                                {/* Car Fitment - Mobile */}
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-2 flex items-center justify-between">
                                        Tương thích xe
                                        {(filters.carBrand || filters.carModel || filters.carYear) && (
                                            <button onClick={() => {
                                                handleFilterChange('carBrand', '');
                                                handleFilterChange('carModel', '');
                                                handleFilterChange('carYear', '');
                                            }} className="text-orange-500 normal-case font-black tracking-tight text-[10px]">Xóa</button>
                                        )}
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hãng xe</p>
                                            <select
                                                value={filters.carBrand}
                                                onChange={(e) => handleFilterChange('carBrand', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 p-3 text-xs font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors uppercase cursor-pointer"
                                            >
                                                <option value="">-- Tất cả hãng --</option>
                                                {compatData.brands.map(brand => (
                                                    <option key={brand} value={brand}>{brand}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dòng xe</p>
                                            <select
                                                value={filters.carModel}
                                                onChange={(e) => handleFilterChange('carModel', e.target.value)}
                                                disabled={!filters.carBrand}
                                                className="w-full bg-slate-50 border border-slate-100 p-3 text-xs font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors uppercase cursor-pointer disabled:opacity-50"
                                            >
                                                <option value="">-- Tất cả dòng --</option>
                                                {filters.carBrand && compatData.modelsByBrand[filters.carBrand]?.map(model => (
                                                    <option key={model} value={model}>{model}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Năm sản xuất</p>
                                            <select
                                                value={filters.carYear}
                                                onChange={(e) => handleFilterChange('carYear', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 p-3 text-xs font-bold text-blue-950 outline-none focus:border-blue-950 transition-colors uppercase cursor-pointer"
                                            >
                                                <option value="">-- Tất cả năm --</option>
                                                {compatData.years.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Part Type - Mobile */}
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-2 flex items-center justify-between">
                                        Nguồn gốc
                                        {filters.partType && (
                                            <button onClick={() => handleFilterChange('partType', '')} className="text-orange-500 normal-case font-black tracking-tight text-[10px]">Xóa</button>
                                        )}
                                    </h3>
                                    <div className="space-y-4">
                                        {['OEM', 'OES', 'Aftermarket'].map(type => (
                                            <label key={type} className="flex items-center gap-4 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.partType === type}
                                                    onChange={() => handleFilterChange('partType', filters.partType === type ? '' : type)}
                                                    className="w-5 h-5 rounded border-slate-300 text-blue-950 focus:ring-blue-950"
                                                />
                                                <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${filters.partType === type ? 'text-blue-950' : 'text-slate-400'}`}>
                                                    {type}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

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
                                        {categories.map(cat => {
                                            const isCatActive = filters.category === cat._id || filters.category === cat.name || filters.category === cat.slug;
                                            return (
                                                <button 
                                                    key={cat._id}
                                                    onClick={() => handleFilterChange('category', isCatActive ? '' : cat._id)}
                                                    className={`px-5 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        isCatActive 
                                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    {cat.name}
                                                    
                                                </button>
                                            );
                                        })}
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
            
            {/* Floating AI Scan Button for Mobile Devices */}
            <button 
                onClick={() => setIsAiModalOpen(true)}
                className="fixed bottom-24 right-6 z-40 bg-[#f97316] hover:bg-[#ea580c] text-white p-4 rounded-full shadow-2xl shadow-orange-500/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/10 lg:hidden no-print"
                title="Tìm kiếm phụ tùng bằng AI"
            >
                <Camera size={22} />
            </button>

            {/* AI Scan Modal */}
            {isAiModalOpen && (
                <div 
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !aiScanning) {
                            setIsAiModalOpen(false);
                        }
                    }}
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                >
                    <div className="bg-[#18181b] border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black/80 text-white relative animate-fade-in">
                        <style dangerouslySetInnerHTML={{__html: `
                            @keyframes laser {
                                0% { top: 0%; }
                                50% { top: 100%; }
                                100% { top: 0%; }
                            }
                            .laser-line {
                                position: absolute;
                                left: 0;
                                right: 0;
                                height: 3px;
                                background-color: #10b981;
                                box-shadow: 0 0 8px #10b981, 0 0 15px #10b981;
                                animation: laser 2s infinite linear;
                            }
                        `}} />
                        
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Camera className="text-[#f97316]" /> AI nhận diện phụ tùng
                            </h3>
                            <button 
                                onClick={() => { if (!aiScanning) setIsAiModalOpen(false); }} 
                                disabled={aiScanning}
                                className="p-1 text-slate-500 hover:text-white rounded-lg transition-colors disabled:opacity-30"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {!aiPreview ? (
                            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-10 text-center hover:border-slate-700 transition-colors cursor-pointer relative group">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleAiImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <UploadCloud size={48} className="mx-auto text-slate-600 group-hover:text-primary transition-colors mb-4" />
                                <p className="text-sm font-bold text-slate-300">Kéo thả hoặc nhấp để tải ảnh lên</p>
                                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">Hỗ trợ JPG, PNG, WEBP</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                                    <img src={aiPreview} alt="Quét AI" className="w-full h-full object-cover" />
                                    {aiScanning && (
                                        <>
                                            <div className="absolute inset-0 bg-emerald-950/20" />
                                            <div className="laser-line" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <p className="text-xs font-black uppercase tracking-widest text-emerald-400 animate-pulse">AI đang nhận diện...</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={handleAiScan}
                                        disabled={aiScanning}
                                        className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl h-12 font-bold flex-1 text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {aiScanning ? 'ĐANG QUÉT...' : 'BẮT ĐẦU QUÉT AI'}
                                    </button>
                                    <button 
                                        onClick={() => { setAiFile(null); setAiPreview(''); }}
                                        disabled={aiScanning}
                                        className="border border-slate-800 text-slate-400 hover:text-white rounded-xl h-12 font-bold px-6 text-xs uppercase tracking-wider hover:bg-slate-950 transition-colors"
                                    >
                                        HỦY
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
