import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Loader2, Paperclip, Clock, X, ChevronLeft, ChevronRight, MoreVertical, Calendar, AlertCircle, CheckCircle, Mail } from 'lucide-react';
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
  const [showTicketList, setShowTicketList] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
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
  const ticketListRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // 🔥 FIX: Use ref to avoid stale closure
  const selectedTicketRef = useRef(null);

  // ✅ Track read tickets in localStorage (like AdminReports)
  const [readTickets, setReadTickets] = useState(() => {
    const stored = localStorage.getItem('adminReadTickets');
    return stored ? JSON.parse(stored) : [];
  });

  // ✅ Save read tickets to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminReadTickets', JSON.stringify(readTickets));
  }, [readTickets]);

  // ✅ Helper functions for read/unread status
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

  // 🔥 Update ref whenever selectedTicket changes
  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);

  // 🔥 Initialize Socket.IO - Setup ONCE
  useEffect(() => {
    console.log('🔌 Initializing socket connection...');
    socketService.connect();
    
    // Small delay to ensure connection before joining room
    setTimeout(() => {
      console.log('👑 Attempting to join admin room...');
      socketService.joinAdminRoom();
    }, 100);

    // 📩 Listen for new messages
    socketService.onNewMessage(({ message, ticket }) => {
      console.log('🔥 New message received:', message);
      console.log('🔍 Message ticket:', message.ticketNumber);
      console.log('🔍 Current ticket:', selectedTicketRef.current?.ticketNumber);
      
      // Update messages if viewing this ticket
      if (selectedTicketRef.current?.ticketNumber === message.ticketNumber) {
        console.log('✅ Ticket match! Adding to messages...');
        setMessages(prev => {
          console.log('📊 Current messages:', prev.length);
          const exists = prev.some(m => m._id === message._id);
          console.log('🔍 Message exists?', exists);
          
          if (exists) {
            console.log('⚠️ Duplicate, skipping');
            return prev;
          }
          
          console.log('✅ Adding message');
          return [...prev, message];
        });
      } else {
        console.log('⚠️ Different ticket, updating list only');
        // ✅ Mark as unread if it's a new message from user
        if (message.sender === 'user') {
          markTicketAsUnreadLocally(ticket.ticketNumber);
        }
      }

      // ✅ Always update ticket list with latest data and sort by most recent
      setTickets(prev => {
        const updatedTickets = prev.map(t => 
          t.ticketNumber === ticket.ticketNumber ? ticket : t
        );
        
        // 🔥 Sort tickets: most recent message first (like Messenger)
        return [...updatedTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA; // Most recent first
        });
      });
    });

    // 📩 Listen for ticket updates
    socketService.onTicketUpdated((updatedTicket) => {
      console.log('🔥 Ticket updated:', updatedTicket);
      console.log('📊 Updated ticket hasUnreadMessages:', updatedTicket.hasUnreadMessages);
      console.log('📊 Updated ticket unreadCount:', updatedTicket.unreadCount);
      
      setTickets(prev => {
        // Update the ticket in the list
        const newTickets = prev.map(t => 
          t.ticketNumber === updatedTicket.ticketNumber ? updatedTicket : t
        );
        
        // 🔥 Sort tickets: most recent message first (like Messenger)
        const sortedTickets = [...newTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA; // Most recent first
        });
        
        console.log('📊 Tickets after update:', sortedTickets.map(t => ({ 
          ticketNumber: t.ticketNumber, 
          hasUnreadMessages: t.hasUnreadMessages,
          unreadCount: t.unreadCount,
          lastMessageAt: t.lastMessageAt
        })));
        
        return sortedTickets;
      });
      
      // Also update selected ticket if it's the one that was updated
      if (selectedTicketRef.current?.ticketNumber === updatedTicket.ticketNumber) {
        setSelectedTicket(updatedTicket);
      }
    });

    // 📩 Listen for ticket closed
    socketService.onTicketClosed(({ ticket, message }) => {
      console.log('🔥 Ticket closed:', ticket);
      if (selectedTicketRef.current?.ticketNumber === ticket.ticketNumber) {
        setSelectedTicket(ticket);
        setMessages(prev => [...prev, message]);
      }
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    });

    // 📩 Listen for ticket reopened
    socketService.onTicketReopened(({ ticket, message }) => {
      console.log('🔥 Ticket reopened:', ticket);
      if (selectedTicketRef.current?.ticketNumber === ticket.ticketNumber) {
        setSelectedTicket(ticket);
        setMessages(prev => [...prev, message]);
      }
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    });

    // 📩 Listen for typing
    socketService.onUserTyping(({ userName, isTyping }) => {
      console.log('👤 Typing event:', userName, isTyping);
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

    // 📩 Listen for read receipts
    socketService.onMessagesRead(({ ticketNumber, readBy }) => {
      console.log('📖 Messages read event received for ticket:', ticketNumber, 'by:', readBy);
      
      // Update messages in current view
      if (selectedTicketRef.current?.ticketNumber === ticketNumber) {
        setMessages(prev => prev.map(msg => ({
          ...msg,
          // Mark messages as read based on who read them
          isRead: msg.sender === 'admin' && readBy === 'user' ? true : msg.isRead
        })));
      }
      
      // ✅ Update ticket list to show as read (for admin view)
      // Only update hasUnreadMessages if user read the admin's messages
      if (readBy === 'user') {
        setTickets(prev => prev.map(t => 
          t.ticketNumber === ticketNumber 
            ? { ...t, unreadCount: { ...t.unreadCount, admin: 0 }, hasUnreadMessages: false } 
            : t
        ));
      }
    });

    // Cleanup only typing timeout, keep socket connected
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // 🔥 Join/leave ticket rooms when selection changes
  useEffect(() => {
    if (selectedTicket) {
      console.log('🎫 Joining ticket room:', selectedTicket.ticketNumber);
      socketService.joinTicket(selectedTicket.ticketNumber);
      
      // Only leave the room when switching tickets, not when unmounting
      return () => {
        console.log('🚪 Leaving ticket room:', selectedTicket.ticketNumber);
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

  // 🔥 NEW: Handle pre-selected ticket from navigation (from Reports page)
  useEffect(() => {
    const handleNavigationState = async () => {
      // Get state from navigation (passed from Reports page)
      const state = window.history.state?.usr;
      
      if (state?.selectedTicketNumber && tickets.length > 0) {
        console.log('🎯 Pre-selecting ticket from navigation:', state.selectedTicketNumber);
        
        // Find the ticket in the loaded tickets
        const ticketToSelect = tickets.find(t => t.ticketNumber === state.selectedTicketNumber);
        
        if (ticketToSelect) {
          console.log('✅ Found ticket, selecting it:', ticketToSelect);
          await handleSelectTicket(ticketToSelect);
        } else {
          console.log('⚠️ Ticket not found in list:', state.selectedTicketNumber);
        }
        
        // Clear the navigation state so it doesn't auto-select on refresh
        window.history.replaceState({}, document.title);
      }
    };
    
    handleNavigationState();
  }, [tickets]); // Run when tickets are loaded

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getAllTickets({ sortBy: 'lastMessageAt' });
      console.log('📥 Loaded tickets:', data);
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
      console.log('📥 Loaded messages:', data);
      setMessages(data);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark ticket as read on server
  const markTicketAsRead = async (ticketNumber) => {
    try {
      await markMessagesAsRead(ticketNumber);
      console.log('✅ Marked ticket as read:', ticketNumber);
      
      // Update local storage
      markTicketAsReadLocally(ticketNumber);
      
      // Update local state
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticketNumber 
          ? { ...t, hasUnreadMessages: false } 
          : t
      ));
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  // ❌ Mark ticket as unread (calls API to update server and broadcasts via socket)
  const handleMarkAsUnread = async (ticketNumber) => {
    try {
      await markTicketAsUnread(ticketNumber);
      console.log('✅ Marked ticket as unread:', ticketNumber);
      
      // Update local storage
      markTicketAsUnreadLocally(ticketNumber);
      
      // Update will come via socket event, but update local state immediately for responsiveness
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
    
    console.log('🔍 Selected ticket:', ticket);
    console.log('🔍 Using ticketNumber:', ticket.ticketNumber);
    
    // ✅ Mark as read when opening
    await markTicketAsRead(ticket.ticketNumber);
    
    await loadMessages(ticket.ticketNumber);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      console.log('📤 Sending to ticketNumber:', selectedTicket.ticketNumber);
      
      const message = await sendTicketMessage(selectedTicket.ticketNumber, {
        content: newMessage.trim(),
        attachments: []
      });
      
      console.log('✅ Message sent:', message);
      
      // 🔥 FIX: Add message immediately for instant feedback
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

  // Show modal helper
  const showModal = (config) => {
    setModalConfig(config);
    setShowConfirmModal(true);
  };

  // 🔥 NEW: Handle sending appointment booking link
  const handleSendAppointmentLink = () => {
    // First check if user is anonymous
    const user = selectedTicket.userId;
  const report = selectedTicket.reportId;
  
  // ✅ Check if user exists and has required info
  const isAnonymous = !user?.firstName || 
                     !user?.lastName ||
                     !user?.email;
  
  console.log('🔍 Checking user data:', {
    hasUser: !!user,
    hasReport: !!report,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    reportIsAnonymous: report?.isAnonymous,
    finalResult: isAnonymous
  });
  
  if (isAnonymous) {
    setShowIdentityModal(true);
    return;
  }

  setShowCalendarReminder(true);
};

  // 🔥 After calendar reminder confirmed
  const handleCalendarConfirmed = () => {
    setShowCalendarReminder(false);
    
    // Show final confirmation
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

  // 🔥 Actually send the booking link
// Replace your handleConfirmSendLink function in Messages.jsx with this:

const handleConfirmSendLink = async () => {
  try {
    setIsSending(true);
    
    // ✅ Use selectedTicket (not selectedMessage)
    const ticket = selectedTicket;
    
    if (!ticket) {
      alert("❌ No ticket selected");
      return;
    }

    console.log("🔍 FULL TICKET DATA:", JSON.stringify(ticket, null, 2));

    // ✅ Extract user ID from ticket.userId
    const userId = ticket.userId?._id || ticket.userId;
    
    // ✅ Get email - try multiple sources
    const userEmail = ticket.userId?.email || 
                     ticket.reportId?.email ||
                     ticket.email;
    
    // ✅ Get name - try multiple sources
    let userName = "";
    
    // Try displayName first (this is what shows in the UI)
    if (ticket.displayName && ticket.displayName !== "Anonymous User") {
      userName = ticket.displayName;
    }
    // Try userId object
    else if (ticket.userId?.firstName && ticket.userId?.lastName) {
      userName = `${ticket.userId.firstName} ${ticket.userId.lastName}`;
    }
    // Try reportId
    else if (ticket.reportId?.firstName && ticket.reportId?.lastName) {
      userName = `${ticket.reportId.firstName} ${ticket.reportId.lastName}`;
    }
    // Fallback
    else {
      userName = "User";
    }

    // ✅ Get ticket number
    const ticketNumber = ticket.reportId?.ticketNumber || ticket.ticketNumber;

    console.log("📤 Extracted data:", {
      userId,
      userEmail,
      userName,
      ticketNumber,
      ticketUserId: ticket.userId,
      ticketReportId: ticket.reportId
    });

    // ✅ Validate required fields
    if (!userId) {
      console.error("❌ Missing userId. Available data:", {
        ticketUserId: ticket.userId,
        hasUserId: !!ticket.userId,
        userIdType: typeof ticket.userId
      });
      alert("❌ Error: User ID not found. Cannot send booking link.");
      return;
    }
    
    if (!userEmail) {
      console.error("❌ Missing email. Available data:", {
        ticketUserIdEmail: ticket.userId?.email,
        ticketReportIdEmail: ticket.reportId?.email,
        ticketEmail: ticket.email
      });
      alert("❌ Error: User email not found. Cannot send booking link.");
      return;
    }

    if (!ticketNumber) {
      console.error("❌ Missing ticket number. Available data:", {
        ticketReportIdTicketNumber: ticket.reportId?.ticketNumber,
        ticketTicketNumber: ticket.ticketNumber
      });
      alert("❌ Error: Ticket number not found.");
      return;
    }

    console.log("✅ All validation passed. Sending booking link...");

    // ✅ Send booking link
    const response = await sendBookingLinkEmail({
      userId,           
      userEmail,        
      userName,         
      ticketNumber
    });

    if (response.success) {
      alert(`✅ Booking link sent successfully to ${userEmail}!\nLink expires in 24 hours.`);
      setShowConfirmModal(false);
      
      // ✅ Optional: Send a message in the chat
      try {
        await sendTicketMessage(ticket.ticketNumber, {
          content: `📅 An appointment booking link has been sent to your email (${userEmail}).\n\nPlease check your inbox and book your preferred consultation date.\n\n⏰ Important: The link is valid for 24 hours only.\n\n✅ Once booked, you will receive a confirmation.`,
          metadata: { type: 'appointment_link' }
        });
        
        console.log("✅ Sent notification message to chat");
      } catch (msgError) {
        console.error("⚠️ Failed to send chat message:", msgError);
        // Don't block the success flow if chat message fails
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

  // Find the last message sent by admin
  const getLastAdminMessageIndex = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'admin') {
        return i;
      }
    }
    return -1;
  };

  const lastAdminMessageIndex = getLastAdminMessageIndex();

  return (
    <>
      {/* Confirmation Modal */}
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

      {/* Identity Disclosure Modal */}
      <IdentityDisclosureModal
        isOpen={showIdentityModal}
        onClose={() => setShowIdentityModal(false)}
        ticketNumber={selectedTicket?.reportId?.ticketNumber || selectedTicket?.ticketNumber}
      />

      {/* Calendar Reminder Modal */}
      <CalendarReminderModal
        isOpen={showCalendarReminder}
        onClose={() => setShowCalendarReminder(false)}
        onConfirm={handleCalendarConfirmed}
      />

      {/* 🔥 Main container - takes full available height from parent */}
      <div className="flex bg-gray-50" style={{ height: '100%', overflow: 'hidden' }}>
        {/* 🔥 TICKET LIST SIDEBAR */}
        <div 
          className={`${showTicketList ? 'block' : 'hidden'} md:block ${
            sidebarCollapsed ? 'md:w-16' : 'w-full md:w-80'
          } bg-white border-r border-gray-200 transition-all duration-300`}
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0
          }}
        >
          {/* FIXED HEADER */}
          <div 
            className="p-4 border-b border-gray-200"
            style={{ 
              flexShrink: 0
            }}
          >
            <div className="flex items-center justify-between mb-4">
              {!sidebarCollapsed && (
                <h2 className="text-xl font-bold text-gray-900">Tickets</h2>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden md:block p-1 hover:bg-gray-100 rounded transition-colors"
                  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setShowTicketList(false)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* SCROLLABLE TICKET LIST */}
          <div 
            ref={ticketListRef}
            style={{ 
              flex: '1 1 auto',
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {!sidebarCollapsed && <p>No tickets found</p>}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tickets.map((ticket) => {
                  const hasUnread = !isTicketRead(ticket.ticketNumber);
                  const isMenuOpen = openMenuId === ticket.ticketNumber;
                  const isSelected = selectedTicket?.ticketNumber === ticket.ticketNumber;
                  
                  return (
                    <div
                      key={ticket._id}
                      className={`relative flex items-stretch transition-colors ${
                        isSelected 
                          ? 'bg-blue-100' 
                          : hasUnread 
                          ? 'bg-blue-50 hover:bg-blue-100' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <button
                        onClick={() => handleSelectTicket(ticket)}
                        className="flex-1 p-4 text-left bg-transparent"
                        title={sidebarCollapsed ? `${ticket.reportId?.ticketNumber || ticket.ticketNumber} - ${ticket.displayName}` : ''}
                      >
                        {sidebarCollapsed ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${hasUnread ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <div className="w-2 flex-shrink-0 pt-1">
                              {hasUnread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-sm ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
                                      {ticket.reportId?.ticketNumber || ticket.ticketNumber}
                                    </span>
                                  </div>
                                  <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                    {ticket.displayName}
                                  </p>
                                  {ticket.reportId?.caseStatus && (
                                    <span className="text-xs text-gray-500">
                                      {ticket.reportId.caseStatus}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(ticket.lastMessageAt)}
                              </div>
                            </div>
                          </div>
                        )}
                      </button>

                      {!sidebarCollapsed && (
                        <div className="relative flex items-center pr-4" ref={isMenuOpen ? menuRef : null}>
                          <button
                            onClick={(e) => toggleMenu(e, ticket.ticketNumber)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              {hasUnread ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markTicketAsRead(ticket.ticketNumber);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  Mark as read
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsUnread(ticket.ticketNumber);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  Mark as unread
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 🔥 CHAT AREA */}
        <div 
          className="flex-1"
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0
          }}
        >
          {selectedTicket ? (
            <>
              {/* FIXED CHAT HEADER */}
              <div 
                className="bg-white border-b border-gray-200 p-4 flex items-center justify-between"
                style={{ 
                  flexShrink: 0
                }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowTicketList(true)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedTicket.reportId?.ticketNumber || selectedTicket.ticketNumber}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedTicket.displayName}</p>
                    {selectedTicket.reportId?.caseStatus && (
                      <p className="text-xs text-gray-400">{selectedTicket.reportId.caseStatus}</p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedTicket.status === 'Open' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedTicket.status}
                </span>
              </div>

              {/* SCROLLABLE MESSAGES */}
              <div 
                ref={messagesContainerRef}
                className="p-4 space-y-4"
                style={{ 
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  minHeight: 0
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isCurrentUser = msg.sender === 'admin';
                    const isLastAdminMessage = isCurrentUser && idx === lastAdminMessageIndex;
                    const isAppointmentLink = msg.metadata?.type === 'appointment_link';
                    
                    return (
                      <div
                        key={idx}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg ${
                          isAppointmentLink 
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-2 border-purple-300' 
                            : isCurrentUser 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white'
                        } rounded-lg p-3 shadow-sm`}>
                          {isAppointmentLink && (
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/30">
                              <Mail className="w-4 h-4" />
                              <span className="text-xs font-semibold">Appointment Booking Link Sent</span>
                            </div>
                          )}
                          <p className={`text-sm whitespace-pre-line ${
                            isAppointmentLink || isCurrentUser ? 'text-white' : 'text-gray-900'
                          }`}>
                            {msg.content}
                          </p>
                          {msg.attachments?.length > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-xs">
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
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {typingUser && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 rounded-lg px-4 py-2">
                      <span className="text-sm text-gray-600">
                        {typingUser} is typing...
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* FIXED MESSAGE INPUT */}
              {selectedTicket.status === 'Open' && (
                <div 
                  className="bg-white border-t border-gray-200 p-4"
                  style={{ 
                    flexShrink: 0
                  }}
                >
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendAppointmentLink}
                      className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2"
                      title="Send appointment booking link to user's email"
                    >
                      <Calendar className="w-5 h-5" />
                      <span className="hidden sm:inline text-sm font-medium">Send Booking Link</span>
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a ticket to start messaging</p>
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