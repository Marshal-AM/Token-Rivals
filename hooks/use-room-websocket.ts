import { useState, useEffect, useRef, useCallback } from 'react';

interface RoomData {
  selectedPlayers: any[];
  formation: string;
  bet?: string;
  stake?: number;
}

interface WebSocketMessage {
  type: string;
  roomId?: string;
  hostData?: RoomData;
  guestData?: RoomData;
  error?: string;
  reason?: string;
  requiredStake?: number;
  betType?: string;
}

interface RoomInfo {
  roomId: string;
  requiredStake: number;
  betType: string;
  hostData: RoomData;
}

interface UseRoomWebSocketReturn {
  isConnected: boolean;
  roomId: string | null;
  roomStatus: 'idle' | 'waiting' | 'handshaking' | 'accepted' | 'tournament' | 'error';
  error: string | null;
  roomInfo: RoomInfo | null;
  createRoom: (data: RoomData) => void;
  getRoomInfo: (roomId: string) => void;
  joinRoom: (roomId: string, data: RoomData) => void;
  acceptHandshake: (roomId: string) => void;
  rejectHandshake: (roomId: string, reason?: string) => void;
  setPlayerReady: (roomId: string) => void;
  disconnect: () => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001';

export function useRoomWebSocket(): UseRoomWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<'idle' | 'waiting' | 'handshaking' | 'accepted' | 'tournament' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const log = useCallback((message: string, type: 'INFO' | 'ERROR' | 'WARN' = 'INFO') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] [RoomWebSocket] ${message}`);
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log('WebSocket already connected');
      return;
    }

    log(`Connecting to WebSocket server: ${WS_URL}`);
    
    try {
      wsRef.current = new WebSocket(WS_URL);
      
      wsRef.current.onopen = () => {
        log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          log(`Received message: ${message.type}`);
          
          handleMessage(message);
        } catch (error) {
          log(`Error parsing message: ${error}`, 'ERROR');
        }
      };

      wsRef.current.onclose = (event) => {
        log(`WebSocket connection closed: ${event.code} - ${event.reason}`);
        setIsConnected(false);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          log('Max reconnection attempts reached', 'ERROR');
          setError('Connection lost. Please refresh the page.');
        }
      };

      wsRef.current.onerror = (error) => {
        log(`WebSocket error: ${error}`, 'ERROR');
        setError('Connection error occurred');
      };
    } catch (error) {
      log(`Failed to create WebSocket connection: ${error}`, 'ERROR');
      setError('Failed to connect to server');
    }
  }, [log]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'ROOM_CREATED':
        log(`Room created successfully: ${message.roomId}`);
        setRoomId(message.roomId || null);
        setRoomStatus('waiting');
        setError(null);
        break;

      case 'ROOM_INFO_SUCCESS':
        log(`Room info received: ${message.roomId}`);
        if (message.roomId && message.requiredStake !== undefined && message.betType && message.hostData) {
          setRoomInfo({
            roomId: message.roomId,
            requiredStake: message.requiredStake,
            betType: message.betType,
            hostData: message.hostData
          });
        }
        setError(null);
        break;

      case 'ROOM_INFO_FAILED':
        log(`Room info failed: ${message.error}`, 'ERROR');
        setError(message.error || 'Failed to get room info');
        setRoomInfo(null);
        break;

      case 'ROOM_CREATION_FAILED':
        log(`Room creation failed: ${message.error}`, 'ERROR');
        setError(message.error || 'Failed to create room');
        setRoomStatus('error');
        break;

      case 'JOIN_ROOM_SUCCESS':
        log(`Successfully joined room: ${message.roomId}`);
        setRoomId(message.roomId || null);
        setRoomStatus('handshaking');
        setError(null);
        break;

      case 'JOIN_ROOM_FAILED':
        log(`Failed to join room: ${message.error}`, 'ERROR');
        setError(message.error || 'Failed to join room');
        setRoomStatus('error');
        break;

      case 'GUEST_JOINED':
        log(`Guest joined room: ${message.roomId}`);
        setRoomStatus('handshaking');
        break;

      case 'HANDSHAKE_REQUEST':
        log(`Handshake request received for room: ${message.roomId}`);
        setRoomStatus('handshaking');
        break;

      case 'HANDSHAKE_ACCEPTED':
        log(`Handshake accepted for room: ${message.roomId}`);
        setRoomStatus('accepted');
        break;

      case 'HANDSHAKE_REJECTED':
        log(`Handshake rejected: ${message.reason}`, 'ERROR');
        setError(message.reason || 'Handshake was rejected');
        setRoomStatus('error');
        break;

      case 'HANDSHAKE_COMPLETE':
        log(`Handshake completed for room: ${message.roomId}`);
        setRoomStatus('accepted');
        break;

      case 'TOURNAMENT_START':
        log(`Tournament starting for room: ${message.roomId}`);
        setRoomStatus('tournament');
        break;

      case 'HOST_DISCONNECTED':
        log(`Host disconnected from room: ${message.roomId}`, 'WARN');
        setError('Host disconnected from the room');
        setRoomStatus('error');
        break;

      case 'GUEST_DISCONNECTED':
        log(`Guest disconnected from room: ${message.roomId}`, 'WARN');
        setError('Guest disconnected from the room');
        setRoomStatus('error');
        break;

      default:
        log(`Unknown message type: ${message.type}`, 'WARN');
    }
  }, [log]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(message);
      log(`Sending message: ${message.type}`);
      wsRef.current.send(messageStr);
    } else {
      log('Cannot send message: WebSocket not connected', 'ERROR');
      setError('Not connected to server');
    }
  }, [log]);

  const createRoom = useCallback((data: RoomData) => {
    log(`Creating room with data: ${JSON.stringify(data)}`);
    sendMessage({
      type: 'CREATE_ROOM',
      hostData: data
    });
  }, [sendMessage, log]);

  const getRoomInfo = useCallback((roomId: string) => {
    log(`Getting room info for: ${roomId}`);
    sendMessage({
      type: 'GET_ROOM_INFO',
      roomId
    });
  }, [sendMessage, log]);

  const joinRoom = useCallback((roomId: string, data: RoomData) => {
    log(`Joining room: ${roomId} with data: ${JSON.stringify(data)}`);
    sendMessage({
      type: 'JOIN_ROOM',
      roomId,
      guestData: data
    });
  }, [sendMessage, log]);

  const acceptHandshake = useCallback((roomId: string) => {
    log(`Accepting handshake for room: ${roomId}`);
    sendMessage({
      type: 'HANDSHAKE_ACCEPT',
      roomId
    });
  }, [sendMessage, log]);

  const rejectHandshake = useCallback((roomId: string, reason?: string) => {
    log(`Rejecting handshake for room: ${roomId}${reason ? ` with reason: ${reason}` : ''}`);
    sendMessage({
      type: 'HANDSHAKE_REJECT',
      roomId,
      reason
    });
  }, [sendMessage, log]);

  const setPlayerReady = useCallback((roomId: string) => {
    log(`Setting player ready for room: ${roomId}`);
    sendMessage({
      type: 'PLAYER_READY',
      roomId
    });
  }, [sendMessage, log]);

  const disconnect = useCallback(() => {
    log('Disconnecting from WebSocket');
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'User initiated disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
    setRoomId(null);
    setRoomStatus('idle');
    setError(null);
    setRoomInfo(null);
  }, [log]);

  // Connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    roomId,
    roomStatus,
    error,
    roomInfo,
    createRoom,
    getRoomInfo,
    joinRoom,
    acceptHandshake,
    rejectHandshake,
    setPlayerReady,
    disconnect
  };
} 