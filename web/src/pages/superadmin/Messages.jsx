import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Loader2, Paperclip, Clock, X, ChevronLeft, ChevronRight, Calendar, AlertCircle, CheckCircle, Mail, Search, Trash2, PlusCircle, Copy, Undo2, Archive, RefreshCw, Info, FileText, Download, Filter } from 'lucide-react';
import {
  getAllTickets,
  getTicketMessages,
  sendTicketMessage,
  markMessagesAsRead,
  markTicketAsUnread,
  closeTicket,
  reopenTicket,
} from '../../api/tickets';
import socketService from '../../api/socket';
import { getAllCalendarEvents } from '../../api/calendar';
import { useDispatch } from 'react-redux';
import { setUnreadMessageCount } from '../../store/uiSlice';
import { Capacitor } from '@capacitor/core';
import API from '../../api/config';

// ─── Confirmation Modal ───────────────────────────────────────────────────────
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'Confirm', cancelText = 'Cancel', isLoading = false }) => {
  if (!isOpen) return null;
  const icons = {
    info: <AlertCircle className="w-12 h-12 text-blue-500" />,
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    warning: <AlertCircle className="w-12 h-12 text-yellow-500" />,
    error: <AlertCircle className="w-12 h-12 text-red-500" />,
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
            <button onClick={onClose} disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium">
              {cancelText}
            </button>
            <button onClick={onConfirm} disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TicketMessagingSystem = () => {
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showTicketList, setShowTicketList] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState("active");
  const [readStatusFilter, setReadStatusFilter] = useState("All");
  const [caseStatusFilter, setCaseStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info', onConfirm: () => { } });

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const selectedTicketRef = useRef(null);

  const [unreadTickets, setUnreadTickets] = useState(new Set());
  const manuallyUnreadRef = useRef(new Set());
  const openingTicketRef = useRef(new Set());

  const dispatch = useDispatch();

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

  const addUnreadRef = useRef(addUnread);
  const removeUnreadRef = useRef(removeUnread);
  useEffect(() => { addUnreadRef.current = addUnread; }, [addUnread]);
  useEffect(() => { removeUnreadRef.current = removeUnread; }, [removeUnread]);

  const isUnread = useCallback((ticketNumber) => unreadTickets.has(ticketNumber), [unreadTickets]);
  const unreadCount = unreadTickets.size;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { selectedTicketRef.current = selectedTicket; }, [selectedTicket]);

  useEffect(() => {
    socketService.connect();
    setTimeout(() => socketService.joinAdminRoom(), 100);

    socketService.onNewMessage(({ message, ticket }) => {
      const current = selectedTicketRef.current;
      const isViewingThisChat = current?.ticketNumber === message.ticketNumber;

      if (isViewingThisChat) {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        if (message.sender === 'user') {
          markMessagesAsRead(message.ticketNumber).catch(() => { });
          removeUnreadRef.current(message.ticketNumber);
          manuallyUnreadRef.current.delete(message.ticketNumber);
        }
      } else if (message.sender === 'user') {
        addUnreadRef.current(ticket.ticketNumber);
      }

      setTickets(prev =>
        [...prev.map(t => t.ticketNumber === ticket.ticketNumber ? { ...t, ...ticket } : t)]
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    socketService.onMessagesRead(({ ticketNumber, readBy }) => {
      if (readBy === 'user') {
        if (selectedTicketRef.current?.ticketNumber === ticketNumber) {
          setMessages(prev => prev.map(msg =>
            msg.sender === 'superadmin' ? { ...msg, isRead: true } : msg
          ));
        }
        return;
      }

      if (readBy === 'superadmin') {
        if (selectedTicketRef.current?.ticketNumber === ticketNumber) {
          setMessages(prev => prev.map(msg =>
            msg.sender === 'user' ? { ...msg, isRead: true } : msg
          ));
        }
        if (!manuallyUnreadRef.current.has(ticketNumber)) {
          removeUnreadRef.current(ticketNumber);
        }
      }
    });

    socketService.onTicketUpdated((updatedTicket) => {
      setTickets(prev =>
        [...prev.map(t => t.ticketNumber === updatedTicket.ticketNumber ? updatedTicket : t)]
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
      if (selectedTicketRef.current?.ticketNumber === updatedTicket.ticketNumber) {
        setSelectedTicket(updatedTicket);
      }

      const serverSaysUnread =
        updatedTicket.hasUnreadMessages === true ||
        (updatedTicket.unreadCount?.superadmin > 0);

      if (serverSaysUnread) {
        if (
          selectedTicketRef.current?.ticketNumber !== updatedTicket.ticketNumber &&
          !openingTicketRef.current.has(updatedTicket.ticketNumber)
        ) {
          addUnreadRef.current(updatedTicket.ticketNumber);
        }
      } else {
        if (!manuallyUnreadRef.current.has(updatedTicket.ticketNumber)) {
          removeUnreadRef.current(updatedTicket.ticketNumber);
        }
      }
    });

    socketService.onTicketClosed(({ ticket, message }) => {
      if (selectedTicketRef.current?.ticketNumber === ticket.ticketNumber) {
        setSelectedTicket(ticket);
        setMessages(prev => [...prev, message]);
      }
      setTickets(prev => prev.map(t => t.ticketNumber === ticket.ticketNumber ? ticket : t));
    });

    socketService.onTicketReopened(({ ticket, message }) => {
      if (selectedTicketRef.current?.ticketNumber === ticket.ticketNumber) {
        setSelectedTicket(ticket);
        setMessages(prev => [...prev, message]);
      }
      setTickets(prev => prev.map(t => t.ticketNumber === ticket.ticketNumber ? ticket : t));
    });

    socketService.onUserTyping(({ userName, isTyping }) => {
      if (isTyping) {
        setTypingUser(userName);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      } else {
        setTypingUser(null);
      }
    });

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socketService.off('new-message');
      socketService.off('messages-read');
      socketService.off('ticket-updated');
      socketService.off('ticket-closed');
      socketService.off('ticket-reopened');
      socketService.off('user-typing');
    };
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      const currentTicketNumber = selectedTicket.ticketNumber;
      socketService.joinTicket(currentTicketNumber);

      return () => {
        socketService.leaveTicket(currentTicketNumber);
      };
    }
  }, [selectedTicket?.ticketNumber]);

  useEffect(() => {
    loadTickets();
  }, []);

  const hasHandledNavigationRef = useRef(false);

  useEffect(() => {
    const state = location.state;

    if (state?.selectedTicketNumber && tickets.length > 0 && !hasHandledNavigationRef.current) {
      const t = tickets.find(t => t.ticketNumber === state.selectedTicketNumber);
      if (t) {
        hasHandledNavigationRef.current = true;
        handleSelectTicket(t);
        window.history.replaceState({}, document.title);
      }
    }
  }, [tickets.length]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getAllTickets({ sortBy: 'lastMessageAt' });
      setTickets(data);
      const serverUnreadSet = new Set();
      data.forEach(t => {
        const serverSaysUnread = t.hasUnreadMessages === true || (t.unreadCount?.superadmin > 0);
        if (serverSaysUnread) serverUnreadSet.add(t.ticketNumber);
      });
      setUnreadTickets(serverUnreadSet);
      manuallyUnreadRef.current = new Set();
    } catch {
      showModal({ title: 'Error', message: 'Failed to load tickets. Please try again.', type: 'error', onConfirm: () => setShowConfirmModal(false) });
    } finally { setLoading(false); }
  };

  const loadMessages = async (ticketNumber) => {
    setLoading(true);
    try {
      const data = await getTicketMessages(ticketNumber, { limit: 50 });
      setMessages(data);
    }
    catch {
      console.error('Error loading messages');
    }
    finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = useCallback(async (ticket) => {
    if (selectedTicketRef.current?.ticketNumber === ticket.ticketNumber) {
      return;
    }

    openingTicketRef.current.add(ticket.ticketNumber);
    selectedTicketRef.current = ticket;

    setSelectedTicket(ticket);
    setShowTicketList(false);

    removeUnread(ticket.ticketNumber);
    setTickets(prev => prev.map(t =>
      t.ticketNumber === ticket.ticketNumber
        ? { ...t, hasUnreadMessages: false, unreadCount: { ...t.unreadCount, superadmin: 0 } }
        : t
    ));

    markMessagesAsRead(ticket.ticketNumber).catch(() => { });

    setTimeout(() => {
      openingTicketRef.current.delete(ticket.ticketNumber);
    }, 3000);

    await loadMessages(ticket.ticketNumber);
  }, [removeUnread]);

  const handleMarkAsUnread = async (ticketNumber) => {
    manuallyUnreadRef.current.add(ticketNumber);

    addUnread(ticketNumber);
    setTickets(prev => prev.map(t =>
      t.ticketNumber === ticketNumber
        ? { ...t, hasUnreadMessages: true, unreadCount: { ...t.unreadCount, superadmin: 1 } }
        : t
    ));

    setSelectedTicket(null);
    setShowTicketList(true);

    try {
      await markTicketAsUnread(ticketNumber);
    } catch {
      console.error('Error marking unread');
    }

    setTimeout(() => {
      manuallyUnreadRef.current.delete(ticketNumber);
    }, 5000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSending(true);
    try {
      await sendTicketMessage(selectedTicket.ticketNumber, { content: newMessage.trim(), attachments: [] });
      setNewMessage('');
      socketService.sendTyping(selectedTicket.ticketNumber, 'superadmin', false);
    } catch {
      showModal({ title: 'Error', message: 'Failed to send message. Please try again.', type: 'error', onConfirm: () => setShowConfirmModal(false) });
    } finally { setSending(false); }
  };

  const handleToggleStatus = async (ticketToToggle = selectedTicket) => {
    if (!ticketToToggle) return;
    const isClosing = ticketToToggle.status === 'Open';

    showModal({
      title: isClosing ? 'Archive Conversation?' : 'Reopen Conversation?',
      message: isClosing
        ? 'This will mark the ticket as closed/archived. You can still view it later in the Archived filter.'
        : 'This will reopen the ticket for active messaging.',
      type: isClosing ? 'warning' : 'info',
      confirmText: isClosing ? 'Archive' : 'Reopen',
      onConfirm: async () => {
        try {
          if (isClosing) {
            await closeTicket(ticketToToggle.ticketNumber, 'Closed by superadmin');
          } else {
            await reopenTicket(ticketToToggle.ticketNumber);
          }
          setShowConfirmModal(false);
        } catch (error) {
          alert('Failed to update status');
        }
      }
    });
  };

  const showModal = (config) => { setModalConfig(config); setShowConfirmModal(true); };

  useEffect(() => {
    dispatch(setUnreadMessageCount(unreadCount));
  }, [unreadCount]);

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedTicket && e.target.value.trim()) {
      socketService.sendTyping(selectedTicket.ticketNumber, 'superadmin', true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => socketService.sendTyping(selectedTicket.ticketNumber, 'superadmin', false), 2000);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date), now = new Date(), diff = now - d;
    const mins = Math.floor(diff / 60000), hrs = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };
  const formatTime = (ts) => new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const lastAdminIdx = (() => { for (let i = messages.length - 1; i >= 0; i--) { if (messages[i].sender === 'superadmin') return i; } return -1; })();

  const filteredTickets = tickets.filter(ticket => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || ticket.displayName?.toLowerCase().includes(q) || ticket.ticketNumber?.toLowerCase().includes(q) || ticket.reportId?.ticketNumber?.toLowerCase().includes(q);

    const isArchived = ticket.status === 'Closed' || ticket.reportId?.caseStatus === 'For Referral' || ticket.reportId?.caseStatus === 'Case Closed';
    const matchTab = activeTab === 'archived' ? isArchived : !isArchived;

    const matchRead = readStatusFilter === 'All' ? true
      : readStatusFilter === 'Read' ? !isUnread(ticket.ticketNumber)
        : isUnread(ticket.ticketNumber);

    const matchCaseStatus = caseStatusFilter === 'All' ? true : ticket.reportId?.caseStatus === caseStatusFilter;

    return matchSearch && matchTab && matchRead && matchCaseStatus;
  });

  const activeFilterCount = [
    readStatusFilter !== "All",
    caseStatusFilter !== "All"
  ].filter(Boolean).length;

  return (
    <>
      <ConfirmationModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={modalConfig.onConfirm} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} confirmText={modalConfig.confirmText} cancelText={modalConfig.cancelText} isLoading={sending} />

      <div className="flex w-full max-w-full bg-white" style={{ height: '100%', overflow: 'hidden' }}>

        {/* ── Sidebar ── */}
        <div className={`${showTicketList ? 'flex' : 'hidden'} flex-col w-full md:w-96 border-r border-gray-200 bg-white transition-all duration-300 ease-in-out`} style={{ height: '100%', minHeight: 0 }}>
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
            <div className="flex justify-end md:hidden mb-2">
              <button onClick={() => setShowTicketList(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            <div className="flex flex-col gap-3">
              {/* Active / Archived Tabs */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`flex-1 whitespace-nowrap px-3 py-2 rounded-xl font-bold transition-all duration-200 ${activeTab === "active"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTab("archived")}
                  className={`flex-1 whitespace-nowrap px-3 py-2 rounded-xl font-bold transition-all duration-200 ${activeTab === "archived"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                >
                  Archived
                </button>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors w-full ${showFilters || activeFilterCount > 0
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
              >
                <Filter size={16} />
                <span className="text-sm">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold border border-blue-200">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Read Status</label>
                    <select
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      value={readStatusFilter}
                      onChange={(e) => setReadStatusFilter(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Unread">Unread</option>
                      <option value="Read">Read</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Case Status</label>
                    <select
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      value={caseStatusFilter}
                      onChange={(e) => setCaseStatusFilter(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="For Queuing">For Queuing</option>
                      <option value="For Interview">For Interview</option>
                      <option value="Internal">Internal</option>
                      <option value="External">External</option>
                      <option value="Case Closed">Case Closed</option>
                    </select>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setReadStatusFilter("All");
                        setCaseStatusFilter("All");
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium text-left mt-1"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {loading ? (
              <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">{searchQuery || activeFilterCount > 0 || activeTab === 'archived' ? 'No tickets match your search' : 'No tickets found'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTickets.map(ticket => {
                  const ticketUnread = isUnread(ticket.ticketNumber);
                  const isSelected = selectedTicket?.ticketNumber === ticket.ticketNumber;

                  return (
                    <button key={ticket._id} onClick={() => handleSelectTicket(ticket)}
                      className={`w-full p-4 text-left transition-all duration-150 ${isSelected
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : ticketUnread
                          ? 'bg-red-50/40 hover:bg-red-50/70 border-l-4 border-red-400'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}>
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg transition-colors duration-200 ${ticketUnread ? 'bg-blue-500' : 'bg-gray-400'}`}>
                            {ticket.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-sm truncate transition-all duration-150 ${ticketUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {ticket.reportId?.identifiedUserId
                                ? `${ticket.reportId.identifiedUserId.firstName} ${ticket.reportId.identifiedUserId.lastName}`
                                : (ticket.displayName || 'Anonymous User')}
                            </span>
                            <span className={`text-xs ml-2 flex-shrink-0 transition-colors duration-150 ${ticketUnread ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                              {formatDate(ticket.lastMessageAt)}
                            </span>
                          </div>
                          <p className={`text-xs mb-1.5 transition-colors duration-150 ${ticketUnread ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                            {ticket.reportId?.ticketNumber || ticket.ticketNumber}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            {ticket.reportId?.caseStatus && (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {ticket.reportId.caseStatus === 'Case Closed' ? 'Archived (Closed)' :
                                  ticket.reportId.caseStatus === 'For Referral' ? 'Archived (Referred)' :
                                    ticket.reportId.caseStatus}
                              </span>
                            )}
                            <div className="flex items-center gap-2 ml-auto">
                              {ticket.status === 'Open' ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleStatus(ticket); }}
                                  className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                  title="Archive Ticket"
                                >
                                  <Archive size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleStatus(ticket); }}
                                  className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                  title="Reopen Ticket"
                                >
                                  <RefreshCw size={14} />
                                </button>
                              )}
                              {ticketUnread && !isSelected && (
                                <span className="flex items-center gap-1 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping inline-block" />
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        <div className={`${showTicketList ? 'hidden md:flex' : 'flex'} flex-col flex-1 min-w-0 w-full overflow-hidden`} style={{ height: '100%', minHeight: 0 }}>
          {selectedTicket ? (
            <>
              <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => setShowTicketList(!showTicketList)} className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors" title={showTicketList ? "Hide Sidebar" : "Show Sidebar"}>
                      {showTicketList ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {selectedTicket.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{selectedTicket.displayName || 'Anonymous User'}</h3>
                      <p className="text-xs text-gray-500 truncate">{selectedTicket.reportId?.ticketNumber || selectedTicket.ticketNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleMarkAsUnread(selectedTicket.ticketNumber)} title="Mark as unread"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700 flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleToggleStatus(selectedTicket)}
                      className={`flex items-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex-shrink-0 ${selectedTicket.status === 'Open'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-600 hover:text-white'
                        : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-600 hover:text-white'
                        }`}
                      title={selectedTicket.status === 'Open' ? 'Archive' : 'Reopen'}
                    >
                      {selectedTicket.status === 'Open' ? (
                        <>
                          <Archive size={16} />
                          <span className="hidden sm:inline">Archive</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} />
                          <span className="hidden sm:inline">Reopen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ minHeight: 0 }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4"><Mail className="w-8 h-8 text-gray-400" /></div>
                    <p className="text-sm">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((msg, idx) => {
                      const isAdmin = msg.sender === 'superadmin', isLast = isAdmin && idx === lastAdminIdx, isAppt = msg.metadata?.type === 'appointment_link';
                      return (
                        <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] sm:max-w-md rounded-2xl p-3 ${isAppt ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg' : isAdmin ? 'bg-blue-500' : 'bg-white shadow-sm'}`}>
                            {isAppt && <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/30"><Calendar className="w-4 h-4 text-white" /><span className="text-xs font-semibold text-white">Appointment Booking</span></div>}
                            <p className={`text-sm whitespace-pre-line break-words ${isAppt || isAdmin ? 'text-white' : 'text-gray-900'}`}>{msg.content}</p>

                            {/* Attachments Section */}
                            {msg.attachments?.length > 0 && (
                              <div className="mt-3 space-y-2 border-t border-white/20 pt-2">
                                {msg.attachments.map((file, fIdx) => {
                                  const isPdf = file.type === 'application/pdf' || file.fileName?.endsWith('.pdf');
                                  const handleDownload = async (e) => {
                                    e.preventDefault();

                                    if (Capacitor.isNative) {
                                      try {
                                        let absoluteUrl = file.uri;
                                        if (file.uri.startsWith('/')) {
                                          const apiBase = API.defaults.baseURL || '';
                                          const serverBase = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
                                          absoluteUrl = `${serverBase}${file.uri}`;
                                        }
                                        window.open(absoluteUrl, '_system');
                                        return;
                                      } catch (err) {
                                        console.error('System download failed:', err);
                                      }
                                    }

                                    try {
                                      let url;
                                      const token = localStorage.getItem('token');
                                      const isApiUrl = file.uri && (file.uri.includes('localhost:') || file.uri.startsWith('/'));
                                      const fetchOptions = isApiUrl && token ? { headers: { Authorization: `Bearer ${token}` } } : {};

                                      const response = await fetch(file.uri, fetchOptions);
                                      if (!response.ok && !file.uri.startsWith('data:')) {
                                        throw new Error('Network response was not ok');
                                      }

                                      const blob = await response.blob();
                                      const isPdf = file.type === 'application/pdf' || file.fileName?.endsWith('.pdf');
                                      const finalBlob = isPdf ? new Blob([blob], { type: 'application/pdf' }) : blob;
                                      url = window.URL.createObjectURL(finalBlob);

                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = file.fileName || `Attachment_${Date.now()}`;
                                      document.body.appendChild(link);
                                      link.click();

                                      setTimeout(() => {
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                      }, 100);
                                    } catch (err) {
                                      console.error('Download failed:', err);
                                      window.open(file.uri, '_blank');
                                    }
                                  };
                                  return (
                                    <div
                                      key={fIdx}
                                      onClick={handleDownload}
                                      className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group border shadow-sm w-full min-w-0 ${isAdmin
                                        ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                                        : "bg-white hover:bg-blue-50 text-gray-700 border-gray-200 hover:border-blue-200"
                                        }`}
                                      title={`Download ${file.fileName || 'Attachment'}`}
                                    >
                                      <div className={`p-2.5 rounded-lg transition-colors ${isAdmin ? "bg-white/20 group-hover:bg-white/30" : "bg-blue-50 group-hover:bg-blue-100"}`}>
                                        {isPdf ? <FileText className={isAdmin ? "text-white" : "text-blue-600"} size={20} /> : <Paperclip className={isAdmin ? "text-white" : "text-blue-600"} size={20} />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${isAdmin ? "text-white" : "text-gray-900"}`}>
                                          {file.fileName || (isPdf ? 'Official Report.pdf' : 'Attachment')}
                                        </p>
                                        <p className={`text-[10px] font-medium tracking-wide uppercase ${isAdmin ? "text-blue-100/60" : "text-gray-500"}`}>
                                          {isPdf ? '📄 Official Document' : (file.type?.split('/')[1]?.toUpperCase() || "FILE")}
                                        </p>
                                      </div>
                                      <div className={`p-2 rounded-lg transition-all ${isAdmin ? "text-white/40 group-hover:text-white" : "text-gray-300 group-hover:text-blue-600 group-hover:bg-blue-100"}`}>
                                        <Download size={18} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <span className={`text-xs ${isAppt || isAdmin ? 'text-white/70' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</span>
                              {isAdmin && isLast && msg.isRead && <span className="text-xs text-blue-200">✓ Read</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {typingUser && (
                      <div className="flex justify-start">
                        <div className="bg-white shadow-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 0.2, 0.4].map(d => <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />)}
                          </div>
                          <span className="text-xs text-gray-500">{typingUser} is typing</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {selectedTicket.status === 'Open' && (
                <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
                  <div className="flex gap-3 items-end max-w-4xl mx-auto">
                    <div className="flex-1">
                      <textarea value={newMessage} onChange={handleTyping} onKeyPress={handleKeyPress} placeholder="Type a message..." rows="1" disabled={sending}
                        className="w-full px-4 py-3 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        style={{ minHeight: '44px', maxHeight: '120px', overflowY: 'auto' }} />
                    </div>
                    <button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}
                      className="flex-shrink-0 w-11 h-11 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center shadow-md active:scale-95 duration-150">
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6"><Mail className="w-12 h-12 text-gray-400" /></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Conversation Selected</h3>
              <p className="text-sm text-gray-500 mb-6">Choose a ticket to start messaging</p>
              <button onClick={() => setShowTicketList(true)} className={`${showTicketList ? 'hidden' : 'block'} px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105`}>View Tickets</button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </>
  );
};

export default TicketMessagingSystem;