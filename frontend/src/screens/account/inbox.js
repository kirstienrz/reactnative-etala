import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getChats, createOrGetChat, getAllUsers } from '../../api/chat';
import { getItem } from '../../utils/storage';

const InboxScreen = () => {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // New message modal states
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchChats();
    }, [])
  );

  const loadCurrentUser = async () => {
    try {
      const userId = await getItem('userId');
      setCurrentUserId(userId);
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const data = await getChats();
      const chatsWithMessages = data.filter(chat => chat.latestMessage);
      setChats(chatsWithMessages);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email?.toLowerCase() || '';
      return fullName.includes(query) || email.includes(query);
    });
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleNewMessage = () => {
    setShowNewMessageModal(true);
    setSearchQuery('');
    fetchUsers();
  };

  const handleUserSelect = async (user) => {
    try {
      setLoadingUsers(true);
      const chat = await createOrGetChat(user._id);
      setShowNewMessageModal(false);
      navigation.navigate('ChatDetail', {
        chatId: chat._id,
        receiverId: user._id,
        receiverName: `${user.firstName} ${user.lastName}`,
      });
    } catch (error) {
      console.error('Error creating/getting chat:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const getOtherUser = (users) => {
    if (!currentUserId) return null;
    return users.find(user => user._id !== currentUserId);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleChatPress = (chat) => {
    const otherUser = getOtherUser(chat.users);
    if (otherUser) {
      navigation.navigate('ChatDetail', {
        chatId: chat._id,
        receiverId: otherUser._id,
        receiverName: `${otherUser.firstName} ${otherUser.lastName}`,
      });
    }
  };

  const renderChatItem = ({ item }) => {
    const otherUser = getOtherUser(item.users);
    if (!otherUser) return null;

    const userName = `${otherUser.firstName} ${otherUser.lastName}`;
    const latestMessageContent = item.latestMessage?.content || 'No messages yet';
    const timeStamp = item.updatedAt ? formatTime(item.updatedAt) : '';
    const isUnread = item.latestMessage && !item.latestMessage.read && 
                     item.latestMessage.receiver === currentUserId;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {otherUser.firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.userName, isUnread && styles.unreadText]}>
              {userName}
            </Text>
            <Text style={styles.timeStamp}>{timeStamp}</Text>
          </View>
          <Text
            style={[styles.messagePreview, isUnread && styles.unreadText]}
            numberOfLines={1}
          >
            {latestMessageContent}
          </Text>
        </View>
        {isUnread && <View style={styles.unreadBadge} />}
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelect(item)}
      disabled={loadingUsers}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.firstName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstName} {item.lastName}
        </Text>
        {item.email && <Text style={styles.userEmail}>{item.email}</Text>}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4338CA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Messages</Text>
        <TouchableOpacity
          style={styles.newMessageButton}
          onPress={handleNewMessage}
          activeOpacity={0.8}
        >
          <Text style={styles.newMessageButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>
      
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Tap "+ New" to start a conversation
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#4338CA"
              colors={["#4338CA"]}
            />
          }
        />
      )}

      {/* New Message Modal */}
      <Modal
        visible={showNewMessageModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowNewMessageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowNewMessageModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Message</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoFocus
            />
          </View>

          {loadingUsers ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#4338CA" />
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No users found' : 'No users available'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item._id}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  newMessageButton: {
    backgroundColor: '#4338CA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  newMessageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4338CA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeStamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messagePreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  unreadText: {
    fontWeight: '700',
    color: '#1F2937',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4338CA',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  cancelButton: {
    fontSize: 16,
    color: '#4338CA',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  userItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default InboxScreen;