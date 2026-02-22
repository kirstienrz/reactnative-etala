import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setUnreadMessageCount } from '../store/uiSlice';
import { getAllTickets } from '../api/tickets';
import socketService from '../api/socket';

const useUnreadMessages = (isActive = false) => {
  const dispatch = useDispatch();
  const countRef = useRef(0);
  const initializedRef = useRef(false);

  const syncFromServer = async () => {
    try {
      const data = await getAllTickets({ sortBy: 'lastMessageAt' });
      const count = data.filter(t =>
        t.hasUnreadMessages === true || (t.unreadCount?.superadmin > 0)
      ).length;
      countRef.current = count;
      dispatch(setUnreadMessageCount(count));
    } catch {
      console.error('Failed to fetch unread count');
    }
  };

  useEffect(() => {
    // Hindi mag-initialize kung hindi superadmin
    if (!isActive) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 1. Fetch agad on mount
    syncFromServer();

    // 2. Connect socket
    const socket = socketService.connect();

    const handleNewMessage = ({ message }) => {
      if (message.sender === 'user') {
        countRef.current += 1;
        dispatch(setUnreadMessageCount(countRef.current));
      }
    };

    const handleTicketUpdated = () => {
      syncFromServer();
    };

    const setupListeners = () => {
      socketService.joinAdminRoom();
      socket.on('new-message', handleNewMessage);
      socket.on('ticket-updated', handleTicketUpdated);
    };

    if (socket.connected) {
      setupListeners();
    } else {
      socket.once('connect', setupListeners);
    }

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('ticket-updated', handleTicketUpdated);
      socket.off('connect', setupListeners);
    };
  }, [isActive]);
};

export default useUnreadMessages;
