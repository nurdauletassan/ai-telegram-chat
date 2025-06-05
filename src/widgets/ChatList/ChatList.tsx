import { useState } from 'react';
import './ChatList.css';
import { chatService } from '../../services/chatService';
import { Modal } from '../Modal/Modal';

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  type: 'human' | 'ai';
  unread?: number;
  messages: { content: string; time: string }[];
}

interface ChatListProps {
  activeFilter: string;
  onChatSelect: (chat: { id: number; name: string; type: 'human' | 'ai'; }) => void;
}

// Helper function to convert time string to comparable value
const getTimeValue = (timeStr: string): number => {
  // For HH:MM format (today's messages)
  if (timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return 1000000 + (hours * 60 + minutes); // Today's messages get highest priority
  }

  // For "Yesterday"
  if (timeStr === 'Yesterday') {
    return 100000; // Yesterday's messages get second priority
  }

  // For "X days ago"
  if (timeStr.includes('days ago')) {
    const days = parseInt(timeStr);
    return 10000 * days; // Older messages get lower priority based on days
  }

  // For "Last week"
  if (timeStr === 'Last week') {
    return 1000; // Last week's messages get lowest priority
  }

  return 0; // Default value for unknown formats
};

export const ChatList = ({ activeFilter, onChatSelect }: ChatListProps) => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newAssistantName, setNewAssistantName] = useState('');

  // Get chats from the chat service
  const allChats: Chat[] = [
    ...Object.values(chatService.getChats('human')).map(chat => ({
      ...chat,
      lastMessage: chat.messages[chat.messages.length - 1]?.content || '',
      time: chat.messages[chat.messages.length - 1]?.time || '',
      type: 'human' as const
    })),
    ...Object.values(chatService.getChats('ai')).map(chat => ({
      ...chat,
      lastMessage: chat.messages[chat.messages.length - 1]?.content || '',
      time: chat.messages[chat.messages.length - 1]?.time || '',
      type: 'ai' as const
    }))
  ];

  const filteredChats = allChats
    .filter(chat => {
      // First filter by type
      if (activeFilter !== 'all' && chat.type !== activeFilter) {
        return false;
      }
      // Then filter by search query
      return chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const timeA = getTimeValue(a.time);
      const timeB = getTimeValue(b.time);
      return timeB - timeA; // Sort in descending order (most recent first)
    });

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat.id);
    onChatSelect({
      id: chat.id,
      name: chat.name,
      type: chat.type
    });
  };

  const handleCreateNewAiChat = () => {
    setShowModal(true);
  };

  const handleCreateAssistant = () => {
    if (newAssistantName.trim()) {
      const newChat = chatService.createNewAiChat(newAssistantName.trim());
      handleChatClick({
        ...newChat,
        lastMessage: '',
        time: '',
        type: 'ai',
        messages: []
      });
      setNewAssistantName('');
      setShowModal(false);
    }
  };

  const handleCancel = () => {
    setNewAssistantName('');
    setShowModal(false);
  };

  return (
    <div className="chat-list">
      <div className="chat-search">
        <div className="search-input-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
          </svg>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="new-chat-button" onClick={handleCreateNewAiChat}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div className="chat-items-container">
        {filteredChats.map(chat => {
          // Get the last message or use empty string if no messages
          const lastMessage = chat.messages && chat.messages.length > 0 
            ? chat.messages[chat.messages.length - 1].content 
            : '';

          return (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`}
              onClick={() => handleChatClick(chat)}
            >
              <div className="chat-avatar">
                <img src={chat.avatar} alt={chat.name} />
              </div>
              <div className="chat-info">
                <div className="chat-header">
                  <h3>{chat.name}</h3>
                  <span className="chat-time">{chat.time}</span>
                </div>
                <p className="chat-preview">{lastMessage}</p>
              </div>
              {chat.unread && (
                <div className="unread-badge">{chat.unread}</div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title="Create New AI Assistant"
      >
        <input
          type="text"
          placeholder="Enter assistant name..."
          value={newAssistantName}
          onChange={(e) => setNewAssistantName(e.target.value)}
          className="modal-input"
        />
        <div className="modal-buttons">
          <button onClick={handleCancel} className="cancel-button">Cancel</button>
          <button 
            onClick={handleCreateAssistant} 
            className="create-button"
            disabled={!newAssistantName.trim()}
          >
            Create
          </button>
        </div>
      </Modal>
    </div>
  );
}; 