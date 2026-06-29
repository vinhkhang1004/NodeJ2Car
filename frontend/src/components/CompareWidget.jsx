import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ArrowRight, BarChart2, Trash2 } from 'lucide-react';
import { CompareContext } from '../context/CompareContext';
import { getFileUrl } from '../lib/utils';

const CompareWidget = () => {
  const { compareItems, removeFromCompare, clearCompare } = useContext(CompareContext);
  const navigate = useNavigate();

  if (compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-20 z-40 max-w-sm sm:max-w-md w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-2xl rounded-xl p-4 animate-fade-in transition-all duration-300">
      <div className="flex items-center justify-between mb-3 border-b border-slate-50 dark:border-slate-800/50 pb-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-orange-500" size={18} />
          <span className="text-xs font-black text-blue-950 dark:text-white uppercase tracking-wider">
            So sánh ({compareItems.length}/4)
          </span>
        </div>
        <button 
          onClick={clearCompare}
          className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 transition-colors"
          title="Xóa tất cả"
        >
          <Trash2 size={12} /> Xóa
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Thumbnails of compared items */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 flex-grow scrollbar-none">
          {compareItems.map((item) => (
            <div key={item._id} className="relative group/thumb shrink-0">
              <img 
                src={getFileUrl(item.imageUrl)} 
                alt={item.name} 
                className="w-12 h-12 rounded-lg object-cover border border-slate-100 dark:border-slate-800 shadow-sm"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=100&auto=format&fit=crop'; }}
              />
              <button 
                onClick={() => removeFromCompare(item._id)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200"
                title="Xóa khỏi so sánh"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 2 - compareItems.length) }).map((_, idx) => (
            <div 
              key={idx} 
              className="w-12 h-12 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 text-xs font-black"
              title="Thêm phụ tùng để so sánh"
            >
              +
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="shrink-0 pl-2">
          {compareItems.length >= 2 ? (
            <button 
              onClick={() => navigate('/compare')}
              className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 active:scale-95"
            >
              So sánh <ArrowRight size={14} />
            </button>
          ) : (
            <div className="text-[10px] text-slate-400 font-bold max-w-[80px] leading-tight text-center">
              Chọn thêm sản phẩm
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareWidget;
