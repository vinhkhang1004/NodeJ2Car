import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    Package, 
    Settings, 
    LogOut,
    HelpCircle,
    CarFront
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const logoutHandler = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Bảng điều khiển', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Người dùng', icon: Users, path: '/admin/users' },
        { name: 'Linh kiện', icon: Package, path: '/admin/parts' },
    ];

    return (
        <div className="flex min-h-screen bg-[#09090b] text-slate-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0">
                <div>
                    <div className="p-6">
                        <div className="flex items-center gap-3 font-semibold text-lg text-white mb-8">
                            <CarFront className="h-6 w-6 text-orange-500" />
                            J2Car Admin
                        </div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
                            Chính
                        </div>
                        <nav className="space-y-1 px-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            isActive 
                                                ? 'bg-slate-800 text-white' 
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }`
                                    }
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 space-y-4">
                    <nav className="space-y-1 px-2">
                        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                            <Settings className="h-4 w-4" /> Cài đặt
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                            <HelpCircle className="h-4 w-4" /> Trợ giúp
                        </a>
                        <button onClick={logoutHandler} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-950/30 transition-colors">
                            <LogOut className="h-4 w-4" /> Đăng xuất
                        </button>
                    </nav>

                    <div className="flex items-center gap-3 px-3 py-2 mt-4">
                        <Avatar className="h-9 w-9 border border-slate-700">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`} />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-sm">
                            <span className="text-white font-medium truncate max-w-[140px]">{user?.name || 'Admin'}</span>
                            <span className="text-slate-500 text-xs truncate max-w-[140px]">{user?.email || 'admin@example.com'}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <div className="p-8 flex-1 overflow-auto bg-[#09090b]">
                    <div className="max-w-[1400px] mx-auto w-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
