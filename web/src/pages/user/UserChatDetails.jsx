import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { getTicketMessages, sendTicketMessage } from "../../api/tickets";
import socketService from "../../api/socket";

const ChatScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ticketStatus, setTicketStatus] = useState(null);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const ticketNumberRef = useRef(null);

  const { 
    ticketNumber, 
    ticketId, 
    displayName, 
    status 
  } = location.state || {};

  useEffect(() => {
    if (!ticketNumber) {
      alert('No ticket selected');
      navigate('/user/inbox');
      return;
    }
    
    ticketNumberRef.current = ticketNumber;
    setTicketStatus(status);
    loadMessages();
  }, [ticketNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 FIX: Setup socket listeners ONCE and cleanup properly
  useEffect(() => {
    if (!ticketNumber) return;

    console.log('🔌 Setting up socket connection for ticket:', ticketNumber);
    socketService.connect();
    socketService.joinTicket(ticketNumber);
    socketService.joinUserRoom(currentUserId);

    // 📩 Listen for new messages
    socketService.onNewMessage(({ message, ticket }) => {
      console.log('🔥 New message received:', message);
      console.log('🔍 Message ticket:', message.ticketNumber);
      console.log('🔍 Current ticket:', ticketNumberRef.current);
      
      if (message.ticketNumber === ticketNumberRef.current) {
        console.log('✅ Ticket match! Adding message...');
        setMessages(prev => {
          console.log('📊 Current messages:', prev.length);
          const exists = prev.some(m => m._id === message._id);
          console.log('🔍 Message exists?', exists);
          
          if (exists) {
            console.log('⚠️ Duplicate message, skipping');
            return prev;
          }
          
          console.log('✅ Adding new message');
          return [...prev, message];
        });
      } else {
        console.log('⚠️ Ticket mismatch, ignoring message');
      }
    });

    // 📩 Listen for ticket closed
    socketService.onTicketClosed(({ ticket, message }) => {
      console.log('🔥 Ticket closed:', ticket);
      if (ticket.ticketNumber === ticketNumberRef.current) {
        setTicketStatus('Closed');
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    // 📩 Listen for ticket reopened
    socketService.onTicketReopened(({ ticket, message }) => {
      console.log('🔥 Ticket reopened:', ticket);
      if (ticket.ticketNumber === ticketNumberRef.current) {
        setTicketStatus('Open');
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
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
    socketService.onMessagesRead(({ ticketNumber: readTicketNumber, readBy }) => {
      console.log('📖 Messages read event received for ticket:', readTicketNumber, 'by:', readBy);
      if (readTicketNumber === ticketNumberRef.current && readBy === 'admin') {
        // Admin read the user's messages
        setMessages(prev => prev.map(msg => ({
          ...msg,
          isRead: msg.sender === 'user' ? true : msg.isRead
        })));
      }
    });

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up socket listeners for ticket:', ticketNumber);
      if (ticketNumberRef.current) {
        socketService.leaveTicket(ticketNumberRef.current);
      }
      socketService.removeAllListeners();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [ticketNumber, currentUserId]); // Only re-run if ticketNumber or userId changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getTicketMessages(ticketNumber, { limit: 100 });
      console.log('📥 Loaded messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error("❌ Error loading messages:", error);
      alert("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !ticketNumber) return;

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: inputText,
      sender: 'user',
      senderName: currentUser?.firstName || currentUser?.name || 'You',
      createdAt: new Date().toISOString(),
      isTemp: true,
      isRead: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    const messageText = inputText;
    setInputText("");
    setSending(true);

    socketService.sendTyping(ticketNumber, currentUser?.firstName || 'You', false);

    try {
      console.log('📤 Sending message to:', ticketNumber);
      const savedMessage = await sendTicketMessage(ticketNumber, {
        content: messageText,
        attachments: []
      });
      
      console.log('✅ Message sent successfully:', savedMessage);
      
      // Remove temp message and add real message
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg._id !== tempMessage._id);
        const exists = filtered.some(m => m._id === savedMessage._id);
        if (!exists) {
          return [...filtered, savedMessage];
        }
        return filtered;
      });
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      alert("Failed to send message");
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
      setInputText(messageText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
    
    if (e.target.value.trim()) {
      const userName = currentUser?.firstName || currentUser?.name || 'User';
      socketService.sendTyping(ticketNumber, userName, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping(ticketNumber, userName, false);
      }, 2000);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Find the last message sent by the user
  const getLastUserMessageIndex = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'user' && !messages[i].isTemp) {
        return i;
      }
    }
    return -1;
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-gray-600 ml-3">Loading chat...</p>
      </div>
    );
  }

  const isTicketClosed = ticketStatus === 'Closed';
  const lastUserMessageIndex = getLastUserMessageIndex();

  return (
    <div className="h-full w-full flex justify-center bg-gray-50">
      <div className="w-full max-w-5xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-purple-900">
                  #{ticketNumber}
                </h1>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  ticketStatus === 'Open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {ticketStatus || 'Open'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Chatting with System Admin
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-1">No messages yet</p>
                <p className="text-sm text-gray-400">
                  Start the conversation with System Admin!
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isMe = message.sender === 'user';
                  const isLastUserMessage = isMe && index === lastUserMessageIndex;

                  return (
                    <div
                      key={message._id || message.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        } ${message.isTemp ? "opacity-60" : ""}`}
                      >
                        <p className="text-sm break-words whitespace-pre-wrap">
                          {message.content || message.text}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span
                            className={`text-xs ${
                              isMe ? "text-purple-200" : "text-gray-500"
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </span>
                          {message.isTemp && (
                            <span
                              className={`text-xs italic ${
                                isMe ? "text-purple-200" : "text-gray-500"
                              }`}
                            >
                              Sending...
                            </span>
                          )}
                          {/* Read indicator for last user message */}
                          {isMe && !message.isTemp && isLastUserMessage && message.isRead && (
                            <span className="text-xs text-purple-200">
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicator */}
                {typingUser && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 rounded-2xl px-4 py-2">
                      <span className="text-sm text-gray-600">
                        {typingUser} is typing...
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
            {isTicketClosed ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  This ticket is closed. You cannot send new messages.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={sending}
                  rows={1}
                  className="flex-1 resize-none bg-white border border-gray-300 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed max-h-32"
                  style={{ minHeight: "42px", maxHeight: "128px" }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="bg-purple-600 text-white rounded-full p-3 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;