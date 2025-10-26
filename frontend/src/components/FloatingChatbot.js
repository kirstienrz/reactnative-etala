// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Modal,
//   ScrollView,
// } from "react-native";
// import Markdown from "react-native-markdown-display";
// import { sendChatbotMessage } from "../api/chatbot";

// export default function FloatingChatbot() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [visible, setVisible] = useState(false);
//   const [isTyping, setIsTyping] = useState(false); // 🆕 Typing indicator state

//   // 📩 Function to send user's message to the backend
//   const sendMessage = async (textToSend) => {
//     const text = textToSend || input;
//     if (!text.trim()) return;

//     const userMsg = { sender: "user", text };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput("");

//     // 🆕 Show typing indicator
//     setIsTyping(true);
//     setMessages((prev) => [...prev, { sender: "bot", text: "💭 Typing..." }]);

//     try {
//       const data = await sendChatbotMessage(text);

//       // Remove typing message before adding bot reply
//       setMessages((prev) => prev.filter((msg) => msg.text !== "💭 Typing..."));
//       setIsTyping(false);

//       // Add bot reply
//       const botMsg = { sender: "bot", text: data.reply, choices: data.choices || null };
//       setMessages((prev) => [...prev, botMsg]);
//     } catch (err) {
//       console.error("Chatbot error:", err);
//       setIsTyping(false);
//       setMessages((prev) =>
//         prev
//           .filter((msg) => msg.text !== "💭 Typing...")
//           .concat({ sender: "bot", text: "⚠️ Error fetching reply. Please try again later." })
//       );
//     }
//   };

//   // 🖱️ Handle choice button click
//   const handleChoiceClick = (choice) => {
//     sendMessage(choice);
//   };

//   return (
//     <>
//       {/* 💬 Floating Button */}
//       <TouchableOpacity style={styles.floatingBtn} onPress={() => setVisible(true)}>
//         <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>💬</Text>
//       </TouchableOpacity>

//       {/* 💬 Chat Modal */}
//       <Modal visible={visible} animationType="slide" transparent={true}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.chatContainer}>
//             <FlatList
//               data={messages}
//               keyExtractor={(_, i) => i.toString()}
//               renderItem={({ item }) => (
//                 <View
//                   style={[
//                     styles.message,
//                     item.sender === "user" ? styles.userMsg : styles.botMsg,
//                   ]}
//                 >
//                   {item.sender === "bot" ? (
//                     <Markdown style={{ body: styles.msgText }}>
//                       {item.text}
//                     </Markdown>
//                   ) : (
//                     <Text style={styles.msgText}>{item.text}</Text>
//                   )}

//                   {/* 🔘 Render choices if available */}
//                   {item.sender === "bot" && item.choices && (
//                     <View style={styles.choicesContainer}>
//                       {item.choices.map((choice, idx) => (
//                         <TouchableOpacity
//                           key={idx}
//                           style={styles.choiceBtn}
//                           onPress={() => handleChoiceClick(choice)}
//                         >
//                           <Text style={styles.choiceText}>{choice}</Text>
//                         </TouchableOpacity>
//                       ))}
//                     </View>
//                   )}
//                 </View>
//               )}
//             />

//             {/* ✏️ Input Row */}
//             <View style={styles.inputRow}>
//               <TextInput
//                 style={styles.input}
//                 value={input}
//                 onChangeText={setInput}
//                 placeholder="Type a message..."
//                 placeholderTextColor="#888"
//               />
//               <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()}>
//                 <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
//               </TouchableOpacity>
//             </View>

//             {/* ❌ Close Chat */}
//             <TouchableOpacity style={styles.closeBtn} onPress={() => setVisible(false)}>
//               <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
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
//     bottom: 100,
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
//     padding: 14,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "100%",
//   },
//   message: {
//     padding: 10,
//     marginVertical: 5,
//     borderRadius: 10,
//     maxWidth: "85%",
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
//     paddingHorizontal: 12,
//     marginRight: 8,
//     color: "#333",
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
//   choicesContainer: {
//     marginTop: 8,
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 6,
//   },
//   choiceBtn: {
//     backgroundColor: "#8B5CF6",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//   },
//   choiceText: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "600",
//   },
// });
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { sendChatbotMessage } from "../api/chatbot";

export default function FloatingChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // 🆕 When chat opens, introduce the chatbot
  useEffect(() => {
    if (visible && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            sender: "bot",
            text: `👋 Kumusta! I’m **Etala**, your Gender and Development (GAD) Support Chatbot from **Technological University of the Philippines -Taguig**.  
I’m here to help you with questions or concerns about **harassment, abuse, discrimination, or gender-related issues**.

You can ask me things like:
- “Paano magreport ng harassment?”
- “Saan pwede tumawag para sa tulong?”
- “Anong gagawin kung may abuse sa bahay?”

All conversations are **confidential**, and I can also provide **hotlines and step-by-step reporting guidance**.  
How can I assist you today? 💜`,
          },
        ]);
      }, 500); // small delay for natural feel
    }
  }, [visible]);

  const sendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setIsTyping(true);
    setMessages((prev) => [...prev, { sender: "bot", text: "💭 Typing..." }]);

    try {
      const data = await sendChatbotMessage(text);

      setMessages((prev) => prev.filter((msg) => msg.text !== "💭 Typing..."));
      setIsTyping(false);

      const botMsg = { sender: "bot", text: data.reply, choices: data.choices || null };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setIsTyping(false);
      setMessages((prev) =>
        prev
          .filter((msg) => msg.text !== "💭 Typing...")
          .concat({
            sender: "bot",
            text: "⚠️ Error fetching reply. Please try again later.",
          })
      );
    }
  };

  const handleChoiceClick = (choice) => {
    sendMessage(choice);
  };

  return (
    <>
      {/* 💬 Floating Button */}
      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => setVisible(true)}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>💬</Text>
      </TouchableOpacity>

      {/* 💬 Chat Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true} // ✅ ensures full-screen overlay without invisible bottom padding
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.chatContainer} edges={["top"]}>
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

            {/* ✏️ Input Row */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
                placeholderTextColor="#888"
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => sendMessage()}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
              </TouchableOpacity>
            </View>

            {/* ❌ Close Chat */}
            {/* ❌ Close Chat */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeIcon}>✖</Text>
            </TouchableOpacity>

          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingBtn: {
    position: "absolute",
    bottom: 100,
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
    paddingBottom: 0, // 🆕 ensures no space under modal
  },

  chatContainer: {
    backgroundColor: "#fff",
    padding: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "100%",
    paddingBottom: 0, // 🆕 prevents bottom spacing under Close button
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
  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 10 },
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
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#EF4444",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  closeIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
});
