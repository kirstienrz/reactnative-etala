// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal } from "react-native";
// import { sendChatbotMessage } from "../api/chatbot";

// export default function FloatingChatbot() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [visible, setVisible] = useState(false);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMsg = { sender: "user", text: input };
//     setMessages((prev) => [...prev, userMsg]);

//     try {
//       const data = await sendChatbotMessage(input);
//       setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
//     } catch (err) {
//       console.error("Chatbot error:", err);
//       setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Error fetching reply" }]);
//     }

//     setInput("");
//   };

//   return (
//     <>
//       {/* Floating Button */}
//       <TouchableOpacity style={styles.floatingBtn} onPress={() => setVisible(true)}>
//         <Text style={{ color: "#fff", fontWeight: "bold" }}>💬</Text>
//       </TouchableOpacity>

//       {/* Chat Modal */}
//       <Modal visible={visible} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={styles.chatContainer}>
//             <FlatList
//               data={messages}
//               keyExtractor={(_, i) => i.toString()}
//               renderItem={({ item }) => (
//                 <View style={[styles.message, item.sender === "user" ? styles.userMsg : styles.botMsg]}>
//                   <Text style={styles.msgText}>{item.text}</Text>
//                 </View>
//               )}
//             />

//             <View style={styles.inputRow}>
//               <TextInput
//                 style={styles.input}
//                 value={input}
//                 onChangeText={setInput}
//                 placeholder="Type a message..."
//               />
//               <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
//                 <Text style={{ color: "#fff" }}>Send</Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity style={styles.closeBtn} onPress={() => setVisible(false)}>
//               <Text style={{ color: "#fff" }}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   floatingBtn: {
//     position: "absolute",
//     bottom: 70,
//     right: 20,
//     backgroundColor: "#8B5CF6",
//     padding: 15,
//     borderRadius: 30,
//     elevation: 5,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "flex-end",
//   },
//   chatContainer: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "70%",
//   },
//   message: {
//     padding: 10,
//     marginVertical: 5,
//     borderRadius: 10,
//     maxWidth: "80%",
//   },
//   userMsg: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
//   botMsg: { backgroundColor: "#F3E8FF", alignSelf: "flex-start" },
//   msgText: { fontSize: 14, color: "#333" },
//   inputRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     marginRight: 8,
//   },
//   sendBtn: {
//     backgroundColor: "#8B5CF6",
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//   },
//   closeBtn: {
//     marginTop: 10,
//     backgroundColor: "#EF4444",
//     padding: 10,
//     borderRadius: 10,
//     alignSelf: "center",
//   },
// });


import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { sendChatbotMessage } from "../api/chatbot";

export default function FloatingChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // 👈 NEW STATE

  // 📩 Function to send user's message to the backend
  const sendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true); // 👈 Start typing animation

    try {
      const data = await sendChatbotMessage(text);

      // Add bot reply
      const botMsg = {
        sender: "bot",
        text: data.reply,
        choices: data.choices || null,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Error fetching reply. Please try again later.",
        },
      ]);
    } finally {
      setIsTyping(false); // 👈 Stop typing animation
    }
  };

  // 🖱️ Handle choice button click
  const handleChoiceClick = (choice) => {
    sendMessage(choice);
  };

  return (
    <>
      {/* 💬 Floating Button */}
      <TouchableOpacity style={styles.floatingBtn} onPress={() => setVisible(true)}>
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>💬</Text>
      </TouchableOpacity>

      {/* 💬 Chat Modal */}
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.chatContainer}>
            <FlatList
              data={messages}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.message,
                    item.sender === "user" ? styles.userMsg : styles.botMsg,
                  ]}
                >
                  {item.sender === "bot" ? (
                    <Markdown style={{ body: styles.msgText }}>{item.text}</Markdown>
                  ) : (
                    <Text style={styles.msgText}>{item.text}</Text>
                  )}

                  {/* 🔘 Render choices if available */}
                  {item.sender === "bot" && item.choices && (
                    <View style={styles.choicesContainer}>
                      {item.choices.map((choice, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.choiceBtn}
                          onPress={() => handleChoiceClick(choice)}
                        >
                          <Text style={styles.choiceText}>{choice}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            />

            {/* ✨ Typing Indicator */}
            {isTyping && (
              <View style={[styles.message, styles.botMsg, styles.typingContainer]}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.typingText}>Typing...</Text>
              </View>
            )}

            {/* ✏️ Input Row */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
                placeholderTextColor="#888"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
              </TouchableOpacity>
            </View>

            {/* ❌ Close Chat */}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setVisible(false)}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingBtn: {
    position: "absolute",
    bottom: 70,
    right: 20,
    backgroundColor: "#8B5CF6",
    padding: 15,
    borderRadius: 30,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  chatContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "85%",
  },
  userMsg: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
  botMsg: { backgroundColor: "#F3E8FF", alignSelf: "flex-start" },
  msgText: { fontSize: 14, color: "#333" },
  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
    color: "#333",
  },
  sendBtn: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  closeBtn: {
    marginTop: 10,
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
  choicesContainer: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  choiceBtn: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  choiceText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typingText: {
    color: "#6B21A8",
    fontSize: 13,
    fontStyle: "italic",
  },
});
