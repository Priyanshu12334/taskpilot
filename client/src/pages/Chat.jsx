import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Loader2, Trash2 } from 'lucide-react';
import { socket } from '../socket';
import api from '../services/api';
import clsx from 'clsx';
import Sidebar from '../components/Sidebar';

// Shared socket instance imported above

// Module-level caches to prevent flashing loading states when returning to Chat
let cachedForUserId = null;
let cachedMessages = null;

const ChatMessageSkeleton = ({ isSelf }) => (
  <div className={clsx("flex flex-col max-w-[75%] animate-pulse-subtle", isSelf ? "ml-auto items-end" : "mr-auto items-start")}>
    {!isSelf && <div className="h-3 w-16 bg-slate-800 rounded mb-1.5 px-1"></div>}
    <div className={clsx(
      "relative rounded-2xl px-3 py-2 text-sm shadow-sm min-w-[120px] max-w-[280px] sm:max-w-[400px]",
      isSelf ? "bg-green-800/40 text-white rounded-br-none" : "bg-violet-900/40 text-slate-100 border border-slate-700/50 rounded-tl-none"
    )}>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-700/60 rounded w-5/6"></div>
        <div className="h-3.5 bg-slate-700/60 rounded w-2/3"></div>
      </div>
      <div className="h-2.5 w-8 bg-slate-700/60 rounded mt-2.5 self-end ml-auto"></div>
    </div>
  </div>
);

export default function Chat() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Clear user cache if user changes
  if (cachedForUserId !== user?._id) {
    cachedMessages = null;
    cachedForUserId = user?._id;
  }

  const messagesEndRef = useRef(null);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [messages, setMessages] = useState(cachedMessages || []);
  const [loadingMessages, setLoadingMessages] = useState(!cachedMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  // Socket Connection & Listeners
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get('/messages');
        const history = res.data.map(m => ({
          _id: m._id,
          user: m.user,
          name: m.name,
          text: m.text,
          timestamp: m.createdAt
        }));
        setMessages(history);
        cachedMessages = history;
      } catch (error) {
        console.error("Failed to load chat history", error);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();

    socket.connect();

    socket.on('receiveMessage', (messageData) => {
      setMessages((prev) => {
        const next = [...prev, messageData];
        cachedMessages = next;
        return next;
      });
    });

    socket.on('messageDeleted', (messageId) => {
      setMessages((prev) => {
        const next = prev.filter(msg => msg._id !== messageId);
        cachedMessages = next;
        return next;
      });
    });

    socket.on('userTyping', (name) => {
      setTypingUser(name);
    });

    socket.on('userStopTyping', () => {
      setTypingUser(null);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('messageDeleted');
      socket.off('userTyping');
      socket.off('userStopTyping');
      socket.disconnect();
    };
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    // Clear existing timeout to restart debounce timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (e.target.value.trim() === '') {
      socket.emit('stopTyping');
      return;
    }

    // Ping the active user flag
    socket.emit('typing', user?.name);

    // Apply the 1.5 seconds debounce
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping');
    }, 1500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const messageData = {
      userId: user?._id,
      name: user?.name || 'Anonymous',
      text: inputMessage,
      // No longer generating timestamp here, relying strictly on server save 
    };

    socket.emit('sendMessage', messageData);
    setInputMessage('');
    socket.emit('stopTyping');
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {} 
    finally {
      setTimeout(() => {
        logout();
        navigate('/login', { replace: true });
      }, 600);
    }
  };

  return (
    <div className="h-screen h-[100dvh] bg-slate-900 text-white flex flex-col sm:flex-row overflow-hidden relative overflow-x-hidden">
      
      {/* Subtle Green Ambient Glows - Top-Left & Bottom-Right */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-emerald-500/10 rounded-full blur-3xl z-0" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-emerald-500/10 rounded-full blur-3xl z-0" />

      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden pt-16 sm:pt-0 p-3 sm:p-10 relative z-10">
        <header className="p-3 sm:p-2 flex items-center justify-between shrink-0 border-b border-slate-800/50 bg-slate-800/20 backdrop-blur-sm">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1 text-white">
              Team Chat
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">Here discuss your problems with the team.</p>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 no-scrollbar min-h-0">
          {loadingMessages ? (
            <div className="space-y-4">
              <ChatMessageSkeleton isSelf={false} />
              <ChatMessageSkeleton isSelf={true} />
              <ChatMessageSkeleton isSelf={false} />
              <ChatMessageSkeleton isSelf={true} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
              <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isSelf = msg.user === user?._id;
              const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit'
              });

              return (
                <div
                  key={idx}
                  className={clsx(
                    'flex flex-col max-w-[80%] sm:max-w-[75%] group',
                    isSelf ? 'ml-auto items-end' : 'mr-auto items-start'
                  )}
                >
                  {/* Sender name — only for received messages */}
                  {!isSelf && (
                    <span className="text-[12px] font-semibold text-slate-200 mb-1 px-1">
                      {msg.name}
                    </span>
                  )}

                  {/* Bubble */}
                  <div className={clsx(
                    'relative group/bubble rounded-2xl px-3 py-2 text-sm break-words shadow-sm',
                    isSelf
                      ? 'bg-green-700 text-white rounded-br-none'
                      : 'bg-violet-900 text-slate-100 border border-slate-700/50 rounded-bl-none'
                  )}>
                    {/* Message text + timestamp row */}
                    <div className="flex flex-col gap-1 font-sans">
                      {/* Message text — with right padding on sent msgs to clear delete button */}
                      <p className={clsx('leading-snug', isSelf && 'pr-7')}>
                        {msg.text}
                      </p>

                      {/* Timestamp — inside bubble, bottom-right */}
                      <span className={clsx(
                        'text-[10px] leading-none self-end',
                        isSelf ? 'text-slate-200' : 'text-slate-400'
                      )}>
                        {timeStr}
                      </span>
                    </div>

                    {/* Delete button — own messages only, appears on hover */}
                    {isSelf && (
                      <button
                        onClick={() => socket.emit('deleteMessage', { messageId: msg._id, userId: user._id })}
                        className="absolute top-2 right-2 p-1 text-white/50 hover:text-red-400 hover:bg-black/20 rounded-full opacity-100 sm:opacity-0 sm:group-hover/bubble:opacity-100 transition-all duration-150"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        {typingUser && (
          <div className="px-4 sm:px-8 py-1.5 text-xs italic text-slate-400 bg-slate-800/80 border-t border-slate-800/50 shrink-0">
            {typingUser} is typing...
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-3 sm:p-0 shrink-0 border-t sm:border-t-0 border-slate-800/50 bg-slate-900/40 sm:bg-transparent backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 bg-slate-700 border border-slate-800 rounded-3xl px-4 py-2.5 sm:py-3 text-sm font-medium text-slate-200 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="bg-green-700 hover:bg-green-600 text-white p-2.5 sm:p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-4" />
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
