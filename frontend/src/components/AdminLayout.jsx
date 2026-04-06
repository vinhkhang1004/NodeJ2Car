import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Package,
    Tag,
    LogOut,
    ShoppingBag,
    CarFront,
    ExternalLink,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const logoutHandler = () => {
        logout();
        navigate('/login');
    };

    const navGroups = [
        {
            label: 'Tổng quan',
            items: [
                { name: 'Bảng điều khiển', icon: LayoutDashboard, path: '/admin/dashboard' },
            ]
        },
        {
            label: 'Quản lý',
            items: [
                { name: 'Sản phẩm', icon: Package, path: '/admin/products' },
                { name: 'Danh mục', icon: Tag, path: '/admin/categories' },
                { name: 'Đơn hàng', icon: ShoppingBag, path: '/admin/orders' },
                { name: 'Người dùng', icon: Users, path: '/admin/users' },
            ]
        },
    ];

    return (
        <div className="flex min-h-screen bg-[#09090b] text-slate-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800/80 flex flex-col justify-between shrink-0 bg-[#09090b]">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="px-6 py-6 border-b border-slate-800/50">
                        <Link to="/admin/dashboard" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                <CarFront className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-black text-base leading-none">J2 Admin</p>
                                <p className="text-slate-600 text-[10px] font-medium mt-0.5">Phụ tùng chính hãng</p>
                            </div>
                        </Link>
                    </div>

                    {/* Nav */}
                    <nav className="flex-grow px-3 py-5 space-y-6 overflow-y-auto">
                        {navGroups.map(group => (
                            <div key={group.label}>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-3 mb-2">
                                    {group.label}
                                </p>
                                <div className="space-y-0.5">
                                    {group.items.map((item) => (
                                        <NavLink
                                            key={item.name}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'text-slate-500 hover:text-white hover:bg-slate-800/60'
                                                }`
                                            }
                                        >
                                            <item.icon className="h-4 w-4 flex-shrink-0" />
                                            {item.name}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Bottom */}
                    <div className="px-3 py-4 border-t border-slate-800/50 space-y-1">
                        <Link
                            to="/"
                            target="_blank"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-white hover:bg-slate-800/60 transition-all"
                        >
                            <ExternalLink className="h-4 w-4" /> Xem cửa hàng
                        </Link>
                        <button
                            onClick={logoutHandler}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-950/30 hover:text-red-400 transition-all"
                        >
                            <LogOut className="h-4 w-4" /> Đăng xuất
                        </button>

                        {/* User info */}
                        <div className="flex items-center gap-3 px-3 py-3 mt-2 bg-slate-900/40 rounded-2xl border border-slate-800">
                            <Avatar className="h-9 w-9 border border-slate-700 flex-shrink-0">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}&backgroundColor=f97316`} />
                                <AvatarFallback className="bg-primary text-white font-bold text-xs">
                                    {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="text-white font-bold text-sm truncate">{user?.name || 'Admin'}</span>
                                <span className="text-slate-500 text-[11px] truncate">{user?.email || ''}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top bar */}
                <div className="h-14 border-b border-slate-800/50 bg-[#09090b]/80 backdrop-blur-sm flex items-center px-8 sticky top-0 z-10 flex-shrink-0">
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-xs">Xin chào,</span>
                        <span className="text-white text-sm font-bold">{user?.name || 'Admin'}</span>
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                </div>

                {/* Page content */}
                <div className="p-8 flex-1 overflow-auto">
                    <div className="max-w-[1400px] mx-auto w-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
