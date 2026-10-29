import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer, allowedOrigins: string[]): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.emit('connected', {
      message: 'Connected to SmartPark Real-Time Service',
      serverTime: new Date().toISOString(),
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitOccupancyUpdate(facilityId: string, currentOccupancy: number, totalCapacity: number) {
  if (io) {
    const occupancyPercentage = Math.round((currentOccupancy / totalCapacity) * 100);
    io.emit('occupancy:update', {
      facilityId,
      currentOccupancy,
      totalCapacity,
      occupancyPercentage,
      availableSpaces: Math.max(0, totalCapacity - currentOccupancy),
      timestamp: new Date().toISOString(),
    });
  }
}

export function emitReservationUpdate(reservation: any) {
  if (io) {
    io.emit('reservation:update', {
      reservation,
      timestamp: new Date().toISOString(),
    });
  }
}

export function emitFacilityUpdate(facility: any) {
  if (io) {
    io.emit('facility:update', {
      facility,
      timestamp: new Date().toISOString(),
    });
  }
}

export function getIO(): SocketIOServer | null {
  return io;
}
