import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token } = useAuth();

  const SOCKET_URL = 'http://localhost:5000';

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      upgrade: false
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Socket Server');
      newSocket.emit('register', user.id || user._id);
    });

    // Populate initial system notifications
    fetchNotifications();

    newSocket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      // In-app check: Let's seed mock initial notifications or fetch from user
      // Standard fetch
      const res = await fetch(`http://localhost:5000/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Notifications are pre-seeded in the database
        // For demonstration, let's load a standard notification list
        const testNotif = [
          { _id: 'not_seed_1', title: 'Welcome Core!', message: 'Explore mentors in discovery tab.', type: 'info', isRead: false },
          { _id: 'not_seed_2', title: 'Platform Active', message: 'Mentorix is fully operational.', type: 'info', isRead: true }
        ];
        setNotifications(testNotif);
        setUnreadCount(testNotif.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.log('Error listing notifications', err);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAllAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
