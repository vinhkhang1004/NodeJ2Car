import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/productService';
import ProductCard from '../components/ProductCard';
import { Loader2, SlidersHorizontal, Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { keyword: routeKeyword } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [keyword, setKeyword] = useState(routeKeyword || '');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Sync route keyword to local state
  useEffect(() => {
    if (routeKeyword !== undefined) {
      setKeyword(routeKeyword);
      setPage(1);
    } else {
      setKeyword('');
    }
  }, [routeKeyword]);

  // Load categories once
  useEffect(() => {
    const loadCats = async () => {
      try {
        const { data } = await fetchCategories(true); // active categories
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCats();
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
      };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      if (brand) params.brand = brand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const { data } = await fetchProducts(params);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotalProducts(data.total || 0);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, category, brand, minPrice, maxPrice]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    if (keyword) {
      navigate(`/search/${keyword}`);
    } else {
      navigate('/');
    }
  };

  const handleClearFilters = () => {
    navigate('/');
    setCategory('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
        <h1 className="title" style={{ fontSize: '3rem', margin: '0' }}>
          {routeKeyword ? `Tìm kiếm: "${routeKeyword}"` : 'Kho Phụ Tùng Premium'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '1rem' }}>
          Khám phá linh kiện đẳng cấp, nâng tầm hiệu suất cho xe của bạn.
        </p>
      </div>

      <div className="store-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 3fr', gap: '2rem', alignItems: 'start' }}>
        {/* Sidebar Filters */}
        <aside style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          position: 'sticky',
          top: '90px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Filter size={20} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Bộ lọc tìm kiếm</h2>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Keyword Search */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Từ khoá</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Lọc dầu, Má phanh..."
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Danh mục</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="form-input"
                style={{ width: '100%', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Thương hiệu</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => { setBrand(e.target.value); setPage(1); }}
                placeholder="VD: Toyota, Bosch"
                className="form-input"
              />
            </div>

            {/* Price Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Giá tiền (VNĐ)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  placeholder="Từ"
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  placeholder="Đến"
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleClearFilters}
              variant="outline"
              className="w-full bg-transparent border-slate-700 text-white hover:bg-slate-800"
            >
              <X size={16} className="mr-2" /> Xoá bộ lọc
            </Button>
          </form>
        </aside>

        {/* Product Grid */}
        <div>
          {/* Top Bar for Results */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Hiển thị <strong style={{ color: 'var(--text-main)' }}>{products.length}</strong> / {totalProducts} sản phẩm
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center" style={{ minHeight: '40vh' }}>
              <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', border: '1px border-dashed var(--border-color)' }}>
              <Search size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Không tìm thấy sản phẩm</h2>
              <p style={{ color: 'var(--text-muted)' }}>Vui lòng thay đổi từ khoá hoặc điều chỉnh lại bộ lọc.</p>
              <Button onClick={handleClearFilters} className="mt-4 bg-white text-black hover:bg-slate-200">
                Hiển thị tất cả sản phẩm
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="bg-transparent border-slate-700 text-white hover:bg-slate-800 disabled:opacity-30"
                  >
                    Trước
                  </Button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                     <Button
                        key={i}
                        variant={page === i + 1 ? 'default' : 'outline'}
                        onClick={() => setPage(i + 1)}
                        className={page === i + 1 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "bg-transparent border-slate-700 text-white hover:bg-slate-800"
                        }
                     >
                       {i + 1}
                     </Button>
                  ))}

                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="bg-transparent border-slate-700 text-white hover:bg-slate-800 disabled:opacity-30"
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Responsive Styles Overlay */}
      <style>{`
        @media (max-width: 992px) {
          .store-layout {
            grid-template-columns: 1fr !important;
          }
          .store-layout aside {
            position: relative !important;
            top: 0 !important;
          }
        }
        @media (max-width: 640px) {
          .grid-cols-3 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
