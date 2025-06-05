import { useState } from 'react';
import './Sidebar.css';
import { SettingsMenu } from '../SettingsMenu/SettingsMenu';
import menu from '../../assets/icons/menu.svg'
import robot from '../../assets/icons/robot.svg'
import user from '../../assets/icons/user.svg'
import allchat from '../../assets/icons/allchat.svg'

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const Sidebar = ({ activeFilter, onFilterChange }: SidebarProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleProfileClick = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <>
      <aside className="sidebar">
        <div className="menu_icon" onClick={handleProfileClick}>
            <img src={menu} alt="" />
        </div>

        <nav className="sidebar-nav">
          <button
            className={`menu-item ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            <img src={allchat} alt="" />
            <span>All Chats</span>
          </button>

          <button
            className={`menu-item ${activeFilter === 'human' ? 'active' : ''}`}
            onClick={() => onFilterChange('human')}
          >
            <img src={user} alt="" />
            <span>Human Chats</span>
          </button>

          <button
            className={`menu-item ${activeFilter === 'ai' ? 'active' : ''}`}
            onClick={() => onFilterChange('ai')}
          >
            <img src={robot} alt="" />
            <span>AI Chats</span>
          </button>
        </nav>
      </aside>

      <SettingsMenu isOpen={isSettingsOpen} onClose={handleCloseSettings} />
    </>
  );
}; 