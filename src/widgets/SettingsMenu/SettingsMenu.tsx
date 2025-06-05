import './SettingsMenu.css';
import myava from '../../assets/images/avatars/myava.jpg'
interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsMenu = ({ isOpen, onClose }: SettingsMenuProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-menu">
        <div className="profile-section">
          <div className="profile-avatar">
            <img src={myava} alt="Profile" />
          </div>
          <div className="profile-info">
            <h5 className="text-black">Nurdaulet Assanov</h5>
            <p className="text-black">Edit Profile</p>
          </div>
        </div>
        
        <nav className="settings-nav">
          <ul>
            <li>
              <a href="#" className="settings-item text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                </svg>
                <span>Privacy & Security</span>
              </a>
            </li>
            <li>
              <a href="#" className="settings-item text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z" fill="currentColor"/>
                </svg>
                <span>Help & Support</span>
              </a>
            </li>
            <li>
              <a href="#" className="settings-item text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
                </svg>
                <span>About</span>
              </a>
            </li>
            <li>
              <a href="#" className="settings-item logout text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7L15.59 5.59L12 9.17L8.41 5.59L7 7L12 12L17 7Z" fill="currentColor"/>
                </svg>
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}; 