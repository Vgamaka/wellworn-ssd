// Notification.jsx

import React, { useEffect, useState } from 'react';
import './Notification.scss';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_BACKEND_API;

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`https://wellworn-4.onrender.com/api/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Toggle the visibility of the notification popup
  const togglePopupVisibility = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  return (
    <div className='mainNotification'>
      <div className='minnotofititle'>
        <h1>Admin Dashboard</h1>
      </div>
      <div className="notifi">
        <ul>
          
          <li>
            <i className='fas fa-bell' onClick={togglePopupVisibility}></i>
          </li>
        </ul>
      </div>

      {/* Notification Popup */}
      {isPopupVisible && (
        <div className="notification-popup"> 
          <p>Notifications</p>
        </div>
      )}
    </div>
  );
};

export default Notification;
