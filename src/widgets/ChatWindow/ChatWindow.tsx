import { useRef, useEffect } from 'react';
import { useChat, useSendMessage } from '../../services/chatQueries';
import './ChatWindow.css';

// Import icons
import uploadIcon from '../../assets/icons/upload.svg';
import sendIcon from '../../assets/icons/send.svg';
import checkDoubleIcon from '../../assets/icons/check-double.svg';

interface ChatWindowProps {
  selectedChat: {
    id: number;
    name: string;
    type: 'human' | 'ai';
  } | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ selectedChat }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: chat, isLoading: isChatLoading } = useChat(
    selectedChat?.id ?? 0,
    selectedChat?.type ?? 'human'
  );
  const sendMessage = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSendMessage = async (content: string) => {
    if (!selectedChat || !content.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: content,
      time: new Date().toLocaleTimeString(),
      type: 'user' as const
    };

    try {
      await sendMessage.mutateAsync({
        chatId: selectedChat.id,
        type: selectedChat.type,
        message: userMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const content = e.currentTarget.value;
      e.currentTarget.value = '';
      handleSendMessage(content);
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

  const messages = chat?.messages.map(msg => ({
    id: msg.id.toString(),
    content: msg.content,
    timestamp: msg.time,
    isUser: msg.type === 'user'
  })) ?? [];

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
        {isChatLoading ? (
          <div className="loading">Loading...</div>
        ) : messages.length === 0 && selectedChat.type === 'ai' ? (
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
        {sendMessage.isPending && selectedChat.type === 'ai' && (
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
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={sendMessage.isPending}
        />
        <button
          className="send-button"
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
            handleSendMessage(input.value);
            input.value = '';
          }}
          disabled={sendMessage.isPending}
        >
          <img src={sendIcon} alt="Send" />
        </button>
      </div>
    </div>
  );
}; 