import { io, Socket } from "socket.io-client";

export interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status_code: number;
  response_time: number;
  ip_address: string;
  user_agent: string;
  browser: string;
  os: string;
  device: string;
  project_id: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  request_size: number;
  response_size: number;
  error_message?: string;
  query_params: string;
  body_params?: string;
  headers: string;
  referrer?: string;
  session_id?: string;
}

export interface LogFilters {
  projectId?: string;
  method?: string;
  status?: string;
  level?: string;
}

export interface LogsStats {
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  statusDistribution: {
    "2xx": number;
    "3xx": number;
    "4xx": number;
    "5xx": number;
  };
}

class LogsService {
  private socket: Socket | null = null;
  private onNewLogCallbacks: ((log: LogEntry) => void)[] = [];
  private onStatsUpdateCallbacks: ((stats: LogsStats) => void)[] = [];
  private currentFilters: LogFilters = {};

  constructor() {
    this.socket = io("http://localhost:8080", {
      autoConnect: false,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Conectado al servidor de logs");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Desconectado del servidor de logs");
    });

    this.socket.on("new-log", (logData: LogEntry) => {
      console.log("📋 Nuevo log recibido:", logData);
      this.onNewLogCallbacks.forEach((callback) => callback(logData));
    });

    this.socket.on("joined-rooms", (data: { rooms: string[] }) => {
      console.log("🏠 Unido a salas:", data.rooms);
    });

    this.socket.on("stats-update", (stats: LogsStats) => {
      this.onStatsUpdateCallbacks.forEach((callback) => callback(stats));
    });

    this.socket.on("connect_error", (error) => {
      console.error("Error de conexión:", error);
    });
  }

  connect() {
    if (!this.socket?.connected) {
      this.socket?.connect();
    }
  }

  disconnect() {
    if (this.socket?.connected) {
      this.socket.emit("leave-logs");
      this.socket.disconnect();
    }
  }

  joinLogs(filters: LogFilters = {}) {
    console.log("🔗 Intentando unirse a logs con filtros:", filters);

    if (!this.socket?.connected) {
      console.warn("Socket no conectado. Conectando primero...");
      this.connect();

      // Wait for connection and then join
      const handleConnect = () => {
        console.log("🚀 Socket conectado, enviando join-logs");
        this.socket?.emit("join-logs", filters);
        this.currentFilters = filters;
        this.socket?.off("connect", handleConnect); // Remove listener to avoid duplicates
      };

      this.socket?.on("connect", handleConnect);
    } else {
      console.log("✅ Socket ya conectado, enviando join-logs");
      this.socket.emit("join-logs", filters);
      this.currentFilters = filters;
    }
  }

  leaveLogs() {
    if (this.socket?.connected) {
      this.socket.emit("leave-logs");
    }
  }

  onNewLog(callback: (log: LogEntry) => void) {
    this.onNewLogCallbacks.push(callback);

    // Return cleanup function
    return () => {
      const index = this.onNewLogCallbacks.indexOf(callback);
      if (index > -1) {
        this.onNewLogCallbacks.splice(index, 1);
      }
    };
  }

  onStatsUpdate(callback: (stats: LogsStats) => void) {
    this.onStatsUpdateCallbacks.push(callback);

    // Return cleanup function
    return () => {
      const index = this.onStatsUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.onStatsUpdateCallbacks.splice(index, 1);
      }
    };
  }

  getCurrentFilters(): LogFilters {
    return { ...this.currentFilters };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Fetch historical logs via HTTP API
  async fetchLogs(
    params: {
      page?: number;
      limit?: number;
      projectId?: string;
      method?: string;
      status?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `http://localhost:8080/api/analytics/logs?${queryParams}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching logs: ${response.statusText}`);
    }

    return response.json();
  }

  // Fetch project stats
  async fetchProjectStats(projectId: string) {
    const response = await fetch(
      `http://localhost:8080/api/analytics/projects/${projectId}/stats`
    );

    if (!response.ok) {
      throw new Error(`Error fetching project stats: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const logsService = new LogsService();
export default logsService;
