import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, X, ChevronRight, Inbox, FileText, Lightbulb, Calendar, Info } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllRead } from '../api/notifications';
import socketService from '../api/socket';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const userRole = user?.role?.toLowerCase();

  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch on mount so the badge count shows immediately
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  // ✅ Also refresh when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // ✅ Poll every 30 seconds to keep badge count fresh
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Listen for real-time updates (use existing socket, don't reconnect)
  useEffect(() => {
    if (!isLoggedIn) return;

    const refresh = () => fetchNotifications();

    const attachListeners = () => {
      const socket = socketService.socket;
      if (!socket) return false;

      socket.on('new-message', refresh);
      socket.on('new-ticket', refresh);
      socket.on('new-suggestion', refresh);
      socket.on('new-booking', refresh);
      socket.on('report-status-updated', refresh);
      return true;
    };

    // Try immediately, retry after 1s if socket not ready yet
    if (!attachListeners()) {
      const retry = setTimeout(() => attachListeners(), 1000);
      return () => clearTimeout(retry);
    }

    return () => {
      const socket = socketService.socket;
      if (!socket) return;
      socket.off('new-message', refresh);
      socket.off('new-ticket', refresh);
      socket.off('new-suggestion', refresh);
      socket.off('new-booking', refresh);
      socket.off('report-status-updated', refresh);
    };
  }, [isLoggedIn]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    setIsOpen(false);
    
    // Prepare navigation state based on notification type
    let navigationState = {};
    
    if (notification.metadata?.ticketNumber) {
      // For ticket/message notifications
      navigationState = { selectedTicketNumber: notification.metadata.ticketNumber };
    } else if (notification.metadata?.eventId) {
      // For booking/event notifications - open the event details (view only)
      navigationState = { 
        openDetailsModal: true, 
        eventId: notification.metadata.eventId 
      };
    }
    
    // Navigate to the link with state
    navigate(notification.link, { state: navigationState });

    // Mark as read
    try {
      if (!notification.isRead) {
        await markAsRead(notification._id);
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
      }
    } catch (e) {
      console.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'message': return <MessageSquare size={20} />;
      case 'ticket': return <FileText size={20} />;
      case 'suggestion': return <Lightbulb size={20} />;
      case 'booking': return <Calendar size={20} />;
      case 'status_update': return <Info size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getIconColor = (type, isRead) => {
    if (isRead) return 'bg-gray-100 text-gray-400';
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-600';
      case 'ticket': return 'bg-green-100 text-green-600';
      case 'suggestion': return 'bg-purple-100 text-purple-600';
      case 'booking': return 'bg-orange-100 text-orange-600';
      case 'status_update': return 'bg-blue-100 text-blue-600';
      default: return 'bg-purple-100 text-purple-600';
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all ${unreadCount > 0 ? 'animate-bell-ring' : ''}`}
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="sm:hidden fixed inset-0 bg-black/40 z-[9998]" onClick={() => setIsOpen(false)} />

          {/* Mobile Bottom Sheet */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-purple-600 font-medium">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm text-gray-400">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="text-purple-300" size={28} />
                  </div>
                  <p className="text-gray-700 font-semibold">All caught up!</p>
                  <p className="text-xs text-gray-400 mt-1">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => (
                    <button
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full px-5 py-4 flex gap-3 text-left active:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-purple-50/30' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type, notification.isRead)}`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${!notification.isRead ? 'text-purple-500' : 'text-gray-400'}`}>
                            {notification.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-sm font-semibold leading-snug ${!notification.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{notification.content}</p>
                      </div>
                      {!notification.isRead && <div className="w-2 h-2 rounded-full bg-purple-500 self-center flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 pb-safe">
              <button
                onClick={() => { setIsOpen(false); navigate(userRole === 'superadmin' ? '/superadmin/notifications' : '/user/inbox'); }}
                className="w-full py-3 bg-purple-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2"
              >
                <Inbox size={16} />
                View All Notifications
              </button>
            </div>
          </div>

          {/* Desktop Dropdown */}
          <div className="hidden sm:block absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[10000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
              <div>
                <h3 className="font-bold text-purple-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-purple-600 hover:underline mt-0.5">
                    Mark all as read
                  </button>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-600 font-medium">All caught up!</p>
                  <p className="text-xs text-gray-400 mt-1">No new notifications at the moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => (
                    <button
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full p-4 flex gap-3 text-left hover:bg-purple-50/30 transition-colors group ${!notification.isRead ? 'bg-purple-50/10' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type, notification.isRead)}`}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${!notification.isRead ? 'text-purple-600' : 'text-gray-400'}`}>
                            {notification.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-sm font-bold truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-xs truncate mt-0.5 ${!notification.isRead ? 'text-gray-600' : 'text-gray-400'}`}>
                          {notification.content}
                        </p>
                      </div>
                      {!notification.isRead && <div className="w-2 h-2 rounded-full bg-purple-600 self-center flex-shrink-0" />}
                      <div className="flex items-center">
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
              <button
                onClick={() => { setIsOpen(false); navigate(userRole === 'superadmin' ? '/superadmin/notifications' : '/user/inbox'); }}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center justify-center gap-1 mx-auto"
              >
                <Inbox size={14} />
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .animate-bell-ring {
          animation: ring 2s ease infinite;
          transform-origin: 50% 0%;
        }
        @keyframes ring {
          0% { transform: rotate(0); }
          5% { transform: rotate(15deg); }
          10% { transform: rotate(-12deg); }
          15% { transform: rotate(10deg); }
          20% { transform: rotate(-8deg); }
          25% { transform: rotate(6deg); }
          30% { transform: rotate(-4deg); }
          35% { transform: rotate(2deg); }
          40% { transform: rotate(-1deg); }
          45% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
