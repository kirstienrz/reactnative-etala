import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { sendChatbotMessage } from "../api/chatbot";
import { useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";

export default function FloatingChatbot() {
  const location = useLocation();
  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");
  const isChatRoute = location.pathname.includes("/chat") || location.pathname.includes("/messages");
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [viewportHeight, setViewportHeight] = useState('100%');
  const [viewportTop, setViewportTop] = useState(0);

  useEffect(() => {
    try {
      const platform = Capacitor.getPlatform();
      setIsNativeApp(platform === "android" || platform === "ios");
    } catch (e) {
      setIsNativeApp(false);
    }
  }, []);

  useEffect(() => {
    const onResizeOrScroll = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
        // Track the offset to know how much Android panned the screen up
        setViewportTop(window.visualViewport.offsetTop || 0);
      } else {
        setViewportHeight(`${window.innerHeight}px`);
        setViewportTop(0);
      }
    };
    
    // Initial call
    onResizeOrScroll();

    window.addEventListener('resize', onResizeOrScroll);
    window.addEventListener('scroll', onResizeOrScroll);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onResizeOrScroll);
      window.visualViewport.addEventListener('scroll', onResizeOrScroll);
    }

    return () => {
      window.removeEventListener('resize', onResizeOrScroll);
      window.removeEventListener('scroll', onResizeOrScroll);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onResizeOrScroll);
        window.visualViewport.removeEventListener('scroll', onResizeOrScroll);
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Lock body scroll when chat is visible
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    if (visible) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;
      document.body.style.overflow = 'hidden';
      // autofocus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.paddingRight = originalPaddingRight || '';
    }
    return () => {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.paddingRight = originalPaddingRight || '';
    };
  }, [visible]);

  useEffect(() => {
    if (visible && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            sender: "bot",
            text: `👋 Kumusta! I'm **eTALA**, your Gender and Development (GAD) Support Chatbot from **Technological University of the Philippines - Taguig**.

I'm here to help you with questions about **harassment, abuse, discrimination, or gender-related issues**.

Pwede kang magtanong ng:
- "Paano magreport ng harassment?"
- "Saan pwede tumawag para sa tulong?"
- "Anong gagawin kung may abuse sa bahay?"

All conversations are **confidential**. How can I help you today? 💜`,
          },
        ]);
      }, 500);
    }
  }, [visible]);

  const sendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setMessages((prev) => [...prev, { sender: "bot", text: "💭 Typing..." }]);

    try {
      const data = await sendChatbotMessage(text);
      setMessages((prev) => prev.filter((m) => m.text !== "💭 Typing..."));

      const botMsg = {
        sender: "bot",
        text: data.reply,
        choices: data.choices || null,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev
          .filter((m) => m.text !== "💭 Typing...")
          .concat({ sender: "bot", text: "⚠️ Error. Try again later." })
      );
    }
  };

  const handleChoiceClick = (choice) => sendMessage(choice);
  const handleKeyPress = (e) => e.key === "Enter" && sendMessage();

  const styles = {
    floatingBtn: {
      position: "fixed",
      bottom: isNativeApp ? "calc(80px + env(safe-area-inset-bottom, 0px))" : "24px",
      right: isMobile ? "16px" : "24px",
      width: isMobile ? "52px" : "60px",
      height: isMobile ? "52px" : "60px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #6D28D9, #8B5CF6)",
      color: "#fff",
      border: "none",
      fontSize: "22px",
      cursor: "pointer",
      boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      transition: "transform 0.18s",
    },
    modalOverlay: {
      position: "fixed",
      top: `${viewportTop}px`,
      left: 0,
      right: 0,
      height: viewportHeight,
      backgroundColor: "rgba(0,0,0,0.22)",
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "flex-end",
      padding: isMobile ? "8px" : "16px",
      paddingBottom: isMobile ? "calc(env(safe-area-inset-bottom) + 8px)" : "16px",
      zIndex: 10005, // Higher than Header (9999) and Drawer (10001)
    },
    chatContainer: {
      backgroundColor: "#fff",
      width: isMobile ? "100%" : "360px",
      maxWidth: isMobile ? "100%" : "95vw",
      height: isMobile ? "72vh" : "70vh",
      maxHeight: "100%", // Ensures it shrinks when keyboard opens instead of overflowing
      borderRadius: isMobile ? "16px 16px 0 0" : "24px",
      boxShadow: "0 12px 35px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
    },
    header: {
      backgroundColor: "#8B5CF6",
      padding: "16px 20px",
      color: "#fff",
      fontWeight: 600,
      fontSize: "16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    closeBtn: {
      border: "none",
      background: "transparent",
      color: "#fff",
      fontSize: "20px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "0.2s",
    },
    messagesContainer: {
      flex: 1,
      padding: "16px",
      overflowY: "auto",
      backgroundColor: "#F7F5FF",
      color: "#222", // Always dark text for readability
    },
    bubble: {
      padding: "14px 18px",
      marginBottom: "12px",
      borderRadius: "20px",
      maxWidth: "78%",
      lineHeight: "1.5",
      wordBreak: "break-word",
    },
    userMsg: {
      backgroundColor: "#DCF8C6",
      marginLeft: "auto",
      borderBottomRightRadius: "6px",
    },
    botMsg: {
      backgroundColor: "#ECE2FF",
      marginRight: "auto",
      borderBottomLeftRadius: "6px",
      color: "#222", // Always dark text for bot
    },
    inputArea: {
      padding: "14px 16px",
      display: "flex",
      gap: "10px",
      borderTop: "1px solid #e5e5e5",
      backgroundColor: "#fff",
    },
    chatInput: {
      flex: 1,
      padding: "12px 16px",
      borderRadius: "24px",
      border: "1px solid #ccc",
      outline: "none",
      fontSize: "14px",
    },
    sendBtn: {
      background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
      border: "none",
      padding: "10px 18px",
      color: "#fff",
      borderRadius: "24px",
      fontWeight: 600,
      cursor: "pointer",
      fontSize: "14px",
      transition: "0.2s",
    },
    choiceBtn: {
      background: "#8B5CF6",
      color: "#fff",
      padding: "6px 14px",
      borderRadius: "18px",
      border: "none",
      fontSize: "13px",
      cursor: "pointer",
      marginTop: "6px",
    },
    choicesContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      marginTop: "6px",
    },
  };

  if (isSuperAdminRoute || isChatRoute) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        style={styles.floatingBtn}
        onClick={() => setVisible(true)}
        aria-label="Open chat"
      >
        {/* Chat SVG Icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" fill="white" opacity="0.06"/>
          <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M8 10h8M8 14h5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {visible && (
        <div style={styles.modalOverlay} onClick={() => setVisible(false)}>
          {/* stopPropagation on container so clicks inside don't close */}
          <div style={styles.chatContainer} onClick={(e) => e.stopPropagation()}>
             <div style={styles.header}>
               <span>eTALA — GAD Chatbot</span>
               <button
                 style={styles.closeBtn}
                 onClick={() => setVisible(false)}
               >
                 ✖
               </button>
             </div>

             {/* Messages */}
             <div style={styles.messagesContainer}>
               {messages.map((msg, i) => (
                 <div
                   key={i}
                   style={{
                     ...styles.bubble,
                     ...(msg.sender === "user" ? styles.userMsg : styles.botMsg),
                   }}
                 >
                   <ReactMarkdown>{msg.text}</ReactMarkdown>

                   {msg.choices && (
                     <div style={styles.choicesContainer}>
                       {msg.choices.map((c, idx) => (
                         <button
                           key={idx}
                           style={styles.choiceBtn}
                           onClick={() => handleChoiceClick(c)}
                         >
                           {c}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
               ))}
               <div ref={messagesEndRef} />
             </div>

             {/* Input Box */}
             <div style={styles.inputArea}>
               <input
                 ref={inputRef}
                 style={styles.chatInput}
                 className="bg-white text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all px-4 py-2"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyPress={handleKeyPress}
                 placeholder="Type a message..."
               />
               <button 
                 style={styles.sendBtn} 
                 onMouseDown={(e) => e.preventDefault()}
                 onTouchStart={(e) => e.preventDefault()}
                 onClick={() => sendMessage()}
               >
                 Send
               </button>
             </div>
           </div>
         </div>
       )}
     </>
   );
 }
