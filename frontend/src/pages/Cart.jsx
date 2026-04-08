import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFileUrl } from '../lib/utils';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center py-32 px-6 text-center">
        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-10 animate-bounce transition-all duration-1000">
            <ShoppingBag size={64} className="text-slate-200" />
        </div>
        <h2 className="text-3xl font-black text-blue-950 mb-4 tracking-tighter uppercase">Giỏ hàng của bạn đang trống</h2>
        <p className="text-slate-500 mb-10 max-w-md font-medium">Kho linh kiện của chúng tôi vẫn đang sẵn sàng phục vụ bạn. Hãy chọn cho mình những món đồ ưng ý nhất.</p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-7 text-xs font-black uppercase tracking-widest rounded-sm shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95">
          <Link to="/shop">Quay lại mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Header / Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-100 py-12 px-6 md:px-12 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            <Link to="/" className="hover:text-blue-950 transition-colors">Trang Chủ</Link>
            <ChevronRight size={12} />
            <span className="text-blue-950">Giỏ Hàng</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-blue-950 tracking-tighter uppercase mb-2">
                Giỏ <span className="text-orange-500">Hàng</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                Đang có {cartItems.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm trong giỏ hàng của bạn.
              </p>
            </div>
            <Button variant="ghost" asChild className="p-0 hover:bg-transparent text-slate-400 hover:text-blue-950 transition-colors font-bold uppercase text-[10px] tracking-widest">
              <Link to="/shop" className="flex items-center gap-2">
                <ArrowLeft size={16} /> Tiếp tục mua sắm
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="premium-card p-6 flex flex-col sm:flex-row items-center gap-8 group">
                <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 bg-slate-50">
                  <img 
                    src={getFileUrl(item.imageUrl)}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x400/f8fafc/94a3b8?text=No+Image'; }}
                  />
                </div>
                
                <div className="flex-grow text-center sm:text-left">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-blue-950 mb-1 leading-none group-hover:text-orange-500 transition-colors">{item.name}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.category?.name || 'Linh kiện'}</p>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-6">
                    <div className="flex items-center bg-slate-50 rounded-sm border border-slate-100 p-1">
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-white hover:shadow-sm text-slate-500 transition-all"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-black text-blue-950">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-white hover:shadow-sm text-slate-500 transition-all"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                  <div className="font-mono text-xl font-black text-blue-950">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                  </div>
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-8">
               <button 
                 onClick={clearCart}
                 className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
               >
                 Xóa tất cả sản phẩm
               </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="premium-card p-8 sticky top-24">
              <h2 className="text-xs font-black text-blue-950 uppercase tracking-[0.2em] mb-8 pb-4 border-b border-slate-100">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Tạm tính</span>
                  <span className="font-mono font-black text-blue-950">{cartTotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Giao hàng</span>
                  <span className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">Miễn phí</span>
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                  <span className="font-black text-xs uppercase tracking-widest text-blue-950">Tổng tiền</span>
                  <div className="text-right">
                    <div className="text-3xl font-mono font-black text-blue-950">
                      {cartTotal.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                </div>
              </div>

              <Button asChild className="w-full bg-blue-950 hover:bg-blue-900 text-white py-8 text-xs font-black uppercase tracking-[0.2em] rounded-sm shadow-2xl shadow-blue-900/20 transition-all hover:-translate-y-1 active:scale-95">
                <Link to="/shipping">Tiến hành thanh toán</Link>
              </Button>
              
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-4 text-slate-400">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                        <ShoppingBag size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-950 uppercase tracking-widest leading-none mb-1">Chính sách bảo hành</p>
                        <p className="text-[10px] font-medium leading-tight">Cam kết hàng chính hãng 100%, đổi trả trong vòng 30 ngày nếu có lỗi.</p>
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

export default Cart;
