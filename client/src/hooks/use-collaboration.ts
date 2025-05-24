import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from './use-websocket';

export interface CollaborativeUser {
  userId: string;
  userName: string;
  cursor?: { x: number; y: number };
}

export interface CollaborationEvents {
  onUserJoined?: (user: CollaborativeUser) => void;
  onUserLeft?: (user: CollaborativeUser) => void;
  onCursorUpdate?: (user: CollaborativeUser) => void;
  onElementChanged?: (data: {
    userId: string;
    userName: string;
    elementId: string;
    changes: any;
    bpmnXml: string;
  }) => void;
}

export function useCollaboration(
  workflowId: number | null,
  userId: string,
  userName: string,
  events: CollaborationEvents = {}
) {
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { socket, isConnected: wsConnected } = useWebSocket();
  const hasJoined = useRef(false);

  useEffect(() => {
    if (!socket || !wsConnected || !workflowId || hasJoined.current) return;

    // Join the collaboration session
    socket.send(JSON.stringify({
      type: 'join',
      userId,
      userName,
      workflowId
    }));

    hasJoined.current = true;
    setIsConnected(true);

    // Listen for collaboration events
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'active_users':
            setActiveUsers(message.data);
            break;
            
          case 'user_joined':
            const joinedUser = message.data;
            setActiveUsers(prev => [...prev, joinedUser]);
            events.onUserJoined?.(joinedUser);
            break;
            
          case 'user_left':
            const leftUser = message.data;
            setActiveUsers(prev => prev.filter(u => u.userId !== leftUser.userId));
            events.onUserLeft?.(leftUser);
            break;
            
          case 'cursor_update':
            const cursorData = message.data;
            setActiveUsers(prev => prev.map(user => 
              user.userId === cursorData.userId 
                ? { ...user, cursor: { x: cursorData.x, y: cursorData.y } }
                : user
            ));
            events.onCursorUpdate?.(cursorData);
            break;
            
          case 'element_changed':
            events.onElementChanged?.(message.data);
            break;
        }
      } catch (error) {
        console.error('Collaboration message error:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
      hasJoined.current = false;
      setIsConnected(false);
      setActiveUsers([]);
    };
  }, [socket, wsConnected, workflowId, userId, userName]);

  const sendCursorPosition = (x: number, y: number) => {
    if (socket && wsConnected) {
      socket.send(JSON.stringify({
        type: 'cursor_move',
        x,
        y
      }));
    }
  };

  const broadcastElementUpdate = (elementId: string, changes: any, bpmnXml: string) => {
    if (socket && wsConnected) {
      socket.send(JSON.stringify({
        type: 'element_update',
        elementId,
        changes,
        bpmnXml
      }));
    }
  };

  return {
    activeUsers,
    isConnected,
    sendCursorPosition,
    broadcastElementUpdate
  };
}