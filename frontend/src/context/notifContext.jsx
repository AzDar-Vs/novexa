import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const NotifContext = createContext();
export const useNotif = () => useContext(NotifContext);

export const NotifProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = async () => {
    const res = await api.get('/notifikasi');
    setNotifications(res.data || []);
    setUnread(res.unread || 0);
  };

  const markAsRead = async (id) => {
    await api.patch(`/notifikasi/${id}/read`);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotifContext.Provider
      value={{
        notifications,
        unread,
        fetchNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotifContext.Provider>
  );
};
