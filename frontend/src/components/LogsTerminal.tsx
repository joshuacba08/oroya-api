import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { LogEntry, LogFilters, logsService } from "../services/logsService";
import { Button } from "./ui/button";

interface LogsTerminalProps {
  projectId: string;
  className?: string;
}

const LogsTerminal: React.FC<LogsTerminalProps> = ({
  projectId,
  className = "",
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const isMountedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const [filters, setFilters] = useState<LogFilters>({ projectId });
  const [logCount, setLogCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Manual refit function
  const manualRefit = () => {
    if (
      fitAddon.current &&
      terminalRef.current &&
      terminal.current &&
      isMountedRef.current
    ) {
      const container = terminalRef.current;
      const { width, height } = container.getBoundingClientRect();

      if (width > 0 && height > 0) {
        try {
          fitAddon.current.fit();
        } catch (error) {
          console.warn("Manual refit failed:", error);
        }
      }
    }
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    // Set mounted state to true
    isMountedRef.current = true;

    // Initialize terminal with modern dark theme
    terminal.current = new Terminal({
      theme: {
        background: "#1a1a1a",
        foreground: "#e5e5e5",
        cursor: "#e5e5e5",
        selectionBackground: "#3b82f6",
        black: "#1a1a1a",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#3b82f6",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#f5f5f5",
        brightBlack: "#374151",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#facc15",
        brightBlue: "#60a5fa",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
      },
      fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
      fontSize: 13,
      lineHeight: 1.2,
      letterSpacing: 0.5,
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 1000,
      tabStopWidth: 2,
    });

    // Add fit addon
    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);

    // Mount terminal
    terminal.current.open(terminalRef.current);

    // Wait for container to have proper dimensions before fitting
    const waitForDimensionsAndFit = () => {
      if (!fitAddon.current || !terminalRef.current || !isMountedRef.current) {
        return;
      }

      const container = terminalRef.current;
      const { width, height } = container.getBoundingClientRect();

      // Only fit if container has dimensions
      if (width > 0 && height > 0) {
        try {
          fitAddon.current.fit();
        } catch (error) {
          console.warn("Failed to fit terminal:", error);
        }
      } else {
        // If no dimensions yet, try again in next frame
        requestAnimationFrame(waitForDimensionsAndFit);
      }
    };

    // Use both setTimeout and requestAnimationFrame for better reliability
    setTimeout(() => requestAnimationFrame(waitForDimensionsAndFit), 0);

    // Welcome message
    terminal.current.writeln(
      "\x1b[1;36m╔══════════════════════════════════════════════════════════════════════════════╗\x1b[0m"
    );
    terminal.current.writeln(
      "\x1b[1;36m║                           🚀 Oroya API - Logs en Tiempo Real                 ║\x1b[0m"
    );
    terminal.current.writeln(
      "\x1b[1;36m╚══════════════════════════════════════════════════════════════════════════════╝\x1b[0m"
    );
    terminal.current.writeln("");
    terminal.current.writeln(
      "\x1b[90m💡 Conectando al servidor de logs...\x1b[0m"
    );
    terminal.current.writeln("");

    // Handle resize with dimension checks
    const handleResize = () => {
      if (
        !fitAddon.current ||
        !terminalRef.current ||
        !terminal.current ||
        !isMountedRef.current
      ) {
        return;
      }

      const container = terminalRef.current;
      const { width, height } = container.getBoundingClientRect();

      // Only attempt to fit if container has valid dimensions
      if (width > 0 && height > 0) {
        try {
          fitAddon.current.fit();
        } catch (error) {
          console.warn("Failed to fit terminal on resize:", error);
        }
      }
    };

    // Use both window resize and ResizeObserver for better coverage
    window.addEventListener("resize", handleResize);

    // Handle page visibility changes (e.g., tab switches)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page is now visible, try to fit after a delay
        setTimeout(handleResize, 200);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;

    if (terminalRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        // Debounce the resize calls
        setTimeout(handleResize, 10);
      });
      resizeObserver.observe(terminalRef.current);
    }

    // Use IntersectionObserver to detect when terminal becomes visible
    if (terminalRef.current && typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
              // Terminal is now visible, attempt to fit
              setTimeout(handleResize, 100);
            }
          });
        },
        { threshold: 0.1 }
      );
      intersectionObserver.observe(terminalRef.current);
    }

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
      if (terminal.current) {
        terminal.current.dispose();
        terminal.current = null;
      }
      if (fitAddon.current) {
        fitAddon.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Connect to logs service
    console.log("🎯 LogsTerminal: Iniciando conexión a logs service");
    console.log("🎯 LogsTerminal: Estado mounted:", isMountedRef.current);
    logsService.connect();

    const cleanupNewLog = logsService.onNewLog((log: LogEntry) => {
      console.log("🎯 LogsTerminal: Log recibido en componente:", log);
      if (!terminal.current || isPaused) {
        console.log(
          "🚫 LogsTerminal: Log ignorado - terminal:",
          !!terminal.current,
          "paused:",
          isPaused
        );
        return;
      }

      try {
        // Format and display log
        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        const method = log.method.padEnd(6);
        const status = log.status_code.toString();
        const responseTime = `${log.response_time}ms`.padStart(6);

        // Color based on status code
        let statusColor = "";
        if (status.startsWith("2")) statusColor = "\x1b[32m"; // Green
        else if (status.startsWith("3")) statusColor = "\x1b[33m"; // Yellow
        else if (status.startsWith("4")) statusColor = "\x1b[31m"; // Red
        else if (status.startsWith("5")) statusColor = "\x1b[91m"; // Bright Red
        else statusColor = "\x1b[37m"; // White

        // Method color
        let methodColor = "";
        switch (log.method) {
          case "GET":
            methodColor = "\x1b[36m"; // Cyan
            break;
          case "POST":
            methodColor = "\x1b[32m"; // Green
            break;
          case "PUT":
            methodColor = "\x1b[33m"; // Yellow
            break;
          case "DELETE":
            methodColor = "\x1b[31m"; // Red
            break;
          case "PATCH":
            methodColor = "\x1b[35m"; // Magenta
            break;
          default:
            methodColor = "\x1b[37m"; // White
        }

        const logLine = `\x1b[90m${timestamp}\x1b[0m ${methodColor}${method}\x1b[0m ${statusColor}${status}\x1b[0m \x1b[90m${responseTime}\x1b[0m \x1b[94m${log.url}\x1b[0m`;

        if (log.error_message) {
          terminal.current.writeln(
            `${logLine} \x1b[91m❌ ${log.error_message}\x1b[0m`
          );
        } else {
          terminal.current.writeln(logLine);
        }

        console.log("✅ LogsTerminal: Log mostrado en terminal exitosamente");
        setLogCount((prev) => prev + 1);
      } catch (error) {
        console.error("Error displaying log:", error);
      }
    });

    // Join logs with current filters
    console.log("🎯 LogsTerminal: Uniéndose a logs con filtros:", filters);
    logsService.joinLogs(filters);

    // Update connection status
    const checkConnection = () => {
      setIsConnected(logsService.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => {
      clearInterval(interval);
      cleanupNewLog();
      logsService.leaveLogs();
    };
  }, [filters, isPaused]);

  // Effect to handle initial visibility and tab switching
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger manual refit after component is likely to be visible
      manualRefit();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleClearTerminal = () => {
    if (terminal.current) {
      terminal.current.clear();
      setLogCount(0);
    }
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    if (terminal.current) {
      if (!isPaused) {
        terminal.current.writeln("\x1b[93m⏸️  Logs pausados\x1b[0m");
      } else {
        terminal.current.writeln("\x1b[92m▶️  Reanudando logs...\x1b[0m");
      }
    }
  };

  const handleReconnect = () => {
    if (terminal.current) {
      terminal.current.writeln("\x1b[93m🔄 Reconectando...\x1b[0m");
    }
    logsService.disconnect();
    setTimeout(() => {
      logsService.connect();
      logsService.joinLogs(filters);
    }, 1000);
  };

  const handleFilterChange = (newFilters: Partial<LogFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    if (terminal.current) {
      terminal.current.writeln(
        `\x1b[93m🔍 Aplicando filtros: ${JSON.stringify(updatedFilters)}\x1b[0m`
      );
    }
  };

  const handleExportLogs = async () => {
    try {
      const response = await logsService.fetchLogs({
        projectId: filters.projectId,
        method: filters.method,
        status: filters.status,
        limit: 1000,
      });

      const csv = [
        "Timestamp,Method,URL,Status,Response Time,IP,Browser,OS",
        ...response.logs.map(
          (log: LogEntry) =>
            `"${log.timestamp}","${log.method}","${log.url}",${log.status_code},${log.response_time},"${log.ip_address}","${log.browser}","${log.os}"`
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logs-${projectId}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (terminal.current) {
        terminal.current.writeln(
          "\x1b[92m📁 Logs exportados exitosamente\x1b[0m"
        );
      }
    } catch (error) {
      console.error("Error exporting logs:", error);
      if (terminal.current) {
        terminal.current.writeln("\x1b[91m❌ Error al exportar logs\x1b[0m");
      }
    }
  };

  return (
    <div
      className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-background border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm font-medium text-foreground">
              {isConnected ? "Conectado" : "Desconectado"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {logCount} logs recibidos
          </div>
          {isPaused && (
            <div className="text-sm text-yellow-500 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Pausado
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filtros
          </Button>

          <Button
            onClick={handleTogglePause}
            variant="outline"
            size="sm"
            className={isPaused ? "text-green-500 border-green-500" : ""}
          >
            {isPaused ? (
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {isPaused ? "Reanudar" : "Pausar"}
          </Button>

          <Button onClick={handleClearTerminal} variant="outline" size="sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Limpiar
          </Button>

          <Button onClick={handleExportLogs} variant="outline" size="sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Exportar
          </Button>

          {!isConnected && (
            <Button
              onClick={handleReconnect}
              variant="outline"
              size="sm"
              className="text-red-500 border-red-500 hover:bg-red-50"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reconectar
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-background border-b border-border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Método HTTP
              </label>
              <select
                value={filters.method || ""}
                onChange={(e) =>
                  handleFilterChange({ method: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Estado HTTP
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange({ status: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="2xx">2xx - Éxito</option>
                <option value="3xx">3xx - Redirección</option>
                <option value="4xx">4xx - Error Cliente</option>
                <option value="5xx">5xx - Error Servidor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nivel de Log
              </label>
              <select
                value={filters.level || ""}
                onChange={(e) =>
                  handleFilterChange({ level: e.target.value || undefined })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="info">Info</option>
                <option value="warn">Advertencia</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilters({ projectId });
                  if (terminal.current) {
                    terminal.current.writeln(
                      "\x1b[93m🧹 Filtros limpiados\x1b[0m"
                    );
                  }
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Terminal */}
      <div
        ref={terminalRef}
        className="h-96 p-4 bg-[#1a1a1a] overflow-hidden"
        style={{
          fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
          minWidth: "300px",
          minHeight: "200px",
        }}
      />
    </div>
  );
};

export default LogsTerminal;
