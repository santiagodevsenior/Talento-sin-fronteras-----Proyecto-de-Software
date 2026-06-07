import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    if (!user) { socketRef.current?.disconnect(); return; }

    const token = localStorage.getItem('tsf_token');
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || '', { auth: { token } });

    socketRef.current.on('online_users', setOnlineUsers);
    socketRef.current.on('receive_message', (msg) => {
      setMessages((prev) => ({
        ...prev,
        [msg.senderId]: [...(prev[msg.senderId] || []), msg],
      }));
    });

    return () => socketRef.current?.disconnect();
  }, [user]);

  const sendMessage = (receiverId, content, mentorshipId) => {
    socketRef.current?.emit('send_message', { receiverId, content, mentorshipId });
  };

  const emitTyping = (receiverId, isTyping) => {
    socketRef.current?.emit('typing', { receiverId, isTyping });
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers, messages, sendMessage, emitTyping }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
