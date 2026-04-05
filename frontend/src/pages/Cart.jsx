import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFileUrl } from '../lib/utils';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart size={80} className="text-slate-700 mb-6 opacity-20" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-slate-400 mb-8 text-lg">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="bg-white text-black hover:bg-slate-200 px-8 py-6 text-lg font-semibold">
          <Link to="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild className="p-0 hover:bg-transparent text-slate-400 hover:text-white transition-colors">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft size={20} /> Back to Shop
          </Link>
        </Button>
      </div>

      <h1 className="text-4xl font-bold mb-10 tracking-tight">Shopping <span className="text-primary">Cart</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div key={item._id} className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 group hover:translate-y-[-2px] transition-all duration-300">
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-slate-800">
                <img 
                  src={getFileUrl(item.imageUrl)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x400/27272a/71717a?text=No+Image'; }}
                />
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-xl font-bold mb-1 line-clamp-1">{item.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{item.category?.name || 'Uncategorized'}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <div className="flex items-center bg-slate-900/50 rounded-full border border-slate-800 p-1">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-bold text-lg">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                <div className="font-mono text-xl font-bold text-success">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </div>
                <button 
                  onClick={() => removeFromCart(item._id)}
                  className="text-slate-500 hover:text-error transition-colors p-2 rounded-full hover:bg-error/10"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-4">
             <Button 
               variant="outline" 
               onClick={clearCart}
               className="border-slate-800 text-slate-400 hover:bg-error/10 hover:text-error transition-colors"
             >
               Clear Cart
             </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card p-8 sticky top-24 border-primary/20 bg-primary/5">
            <h2 className="text-2xl font-bold mb-6">Order <span className="text-primary">Summary</span></h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-white">{cartTotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-success font-medium">Free</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                <span className="font-bold text-lg">Total</span>
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold text-primary">
                    {cartTotal.toLocaleString('vi-VN')}₫
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full bg-white text-black hover:bg-slate-200 py-8 text-xl font-bold rounded-2xl shadow-xl shadow-primary/10">
              Proceed to Checkout
            </Button>
            
            <p className="text-center text-slate-500 text-xs mt-6">
              Tax included. Shipping calculated at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
