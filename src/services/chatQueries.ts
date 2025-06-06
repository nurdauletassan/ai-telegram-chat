import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from './chatService';
import { geminiService } from './geminiService';

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

// Query key factory
export const chatKeys = {
  all: ['chats'] as const,
  lists: () => [...chatKeys.all, 'list'] as const,
  list: (type: 'human' | 'ai') => [...chatKeys.lists(), type] as const,
  detail: (id: number, type: 'human' | 'ai') => [...chatKeys.all, 'detail', id, type] as const,
};

// Hook for getting all chats
export const useChats = (type: 'human' | 'ai') => {
  return useQuery({
    queryKey: chatKeys.list(type),
    queryFn: () => chatService.getChats(type),
  });
};

// Hook for getting a single chat
export const useChat = (chatId: number, type: 'human' | 'ai') => {
  return useQuery({
    queryKey: chatKeys.detail(chatId, type),
    queryFn: () => chatService.getChat(chatId, type),
    enabled: !!chatId,
  });
};

// Hook for sending messages
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, type, message }: { 
      chatId: number; 
      type: 'human' | 'ai'; 
      message: Message;
    }) => {
      await chatService.addMessage(chatId, type, message);
      
      // If it's a user message in an AI chat, generate AI response
      if (type === 'ai' && message.type === 'user') {
        try {
          const aiResponse = await geminiService.generateResponse(message.content);
          const aiMessage: Message = {
            id: Date.now() + 1,
            content: aiResponse,
            time: new Date().toLocaleTimeString(),
            type: 'ai'
          };
          await chatService.addMessage(chatId, type, aiMessage);
          return aiMessage;
        } catch (error) {
          console.error('Error generating AI response:', error);
          throw error;
        }
      }
      return null;
    },
    onSuccess: (aiMessage, { chatId, type }) => {
      // Invalidate and refetch the chat
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId, type) });
    },
  });
};

// Hook for creating a new AI chat
export const useCreateAiChat = () => {
  const queryClient = useQueryClient();

  return useMutation<Chat, Error, string | undefined>({
    mutationFn: async (name?: string) => {
      const chat = chatService.createNewAiChat(name);
      return chat;
    },
    onSuccess: () => {
      // Invalidate the AI chats list
      queryClient.invalidateQueries({ queryKey: chatKeys.list('ai') });
    },
  });
}; 