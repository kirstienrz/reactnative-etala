import React, { useState, useEffect, useRef } from 'react';
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

  // ✅ Track read tickets in localStorage (like AdminReports)
  const [readTickets, setReadTickets] = useState(() => {
    const stored = localStorage.getItem('userReadTickets');
    return stored ? JSON.parse(stored) : [];
  });

  // ✅ Save read tickets to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userReadTickets', JSON.stringify(readTickets));
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

  useEffect(() => {
    if (currentUserId) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [currentUserId]);

  // 🔥 Setup Socket.IO for real-time updates
  useEffect(() => {
    if (!currentUserId) {
      console.log('⚠️ No currentUserId, skipping socket setup');
      return;
    }

    console.log('🔌 Setting up socket connection for user inbox');
    console.log('👤 Current User ID:', currentUserId);
    
    socketService.connect();
    
    // Wait a bit for connection before joining room
    setTimeout(() => {
      console.log('📍 Joining user room:', `user-${currentUserId}`);
      socketService.joinUserRoom(currentUserId);
    }, 100);

    // 📩 Listen for new messages
    socketService.onNewMessage(({ message, ticket }) => {
      console.log('🔥 New message received in inbox:', message);
      console.log('📊 Updated ticket from new-message:', ticket);
      
      // Update ticket list with latest data and sort by most recent
      setTickets(prev => {
        console.log('📊 Current tickets count:', prev.length);
        
        // Check if this is a completely new ticket (not in the list yet)
        const existingTicket = prev.find(t => t.ticketNumber === ticket.ticketNumber);
        
        let updatedTickets;
        if (!existingTicket) {
          // 🆕 NEW TICKET: Add it to the list and mark as UNREAD
          console.log('🆕 New ticket detected, adding to inbox as unread');
          updatedTickets = [ticket, ...prev];
          
          // 🔥 Mark new tickets as unread in localStorage
          markTicketAsUnreadLocally(ticket.ticketNumber);
        } else {
          // Existing ticket: update it
          updatedTickets = prev.map(t => 
            t.ticketNumber === ticket.ticketNumber ? ticket : t
          );
          
          // 🔥 If message is from admin, mark as unread
          if (message.sender === 'admin') {
            console.log('📨 Admin replied, marking as unread');
            markTicketAsUnreadLocally(ticket.ticketNumber);
          }
        }
        
        // 🔥 Sort tickets: most recent message first (like Messenger)
        const sorted = [...updatedTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA;
        });
        
        console.log('✅ Updated tickets, new count:', sorted.length);
        return sorted;
      });
    });

    // 📩 Listen for ticket updates (status changes, read receipts, etc.)
    socketService.onTicketUpdated((updatedTicket) => {
      console.log('🔥 ✅✅✅ Ticket updated in inbox:', updatedTicket);
      console.log('📊 Updated ticket details:', {
        ticketNumber: updatedTicket.ticketNumber,
        unreadCount: updatedTicket.unreadCount,
        hasUnreadMessagesForUser: updatedTicket.hasUnreadMessagesForUser
      });
      
      setTickets(prev => {
        console.log('📊 Updating ticket in list...');
        
        // Check if this ticket exists in the list
        const existingTicket = prev.find(t => t.ticketNumber === updatedTicket.ticketNumber);
        
        let newTickets;
        if (!existingTicket) {
          // 🆕 NEW TICKET: Add it to the list and mark as UNREAD
          console.log('🆕 New ticket detected via update event, adding to inbox as unread');
          newTickets = [updatedTicket, ...prev];
          markTicketAsUnreadLocally(updatedTicket.ticketNumber);
        } else {
          // Update the existing ticket
          console.log('✅ Found matching ticket, updating');
          newTickets = prev.map(t => {
            if (t.ticketNumber === updatedTicket.ticketNumber) {
              return updatedTicket;
            }
            return t;
          });
        }
        
        // 🔥 Sort tickets: most recent message first
        const sorted = [...newTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA;
        });
        
        console.log('📊 Tickets after update:', sorted.map(t => ({
          ticketNumber: t.ticketNumber,
          unreadCount: t.unreadCount,
          lastMessageAt: t.lastMessageAt
        })));
        
        return sorted;
      });
    });

    // 📩 Listen for ticket closed
    socketService.onTicketClosed(({ ticket }) => {
      console.log('🔥 Ticket closed in inbox:', ticket);
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    });

    // 📩 Listen for ticket reopened
    socketService.onTicketReopened(({ ticket }) => {
      console.log('🔥 Ticket reopened in inbox:', ticket);
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    });

    return () => {
      console.log('🧹 Cleaning up inbox socket listeners');
      socketService.removeAllListeners();
    };
  }, [currentUserId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getMyTickets();
      console.log('📥 Loaded user tickets:', data);
      
      // Sort by most recent message
      const sortedTickets = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.lastMessageAt);
        const dateB = new Date(b.lastMessageAt);
        return dateB - dateA;
      });
      
      setTickets(sortedTickets);
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    }
    if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // ✅ Mark ticket as read on server AND locally
  const markTicketAsRead = async (ticketNumber) => {
    try {
      await markMessagesAsRead(ticketNumber);
      console.log('✅ Marked ticket as read:', ticketNumber);
      
      // Update localStorage
      markTicketAsReadLocally(ticketNumber);
      
      // Update local state immediately for responsiveness
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticketNumber 
          ? { ...t, unreadCount: { ...t.unreadCount, user: 0 } } 
          : t
      ));
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  // ❌ Mark ticket as unread (localStorage only since no backend endpoint)
  const markTicketAsUnread = (ticketNumber) => {
    // Update localStorage
    markTicketAsUnreadLocally(ticketNumber);
    
    // Update local state
    setTickets(prev => prev.map(t => 
      t.ticketNumber === ticketNumber 
        ? { ...t, unreadCount: { ...t.unreadCount, user: 1 } } 
        : t
    ));
  };

  const handleTicketPress = async (ticket) => {
    // Mark as read when opening
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
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold text-purple-900">Inbox</h1>
          <button 
            onClick={handleRefresh} 
            disabled={refreshing} 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <p className="text-gray-600 mb-6">Your messages and support tickets.</p>

        {/* Tickets List */}
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
                const timeStamp = ticket.lastMessageAt ? formatTime(ticket.lastMessageAt) : '';
                const ticketNumber = ticket.ticketNumber;
                
                // ✅ Check localStorage first, then fall back to server unreadCount
                const hasUnread = !isTicketRead(ticketNumber) || (ticket.unreadCount?.user > 0);
                const isMenuOpen = openMenuId === ticketNumber;

                return (
                  <div
                    key={ticket._id}
                    className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-4 relative ${
                      hasUnread ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => handleTicketPress(ticket)}
                  >
                    {/* Unread indicator */}
                    <div className="w-2 flex-shrink-0">
                      {hasUnread && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold truncate ${hasUnread ? 'text-purple-900' : 'text-gray-700'}`}>
                          Ticket #{ticket.ticketNumber || ticket.reportId?.ticketNumber || 'N/A'}
                        </p>
                        {timeStamp && (
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {timeStamp}
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

                      {/* Status Badge */}
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          ticket.status === 'Open'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    {/* Three Dots Menu */}
                    <div className="relative flex-shrink-0" ref={isMenuOpen ? menuRef : null}>
                      <button
                        onClick={(e) => toggleMenu(e, ticketNumber)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          {hasUnread ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markTicketAsRead(ticketNumber);
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
                                markTicketAsUnread(ticketNumber);
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