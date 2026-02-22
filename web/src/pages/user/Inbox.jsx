import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2, MessageSquare, MoreVertical } from 'lucide-react';
import { getMyTickets, markMessagesAsRead } from '../../api/tickets';
import socketService from '../../api/socket';

const Inbox = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // ── Unread state — pure in-memory, reconciled from server on load ──────────
  const [unreadTickets, setUnreadTickets] = useState(new Set());

  const addUnread = useCallback((ticketNumber) => {
    setUnreadTickets(prev => {
      if (prev.has(ticketNumber)) return prev;
      const next = new Set(prev);
      next.add(ticketNumber);
      return next;
    });
  }, []);

  const removeUnread = useCallback((ticketNumber) => {
    setUnreadTickets(prev => {
      if (!prev.has(ticketNumber)) return prev;
      const next = new Set(prev);
      next.delete(ticketNumber);
      return next;
    });
  }, []);

  const isUnread = useCallback((ticketNumber) => unreadTickets.has(ticketNumber), [unreadTickets]);

  // ── Fetch tickets ──────────────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    try {
      const data = await getMyTickets();
      const sorted = [...(data || [])].sort((a, b) =>
        new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );
      setTickets(sorted);

      // Reconcile unread from server — source of truth
      const serverUnread = new Set();
      sorted.forEach(t => {
        if (t.unreadCount?.user > 0) serverUnread.add(t.ticketNumber);
      });
      setUnreadTickets(serverUnread);
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (currentUserId) fetchTickets();
    else setLoading(false);
  }, [currentUserId, fetchTickets]);

  // ── Socket ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    socketService.connect();
    setTimeout(() => socketService.joinUserRoom(currentUserId), 100);

    const handleNewMessage = ({ message, ticket }) => {
      setTickets(prev => {
        const exists = prev.find(t => t.ticketNumber === ticket.ticketNumber);
        const updated = exists
          ? prev.map(t => t.ticketNumber === ticket.ticketNumber ? { ...t, ...ticket } : t)
          : [ticket, ...prev];
        return [...updated].sort((a, b) =>
          new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );
      });

      // Only mark unread if message is from admin
      if (message.sender === 'superadmin') {
        addUnread(ticket.ticketNumber);
      }
    };

    const handleTicketUpdated = (updatedTicket) => {
      setTickets(prev => {
        const exists = prev.find(t => t.ticketNumber === updatedTicket.ticketNumber);
        const updated = exists
          ? prev.map(t => t.ticketNumber === updatedTicket.ticketNumber ? updatedTicket : t)
          : [updatedTicket, ...prev];
        return [...updated].sort((a, b) =>
          new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );
      });

      // Sync unread from server data
      if (updatedTicket.unreadCount?.user > 0) {
        addUnread(updatedTicket.ticketNumber);
      } else {
        removeUnread(updatedTicket.ticketNumber);
      }
    };

    const handleTicketClosed = ({ ticket }) => {
      setTickets(prev => prev.map(t =>
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    };

    const handleTicketReopened = ({ ticket }) => {
      setTickets(prev => prev.map(t =>
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    };

    // Use named functions so we can remove exactly these listeners on cleanup
    const socket = socketService.socket;
    socket.on('new-message', handleNewMessage);
    socket.on('ticket-updated', handleTicketUpdated);
    socket.on('ticket-closed', handleTicketClosed);
    socket.on('ticket-reopened', handleTicketReopened);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('ticket-updated', handleTicketUpdated);
      socket.off('ticket-closed', handleTicketClosed);
      socket.off('ticket-reopened', handleTicketReopened);
    };
  }, [currentUserId, addUnread, removeUnread]);

  // ── Click outside menu ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Mark as read ───────────────────────────────────────────────────────────
  const markTicketAsRead = async (ticketNumber) => {
    // Optimistic
    removeUnread(ticketNumber);
    setTickets(prev => prev.map(t =>
      t.ticketNumber === ticketNumber
        ? { ...t, unreadCount: { ...t.unreadCount, user: 0 } }
        : t
    ));
    try {
      await markMessagesAsRead(ticketNumber);
    } catch (error) {
      console.error('❌ Error marking as read:', error);
      // Revert on failure
      addUnread(ticketNumber);
    }
  };

  // ── Mark as unread (optimistic only, no backend endpoint needed) ───────────
  const markTicketAsUnread = (ticketNumber) => {
    addUnread(ticketNumber);
    setTickets(prev => prev.map(t =>
      t.ticketNumber === ticketNumber
        ? { ...t, unreadCount: { ...t.unreadCount, user: 1 } }
        : t
    ));
  };

  const handleTicketPress = async (ticket) => {
    await markTicketAsRead(ticket.ticketNumber);
    navigate('/user/chat', {
      state: {
        ticketNumber: ticket.ticketNumber,
        ticketId: ticket._id || ticket.id,
        displayName: ticket.displayName,
        status: ticket.status,
      },
    });
  };

  const toggleMenu = (e, ticketNumber) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === ticketNumber ? null : ticketNumber);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (diffInHours < 168) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold text-purple-900">Inbox</h1>
          <button
            onClick={() => { setRefreshing(true); fetchTickets(); }}
            disabled={refreshing}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <p className="text-gray-600 mb-6">Your messages and support tickets.</p>

        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          {tickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-1">No tickets yet</p>
              <p className="text-sm text-gray-400">Your support tickets will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tickets.map((ticket) => {
                const ticketNumber = ticket.ticketNumber;
                const hasUnread = isUnread(ticketNumber);
                const isMenuOpen = openMenuId === ticketNumber;

                return (
                  <div
                    key={ticket._id}
                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-4 relative ${hasUnread ? 'bg-purple-50' : ''}`}
                    onClick={() => handleTicketPress(ticket)}
                  >
                    {/* Unread dot */}
                    <div className="w-2 flex-shrink-0">
                      {hasUnread && <div className="w-2 h-2 bg-purple-600 rounded-full" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold truncate ${hasUnread ? 'text-purple-900' : 'text-gray-700'}`}>
                          Ticket #{ticket.ticketNumber || ticket.reportId?.ticketNumber || 'N/A'}
                        </p>
                        {ticket.lastMessageAt && (
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {formatTime(ticket.lastMessageAt)}
                          </span>
                        )}
                      </div>

                      {ticket.lastMessage && (
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-purple-900' : 'text-gray-500'}`}>
                            {ticket.lastMessage}
                          </p>
                          {ticket.reportId?.status && (
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {ticket.reportId.status}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;