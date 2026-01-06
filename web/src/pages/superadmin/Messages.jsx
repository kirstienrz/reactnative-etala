import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Plus, X, Loader2 } from 'lucide-react';
import { getChats, createOrGetChat, getAllUsers } from '../../api/chat';

const Messages = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  
  // ✅ Better user ID extraction - try multiple possible fields
  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId;
  
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    console.log('=== USER DEBUG INFO ===');
    console.log('Current user from Redux:', currentUser);
    console.log('Full user object:', JSON.stringify(currentUser, null, 2));
    console.log('Available keys:', currentUser ? Object.keys(currentUser) : 'no user');
    console.log('Extracted user ID:', currentUserId);
    console.log('====================');
    
    if (currentUserId) {
      fetchChats();
    } else {
      console.error('❌ No user ID found! Check your login dispatch.');
      setLoading(false);
    }
  }, [currentUserId]);

  const fetchChats = async () => {
    try {
      console.log('📨 Fetching chats for user:', currentUserId);
      const data = await getChats();
      console.log('✅ Chats received:', data);
      
      if (!data || data.length === 0) {
        console.log('ℹ️ No chats returned from API');
        setChats([]);
        return;
      }
      
      const chatsWithMessages = data.filter(chat => chat.latestMessage);
      console.log('💬 Chats with messages:', chatsWithMessages.length);
      setChats(chatsWithMessages);
    } catch (error) {
      console.error('❌ Error fetching chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getAllUsers();
      console.log('👥 All users fetched:', data.length);
      
      // ✅ Filter out current user using the extracted ID
      const otherUsers = data.filter(user => {
        const userId = user._id || user.id;
        return userId !== currentUserId;
      });
      
      console.log('👤 Other users (excluding current):', otherUsers.length);
      setUsers(otherUsers);
      setFilteredUsers(otherUsers);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
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
    setShowNewModal(true);
    setSearchQuery('');
    fetchUsers();
  };

  const handleUserSelect = async (user) => {
    try {
      setLoadingUsers(true);
      const userId = user._id || user.id;
      const chat = await createOrGetChat(userId);
      setShowNewModal(false);
      navigate('/superadmin/chat', {
        state: {
          chatId: chat._id,
          receiverId: userId,
          receiverName: `${user.firstName} ${user.lastName}`,
        }
      });
      fetchChats();
    } catch (error) {
      console.error('❌ Error creating/getting chat:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const getOtherUser = (users) => {
    if (!currentUserId || !users || users.length === 0) {
      return users && users.length > 0 ? users[0] : null;
    }
    
    // ✅ Better comparison - check both _id and id fields
    return users.find(user => {
      const userId = user._id || user.id;
      return userId !== currentUserId;
    }) || users[0];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleChatPress = (chat) => {
    const otherUser = getOtherUser(chat.users);
    if (otherUser) {
      const userId = otherUser._id || otherUser.id;
      navigate('/superadmin/chat', {
        state: {
          chatId: chat._id,
          receiverId: userId,
          receiverName: `${otherUser.firstName} ${otherUser.lastName}`,
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ✅ Show error if no user ID found
  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600 mb-2">Unable to load messages</p>
          <p className="text-sm text-gray-500">User ID not found. Please try logging in again.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleNewMessage}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Message
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <p className="text-lg font-medium text-gray-600">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-2">Click "New Message" to start a conversation</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {chats.map((chat) => {
              const otherUser = getOtherUser(chat.users);
              if (!otherUser) return null;

              const userName = `${otherUser.firstName} ${otherUser.lastName}`;
              const latestMessageContent = chat.latestMessage?.content || 'Start a conversation';
              const timeStamp = chat.updatedAt ? formatTime(chat.updatedAt) : '';
              
              // ✅ Better unread check with flexible ID matching
              const messageReceiverId = chat.latestMessage?.receiver?._id || chat.latestMessage?.receiver?.id || chat.latestMessage?.receiver;
              const isUnread = chat.latestMessage && !chat.latestMessage.read && 
                             messageReceiverId === currentUserId;

              return (
                <div
                  key={chat._id}
                  onClick={() => handleChatPress(chat)}
                  className="bg-white px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {otherUser.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-semibold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {userName}
                      </p>
                      {timeStamp && <span className="text-xs text-gray-400 ml-2">{timeStamp}</span>}
                    </div>
                    <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'} ${!chat.latestMessage ? 'italic' : ''}`}>
                      {latestMessageContent}
                    </p>
                  </div>
                  {isUnread && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Message</h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  {searchQuery ? 'No users found' : 'No users available'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id || user.id}
                      onClick={() => handleUserSelect(user)}
                      className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {user.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.email && <p className="text-sm text-gray-500 truncate">{user.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;