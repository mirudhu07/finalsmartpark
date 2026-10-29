import { io, Socket } from 'socket.io-client';
import { Config } from '../constants/config';

export const socket: Socket = io(Config.socketUrl, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  transports: ['websocket', 'polling'],
});
