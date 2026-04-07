import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowUpRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { getFileUrl } from '../lib/utils';

const PartCard = ({ part }) => {
  const { addToCart } = useContext(CartContext);
  // Format price to VND style
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(part.price || 0); 

  return (
    <div className="group relative bg-white border border-slate-100 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2">
      {/* Category Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-3 py-1 bg-blue-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-sm">
          {part.category}
        </span>
      </div>

      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-slate-50">
        <img 
          src={getFileUrl(part.imageUrl)} 
          alt={part.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/27272a/71717a?text=No+Image'; }}
        />
        <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/5 transition-colors duration-500" />
        
        {/* Quick Link */}
        <Link 
          to={`/part/${part._id}`}
          className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 w-10 h-10 bg-white shadow-xl flex items-center justify-center rounded-full text-blue-950 hover:bg-blue-950 hover:text-white"
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-black text-blue-950 mb-1 leading-tight group-hover:text-blue-700 transition-colors">
            {part.name}
          </h3>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{part.brand}</p>
        </div>

        <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">
          {part.description}
        </p>

        {/* Pricing & Logic */}
        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giá Niêm Yết</p>
            <p className="text-xl font-black text-blue-950 tracking-tight">
              {formattedPrice}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button onClick={() => { addToCart(part); alert('Đã thêm vào giỏ hàng!'); }} className="mt-6 w-full py-4 bg-[#f97316] hover:bg-[#ea580c] text-white flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-sm shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40">
          <ShoppingCart size={16} /> Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default PartCard;
