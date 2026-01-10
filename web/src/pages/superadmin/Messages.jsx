import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Loader2, Paperclip, Clock, X, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { 
  getAllTickets, 
  getTicketMessages, 
  sendTicketMessage,
  markMessagesAsRead,
  markTicketAsUnread 
} from '../../api/tickets';
import socketService from '../../api/socket';

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
  
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // 🔥 FIX: Use ref to avoid stale closure
  const selectedTicketRef = useRef(null);

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
      alert('Failed to load tickets');
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
      alert('Failed to send message');
    } finally {
      setSending(false);
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
    <div className="flex h-full bg-gray-50">
      {/* Ticket List Sidebar */}
      <div className={`${showTicketList ? 'block' : 'hidden'} md:block ${
        sidebarCollapsed ? 'md:w-16' : 'w-full md:w-80'
      } bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-gray-200">
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

        <div className="flex-1 overflow-y-auto">
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
                // ✅ Use server-side hasUnreadMessages flag
                const hasUnread = ticket.hasUnreadMessages;
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  
                  return (
                    <div
                      key={idx}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${
                        isCurrentUser ? 'bg-blue-500 text-white' : 'bg-white'
                      } rounded-lg p-3 shadow-sm`}>
                        <p className={`text-sm ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
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
                            isCurrentUser ? 'text-blue-200' : 'text-gray-400'
                          }`}>
                            {formatTime(msg.createdAt)}
                          </span>
                          {/* Read indicator for last admin message */}
                          {isCurrentUser && isLastAdminMessage && msg.isRead && (
                            <span className="text-xs text-blue-200">
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Typing Indicator */}
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

            {/* Message Input */}
            {selectedTicket.status === 'Open' && (
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex gap-2">
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
  );
};

export default TicketMessagingSystem;