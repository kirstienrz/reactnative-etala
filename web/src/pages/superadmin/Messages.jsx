import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Loader2, Paperclip, Clock, X, ChevronLeft, ChevronRight, MoreVertical, Calendar, AlertCircle, CheckCircle, Mail, Search, Filter } from 'lucide-react';
import { 
  getAllTickets, 
  getTicketMessages, 
  sendTicketMessage,
  markMessagesAsRead,
  markTicketAsUnread, 
} from '../../api/tickets';
import socketService from '../../api/socket';
import { sendBookingLinkEmail } from '../../api/calendar';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'Confirm', cancelText = 'Cancel', isLoading = false }) => {
  if (!isOpen) return null;

  const icons = {
    info: <AlertCircle className="w-12 h-12 text-blue-500" />,
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    warning: <AlertCircle className="w-12 h-12 text-yellow-500" />,
    error: <AlertCircle className="w-12 h-12 text-red-500" />
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            {icons[type]}
            <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">{title}</h3>
            <p className="text-gray-600 whitespace-pre-line">{message}</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Identity Disclosure Modal
const IdentityDisclosureModal = ({ isOpen, onClose, ticketNumber }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-fadeIn">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">User Must Disclose Identity First</h3>
            <p className="text-gray-600 mb-4">
              This user is currently anonymous and cannot book appointments until they disclose their identity.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left w-full">
              <p className="text-sm text-gray-700 mb-2"><strong>User needs to:</strong></p>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Go to <strong>My Reports</strong> page</li>
                <li>Find ticket: <strong>{ticketNumber}</strong></li>
                <li>Click <strong>View Details</strong></li>
                <li>Click <strong>Disclose Identity</strong></li>
                <li>Fill in their personal information</li>
              </ol>
              <p className="text-sm text-gray-700 mt-3">
                Once identity is disclosed, you can send them the appointment booking link.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// Calendar Reminder Modal
const CalendarReminderModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-fadeIn">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-yellow-100 rounded-full p-4 mb-4">
              <Calendar className="w-12 h-12 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Update Your Calendar First</h3>
            <p className="text-gray-600 mb-4">
              Before sending the appointment booking link, please make sure your calendar is up to date.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left w-full">
              <p className="text-sm font-semibold text-gray-900 mb-2">⚠️ Important Reminder:</p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Check if there are any new events or meetings</li>
                <li>• Update your calendar with blocked time slots</li>
                <li>• Mark any unavailable dates or times</li>
                <li>• This prevents double-booking conflicts</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              The user will see your available time slots and choose their preferred appointment time.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Calendar is Updated, Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TicketMessagingSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showTicketList, setShowTicketList] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'open', 'closed', 'unread'
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showCalendarReminder, setShowCalendarReminder] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {}
  });
  
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedTicketRef = useRef(null);

  const [readTickets, setReadTickets] = useState(() => {
    const stored = localStorage.getItem('adminReadTickets');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('adminReadTickets', JSON.stringify(readTickets));
  }, [readTickets]);

  const isTicketRead = (ticketNumber) => {
    return readTickets.includes(ticketNumber);
  };

  const markTicketAsReadLocally = (ticketNumber) => {
    if (!readTickets.includes(ticketNumber)) {
      setReadTickets([...readTickets, ticketNumber]);
    }
  };

  const markTicketAsUnreadLocally = (ticketNumber) => {
    setReadTickets(readTickets.filter(t => t !== ticketNumber));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);

  // Socket initialization
  useEffect(() => {
    console.log('🔌 Initializing socket connection...');
    socketService.connect();
    
    setTimeout(() => {
      console.log('👑 Attempting to join admin room...');
      socketService.joinAdminRoom();
    }, 100);

    socketService.onNewMessage(({ message, ticket }) => {
      console.log('🔥 New message received:', message);
      
      if (selectedTicketRef.current?.ticketNumber === message.ticketNumber) {
        console.log('✅ Ticket match! Adding to messages...');
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      } else {
        if (message.sender === 'user') {
          markTicketAsUnreadLocally(ticket.ticketNumber);
        }
      }

      setTickets(prev => {
        const updatedTickets = prev.map(t => 
          t.ticketNumber === ticket.ticketNumber ? ticket : t
        );
        return [...updatedTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA;
        });
      });
    });

    socketService.onTicketUpdated((updatedTicket) => {
      setTickets(prev => {
        const newTickets = prev.map(t => 
          t.ticketNumber === updatedTicket.ticketNumber ? updatedTicket : t
        );
        const sortedTickets = [...newTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA;
        });
        return sortedTickets;
      });
      
      if (selectedTicketRef.current?.ticketNumber === updatedTicket.ticketNumber) {
        setSelectedTicket(updatedTicket);
      }
    });

    socketService.onTicketClosed(({ ticket, message }) => {
      if (selectedTicketRef.current?.ticketNumber === ticket.ticketNumber) {
        setSelectedTicket(ticket);
        setMessages(prev => [...prev, message]);
      }
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    });

    socketService.onTicketReopened(({ ticket, message }) => {
      if (selectedTicketRef.current?.ticketNumber === ticket.ticketNumber) {
        setSelectedTicket(ticket);
        setMessages(prev => [...prev, message]);
      }
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    });

    socketService.onUserTyping(({ userName, isTyping }) => {
      if (isTyping) {
        setTypingUser(userName);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      } else {
        setTypingUser(null);
      }
    });

    socketService.onMessagesRead(({ ticketNumber, readBy }) => {
      if (selectedTicketRef.current?.ticketNumber === ticketNumber) {
        setMessages(prev => prev.map(msg => ({
          ...msg,
          isRead: msg.sender === 'admin' && readBy === 'user' ? true : msg.isRead
        })));
      }
      
      if (readBy === 'user') {
        setTickets(prev => prev.map(t => 
          t.ticketNumber === ticketNumber 
            ? { ...t, unreadCount: { ...t.unreadCount, admin: 0 }, hasUnreadMessages: false } 
            : t
        ));
      }
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      socketService.joinTicket(selectedTicket.ticketNumber);
      return () => {
        socketService.leaveTicket(selectedTicket.ticketNumber);
      };
    }
  }, [selectedTicket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const handleNavigationState = async () => {
      const state = window.history.state?.usr;
      
      if (state?.selectedTicketNumber && tickets.length > 0) {
        const ticketToSelect = tickets.find(t => t.ticketNumber === state.selectedTicketNumber);
        
        if (ticketToSelect) {
          await handleSelectTicket(ticketToSelect);
        }
        
        window.history.replaceState({}, document.title);
      }
    };
    
    handleNavigationState();
  }, [tickets]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getAllTickets({ sortBy: 'lastMessageAt' });
      setTickets(data);
    } catch (error) {
      console.error('❌ Error loading tickets:', error);
      showModal({
        title: 'Error',
        message: 'Failed to load tickets. Please try again.',
        type: 'error',
        onConfirm: () => setShowConfirmModal(false)
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketNumber) => {
    setLoading(true);
    try {
      const data = await getTicketMessages(ticketNumber, { limit: 50 });
      setMessages(data);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markTicketAsRead = async (ticketNumber) => {
    try {
      await markMessagesAsRead(ticketNumber);
      markTicketAsReadLocally(ticketNumber);
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticketNumber 
          ? { ...t, hasUnreadMessages: false } 
          : t
      ));
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  const handleMarkAsUnread = async (ticketNumber) => {
    try {
      await markTicketAsUnread(ticketNumber);
      markTicketAsUnreadLocally(ticketNumber);
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticketNumber 
          ? { ...t, hasUnreadMessages: true, unreadCount: { ...t.unreadCount, admin: 1 } } 
          : t
      ));
    } catch (error) {
      console.error('❌ Error marking as unread:', error);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketList(false);
    await markTicketAsRead(ticket.ticketNumber);
    await loadMessages(ticket.ticketNumber);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const message = await sendTicketMessage(selectedTicket.ticketNumber, {
        content: newMessage.trim(),
        attachments: []
      });
      
      setMessages(prev => {
        const exists = prev.some(m => m._id === message._id);
        if (!exists) {
          return [...prev, message];
        }
        return prev;
      });
      
      setNewMessage('');
      socketService.sendTyping(selectedTicket.ticketNumber, 'Admin', false);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      showModal({
        title: 'Error',
        message: 'Failed to send message. Please try again.',
        type: 'error',
        onConfirm: () => setShowConfirmModal(false)
      });
    } finally {
      setSending(false);
    }
  };

  const showModal = (config) => {
    setModalConfig(config);
    setShowConfirmModal(true);
  };

  const handleSendAppointmentLink = () => {
    const user = selectedTicket.userId;
    const report = selectedTicket.reportId;
    
    const isAnonymous = !user?.firstName || 
                       !user?.lastName ||
                       !user?.email;
    
    if (isAnonymous) {
      setShowIdentityModal(true);
      return;
    }

    setShowCalendarReminder(true);
  };

  const handleCalendarConfirmed = () => {
    setShowCalendarReminder(false);
    
    const userEmail = selectedTicket.reportId?.personalInfo?.email || 'the user';
    const userName = selectedTicket.displayName || 'User';
    
    showModal({
      title: 'Send Appointment Booking Link?',
      message: `An email will be sent to ${userEmail} with a link to book an appointment.\n\nThe user (${userName}) will be able to:\n• View your available time slots\n• Choose their preferred date and time\n• Book the appointment`,
      type: 'info',
      confirmText: 'Send Link',
      onConfirm: handleConfirmSendLink
    });
  };

  const handleConfirmSendLink = async () => {
    try {
      setIsSending(true);
      
      const ticket = selectedTicket;
      
      if (!ticket) {
        alert("❌ No ticket selected");
        return;
      }

      const userId = ticket.userId?._id || ticket.userId;
      const userEmail = ticket.userId?.email || 
                       ticket.reportId?.email ||
                       ticket.email;
      
      let userName = "";
      
      if (ticket.displayName && ticket.displayName !== "Anonymous User") {
        userName = ticket.displayName;
      }
      else if (ticket.userId?.firstName && ticket.userId?.lastName) {
        userName = `${ticket.userId.firstName} ${ticket.userId.lastName}`;
      }
      else if (ticket.reportId?.firstName && ticket.reportId?.lastName) {
        userName = `${ticket.reportId.firstName} ${ticket.reportId.lastName}`;
      }
      else {
        userName = "User";
      }

      const ticketNumber = ticket.reportId?.ticketNumber || ticket.ticketNumber;

      if (!userId) {
        alert("❌ Error: User ID not found. Cannot send booking link.");
        return;
      }
      
      if (!userEmail) {
        alert("❌ Error: User email not found. Cannot send booking link.");
        return;
      }

      if (!ticketNumber) {
        alert("❌ Error: Ticket number not found.");
        return;
      }

      const response = await sendBookingLinkEmail({
        userId,           
        userEmail,        
        userName,         
        ticketNumber
      });

      if (response.success) {
        alert(`✅ Booking link sent successfully to ${userEmail}!\nLink expires in 24 hours.`);
        setShowConfirmModal(false);
        
        try {
          await sendTicketMessage(ticket.ticketNumber, {
            content: `📅 An appointment booking link has been sent to your email (${userEmail}).\n\nPlease check your inbox and book your preferred consultation date.\n\n⏰ Important: The link is valid for 24 hours only.\n\n✅ Once booked, you will receive a confirmation.`,
            metadata: { type: 'appointment_link' }
          });
        } catch (msgError) {
          console.error("⚠️ Failed to send chat message:", msgError);
        }
      } else {
        alert(`❌ ${response.message || "Failed to send booking link"}`);
      }

    } catch (error) {
      console.error("❌ Error sending appointment link:", error);
      alert(`❌ Error: ${error.message || "Failed to send booking link"}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedTicket && e.target.value.trim()) {
      socketService.sendTyping(selectedTicket.ticketNumber, 'Admin', true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping(selectedTicket.ticketNumber, 'Admin', false);
      }, 2000);
    }
  };

  const toggleMenu = (e, ticketNumber) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === ticketNumber ? null : ticketNumber);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getLastAdminMessageIndex = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'admin') {
        return i;
      }
    }
    return -1;
  };

  const lastAdminMessageIndex = getLastAdminMessageIndex();

  // Filter tickets based on search and filter
  const filteredTickets = tickets.filter(ticket => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      ticket.displayName?.toLowerCase().includes(searchLower) ||
      ticket.ticketNumber?.toLowerCase().includes(searchLower) ||
      ticket.reportId?.ticketNumber?.toLowerCase().includes(searchLower);

    // Status filter
    let matchesFilter = true;
    if (filterStatus === 'open') {
      matchesFilter = ticket.status === 'Open';
    } else if (filterStatus === 'closed') {
      matchesFilter = ticket.status === 'Closed';
    } else if (filterStatus === 'unread') {
      matchesFilter = !isTicketRead(ticket.ticketNumber);
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        isLoading={sending}
      />

      <IdentityDisclosureModal
        isOpen={showIdentityModal}
        onClose={() => setShowIdentityModal(false)}
        ticketNumber={selectedTicket?.reportId?.ticketNumber || selectedTicket?.ticketNumber}
      />

      <CalendarReminderModal
        isOpen={showCalendarReminder}
        onClose={() => setShowCalendarReminder(false)}
        onConfirm={handleCalendarConfirmed}
      />

      {/* Main Container - Messenger-style Layout */}
      <div className="flex bg-white" style={{ height: '100%', overflow: 'hidden' }}>
        {/* Sidebar - Always visible on desktop, toggleable on mobile */}
        <div 
          className={`${
            showTicketList ? 'flex' : 'hidden'
          } md:flex flex-col w-full md:w-96 border-r border-gray-200 bg-white`}
          style={{ 
            height: '100%',
            minHeight: 0
          }}
        >
          {/* Sidebar Header - Fixed */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <button
                onClick={() => setShowTicketList(false)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'unread', 'open', 'closed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterStatus(filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterStatus === filter
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket List - Scrollable */}
          <div 
            className="flex-1 overflow-y-auto"
            style={{ minHeight: 0 }}
          >
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'No tickets match your search' 
                    : 'No tickets found'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTickets.map((ticket) => {
                  const hasUnread = !isTicketRead(ticket.ticketNumber);
                  const isSelected = selectedTicket?.ticketNumber === ticket.ticketNumber;
                  
                  return (
                    <button
                      key={ticket._id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`w-full p-4 text-left transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : hasUnread 
                          ? 'bg-gray-50 hover:bg-gray-100' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                          hasUnread ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          {ticket.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                              {ticket.displayName || 'Anonymous User'}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatDate(ticket.lastMessageAt)}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-1">
                            {ticket.reportId?.ticketNumber || ticket.ticketNumber}
                          </p>

                          {ticket.reportId?.caseStatus && (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                              ticket.status === 'Open'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {ticket.reportId.caseStatus}
                            </span>
                          )}
                        </div>

                        {/* Unread indicator */}
                        {hasUnread && (
                          <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div 
          className={`${showTicketList ? 'hidden md:flex' : 'flex'} flex-col flex-1`} 
          style={{ 
            height: '100%',
            minHeight: 0
          }}
        >
          {selectedTicket ? (
            <>
              {/* Chat Header - Fixed */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowTicketList(true)}
                      className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {selectedTicket.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedTicket.displayName || 'Anonymous User'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedTicket.reportId?.ticketNumber || selectedTicket.ticketNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSendAppointmentLink}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all text-sm font-medium"
                      title="Send appointment booking link"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Appointment
                    </button>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedTicket.status === 'Open' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages - Scrollable */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 bg-gray-50"
                style={{ minHeight: 0 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start the conversation</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((msg, idx) => {
                      const isCurrentUser = msg.sender === 'admin';
                      const isLastAdminMessage = isCurrentUser && idx === lastAdminMessageIndex;
                      const isAppointmentLink = msg.metadata?.type === 'appointment_link';
                      
                      return (
                        <div
                          key={idx}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-md ${
                            isAppointmentLink 
                              ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg' 
                              : isCurrentUser 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white shadow-sm'
                          } rounded-2xl p-3`}>
                            {isAppointmentLink && (
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/30">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-semibold">Appointment Booking</span>
                              </div>
                            )}
                            <p className={`text-sm whitespace-pre-line ${
                              isAppointmentLink || isCurrentUser ? 'text-white' : 'text-gray-900'
                            }`}>
                              {msg.content}
                            </p>
                            {msg.attachments?.length > 0 && (
                              <div className="mt-2 flex items-center gap-1 text-xs opacity-80">
                                <Paperclip className="w-3 h-3" />
                                {msg.attachments.length} attachment(s)
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <span className={`text-xs ${
                                isAppointmentLink || isCurrentUser ? 'text-white/70' : 'text-gray-400'
                              }`}>
                                {formatTime(msg.createdAt)}
                              </span>
                              {isCurrentUser && isLastAdminMessage && msg.isRead && (
                                <span className={`text-xs ${isAppointmentLink ? 'text-white/70' : 'text-blue-200'}`}>
                                  ✓ Read
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {typingUser && (
                      <div className="flex justify-start">
                        <div className="bg-white shadow-sm rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                            <span className="text-xs text-gray-500">{typingUser} is typing</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input - Fixed */}
              {selectedTicket.status === 'Open' && (
                <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
                  {/* Mobile Calendar Button */}
                  <button
                    onClick={handleSendAppointmentLink}
                    className="sm:hidden w-full mb-3 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Calendar className="w-4 h-4" />
                    Send Booking Link
                  </button>

                  <div className="flex gap-3 items-end max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows="1"
                        className="w-full px-4 py-3 pr-12 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        style={{ 
                          minHeight: '44px',
                          maxHeight: '120px',
                          overflowY: 'auto'
                        }}
                        disabled={sending}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="flex-shrink-0 w-11 h-11 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Conversation Selected</h3>
              <p className="text-sm text-gray-500 mb-6">Choose a ticket to start messaging</p>
              <button
                onClick={() => setShowTicketList(true)}
                className="md:hidden px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View Tickets
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default TicketMessagingSystem;