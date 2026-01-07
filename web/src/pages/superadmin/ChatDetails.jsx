import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { sendMessage, getMessages, createOrGetChat } from "../../api/chat";

const ChatScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);

  const isSuperAdmin = currentUser?.role === "superadmin";

  const hasInterviewInvite = messages.some(
    (m) => m.type === "SYSTEM" && m.action === "PROCEED_TO_INTERVIEW"
  );

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get params from location state
  const { receiverId, receiverName, chatId: existingChatId } = location.state || {};

  useEffect(() => {
    console.log('📱 Current User ID:', currentUserId);
    console.log('🎯 Route params:', { receiverId, receiverName, existingChatId });

    if (!receiverId) {
      console.error("❌ Receiver ID is missing from route params");
      alert("Error: Receiver ID is missing");
      navigate(-1);
      return;
    }

    if (currentUserId) {
      initializeChat();
    }
  }, [receiverId, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      console.log("🔄 Initializing chat with receiver:", receiverId);

      let chatDataId = existingChatId;

      if (!chatDataId) {
        const chatData = await createOrGetChat(receiverId);
        console.log("💬 Chat data received:", chatData);
        chatDataId = chatData._id || chatData.id;
      } else {
        console.log("💬 Using existing chatId:", chatDataId);
      }

      setChatId(chatDataId);

      const messagesData = await getMessages(chatDataId);
      console.log("📩 Messages loaded:", messagesData.length);
      setMessages(messagesData);
    } catch (error) {
      console.error("❌ Error initializing chat:", error);
      alert("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();

    if (!inputText.trim() || !chatId) return;

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: inputText,
      sender: { _id: currentUserId },
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    const messageText = inputText;
    setInputText("");
    setSending(true);

    try {
      console.log("📤 Sending message:", { chatId, receiverId, messageText });

      const savedMessage = await sendMessage(chatId, receiverId, messageText);
      console.log("✅ Message saved:", savedMessage);

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? savedMessage : msg))
      );

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

  const sendProceedToInterview = async () => {
    if (!chatId || !receiverId) return;

    try {
      // Frontend
      await sendMessage(chatId, receiverId, "Proceed to Interview", "SYSTEM", "PROCEED_TO_INTERVIEW");



      const updated = await getMessages(chatId);
      setMessages(updated);
    } catch (err) {
      console.error("Failed to send interview invite", err);
      alert("Failed to send interview invite");
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 -m-6" style={{ height: '100vh' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {receiverName?.charAt(0).toUpperCase() || 'U'}
        </div>

        <div className="flex-1">
          {isSuperAdmin && !hasInterviewInvite && (
            <button
              onClick={sendProceedToInterview}
              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              Proceed to Interview
            </button>
          )}

          <h1 className="text-lg font-semibold text-gray-900">
            {receiverName || "User"}
          </h1>
          <p className="text-xs text-gray-500">Active now</p>
        </div>
      </div>

      {/* Messages Area - Only this scrolls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">No messages yet</p>
            <p className="text-sm text-gray-400">
              Start the conversation with {receiverName}!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isMe =
                message.sender?._id === currentUserId ||
                message.sender === currentUserId;

              return (
                <div
                  key={message._id || message.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                      } ${message.isTemp ? 'opacity-60' : ''}`}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {message.content || message.text}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span
                        className={`text-xs ${isMe ? 'text-indigo-200' : 'text-gray-400'
                          }`}
                      >
                        {formatTime(message.createdAt)}
                      </span>
                      {message.isTemp && (
                        <span
                          className={`text-xs italic ${isMe ? 'text-indigo-200' : 'text-gray-400'
                            }`}
                        >
                          Sending...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            rows={1}
            className="flex-1 resize-none bg-gray-100 border border-gray-300 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed max-h-32"
            style={{
              minHeight: '42px',
              maxHeight: '128px',
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;