import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Modal } from "react-native";
import { sendChatbotMessage } from "../api/chatbot";

export default function FloatingChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [visible, setVisible] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const data = await sendChatbotMessage(input);
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Error fetching reply" }]);
    }

    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity style={styles.floatingBtn} onPress={() => setVisible(true)}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>💬</Text>
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.chatContainer}>
            <FlatList
              data={messages}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <View style={[styles.message, item.sender === "user" ? styles.userMsg : styles.botMsg]}>
                  <Text style={styles.msgText}>{item.text}</Text>
                </View>
              )}
            />

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                <Text style={{ color: "#fff" }}>Send</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setVisible(false)}>
              <Text style={{ color: "#fff" }}>Close</Text>
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
    bottom: 30,
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
    maxWidth: "80%",
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
    paddingHorizontal: 10,
    marginRight: 8,
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
});
