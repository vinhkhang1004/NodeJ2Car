import React, { useState, useEffect, useRef } from 'react';
import { Bell, Package, Star, MessageCircle, X, Check } from 'lucide-react';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const socket = io('http://localhost:5000');

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get('/api/notifications');
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            } catch (error) {
                console.error('Fetch notifications error:', error);
            }
        };

        fetchNotifications();

        socket.on('admin_new_notification', (notification) => {
            setNotifications(prev => [notification, ...prev].slice(0, 10));
            setUnreadCount(prev => prev + 1);
            audioRef.current.play().catch(e => console.log('Audio play blocked'));
        });

        // Also listen to chat specific notifications if they aren't unified yet
        socket.on('admin_notification', (data) => {
            // This is the legacy chat notification, we can unify it or handle it here
            const chatNotif = {
                _id: Date.now(),
                type: 'chat',
                message: `Tin nhắn mới từ ${data.senderName}`,
                link: '/admin/chat',
                isRead: false,
                createdAt: new Date()
            };
            setNotifications(prev => [chatNotif, ...prev].slice(0, 10));
            setUnreadCount(prev => prev + 1);
            audioRef.current.play().catch(e => console.log('Audio play blocked'));
        });

        return () => {
            socket.off('admin_new_notification');
            socket.off('admin_notification');
        };
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/api/notifications/readall');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <Package size={14} className="text-emerald-500" />;
            case 'review': return <Star size={14} className="text-amber-500" />;
            case 'chat': return <MessageCircle size={14} className="text-blue-500" />;
            default: return <Bell size={14} />;
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-[#09090b]">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-[#18181b] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Thông báo</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-tight"
                                >
                                    Đánh dấu đã đọc hết
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <Bell size={32} className="mx-auto text-slate-700 mb-3 opacity-20" />
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Không có thông báo mới</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                        key={notif._id} 
                                        className={`group p-4 flex gap-4 hover:bg-slate-800/40 transition-all border-b border-slate-800/50 relative ${!notif.isRead ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                            notif.type === 'order' ? 'bg-emerald-500/10' : 
                                            notif.type === 'review' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                                        }`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link 
                                                to={notif.link}
                                                onClick={() => {
                                                    markAsRead(notif._id);
                                                    setIsOpen(false);
                                                }}
                                                className="block"
                                            >
                                                <p className={`text-xs leading-relaxed ${notif.isRead ? 'text-slate-400' : 'text-slate-200 font-bold'}`}>
                                                    {notif.message}
                                                </p>
                                                <span className="text-[9px] text-slate-600 font-medium mt-1 inline-block">
                                                    {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                            </Link>
                                        </div>
                                        {!notif.isRead && (
                                            <button 
                                                onClick={() => markAsRead(notif._id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-emerald-500 transition-all shrink-0"
                                                title="Đánh dấu đã đọc"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 bg-slate-900/50 border-t border-slate-800">
                            <Link 
                                to="/admin/dashboard" 
                                className="block w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                Xem tất cả hoạt động
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
