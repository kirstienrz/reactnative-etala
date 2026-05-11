import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import socketService from '../api/socket';

// Notification Sound URL
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3';

/**
 * Hook to handle real-time message notifications using react-toastify.
 * Works for both users and superadmins.
 */
const useMessageNotifications = () => {
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Use refs so the effect doesn't re-run on every navigation
  const locationRef = useRef(location);
  const navigateRef = useRef(navigate);

  useEffect(() => { locationRef.current = location; }, [location]);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.play();
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    // Connect socket if not connected
    const socket = socketService.connect();
    const currentUserId = user._id || user.id;
    const userRole = user.role?.toLowerCase();

    // Join appropriate rooms ONCE
    if (userRole === 'superadmin') {
      socketService.joinAdminRoom();
    } else {
      socketService.joinUserRoom(currentUserId);
    }

    const handleNewMessage = ({ message }) => {
      const isMe = 
        message.senderId === currentUserId || 
        (message.sender === userRole && message.senderId === currentUserId);
      
      if (isMe) return;

      // Use ref to get current location
      const loc = locationRef.current;
      const isUserChatPage = loc.pathname === '/user/chat';
      const isAdminChatPage = loc.pathname === '/superadmin/messages';
      
      if (isUserChatPage && loc.state?.ticketNumber === message.ticketNumber) {
        return;
      }
      
      if (isAdminChatPage) {
        return;
      }

      playNotificationSound();
      toast.info(
        <div className="flex flex-col gap-1">
          <p className="font-bold text-blue-800">New Message from {message.senderName}</p>
          <p className="text-sm line-clamp-1">{message.content}</p>
          <p className="text-[10px] opacity-70">Ticket #{message.ticketNumber}</p>
        </div>,
        {
          toastId: `msg-${message._id || Date.now()}`,
          position: "top-right",
          autoClose: 5000,
          className: "notification-wiggle",
          onClick: () => {
            if (userRole === 'superadmin') {
              navigateRef.current('/superadmin/messages', { 
                state: { selectedTicketNumber: message.ticketNumber } 
              });
            } else {
              navigateRef.current('/user/chat', { 
                state: { 
                  ticketNumber: message.ticketNumber,
                  displayName: 'System Admin' 
                } 
              });
            }
          }
        }
      );
    };

    // 📢 New Ticket Notification (Admin Only)
    const handleNewTicket = ({ ticket }) => {
      if (userRole !== 'superadmin') return;
      playNotificationSound();
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-bold text-green-800">🆕 New Report Submitted</p>
          <p className="text-sm">From: {ticket.displayName}</p>
          <p className="text-[10px] opacity-70">Ticket #{ticket.ticketNumber}</p>
        </div>,
        {
          toastId: `ticket-${ticket.ticketNumber || Date.now()}`,
          position: "top-right",
          autoClose: 8000,
          className: "notification-wiggle",
          onClick: () => navigateRef.current('/superadmin/reports')
        }
      );
    };

    // 💡 New Suggestion Notification (Admin Only)
    const handleNewSuggestion = ({ suggestion }) => {
      if (userRole !== 'superadmin') return;
      playNotificationSound();
      toast.info(
        <div className="flex flex-col gap-1">
          <p className="font-bold text-purple-800">💡 New Suggestion Received</p>
          <p className="text-sm line-clamp-2 italic">"{suggestion.text}"</p>
        </div>,
        {
          toastId: `suggestion-${suggestion._id || Date.now()}`,
          position: "top-right",
          autoClose: 6000,
          className: "notification-wiggle",
          onClick: () => navigateRef.current('/superadmin/suggestions')
        }
      );
    };

    // 📅 New Interview Booking (Admin Only)
    const handleNewBooking = ({ event }) => {
      if (userRole !== 'superadmin') return;
      playNotificationSound();
      toast.warning(
        <div className="flex flex-col gap-1">
          <p className="font-bold text-orange-800">📅 New Interview Booked</p>
          <p className="text-sm">Client: {event.extendedProps?.userName}</p>
          <p className="text-xs">Mode: {event.extendedProps?.mode}</p>
        </div>,
        {
          toastId: `booking-${event._id || Date.now()}`,
          position: "top-right",
          autoClose: 8000,
          className: "notification-wiggle",
          onClick: () => navigateRef.current('/superadmin/events')
        }
      );
    };

    // 🔔 Status Update Notification (User Only)
    const handleStatusUpdate = ({ report }) => {
      if (userRole === 'superadmin') return;
      playNotificationSound();
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-bold text-blue-800">🔔 Report Status Updated</p>
          <p className="text-sm text-gray-700">Your report #{report.ticketNumber} is now: <span className="font-bold text-blue-600">{report.status}</span></p>
        </div>,
        {
          toastId: `status-${report._id || Date.now()}`,
          position: "top-right",
          autoClose: 10000,
          className: "notification-wiggle",
          onClick: () => navigateRef.current('/user/consultations')
        }
      );
    };

    socket.on('new-message', handleNewMessage);
    
    if (userRole === 'superadmin') {
      socket.on('new-ticket', handleNewTicket);
      socket.on('new-suggestion', handleNewSuggestion);
      socket.on('new-booking', handleNewBooking);
    } else {
      socket.on('report-status-updated', handleStatusUpdate);
    }

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('new-ticket', handleNewTicket);
      socket.off('new-suggestion', handleNewSuggestion);
      socket.off('new-booking', handleNewBooking);
      socket.off('report-status-updated', handleStatusUpdate);
    };
    // ✅ Only re-run when login state changes, NOT on navigation
  }, [isLoggedIn, user?._id]);
};

export default useMessageNotifications;

