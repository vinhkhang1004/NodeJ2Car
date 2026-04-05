import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Loader2, Search, Filter, SlidersHorizontal, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const { keyword } = useParams();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data || []);
            } catch {}
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const kw = keyword || search;
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({ page, limit: 12 });
                if (kw) params.set('keyword', kw);
                if (selectedCategory) params.set('category', selectedCategory);
                if (sortBy === 'price-asc') params.set('sort', 'price');
                if (sortBy === 'price-desc') params.set('sort', '-price');
                if (sortBy === 'newest') params.set('sort', '-createdAt');

                const { data } = await api.get(`/products?${params}`);
                setProducts(data.products || []);
                setPages(data.pages || 1);
                setTotal(data.total || 0);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [keyword, search, selectedCategory, sortBy, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleCatSelect = (id) => {
        setSelectedCategory(id === selectedCategory ? '' : id);
        setPage(1);
    };

    const currentKeyword = keyword || search;

    return (
        <div className="animate-fade-in pb-20">
            {/* Section header */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                    {currentKeyword
                        ? <>Kết quả cho <span className="text-primary">"{currentKeyword}"</span></>
                        : <>Kho phụ tùng <span className="text-primary">ô tô</span></>
                    }
                </h1>
                <p className="text-slate-500 mt-2">
                    {total > 0 ? `${total} sản phẩm tìm thấy` : 'Tìm kiếm và mua phụ tùng chính hãng'}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar filters */}
                <aside className="lg:w-60 flex-shrink-0">
                    {/* Search */}
                    <div className="mb-6">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Tìm phụ tùng..."
                                className="w-full pl-10 pr-4 py-3 bg-[#18181b] border border-slate-800 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </form>
                    </div>

                    {/* Sort */}
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                            <SlidersHorizontal size={12} /> Sắp xếp
                        </p>
                        <div className="space-y-1.5">
                            {[
                                { label: 'Mới nhất', value: 'newest' },
                                { label: 'Giá thấp → cao', value: 'price-asc' },
                                { label: 'Giá cao → thấp', value: 'price-desc' },
                            ].map(({ label, value }) => (
                                <button
                                    key={value}
                                    onClick={() => { setSortBy(sortBy === value ? '' : value); setPage(1); }}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${sortBy === value ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    {categories.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                <Filter size={12} /> Danh mục
                            </p>
                            <div className="space-y-1.5">
                                <button
                                    onClick={() => handleCatSelect('')}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!selectedCategory ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >
                                    Tất cả
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => handleCatSelect(cat._id)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat._id ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main content */}
                <div className="flex-grow">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                            <Loader2 className="animate-spin text-primary" size={48} />
                            <p className="text-slate-500 text-sm">Đang tải sản phẩm...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-950/30 border border-red-900/50 text-red-400 rounded-2xl px-6 py-8 text-center">
                            <p className="font-bold mb-1">Lỗi tải dữ liệu</p>
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[40vh] opacity-40">
                            <Package size={72} className="text-slate-700 mb-6" />
                            <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy sản phẩm</h2>
                            <p className="text-slate-500 text-sm">Thử tìm với từ khoá khác hoặc bỏ bộ lọc.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pages > 1 && (
                                <div className="flex items-center justify-center gap-3 mt-12">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${page === p ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setPage(p => Math.min(pages, p + 1))}
                                        disabled={page === pages}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
