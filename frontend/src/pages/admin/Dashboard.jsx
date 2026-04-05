import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Settings2, MoreVertical, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jun 24', desktop: 200, mobile: 150 },
  { name: 'Jun 25', desktop: 180, mobile: 230 },
  { name: 'Jun 26', desktop: 250, mobile: 200 },
  { name: 'Jun 27', desktop: 280, mobile: 300 },
  { name: 'Jun 28', desktop: 310, mobile: 250 },
  { name: 'Jun 29', desktop: 300, mobile: 340 },
  { name: 'Jun 30', desktop: 446, mobile: 400 },
];

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalParts: 0, totalUsers: 0 });
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, partsRes] = await Promise.all([
                    api.get('/parts/admin/stats'),
                    api.get('/parts')
                ]);
                setStats(statsRes.data);
                const fetchedParts = partsRes.data.parts || [];
                setParts(fetchedParts.slice(0, 7)); // Only show top 7 in dashboard
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin text-white" size={48} />
        </div>
    );

    return (
        <div className="space-y-6 pb-12 animate-fade-in text-white/90">
            {/* Header */}
            <div className="flex justify-between items-center bg-[#09090b]">
                <h1 className="text-2xl font-bold tracking-tight text-white">Tổng quan quản trị</h1>
                <Button onClick={() => navigate('/admin/part/create')} className="bg-white text-black hover:bg-slate-200">
                    <Plus className="mr-2 h-4 w-4" /> Thêm nhanh
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-[#18181b] border-slate-800 text-white shadow-xl shadow-black/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Người dùng</CardTitle>
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">↗ +12.5%</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-2">{stats.totalUsers}</div>
                        <p className="text-xs text-white/80 font-medium">Xu hướng tăng tháng này ↗</p>
                        <p className="text-xs text-slate-500">Đăng ký trong 6 tháng qua</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#18181b] border-slate-800 text-white shadow-xl shadow-black/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Linh kiện</CardTitle>
                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">↘ -20%</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-2">{stats.totalParts}</div>
                        <p className="text-xs text-white/80 font-medium">Giảm 20% trong kỳ này ↘</p>
                        <p className="text-xs text-slate-500">Kho hàng cần chú ý</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#18181b] border-slate-800 text-white shadow-xl shadow-black/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Phiên hoạt động</CardTitle>
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">↗ +12.5%</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-2">45,678</div>
                        <p className="text-xs text-white/80 font-medium">Duy trì người dùng tốt ↗</p>
                        <p className="text-xs text-slate-500">Tương tác vượt mục tiêu</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#18181b] border-slate-800 text-white shadow-xl shadow-black/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Tỷ lệ tăng trưởng</CardTitle>
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">↗ +4.5%</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-2">4.5%</div>
                        <p className="text-xs text-white/80 font-medium">Tăng trưởng ổn định ↗</p>
                        <p className="text-xs text-slate-500">Đạt dự báo tăng trưởng</p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Card */}
            <Card className="bg-[#18181b] border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-white text-lg">Tổng lượt truy cập</CardTitle>
                        <CardDescription className="text-slate-500">Tổng cộng trong 3 tháng qua</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent border-slate-700 text-white hover:bg-slate-800">3 tháng qua</Button>
                        <Button variant="outline" size="sm" className="bg-transparent border-slate-700 text-white hover:bg-slate-800">30 ngày qua</Button>
                        <Button variant="outline" size="sm" className="bg-transparent border-slate-700 text-white hover:bg-slate-800">7 ngày qua</Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <div className="h-[250px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fafafa" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#fafafa" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#71717a" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                                <Area type="monotone" dataKey="desktop" stroke="#fafafa" strokeWidth={2} fillOpacity={1} fill="url(#colorDesktop)" />
                                <Area type="monotone" dataKey="mobile" stroke="#71717a" strokeWidth={2} fillOpacity={1} fill="url(#colorMobile)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Table Section */}
            <Tabs defaultValue="outline" className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <TabsList className="bg-[#18181b] border border-slate-800">
                        <TabsTrigger value="outline" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">Linh kiện kho</TabsTrigger>
                        <TabsTrigger value="past" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">Hiệu suất trước đây <Badge className="ml-2 bg-slate-700 text-white">3</Badge></TabsTrigger>
                        <TabsTrigger value="key" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">Nhân sự chính <Badge className="ml-2 bg-slate-700 text-white">2</Badge></TabsTrigger>
                    </TabsList>
                    
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                            <Settings2 className="mr-2 h-4 w-4" /> Tùy chỉnh cột
                        </Button>
                        <Button variant="outline" className="bg-transparent border-slate-700 text-white hover:bg-slate-800">
                            <Plus className="mr-2 h-4 w-4" /> Thêm mục
                        </Button>
                    </div>
                </div>

                <TabsContent value="outline">
                    <div className="rounded-xl border border-slate-800 bg-[#18181b] overflow-hidden shadow-xl shadow-black/20">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 bg-[#27272a]/50 uppercase border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium"><input type="checkbox" className="rounded bg-black border-slate-700 accent-white" /></th>
                                    <th className="px-6 py-4 font-medium">Tiêu đề</th>
                                    <th className="px-6 py-4 font-medium">Loại mục</th>
                                    <th className="px-6 py-4 font-medium">Trạng thái</th>
                                    <th className="px-6 py-4 font-medium">Giá mục tiêu</th>
                                    <th className="px-6 py-4 font-medium">Đánh giá/Hãng</th>
                                    <th className="px-6 py-4 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                                {parts.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4"><input type="checkbox" className="rounded bg-black border-slate-700 accent-white" /></td>
                                        <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                                        <td className="px-6 py-4 text-slate-400">
                                            <span className="px-2.5 py-1 rounded-full border border-slate-700 text-xs">{item.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.stock > 0 ? (
                                                <span className="flex items-center text-green-400 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span> Xong</span>
                                            ) : (
                                                <span className="flex items-center text-slate-400 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-2"></span> Đang xử lý</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-white font-mono">{item.price}</td>
                                        <td className="px-6 py-4 text-white">{item.brand}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {parts.length === 0 && (
                                     <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Không tìm thấy dữ liệu.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 text-xs text-slate-400 bg-[#18181b]">
                            <div>Đã chọn 0 trong tổng số {parts.length} hàng.</div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span>Hàng trên mỗi trang</span>
                                    <select className="bg-transparent border border-slate-700 rounded p-1 outline-none text-white">
                                        <option>10</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">Trang 1 / 1</div>
                                <div className="flex gap-1">
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent border-slate-700">&laquo;</Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent border-slate-700">&lt;</Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent border-slate-700">&gt;</Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent border-slate-700">&raquo;</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;
