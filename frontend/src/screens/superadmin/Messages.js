import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { 
  Send, 
  Plus, 
  Calendar, 
  Clock, 
  X, 
  ChevronLeft, 
  MoreVertical, 
  AlertCircle, 
  CheckCircle, 
  Mail,
  Paperclip 
} from 'lucide-react-native';

// Import your API functions
import { 
  getAllTickets, 
  getTicketMessages, 
  sendTicketMessage,
  markMessagesAsRead,
  markTicketAsUnread, 
} from '../../api/tickets';
import socketService from '../../api/socket';
import { sendBookingLinkEmail } from '../../api/calendar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Confirmation Modal Component
const ConfirmationModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'info', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  isLoading = false 
}) => {
  const icons = {
    info: <AlertCircle width={48} height={48} color="#3B82F6" />,
    success: <CheckCircle width={48} height={48} color="#10B981" />,
    warning: <AlertCircle width={48} height={48} color="#F59E0B" />,
    error: <AlertCircle width={48} height={48} color="#EF4444" />
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIcon}>
            {icons[type]}
          </View>
          
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Identity Disclosure Modal
const IdentityDisclosureModal = ({ visible, onClose, ticketNumber }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: SCREEN_HEIGHT * 0.8 }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalIcon}>
              <AlertCircle width={64} height={64} color="#F59E0B" />
            </View>
            
            <Text style={styles.modalTitle}>User Must Disclose Identity First</Text>
            <Text style={styles.modalMessage}>
              This user is currently anonymous and cannot book appointments until they disclose their identity.
            </Text>
            
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>User needs to:</Text>
              <View style={styles.instructionsList}>
                <Text style={styles.instructionItem}>1. Go to My Reports page</Text>
                <Text style={styles.instructionItem}>2. Find ticket: {ticketNumber}</Text>
                <Text style={styles.instructionItem}>3. Click View Details</Text>
                <Text style={styles.instructionItem}>4. Click Disclose Identity</Text>
                <Text style={styles.instructionItem}>5. Fill in personal information</Text>
              </View>
              <Text style={styles.instructionsNote}>
                Once identity is disclosed, you can send them the appointment booking link.
              </Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity style={styles.fullWidthButton} onPress={onClose}>
            <Text style={styles.fullWidthButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Calendar Reminder Modal
const CalendarReminderModal = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: SCREEN_HEIGHT * 0.8 }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.modalIcon, { backgroundColor: '#FEF3C7' }]}>
              <Calendar width={48} height={48} color="#D97706" />
            </View>
            
            <Text style={styles.modalTitle}>Update Your Calendar First</Text>
            <Text style={styles.modalMessage}>
              Before sending the appointment booking link, please make sure your calendar is up to date.
            </Text>
            
            <View style={[styles.instructionsBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              <Text style={[styles.instructionsTitle, { color: '#92400E' }]}>⚠️ Important Reminder:</Text>
              <View style={styles.instructionsList}>
                <Text style={styles.reminderItem}>• Check if there are any new events or meetings</Text>
                <Text style={styles.reminderItem}>• Update your calendar with blocked time slots</Text>
                <Text style={styles.reminderItem}>• Mark any unavailable dates or times</Text>
                <Text style={styles.reminderItem}>• This prevents double-booking conflicts</Text>
              </View>
            </View>
            
            <Text style={[styles.modalMessage, { marginTop: 16 }]}>
              The user will see your available time slots and choose their preferred appointment time.
            </Text>
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const TicketMessagingMobile = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showCalendarReminder, setShowCalendarReminder] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {}
  });
  
  const messagesEndRef = useRef(null);
  const selectedTicketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const flatListRef = useRef(null);

  // Read tickets tracking
  const [readTickets, setReadTickets] = useState([]);

  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);

  // Initialize Socket.IO
  useEffect(() => {
    socketService.connect();
    
    setTimeout(() => {
      socketService.joinAdminRoom();
    }, 100);

    socketService.onNewMessage(({ message, ticket }) => {
      if (selectedTicketRef.current?.ticketNumber === message.ticketNumber) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
      }

      setTickets(prev => {
        const updatedTickets = prev.map(t => 
          t.ticketNumber === ticket.ticketNumber ? ticket : t
        );
        return [...updatedTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA;
        });
      });
    });

    socketService.onTicketUpdated((updatedTicket) => {
      setTickets(prev => {
        const newTickets = prev.map(t => 
          t.ticketNumber === updatedTicket.ticketNumber ? updatedTicket : t
        );
        const sortedTickets = [...newTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA;
        });
        return sortedTickets;
      });
      
      if (selectedTicketRef.current?.ticketNumber === updatedTicket.ticketNumber) {
        setSelectedTicket(updatedTicket);
      }
    });

    socketService.onUserTyping(({ userName, isTyping }) => {
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

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      socketService.joinTicket(selectedTicket.ticketNumber);
      return () => {
        socketService.leaveTicket(selectedTicket.ticketNumber);
      };
    }
  }, [selectedTicket]);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getAllTickets({ sortBy: 'lastMessageAt' });
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const loadMessages = async (ticketNumber) => {
    setLoading(true);
    try {
      const data = await getTicketMessages(ticketNumber, { limit: 50 });
      setMessages(data);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markTicketAsRead = async (ticketNumber) => {
    try {
      await markMessagesAsRead(ticketNumber);
      if (!readTickets.includes(ticketNumber)) {
        setReadTickets([...readTickets, ticketNumber]);
      }
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticketNumber 
          ? { ...t, hasUnreadMessages: false } 
          : t
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    await markTicketAsRead(ticket.ticketNumber);
    await loadMessages(ticket.ticketNumber);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const message = await sendTicketMessage(selectedTicket.ticketNumber, {
        content: newMessage.trim(),
        attachments: []
      });
      
      setMessages(prev => {
        const exists = prev.some(m => m._id === message._id);
        if (!exists) {
          return [...prev, message];
        }
        return prev;
      });
      
      setNewMessage('');
      socketService.sendTyping(selectedTicket.ticketNumber, 'Admin', false);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendAppointmentLink = () => {
    const user = selectedTicket.userId;
    const report = selectedTicket.reportId;
    
    const isAnonymous = !user?.firstName || 
                       !user?.lastName ||
                       !user?.email;
    
    if (isAnonymous) {
      setShowIdentityModal(true);
      return;
    }

    setShowCalendarReminder(true);
  };

  const handleCalendarConfirmed = () => {
    setShowCalendarReminder(false);
    
    const userEmail = selectedTicket.reportId?.personalInfo?.email || 'the user';
    const userName = selectedTicket.displayName || 'User';
    
    setModalConfig({
      title: 'Send Appointment Booking Link?',
      message: `An email will be sent to ${userEmail} with a link to book an appointment.\n\nThe user (${userName}) will be able to:\n• View your available time slots\n• Choose their preferred date and time\n• Book the appointment`,
      type: 'info',
      confirmText: 'Send Link',
      onConfirm: handleConfirmSendLink
    });
    setShowConfirmModal(true);
  };

  const handleConfirmSendLink = async () => {
    try {
      setIsSending(true);
      
      const ticket = selectedTicket;
      
      if (!ticket) {
        alert("No ticket selected");
        return;
      }

      const userId = ticket.userId?._id || ticket.userId;
      const userEmail = ticket.userId?.email || 
                       ticket.reportId?.email ||
                       ticket.email;
      
      let userName = "";
      if (ticket.displayName && ticket.displayName !== "Anonymous User") {
        userName = ticket.displayName;
      } else if (ticket.userId?.firstName && ticket.userId?.lastName) {
        userName = `${ticket.userId.firstName} ${ticket.userId.lastName}`;
      } else if (ticket.reportId?.firstName && ticket.reportId?.lastName) {
        userName = `${ticket.reportId.firstName} ${ticket.reportId.lastName}`;
      } else {
        userName = "User";
      }

      const ticketNumber = ticket.reportId?.ticketNumber || ticket.ticketNumber;

      if (!userId || !userEmail || !ticketNumber) {
        alert("Error: Missing required user information");
        return;
      }

      const response = await sendBookingLinkEmail({
        userId,           
        userEmail,        
        userName,         
        ticketNumber
      });

      if (response.success) {
        alert(`Booking link sent successfully to ${userEmail}!`);
        setShowConfirmModal(false);
        
        try {
          await sendTicketMessage(ticket.ticketNumber, {
            content: `📅 An appointment booking link has been sent to your email (${userEmail}).\n\nPlease check your inbox and book your preferred consultation date.\n\n⏰ Important: The link is valid for 24 hours only.\n\n✅ Once booked, you will receive a confirmation.`,
            metadata: { type: 'appointment_link' }
          });
        } catch (msgError) {
          console.error("Failed to send chat message:", msgError);
        }
      } else {
        alert(response.message || "Failed to send booking link");
      }

    } catch (error) {
      console.error("Error sending appointment link:", error);
      alert(`Error: ${error.message || "Failed to send booking link"}`);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderTicketItem = ({ item: ticket }) => {
    const hasUnread = !readTickets.includes(ticket.ticketNumber);
    const isSelected = selectedTicket?.ticketNumber === ticket.ticketNumber;
    
    return (
      <TouchableOpacity
        style={[
          styles.ticketItem,
          isSelected && styles.ticketItemSelected,
          hasUnread && styles.ticketItemUnread
        ]}
        onPress={() => handleSelectTicket(ticket)}
      >
        <View style={styles.ticketItemContent}>
          <View style={styles.ticketUnreadIndicator}>
            {hasUnread && <View style={styles.unreadDot} />}
          </View>
          
          <View style={styles.ticketItemInfo}>
            <View style={styles.ticketItemHeader}>
              <Text style={[styles.ticketNumber, hasUnread && styles.ticketNumberUnread]}>
                {ticket.reportId?.ticketNumber || ticket.ticketNumber}
              </Text>
              <View style={styles.ticketTime}>
                <Clock width={12} height={12} color="#6B7280" />
                <Text style={styles.ticketTimeText}>{formatDate(ticket.lastMessageAt)}</Text>
              </View>
            </View>
            
            <Text style={[styles.ticketName, hasUnread && styles.ticketNameUnread]}>
              {ticket.displayName}
            </Text>
            
            {ticket.reportId?.caseStatus && (
              <Text style={styles.ticketStatus}>{ticket.reportId.caseStatus}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item: msg, index }) => {
    const isCurrentUser = msg.sender === 'admin';
    const isAppointmentLink = msg.metadata?.type === 'appointment_link';
    
    return (
      <View style={[styles.messageContainer, isCurrentUser && styles.messageContainerRight]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.messageBubbleAdmin : styles.messageBubbleUser,
          isAppointmentLink && styles.messageBubbleAppointment
        ]}>
          {isAppointmentLink && (
            <View style={styles.appointmentHeader}>
              <Mail width={16} height={16} color="#fff" />
              <Text style={styles.appointmentHeaderText}>Appointment Booking Link Sent</Text>
            </View>
          )}
          
          <Text style={[
            styles.messageText,
            (isCurrentUser || isAppointmentLink) && styles.messageTextWhite
          ]}>
            {msg.content}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              (isCurrentUser || isAppointmentLink) && styles.messageTimeWhite
            ]}>
              {formatTime(msg.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (!selectedTicket) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tickets</Text>
        </View>
        
        {/* Ticket List */}
        <FlatList
          data={tickets}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.ticketList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tickets found</Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        isLoading={sending}
      />

      <IdentityDisclosureModal
        visible={showIdentityModal}
        onClose={() => setShowIdentityModal(false)}
        ticketNumber={selectedTicket?.reportId?.ticketNumber || selectedTicket?.ticketNumber}
      />

      <CalendarReminderModal
        visible={showCalendarReminder}
        onClose={() => setShowCalendarReminder(false)}
        onConfirm={handleCalendarConfirmed}
      />
      
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setSelectedTicket(null)} style={styles.backButton}>
          <ChevronLeft width={24} height={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderTitle}>
            {selectedTicket.reportId?.ticketNumber || selectedTicket.ticketNumber}
          </Text>
          <Text style={styles.chatHeaderSubtitle}>{selectedTicket.displayName}</Text>
        </View>
        
        <View style={[
          styles.statusBadge,
          selectedTicket.status === 'Open' ? styles.statusBadgeOpen : styles.statusBadgeClosed
        ]}>
          <Text style={styles.statusBadgeText}>{selectedTicket.status}</Text>
        </View>
      </View>
      
      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            loading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
              </View>
            )
          }
          ListFooterComponent={
            typingUser ? (
              <View style={styles.typingContainer}>
                <View style={styles.typingBubble}>
                  <Text style={styles.typingText}>{typingUser} is typing...</Text>
                </View>
              </View>
            ) : null
          }
        />
        
        {/* Input Area */}
        {selectedTicket.status === 'Open' && (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.appointmentButton}
              onPress={handleSendAppointmentLink}
            >
              <Calendar width={20} height={20} color="#fff" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message..."
              multiline
              maxLength={1000}
              editable={!sending}
            />
            
            <TouchableOpacity
              style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send width={20} height={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  ticketList: {
    paddingVertical: 8,
  },
  ticketItem: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  ticketItemSelected: {
    backgroundColor: '#DBEAFE',
  },
  ticketItemUnread: {
    backgroundColor: '#EFF6FF',
  },
  ticketItemContent: {
    flexDirection: 'row',
    padding: 16,
  },
  ticketUnreadIndicator: {
    width: 8,
    marginRight: 12,
    alignItems: 'center',
    paddingTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  ticketItemInfo: {
    flex: 1,
  },
  ticketItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  ticketNumberUnread: {
    fontWeight: 'bold',
  },
  ticketTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketTimeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  ticketName: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  ticketNameUnread: {
    fontWeight: '600',
    color: '#111827',
  },
  ticketStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  chatHeader: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chatHeaderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeOpen: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeClosed: {
    backgroundColor: '#F3F4F6',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  messageContainerRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleUser: {
    backgroundColor: '#fff',
  },
  messageBubbleAdmin: {
    backgroundColor: '#3B82F6',
  },
  messageBubbleAppointment: {
    backgroundColor: '#7C3AED',
    borderWidth: 2,
    borderColor: '#C4B5FD',
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  appointmentHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
  messageTextWhite: {
    color: '#fff',
  },
  messageFooter: {
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  messageTimeWhite: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  typingContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  typingBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  appointmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  fullWidthButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  fullWidthButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  instructionsBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  reminderItem: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  instructionsNote: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 12,
    lineHeight: 20,
  },
});

export default TicketMessagingMobile;