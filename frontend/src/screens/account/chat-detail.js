import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sendMessage, getMessages, createOrGetChat } from "../../api/chat";
import { getItem } from "../../utils/storage";

export default function ChatScreen({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [chatId, setChatId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const { receiverId, receiverName, chatId: existingChatId } = route.params || {};
  
  const userId = receiverId;
  const userName = receiverName;

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const storedUserId = await getItem("userId");
        console.log("📱 Current User ID from storage:", storedUserId);
        setCurrentUserId(storedUserId);
      } catch (error) {
        console.error("Error getting user ID:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!userId) {
      console.error("❌ User ID is missing from route params:", route.params);
      Alert.alert("Error", "Receiver ID is missing");
      return;
    }

    if (currentUserId) {
      initializeChat();
    }
  }, [userId, currentUserId]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      console.log("🔄 Initializing chat with receiver:", userId);
      
      let chatDataId = existingChatId;
      
      if (!chatDataId) {
        const chatData = await createOrGetChat(userId);
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
      Alert.alert("Error", "Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !chatId) return;

    const tempMessage = {
      id: Date.now().toString(),
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
      console.log("📤 Sending message:", { chatId, userId, messageText });
      
      const savedMessage = await sendMessage(chatId, userId, messageText);
      console.log("✅ Message saved:", savedMessage);
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? savedMessage : msg
        )
      );

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
      
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender?._id === currentUserId || item.sender === currentUserId;
    
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
          item.isTemp && styles.tempMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {item.content || item.text}
        </Text>
        {item.isTemp && (
          <Text style={[styles.sendingText, isMe && styles.sendingTextMy]}>
            Sending...
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4338CA" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {userName || "User"}
        </Text>
      </View>

      {/* Message List */}
      {messages.length === 0 ? (
        <View
          style={[
            styles.emptyContainer,
            { paddingBottom: keyboardHeight > 0 ? keyboardHeight : 0 },
          ]}
        >
          <Text style={styles.emptyText}>
            No messages yet
          </Text>
          <Text style={styles.emptySubtext}>
            Start the conversation with {userName}!
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      {/* Input Field */}
      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom:
              Platform.OS === "ios"
                ? insets.bottom + 8
                : insets.bottom + 20,
            marginBottom:
              Platform.OS === "android" && keyboardHeight > 0
                ? keyboardHeight - 10
                : 0,
          },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!sending}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          disabled={!inputText.trim() || sending}
          onPress={handleSend}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptySubtext: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
  },
  messageList: {
    padding: 16,
    paddingBottom: 100,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4338CA",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tempMessage: {
    opacity: 0.6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#FFFFFF",
  },
  theirMessageText: {
    color: "#1F2937",
  },
  sendingText: {
    fontSize: 11,
    marginTop: 2,
    color: "#9CA3AF",
  },
  sendingTextMy: {
    color: "#E0E7FF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#4338CA",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: "#4338CA",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});