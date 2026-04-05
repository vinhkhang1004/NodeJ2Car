import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, ShoppingCart, LogOut, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
            {/* Logo */}
            <Link to="/" className="text-xl md:text-2xl font-black text-[#0f172a] hover:opacity-80 transition-opacity tracking-tight">
                J2<span className="text-orange-500">Car</span>
            </Link>

            {/* Middle Links */}
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
            <div className="flex items-center gap-6">
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
                
                <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
                    <ShoppingCart className="text-[#0f172a]" size={24} />
                    <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full w-4 h-4 shadow-sm border border-white">
                        0
                    </span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
