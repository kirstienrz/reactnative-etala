import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyTickets, markMessagesAsRead } from '../../api/tickets';
import socketService from '../../api/socket';

// Icons - you can replace these with react-native-vector-icons
const MessageSquareIcon = () => (
  <View style={styles.emptyIcon}>
    <Text style={styles.emptyIconText}>💬</Text>
  </View>
);

const MoreVerticalIcon = () => (
  <Text style={styles.menuIcon}>⋮</Text>
);

const Inbox = () => {
  const navigation = useNavigation();
  const currentUser = useSelector((state) => state.auth.profile);
  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // ✅ Track read tickets in AsyncStorage
  const [readTickets, setReadTickets] = useState([]);

  // Load read tickets from AsyncStorage
  useEffect(() => {
    const loadReadTickets = async () => {
      try {
        const stored = await AsyncStorage.getItem('userReadTickets');
        if (stored) {
          setReadTickets(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading read tickets:', error);
      }
    };
    loadReadTickets();
  }, []);

  // ✅ Save read tickets to AsyncStorage whenever it changes
  useEffect(() => {
    const saveReadTickets = async () => {
      try {
        await AsyncStorage.setItem('userReadTickets', JSON.stringify(readTickets));
      } catch (error) {
        console.error('Error saving read tickets:', error);
      }
    };
    if (readTickets.length > 0) {
      saveReadTickets();
    }
  }, [readTickets]);

  // ✅ Helper functions for read/unread status
  const isTicketRead = (ticketNumber) => {
    return readTickets.includes(ticketNumber);
  };

  const markTicketAsReadLocally = (ticketNumber) => {
    if (!readTickets.includes(ticketNumber)) {
      setReadTickets([...readTickets, ticketNumber]);
    }
  };

  const markTicketAsUnreadLocally = (ticketNumber) => {
    setReadTickets(readTickets.filter(t => t !== ticketNumber));
  };

  useEffect(() => {
    if (currentUserId) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [currentUserId]);

  // 🔥 Setup Socket.IO for real-time updates
  useEffect(() => {
    if (!currentUserId) {
      console.log('⚠️ No currentUserId, skipping socket setup');
      return;
    }

    console.log('🔌 Setting up socket connection for user inbox');
    console.log('👤 Current User ID:', currentUserId);
    
    socketService.connect();
    
    // Wait a bit for connection before joining room
    setTimeout(() => {
      console.log('📍 Joining user room:', `user-${currentUserId}`);
      socketService.joinUserRoom(currentUserId);
    }, 100);

    // 📩 Listen for new messages
    socketService.onNewMessage(({ message, ticket }) => {
      console.log('🔥 New message received in inbox:', message);
      console.log('📊 Updated ticket from new-message:', ticket);
      
      setTickets(prev => {
        const existingTicket = prev.find(t => t.ticketNumber === ticket.ticketNumber);
        
        let updatedTickets;
        if (!existingTicket) {
          console.log('🆕 New ticket detected, adding to inbox as unread');
          updatedTickets = [ticket, ...prev];
          markTicketAsUnreadLocally(ticket.ticketNumber);
        } else {
          updatedTickets = prev.map(t => 
            t.ticketNumber === ticket.ticketNumber ? ticket : t
          );
          
          if (message.sender === 'admin') {
            console.log('📨 Admin replied, marking as unread');
            markTicketAsUnreadLocally(ticket.ticketNumber);
          }
        }
        
        const sorted = [...updatedTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA;
        });
        
        return sorted;
      });
    });

    // 📩 Listen for ticket updates
    socketService.onTicketUpdated((updatedTicket) => {
      console.log('🔥 Ticket updated in inbox:', updatedTicket);
      
      setTickets(prev => {
        const existingTicket = prev.find(t => t.ticketNumber === updatedTicket.ticketNumber);
        
        let newTickets;
        if (!existingTicket) {
          console.log('🆕 New ticket detected via update event');
          newTickets = [updatedTicket, ...prev];
          markTicketAsUnreadLocally(updatedTicket.ticketNumber);
        } else {
          newTickets = prev.map(t => 
            t.ticketNumber === updatedTicket.ticketNumber ? updatedTicket : t
          );
        }
        
        const sorted = [...newTickets].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt);
          const dateB = new Date(b.lastMessageAt);
          return dateB - dateA;
        });
        
        return sorted;
      });
    });

    // 📩 Listen for ticket closed
    socketService.onTicketClosed(({ ticket }) => {
      console.log('🔥 Ticket closed in inbox:', ticket);
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    });

    // 📩 Listen for ticket reopened
    socketService.onTicketReopened(({ ticket }) => {
      console.log('🔥 Ticket reopened in inbox:', ticket);
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticket.ticketNumber ? ticket : t
      ));
    });

    return () => {
      console.log('🧹 Cleaning up inbox socket listeners');
      socketService.removeAllListeners();
    };
  }, [currentUserId]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getMyTickets();
      console.log('📥 Loaded user tickets:', data);
      
      const sortedTickets = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.lastMessageAt);
        const dateB = new Date(b.lastMessageAt);
        return dateB - dateA;
      });
      
      setTickets(sortedTickets);
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    }
    if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // ✅ Mark ticket as read on server AND locally
  const markTicketAsRead = async (ticketNumber) => {
    try {
      await markMessagesAsRead(ticketNumber);
      console.log('✅ Marked ticket as read:', ticketNumber);
      
      markTicketAsReadLocally(ticketNumber);
      
      setTickets(prev => prev.map(t => 
        t.ticketNumber === ticketNumber 
          ? { ...t, unreadCount: { ...t.unreadCount, user: 0 } } 
          : t
      ));
    } catch (error) {
      console.error('❌ Error marking as read:', error);
    }
  };

  // ❌ Mark ticket as unread (AsyncStorage only)
  const markTicketAsUnread = (ticketNumber) => {
    markTicketAsUnreadLocally(ticketNumber);
    
    setTickets(prev => prev.map(t => 
      t.ticketNumber === ticketNumber 
        ? { ...t, unreadCount: { ...t.unreadCount, user: 1 } } 
        : t
    ));
  };

  const handleTicketPress = async (ticket) => {
    await markTicketAsRead(ticket.ticketNumber);
    
    navigation.navigate('ChatDetail', {
      ticketNumber: ticket.ticketNumber,
      ticketId: ticket._id || ticket.id,
      displayName: ticket.displayName,
      status: ticket.status,
    });
  };

  const toggleMenu = (ticketNumber) => {
    setOpenMenuId(openMenuId === ticketNumber ? null : ticketNumber);
  };

  const renderTicketItem = ({ item: ticket }) => {
    const timeStamp = ticket.lastMessageAt ? formatTime(ticket.lastMessageAt) : '';
    const ticketNumber = ticket.ticketNumber;
    const hasUnread = !isTicketRead(ticketNumber) || (ticket.unreadCount?.user > 0);
    const isMenuOpen = openMenuId === ticketNumber;

    return (
      <TouchableOpacity
        style={[styles.ticketItem, hasUnread && styles.ticketItemUnread]}
        onPress={() => handleTicketPress(ticket)}
        activeOpacity={0.7}
      >
        {/* Unread indicator */}
        <View style={styles.unreadIndicatorContainer}>
          {hasUnread && <View style={styles.unreadIndicator} />}
        </View>

        {/* Content */}
        <View style={styles.ticketContent}>
          <View style={styles.ticketHeader}>
            <Text style={[styles.ticketNumber, hasUnread && styles.ticketNumberUnread]}>
              Ticket #{ticket.ticketNumber || ticket.reportId?.ticketNumber || 'N/A'}
            </Text>
            {timeStamp && (
              <Text style={styles.timestamp}>{timeStamp}</Text>
            )}
          </View>

          {ticket.lastMessage && (
            <View style={styles.messageRow}>
              <Text 
                style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]} 
                numberOfLines={1}
              >
                {ticket.lastMessage}
              </Text>
              {ticket.reportId?.status && (
                <Text style={styles.reportStatus}>{ticket.reportId.status}</Text>
              )}
            </View>
          )}

          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              ticket.status === 'Open' ? styles.statusOpen : styles.statusClosed
            ]}>
              <Text style={[
                styles.statusText,
                ticket.status === 'Open' ? styles.statusTextOpen : styles.statusTextClosed
              ]}>
                {ticket.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Three Dots Menu */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            onPress={() => toggleMenu(ticketNumber)}
            style={styles.menuButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVerticalIcon />
          </TouchableOpacity>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                onPress={() => {
                  if (hasUnread) {
                    markTicketAsRead(ticketNumber);
                  } else {
                    markTicketAsUnread(ticketNumber);
                  }
                  setOpenMenuId(null);
                }}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownText}>
                  {hasUnread ? 'Mark as read' : 'Mark as unread'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        <TouchableOpacity 
          onPress={handleRefresh} 
          disabled={refreshing}
        >
          <Text style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Your messages and support tickets.</Text>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageSquareIcon />
          <Text style={styles.emptyTitle}>No tickets yet</Text>
          <Text style={styles.emptySubtitle}>Your support tickets will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#7c3aed"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#581c87',
  },
  refreshButton: {
    fontSize: 14,
    color: '#4b5563',
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  listContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  ticketItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  ticketItemUnread: {
    backgroundColor: '#faf5ff',
  },
  unreadIndicatorContainer: {
    width: 8,
    justifyContent: 'center',
    marginRight: 12,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
  },
  ticketContent: {
    flex: 1,
    minWidth: 0,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  ticketNumberUnread: {
    color: '#581c87',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: '#581c87',
  },
  reportStatus: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  statusContainer: {
    marginTop: 4,
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusOpen: {
    backgroundColor: '#d1fae5',
  },
  statusClosed: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextOpen: {
    color: '#065f46',
  },
  statusTextClosed: {
    color: '#374151',
  },
  menuContainer: {
    position: 'relative',
    marginLeft: 8,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
  },
  menuIcon: {
    fontSize: 20,
    color: '#4b5563',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 36,
    width: 160,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 14,
    color: '#374151',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default Inbox;