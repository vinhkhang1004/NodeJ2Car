import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { Search, Send, User, MessageSquare, Bell } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';


const socket = io('http://localhost:5000');

const ChatManagement = () => {
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isOnline, setIsOnline] = useState(true);
    const scrollRef = useRef(null);


    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { data } = await api.get('/chat/admin/conversations');
                setConversations(data);
            } catch (error) {
                console.error('Fetch conversations error:', error);
            }
        };

        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/chat/settings');
                setIsOnline(data.isSupportOnline);
            } catch (error) {
                console.error('Fetch settings error:', error);
            }
        };

        fetchConversations();
        fetchSettings();


        socket.on('admin_notification', (data) => {
            // Play notification sound
            audioRef.current.play().catch(e => console.log('Audio play blocked'));
            
            // Refresh conversation list
            fetchConversations();
            
            // If current selected conversation matches, add message
            setConversations(prev => {
                const exists = prev.find(c => c._id === data.roomId);
                if (exists) {
                    return prev.map(c => c._id === data.roomId ? { ...c, lastMessage: data.message.message, lastMessageTime: data.message.createdAt, unreadCount: c.unreadCount + 1 } : c);
                } else {
                    return [{ _id: data.roomId, senderName: data.senderName, lastMessage: data.message.message, lastMessageTime: data.message.createdAt, unreadCount: 1 }, ...prev];
                }
            });
        });

        socket.on('receive_message', (message) => {
            if (selectedConv && (message.sender === selectedConv._id || message.guestId === selectedConv._id)) {
                setMessages(prev => [...prev, message]);
                
                // Mark as seen immediately if we are viewing this conversation
                if (!message.isAdmin) {
                    socket.emit('mark_seen', { roomId: selectedConv._id, isAdmin: true });
                }
            } else if (!message.isAdmin) {
                // Refresh list to update last message and unread count
                fetchConversations();
            }
        });

        socket.on('messages_seen', ({ roomId }) => {
            if (selectedConv?._id === roomId) {
                setMessages(prev => prev.map(m => ({ ...m, status: 'seen' })));
            }
        });

        socket.on('support_status_change', (status) => {
            setIsOnline(status);
        });

        return () => {
            socket.off('admin_notification');
            socket.off('receive_message');
            socket.off('messages_seen');
            socket.off('support_status_change');
        };

    }, [user, selectedConv]);

    useEffect(() => {
        if (selectedConv) {
            socket.emit('join_room', selectedConv._id);
            socket.emit('mark_seen', { roomId: selectedConv._id, isAdmin: true });
            
            const fetchHistory = async () => {
                try {
                    const { data } = await api.get(`/chat/${selectedConv._id}`);
                    setMessages(data);
                    
                    // Mark as read in DB
                    api.put(`/chat/read/${selectedConv._id}`, {});
                    setConversations(prev => prev.map(c => c._id === selectedConv._id ? { ...c, unreadCount: 0 } : c));
                } catch (error) {
                    console.error('History fetch error:', error);
                }
            };
            fetchHistory();
        }
    }, [selectedConv, user]);


    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleStatus = async () => {
        try {
            const { data } = await api.put('/chat/settings/toggle');
            setIsOnline(data.isSupportOnline);
            socket.emit('toggle_support_status', data.isSupportOnline);
        } catch (error) {
            console.error('Toggle status error:', error);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && selectedConv) {
            const messageData = {
                sender: user._id,
                senderName: user.name,
                message: input,
                isAdmin: true,
                roomId: selectedConv._id,
            };

            socket.emit('send_message', messageData);
            setInput('');
        }
    };


    const filteredConversations = conversations.filter(c => 
        c.senderName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {/* Sidebar: Conv List */}
            <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <h2 className="text-xl font-black text-blue-950 uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <MessageSquare className="text-blue-700" size={24} />
                        Tin nhắn
                    </h2>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Tìm khách hàng..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-950 transition-all font-medium"
                        />

                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    </div>
                </div>

                {/* Support Status Toggle */}
                <div className="p-4 mx-6 my-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái hỗ trợ</span>
                    <button 
                        onClick={toggleStatus}
                        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isOnline ? 'right-1' : 'left-1'}`}></div>
                    </button>
                </div>


                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Không có trò chuyện</p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <button 
                                key={conv._id}
                                onClick={() => setSelectedConv(conv)}
                                className={`w-full p-6 flex items-start gap-4 transition-all border-b border-slate-100/50 relative ${
                                    selectedConv?._id === conv._id ? 'bg-white shadow-lg z-10' : 'hover:bg-white/50'
                                }`}
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-900 shrink-0">
                                    <User size={20} />
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-sm font-black text-blue-950 truncate">{conv.senderName}</h4>
                                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap ml-2">
                                            {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate font-medium">{conv.lastMessage}</p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="absolute top-6 right-6 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main: Chat Window */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-20 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-blue-950 uppercase tracking-tight">{selectedConv.senderName}</h3>
                                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
                                        Đang trò chuyện
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-100">
                                    <Bell size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto bg-slate-50 space-y-6">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-3xl text-sm font-medium shadow-sm leading-relaxed ${
                                        msg.isAdmin 
                                        ? 'bg-blue-900 text-white rounded-tr-none' 
                                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 px-5 py-4'
                                    }`}>
                                        {msg.message}
                                        <div className={`flex items-center gap-2 text-[9px] mt-2 opacity-50 font-bold ${msg.isAdmin ? 'text-blue-200 justify-end' : 'text-slate-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.isAdmin && (
                                                <span className="uppercase tracking-tighter">
                                                    • {msg.status === 'seen' ? 'Đã xem' : 'Đã gửi'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendMessage} className="p-6 bg-white border-t border-slate-100 flex gap-4">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Viết phản hồi của bạn..."
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-950 transition-all"
                            />

                            <button 
                                type="submit"
                                className="px-8 bg-blue-900 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-950 transition-all shadow-xl shadow-blue-900/20 font-black uppercase text-[11px] tracking-widest"
                            >
                                <Send size={16} />
                                Gửi đi
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-slate-50">
                        <div className="w-24 h-24 bg-white shadow-2xl rounded-3xl flex items-center justify-center mb-10 text-blue-900">
                            <MessageSquare size={48} className="animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-blue-950 uppercase tracking-tighter mb-4">Chào mừng đến với Trung tâm hỗ trợ</h3>
                        <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed">
                            Chọn một khách hàng từ danh sách bên trái để bắt đầu hồi đáp các thắc mắc của họ theo thời gian thực.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatManagement;
