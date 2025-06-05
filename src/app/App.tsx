import { useState } from 'react';
import { Sidebar } from '../widgets/sidebar/Sidebar';
import { ChatList } from '../widgets/ChatList/ChatList';
import { ChatWindow } from '../widgets/ChatWindow/ChatWindow';
import './App.css';

export const App = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedChat, setSelectedChat] = useState<{
    id: number;
    name: string;
    type: 'human' | 'ai';
  } | null>(null);

  return (
    <div className="app">
      <Sidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <ChatList activeFilter={activeFilter} onChatSelect={setSelectedChat} />
      <ChatWindow selectedChat={selectedChat} />
      </div>
  );
};
