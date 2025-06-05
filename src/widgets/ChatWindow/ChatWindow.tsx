import { useState, useRef, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
import { chatService } from '../../services/chatService';
import './ChatWindow.css';

// Import icons
import uploadIcon from '../../assets/icons/upload.svg';
import sendIcon from '../../assets/icons/send.svg';
import checkDoubleIcon from '../../assets/icons/check-double.svg';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isUser: boolean;
}

interface ChatWindowProps {
  selectedChat: {
    id: number;
    name: string;
    type: 'human' | 'ai';
  } | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ selectedChat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedChat) {
      // Load messages from chatService
      const chat = chatService.getChat(selectedChat.id, selectedChat.type);
      if (chat) {
        const formattedMessages = chat.messages.map(msg => ({
          id: msg.id.toString(),
          content: msg.content,
          timestamp: msg.time,
          isUser: msg.type === 'user'
        }));
        setMessages(formattedMessages);
      } else {
        // If chat doesn't exist, create a new one
        chatService.addMessage(selectedChat.id, selectedChat.type, {
          id: Date.now(),
          content: selectedChat.type === 'ai' ? 'Hello! How can I help you today?' : 'Hi there!',
          time: new Date().toLocaleTimeString(),
          type: selectedChat.type === 'ai' ? 'ai' : 'user'
        });
        setMessages([{
          id: Date.now().toString(),
          content: selectedChat.type === 'ai' ? 'Hello! How can I help you today?' : 'Hi there!',
          timestamp: new Date().toLocaleTimeString(),
          isUser: selectedChat.type !== 'ai'
        }]);
      }
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      isUser: true,
    };

    // Add user message to chatService
    chatService.addMessage(selectedChat.id, selectedChat.type, {
      id: parseInt(userMessage.id),
      content: userMessage.content,
      time: userMessage.timestamp,
      type: 'user'
    });

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Only use Gemini API for AI chats
    if (selectedChat.type === 'ai') {
      setIsLoading(true);
      try {
        const response = await geminiService.generateResponse(newMessage);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          timestamp: new Date().toLocaleTimeString(),
          isUser: false,
        };

        // Add AI message to chatService
        chatService.addMessage(selectedChat.id, selectedChat.type, {
          id: parseInt(aiMessage.id),
          content: aiMessage.content,
          time: aiMessage.timestamp,
          type: 'ai'
        });

        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedChat) {
    return (
      <div className="chat-window">
        <div className="no-chat-selected">
          <h2>Select a chat to start messaging</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <div className="chat-window-header-content">
          <div className="chat-avatar">
            <img src={selectedChat.type === 'ai' ? '/src/assets/images/avatars/robot.jpg' : '/src/assets/images/avatars/cat.jpg'} alt={selectedChat.name} />
          </div>
          <h2>{selectedChat.name}</h2>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && selectedChat.type === 'ai' ? (
          <div className="welcome-message">
            <h2>Hello! I'm your AI assistant</h2>
            <p>How can I help you today?</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-content">{message.content}</div>
              <div className="message-footer">
                <span className="message-time">{message.timestamp}</span>
                {message.isUser && (
                  <img
                    src={checkDoubleIcon}
                    alt="Sent"
                    className="message-status-icon"
                  />
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && selectedChat.type === 'ai' && (
          <div className="message ai-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <button className="upload-button">
          <img src={uploadIcon} alt="Upload" />
        </button>
        <textarea
          className="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || isLoading}
        >
          <img src={sendIcon} alt="Send" />
        </button>
      </div>
    </div>
  );
}; 