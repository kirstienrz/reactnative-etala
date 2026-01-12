import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons"; // or react-native-vector-icons
import { getTicketMessages, sendTicketMessage } from "../../api/tickets";
import socketService from "../../api/socket";

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ticketStatus, setTicketStatus] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [inputHeight, setInputHeight] = useState(40);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const ticketNumberRef = useRef(null);

  const { ticketNumber, ticketId, displayName, status } = route.params || {};

  useEffect(() => {
    if (!ticketNumber) {
      Alert.alert("Error", "No ticket selected");
      navigation.goBack();
      return;
    }

    ticketNumberRef.current = ticketNumber;
    setTicketStatus(status);
    loadMessages();
  }, [ticketNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket setup
  useEffect(() => {
    if (!ticketNumber) return;

    console.log("🔌 Setting up socket connection for ticket:", ticketNumber);
    socketService.connect();
    socketService.joinTicket(ticketNumber);
    socketService.joinUserRoom(currentUserId);

    // Listen for new messages
    socketService.onNewMessage(({ message, ticket }) => {
      console.log("🔥 New message received:", message);

      if (message.ticketNumber === ticketNumberRef.current) {
        console.log("✅ Ticket match! Adding message...");
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          if (exists) {
            console.log("⚠️ Duplicate message, skipping");
            return prev;
          }
          console.log("✅ Adding new message");
          return [...prev, message];
        });
      }
    });

    // Listen for ticket closed
    socketService.onTicketClosed(({ ticket, message }) => {
      console.log("🔥 Ticket closed:", ticket);
      if (ticket.ticketNumber === ticketNumberRef.current) {
        setTicketStatus("Closed");
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    // Listen for ticket reopened
    socketService.onTicketReopened(({ ticket, message }) => {
      console.log("🔥 Ticket reopened:", ticket);
      if (ticket.ticketNumber === ticketNumberRef.current) {
        setTicketStatus("Open");
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }
    });

    // Listen for typing
    socketService.onUserTyping(({ userName, isTyping }) => {
      console.log("👤 Typing event:", userName, isTyping);
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

    // Listen for read receipts
    socketService.onMessagesRead(({ ticketNumber: readTicketNumber, readBy }) => {
      console.log("📖 Messages read event received for ticket:", readTicketNumber, "by:", readBy);
      if (readTicketNumber === ticketNumberRef.current && readBy === "admin") {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            isRead: msg.sender === "user" ? true : msg.isRead,
          }))
        );
      }
    });

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up socket listeners for ticket:", ticketNumber);
      if (ticketNumberRef.current) {
        socketService.leaveTicket(ticketNumberRef.current);
      }
      socketService.removeAllListeners();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [ticketNumber, currentUserId]);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getTicketMessages(ticketNumber, { limit: 100 });
      console.log("📥 Loaded messages:", data);
      setMessages(data || []);
    } catch (error) {
      console.error("❌ Error loading messages:", error);
      Alert.alert("Error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !ticketNumber) return;

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: inputText,
      sender: "user",
      senderName: currentUser?.firstName || currentUser?.name || "You",
      createdAt: new Date().toISOString(),
      isTemp: true,
      isRead: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    const messageText = inputText;
    setInputText("");
    setInputHeight(40);
    setSending(true);
    Keyboard.dismiss();

    socketService.sendTyping(ticketNumber, currentUser?.firstName || "You", false);

    try {
      console.log("📤 Sending message to:", ticketNumber);
      const savedMessage = await sendTicketMessage(ticketNumber, {
        content: messageText,
        attachments: [],
      });

      console.log("✅ Message sent successfully:", savedMessage);

      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg._id !== tempMessage._id);
        const exists = filtered.some((m) => m._id === savedMessage._id);
        if (!exists) {
          return [...filtered, savedMessage];
        }
        return filtered;
      });

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (text) => {
    setInputText(text);

    if (text.trim()) {
      const userName = currentUser?.firstName || currentUser?.name || "User";
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

  const getLastUserMessageIndex = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === "user" && !messages[i].isTemp) {
        return i;
      }
    }
    return -1;
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender === "user";
    const lastUserMessageIndex = getLastUserMessageIndex();
    const isLastUserMessage = isMe && index === lastUserMessageIndex;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.messageContainerRight : styles.messageContainerLeft,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.messageBubbleUser : styles.messageBubbleAdmin,
            item.isTemp && styles.messageBubbleTemp,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.messageTextUser : styles.messageTextAdmin,
            ]}
          >
            {item.content || item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isMe ? styles.messageTimeUser : styles.messageTimeAdmin,
              ]}
            >
              {formatTime(item.createdAt)}
            </Text>
            {item.isTemp && (
              <Text
                style={[
                  styles.messageSending,
                  isMe ? styles.messageTimeUser : styles.messageTimeAdmin,
                ]}
              >
                Sending...
              </Text>
            )}
            {isMe && !item.isTemp && isLastUserMessage && item.isRead && (
              <Text style={styles.messageRead}>Read</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!typingUser) return null;

    return (
      <View style={[styles.messageContainer, styles.messageContainerLeft]}>
        <View style={[styles.messageBubble, styles.typingBubble]}>
          <Text style={styles.typingText}>{typingUser} is typing...</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptySubtitle}>
        Start the conversation with System Admin!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </SafeAreaView>
    );
  }

  const isTicketClosed = ticketStatus === "Closed";

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>#{ticketNumber}</Text>
              <View
                style={[
                  styles.statusBadge,
                  ticketStatus === "Open"
                    ? styles.statusBadgeOpen
                    : styles.statusBadgeClosed,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    ticketStatus === "Open"
                      ? styles.statusTextOpen
                      : styles.statusTextClosed,
                  ]}
                >
                  {ticketStatus || "Open"}
                </Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>Chatting with System Admin</Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.messagesListEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderTypingIndicator}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          {isTicketClosed ? (
            <View style={styles.closedContainer}>
              <Text style={styles.closedText}>
                This ticket is closed. You cannot send new messages.
              </Text>
            </View>
          ) : (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { height: Math.max(40, inputHeight) }]}
                value={inputText}
                onChangeText={handleTyping}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                multiline
                editable={!sending}
                onContentSizeChange={(e) => {
                  const height = e.nativeEvent.contentSize.height;
                  setInputHeight(Math.min(Math.max(40, height), 120));
                }}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!inputText.trim() || sending}
                style={[
                  styles.sendButton,
                  (!inputText.trim() || sending) && styles.sendButtonDisabled,
                ]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardAvoid: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#581C87",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeOpen: {
    backgroundColor: "#D1FAE5",
  },
  statusBadgeClosed: {
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusTextOpen: {
    color: "#047857",
  },
  statusTextClosed: {
    color: "#374151",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messagesListEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: "80%",
  },
  messageContainerLeft: {
    alignSelf: "flex-start",
  },
  messageContainerRight: {
    alignSelf: "flex-end",
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageBubbleUser: {
    backgroundColor: "#9333EA",
  },
  messageBubbleAdmin: {
    backgroundColor: "#F3F4F6",
  },
  messageBubbleTemp: {
    opacity: 0.6,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextUser: {
    color: "#FFFFFF",
  },
  messageTextAdmin: {
    color: "#1F2937",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  messageTimeUser: {
    color: "#E9D5FF",
  },
  messageTimeAdmin: {
    color: "#6B7280",
  },
  messageSending: {
    fontSize: 11,
    fontStyle: "italic",
  },
  messageRead: {
    fontSize: 11,
    color: "#E9D5FF",
  },
  typingBubble: {
    backgroundColor: "#E5E7EB",
  },
  typingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  inputContainer: {
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closedContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  closedText: {
    fontSize: 14,
    color: "#6B7280",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#9333EA",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;