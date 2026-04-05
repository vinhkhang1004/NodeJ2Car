import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Package } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { getFileUrl } from '../lib/utils';

const ProductCard = ({ product }) => {
    const { addToCart } = React.useContext(CartContext);
    const navigate = useNavigate();

    const isLowStock = product.stock > 0 && product.stock <= 5;
    const isOutOfStock = product.stock <= 0;

    return (
        <div
            onClick={() => navigate(`/product/${product._id}`)}
            className="group relative bg-[#18181b] border border-slate-800 rounded-2xl overflow-hidden cursor-pointer flex flex-col hover:border-slate-600 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1"
        >
            {/* Image */}
            <div className="relative h-52 overflow-hidden bg-slate-900">
                <img
                    src={getFileUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
                {/* Fallback */}
                <div className="absolute inset-0 hidden items-center justify-center bg-slate-900 text-slate-700">
                    <Package size={48} />
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.category?.name && (
                        <span className="bg-black/70 backdrop-blur-sm text-primary text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-primary/20">
                            {product.category.name}
                        </span>
                    )}
                    {isLowStock && (
                        <span className="bg-yellow-500/90 text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                            Sắp hết
                        </span>
                    )}
                    {isOutOfStock && (
                        <span className="bg-red-500/90 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                            Hết hàng
                        </span>
                    )}
                </div>

                {/* Quick view overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product._id}`);
                        }}
                        className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <Eye size={18} />
                    </button>
                    {!isOutOfStock && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                            }}
                            className="px-5 py-2.5 bg-primary rounded-xl text-white text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                        >
                            <ShoppingCart size={16} /> Thêm giỏ
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-grow p-5">
                {/* Brand */}
                {product.brand && (
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{product.brand}</p>
                )}
                
                {/* Name */}
                <h3 className="text-white font-bold text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>

                {/* Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
                    {product.description || 'Phụ tùng chính hãng, chất lượng cao.'}
                </p>

                {/* Price + Stock */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-primary text-xl font-black">
                        {product.price?.toLocaleString('vi-VN')}₫
                    </span>
                    <span className={`text-xs font-bold ${isOutOfStock ? 'text-red-400' : isLowStock ? 'text-yellow-400' : 'text-green-400'}`}>
                        {isOutOfStock ? 'Hết hàng' : `Còn ${product.stock}`}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
