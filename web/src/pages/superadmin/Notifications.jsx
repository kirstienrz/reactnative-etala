import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MessageSquare, 
  FileText, 
  Lightbulb, 
  Calendar, 
  Info, 
  Search, 
  Filter, 
  CheckCircle2, 
  Trash2, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { getNotifications, markAsRead, markAllRead } from '../../api/notifications';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    
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
    
    navigate(notification.link, { state: navigationState });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-purple-600" />
            Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            You have {unreadCount} unread notifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-purple-600 bg-white border border-purple-100 rounded-xl hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={18} />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="flex items-center p-4 border-b border-gray-100 gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`text-sm font-bold pb-1 transition-all whitespace-nowrap ${filter === 'all' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`text-sm font-bold pb-1 transition-all whitespace-nowrap ${filter === 'unread' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Unread
            {unreadCount > 0 && <span className="ml-2 bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-[10px]">{unreadCount}</span>}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`text-sm font-bold pb-1 transition-all whitespace-nowrap ${filter === 'read' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Read
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="text-gray-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No notifications found</h3>
              <p className="text-gray-500 mt-1">When you receive alerts, they will appear here.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-6 flex gap-4 hover:bg-gray-50 transition-all cursor-pointer group relative ${!notification.isRead ? 'bg-purple-50/10' : ''}`}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600"></div>
                )}
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${getIconColor(notification.type, notification.isRead)}`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase tracking-widest ${!notification.isRead ? 'text-purple-600' : 'text-gray-400'}`}>
                        {notification.type.replace('_', ' ')}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className={`text-base font-bold mb-1 ${!notification.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                    {notification.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${!notification.isRead ? 'text-gray-600' : 'text-gray-400'}`}>
                    {notification.content}
                  </p>
                </div>

                <div className="flex items-center ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2 bg-white border border-gray-100 rounded-lg text-purple-600 shadow-sm">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
