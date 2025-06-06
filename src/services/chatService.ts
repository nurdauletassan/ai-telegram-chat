import chatData from '../data/chats.json';

interface Message {
  id: number;
  content: string;
  time: string;
  type: 'user' | 'ai';
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  messages: Message[];
}

interface HumanChats {
  [key: string]: Chat;
}

interface AIChats {
  [key: string]: Chat;
}

class ChatService {
  private humanChats: HumanChats;
  private aiChats: AIChats;
  private nextAiChatId: number = 10000; // Start from 10000 for AI chats

  constructor() {
    console.log(localStorage)
    // Load chats from localStorage or use default data from JSON files
    const storedHumanChats = localStorage.getItem('humanChats');
    const storedAiChats = localStorage.getItem('aiChats');

    if (storedHumanChats) {
      this.humanChats = JSON.parse(storedHumanChats);
    } else {
      // Use default data from JSON files for human chats
      this.humanChats = chatData.chats as HumanChats;
    }

    // Initialize AI chats from localStorage or start with default
    if (storedAiChats) {
      this.aiChats = JSON.parse(storedAiChats);
      // Find the next available ID, ensuring it's at least 10000
      const maxId = Math.max(...Object.keys(this.aiChats).map(Number), 9999);
      this.nextAiChatId = maxId + 1;
    } else {
      // Start with one default AI chat
      this.aiChats = {
        "10000": {
          id: 10000,
          name: "AI Assistant",
          avatar: "/src/assets/images/avatars/robot.jpg",
          messages: []
        }
      };
      this.nextAiChatId = 10001;
    }

    // Save initial state to localStorage
    this.saveToLocalStorage();
  }

  getChat(chatId: number, type: 'human' | 'ai'): Chat | null {
    return type === 'ai' ? this.aiChats[chatId] || null : this.humanChats[chatId] || null;
  }

  getChats(type: 'human' | 'ai'): { [key: string]: Chat } {
    return type === 'ai' ? this.aiChats : this.humanChats;
  }

  createNewAiChat(name?: string): Chat {
    // Ensure nextAiChatId is at least 10000
    if (this.nextAiChatId < 10000) {
      this.nextAiChatId = 10000;
    }

    const newChat = {
      id: this.nextAiChatId,
      name: name || `AI Assistant ${this.nextAiChatId}`,
      avatar: "/src/assets/images/avatars/robot.jpg",
      messages: [] // Empty messages array to show welcome message in center
    };
    
    // Add the new chat to aiChats
    this.aiChats[this.nextAiChatId] = newChat;
    
    // Increment the next ID
    this.nextAiChatId++;
    
    // Save to localStorage immediately after creating new chat
    this.saveToLocalStorage();
    
    return newChat;
  }

  async addMessage(chatId: number, type: 'human' | 'ai', message: Message): Promise<void> {
    const chats = type === 'ai' ? this.aiChats : this.humanChats;
    
    if (!chats[chatId]) {
      chats[chatId] = {
        id: chatId,
        name: type === 'ai' ? 'AI Assistant' : 'Unknown User',
        avatar: '/src/assets/images/avatars/cat.jpg',
        messages: []
      };
    }

    // Check if message with this ID already exists
    const messageExists = chats[chatId].messages.some(msg => msg.id === message.id);
    if (!messageExists) {
      // Create a new array to ensure we're not mutating the original
      chats[chatId].messages = [...chats[chatId].messages, message];
      // Save to localStorage after adding message
      this.saveToLocalStorage();
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('humanChats', JSON.stringify(this.humanChats));
      localStorage.setItem('aiChats', JSON.stringify(this.aiChats));
      console.log('Saved to localStorage:', { humanChats: this.humanChats, aiChats: this.aiChats });
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
}

export const chatService = new ChatService(); 