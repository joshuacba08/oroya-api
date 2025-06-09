import { Server as HttpServer } from "http";
import { Socket, Server as SocketIOServer } from "socket.io";
import logger from "./logger";

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HttpServer): SocketIOServer => {
  // Configuración simplificada y más permisiva para desarrollo
  const corsConfig = {
    origin:
      process.env.NODE_ENV === "development"
        ? true
        : ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  };

  io = new SocketIOServer(httpServer, {
    cors: corsConfig,
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  // Log de configuración para debug
  console.log("🔧 Socket.io CORS config:", corsConfig);

  io.on("connection", (socket: Socket) => {
    logger.info("🔌 Client connected to real-time logs", {
      socketId: socket.id,
      ip: socket.handshake.address,
    });

    // Join specific log rooms based on filters
    socket.on(
      "join-logs",
      (filters: {
        projectId?: string;
        method?: string;
        status?: string;
        level?: string;
      }) => {
        // Leave previous rooms
        socket.rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join appropriate rooms
        const rooms = ["logs-all"]; // Always join general logs

        if (filters.projectId) {
          rooms.push(`logs-project-${filters.projectId}`);
        }

        if (filters.method) {
          rooms.push(`logs-method-${filters.method}`);
        }

        if (filters.status) {
          rooms.push(`logs-status-${filters.status}`);
        }

        if (filters.level) {
          rooms.push(`logs-level-${filters.level}`);
        }

        rooms.forEach((room) => socket.join(room));

        logger.info("📺 Client joined log rooms", {
          socketId: socket.id,
          rooms,
          filters,
        });

        socket.emit("joined-rooms", { rooms, filters });
      }
    );

    socket.on("leave-logs", () => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      logger.info("🚪 Client left all log rooms", {
        socketId: socket.id,
      });
    });

    socket.on("disconnect", () => {
      logger.info("🔌 Client disconnected from real-time logs", {
        socketId: socket.id,
      });
    });
  });

  logger.info("🚀 Socket.io initialized for real-time logs");
  return io;
};

export const getSocketIO = (): SocketIOServer | null => {
  return io;
};

// Interfaces for log data
export interface LogData {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status_code?: number;
  response_time?: number;
  ip_address: string;
  user_agent: string;
  browser?: string;
  os?: string;
  device?: string;
  project_id?: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  request_size?: number;
  response_size?: number;
  error_message?: string;
  query_params?: string;
  body_params?: string;
  headers?: string;
  referrer?: string;
  session_id?: string;
}

// Function to emit logs to connected clients
export const emitLogToClients = (logData: LogData): void => {
  if (!io) return;

  // Emit to all logs room
  io.to("logs-all").emit("new-log", logData);

  // Emit to project-specific room
  if (logData.project_id) {
    io.to(`logs-project-${logData.project_id}`).emit("new-log", logData);
  }

  // Emit to method-specific room
  io.to(`logs-method-${logData.method}`).emit("new-log", logData);

  // Emit to status-specific room
  if (logData.status_code) {
    const statusRange = Math.floor(logData.status_code / 100) + "xx";
    io.to(`logs-status-${statusRange}`).emit("new-log", logData);
  }

  // Emit based on log level
  let level = "info";
  if (logData.status_code && logData.status_code >= 500) {
    level = "error";
  } else if (logData.status_code && logData.status_code >= 400) {
    level = "warn";
  }

  io.to(`logs-level-${level}`).emit("new-log", logData);
};

export default { initializeSocket, getSocketIO, emitLogToClients };
