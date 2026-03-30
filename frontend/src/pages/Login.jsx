import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (user) {
            navigate(user.isAdmin ? '/admin/dashboard' : redirect);
        }
    }, [user, navigate, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await login(email, password);
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in w-full">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Chào mừng trở lại</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">Đăng nhập để quản lý đơn hàng và cấu hình xe của bạn.</p>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-md font-bold text-xs hover:bg-slate-50 transition-colors text-slate-700">
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> GOOGLE
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-md font-bold text-xs hover:bg-slate-50 transition-colors text-slate-700">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg> FACEBOOK
                </button>
            </div>

            <div className="relative mb-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="bg-white px-3 relative z-10">Hoặc bằng Email</span>
                <div className="absolute left-0 top-1/2 w-full h-px bg-slate-200 z-0"></div>
            </div>

            {error && <div className="p-3 mb-6 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">{error}</div>}

            <form onSubmit={submitHandler} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Kỹ thuật</label>
                    <input 
                        type="email" 
                        placeholder="engineer@company.vn"
                        className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mật khẩu</label>
                        <a href="#" className="text-[10px] font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider">Quên mật khẩu?</a>
                    </div>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium text-slate-900 placeholder:font-mono placeholder:tracking-widest placeholder:text-slate-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                    <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                    <label htmlFor="remember" className="text-[11px] font-bold text-slate-600">Ghi nhớ đăng nhập cho lần sau</label>
                </div>

                <button type="submit" disabled={loading} className="mt-2 w-full bg-[#f97316] text-white font-bold py-4 rounded-md hover:bg-[#ea580c] transition-colors flex justify-center items-center shadow-lg shadow-orange-500/20 text-sm">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>ĐĂNG NHẬP HỆ THỐNG <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                </button>
            </form>

            <div className="mt-10 text-center text-xs font-medium text-slate-600">
                Chưa có tài khoản chuyên gia?{' '}
                <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="font-bold text-blue-900 hover:text-blue-700 ml-1">
                    Đăng ký ngay
                </Link>
            </div>

            <div className="mt-16 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-600">
                    <ShieldCheck size={14} /> Mã hóa SSL 256-Bit
                </div>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-slate-600 transition-colors">Điều khoản</a>
                    <a href="#" className="hover:text-slate-600 transition-colors">Bảo mật</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
