import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { User, ShoppingCart, LogOut, LayoutDashboard, Search, Menu, X, Heart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
    const { user, logout, wishlist } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?keyword=${searchQuery}`);
            setIsMenuOpen(false);
        }
    };

    return (
        <nav className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-xl md:text-2xl font-black text-[#0f172a] hover:opacity-80 transition-opacity tracking-tight shrink-0">
                    J2<span className="text-orange-500">Car</span>
                </Link>

                {/* Desktop Middle Links */}
                <div className="hidden md:flex items-center gap-10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <Link to="/" className="hover:text-blue-700 transition-colors pb-1 border-b-2 border-transparent">Trang chủ</Link>
                    <Link to="/shop" className="hover:text-blue-700 transition-colors pb-1 border-b-2 border-transparent">Sản phẩm</Link>
                    
                    {/* Category Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none hover:text-blue-700 transition-colors pb-1 border-b-2 border-transparent flex items-center gap-1 uppercase">
                            Danh mục sản phẩm
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56 bg-white border-slate-200 p-2">
                            <DropdownMenuItem onClick={() => navigate('/shop?category=Động Cơ')} className="cursor-pointer font-bold text-[10px] uppercase tracking-widest text-slate-600 focus:bg-slate-50 py-3">
                                Động Cơ
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/shop?category=Hiệu Suất')} className="cursor-pointer font-bold text-[10px] uppercase tracking-widest text-slate-600 focus:bg-slate-50 py-3">
                                Hiệu Suất
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/shop?category=Nội Thất')} className="cursor-pointer font-bold text-[10px] uppercase tracking-widest text-slate-600 focus:bg-slate-50 py-3">
                                Nội Thất
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/shop?category=Ngoại Thất')} className="cursor-pointer font-bold text-[10px] uppercase tracking-widest text-slate-600 focus:bg-slate-50 py-3">
                                Ngoại Thất
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem onClick={() => navigate('/shop')} className="cursor-pointer font-bold text-[10px] uppercase tracking-widest text-blue-600 focus:bg-blue-50 py-3 italic">
                                Tất cả phụ tùng
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Desktop Search Bar (Optional hidden for mobile toggle simplicity) */}
                    <form onSubmit={handleSearch} className="hidden lg:flex relative items-center">
                        <input 
                            type="text" 
                            placeholder="Tìm linh kiện..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-full text-xs font-medium w-48 focus:w-64 focus:outline-none focus:border-orange-500 transition-all"
                        />
                        <button type="submit" className="absolute right-3 text-slate-400 hover:text-orange-500">
                            <Search size={14} />
                        </button>
                    </form>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                                <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                                    <User size={16} />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200">
                                <DropdownMenuLabel className="font-bold text-slate-800">Xin chào, {user.name}</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                {user.isAdmin && (
                                    <DropdownMenuItem onClick={() => navigate('/admin/dashboard')} className="cursor-pointer font-medium text-slate-600 focus:bg-slate-50">
                                        <LayoutDashboard className="mr-2 h-4 w-4 text-blue-600" />
                                        Bảng quản trị
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer font-medium text-slate-600 focus:bg-slate-50">
                                    <User className="mr-2 h-4 w-4" /> Tài khoản
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer font-bold text-red-600 focus:text-red-700 focus:bg-red-50">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <button onClick={() => navigate('/login')} className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shadow-sm">
                            <User size={16} />
                        </button>
                    )}
                    
                    {user && (
                        <Link to="/wishlist" className="relative cursor-pointer hover:opacity-80 transition-opacity p-2">
                            <Heart className={`text-[#0f172a] ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} size={24} />
                            {wishlist.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full w-5 h-5 shadow-sm border border-white">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>
                    )}
                    
                    <Link to="/cart" className="relative cursor-pointer hover:opacity-80 transition-opacity p-2">
                        <ShoppingCart className="text-[#0f172a]" size={24} />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full w-5 h-5 shadow-sm border border-white animate-pulse">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Toggle */}
                    <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 py-6 px-6 shadow-xl animate-fade-in">
                    <form onSubmit={handleSearch} className="relative mb-6">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm font-medium w-full focus:outline-none focus:border-orange-500"
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search size={18} />
                        </button>
                    </form>
                    <div className="flex flex-col gap-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-700">Trang chủ</Link>
                        <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-700">Sản phẩm</Link>
                        <div className="pt-4 mt-4 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 mb-2">Danh mục</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => { navigate('/shop?category=Động Cơ'); setIsMenuOpen(false); }} className="text-left text-xs py-2">Động Cơ</button>
                                <button onClick={() => { navigate('/shop?category=Hiệu Suất'); setIsMenuOpen(false); }} className="text-left text-xs py-2">Hiệu Suất</button>
                                <button onClick={() => { navigate('/shop?category=Nội Thất'); setIsMenuOpen(false); }} className="text-left text-xs py-2">Nội Thất</button>
                                <button onClick={() => { navigate('/shop?category=Ngoại Thất'); setIsMenuOpen(false); }} className="text-left text-xs py-2">Ngoại Thất</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
