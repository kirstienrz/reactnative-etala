import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { sendChatbotMessage } from "../api/chatbot";

export default function FloatingChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (visible && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            sender: "bot",
            text: `👋 Kumusta! I'm **Etala**, your Gender and Development (GAD) Support Chatbot from **Technological University of the Philippines - Taguig**.

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
      bottom: "24px",
      right: "24px",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
      color: "#fff",
      border: "none",
      fontSize: "26px",
      cursor: "pointer",
      boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      transition: "transform 0.2s",
    },
  modalOverlay: {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.25)", // softer overlay
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "flex-end", // aligns chat to bottom right
  padding: "16px", // minimal padding
  zIndex: 2001,
},
chatContainer: {
  backgroundColor: "#fff",
  width: "360px", // slightly smaller
  maxWidth: "95vw",
  height: "70vh", // reduce height
  borderRadius: "24px",
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

  return (
    <>
      {/* Floating Button */}
      <button
        style={styles.floatingBtn}
        onClick={() => setVisible(true)}
      >
        💬
      </button>

      {visible && (
        <div style={styles.modalOverlay}>
          <div style={styles.chatContainer}>
            <div style={styles.header}>
              <span>Etala — GAD Chatbot</span>
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
                style={styles.chatInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
              />
              <button style={styles.sendBtn} onClick={() => sendMessage()}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
