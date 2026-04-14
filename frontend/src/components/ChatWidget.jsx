import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';


const socket = io('http://localhost:5000');

const ChatWidget = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [isSupportOnline, setIsSupportOnline] = useState(true);

    const [guestId, setGuestId] = useState(localStorage.getItem('chatGuestId') || '');
    const scrollRef = useRef(null);
    const isOpenRef = useRef(isOpen);
    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);




    const roomId = user ? user._id : guestId;

    useEffect(() => {
        if (!user && !guestId) {
            const newGuestId = 'guest_' + Math.random().toString(36).substr(2, 9);
            setGuestId(newGuestId);
            localStorage.setItem('chatGuestId', newGuestId);
        }
    }, [user, guestId]);

    useEffect(() => {
        if (roomId) {
            socket.emit('join_room', roomId);
            
            // Fetch history
            const fetchHistory = async () => {
                try {
                    const { data } = await api.get(`/chat/${roomId}`);
                    setMessages(data);
                } catch (error) {
                    console.error('Fetch history error:', error);
                }
            };
            
            const fetchSettings = async () => {
                try {
                    const { data } = await api.get('/chat/settings');
                    setIsSupportOnline(data.isSupportOnline);
                } catch (error) {
                    console.error('Fetch settings error:', error);
                }
            };

            fetchHistory();
            fetchSettings();
        }


        socket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
            
            // Use Ref to avoid stale closure
            if (message.isAdmin && !isOpenRef.current) {
                setUnreadCount(prev => prev + 1);
                audioRef.current.play().catch(e => console.log('Audio play blocked'));
            } else if (message.isAdmin && isOpenRef.current) {
                // If open, mark as seen immediately
                socket.emit('mark_seen', { roomId, isAdmin: false });
            }
        });


        socket.on('messages_seen', ({ roomId: seenRoomId }) => {
            if (roomId === seenRoomId) {
                setMessages(prev => prev.map(m => ({ ...m, status: 'seen' })));
            }
        });

        socket.on('support_status_change', (status) => {
            setIsSupportOnline(status);
        });

        return () => {
            socket.off('receive_message');
            socket.off('messages_seen');
            socket.off('support_status_change');
        };

    }, [roomId, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        if (isOpen) {
            setUnreadCount(0);
            socket.emit('mark_seen', { roomId, isAdmin: false });
            
            // Also call API to clear DB
            api.put(`/chat/read/${roomId}`, {});
        }
    }, [messages, isOpen, roomId]);



    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && roomId) {
            const messageData = {
                sender: user ? user._id : null,
                guestId: !user ? guestId : null,
                senderName: user ? user.name : 'Khách hàng',
                message: input,
                isAdmin: false,
                roomId: roomId,
            };

            socket.emit('send_message', messageData);
            setInput('');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Chat Bubble */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-blue-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform animate-bounce-slow relative"
                >
                    <MessageCircle size={28} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </button>
            )}


            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-[350px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-blue-900 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
                                <User size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Hỗ trợ khách hàng</h3>
                                <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${isSupportOnline ? 'bg-emerald-400' : 'bg-slate-400'}`}></div>
                                    <span className="text-[10px] text-blue-200">
                                        {isSupportOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
                                    </span>
                                </div>

                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-xs text-slate-400 font-medium italic">Chào mừng bạn đến với J2Car! <br/> Hãy để lại tin nhắn nếu bạn cần hỗ trợ nhé.</p>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm ${
                                    msg.isAdmin 
                                    ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100' 
                                    : 'bg-blue-900 text-white rounded-tr-none'
                                }`}>
                                    {msg.message}
                                    <div className={`flex items-center gap-1 text-[8px] mt-1 opacity-50 ${msg.isAdmin ? 'text-slate-400' : 'text-blue-100 justify-end'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {!msg.isAdmin && (
                                            <span className="uppercase tracking-tighter decoration-0">
                                                • {msg.status === 'seen' ? 'Đã xem' : 'Đã gửi'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>

                    {/* Input Area */}
                    <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập nội dung..."
                            className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900/10"
                        />

                        <button 
                            type="submit"
                            className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
