import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { getSignalRHubUrl, SIGNALR_HUBS } from '@/env.config';
import { topMostOrderedProducts } from '@/api/admin/adminApi';

interface UseAdminDashboardHubOptions {
  /** Callback khi nhận được cập nhật dashboard từ server */
  onDashboardUpdated?: (data: topMostOrderedProducts) => void;
  /** Tự động kết nối khi hook được mount (default: true) */
  autoConnect?: boolean;
}

interface UseAdminDashboardHubReturn {
  /** Trạng thái kết nối */
  isConnected: boolean;
  /** Đang trong quá trình kết nối */
  isConnecting: boolean;
  /** Lỗi kết nối (nếu có) */
  error: Error | null;
  /** Kết nối thủ công */
  connect: () => Promise<void>;
  /** Ngắt kết nối thủ công */
  disconnect: () => Promise<void>;
}

/**
 * Hook để kết nối với AdminDashboardHub qua SignalR
 * 
 * @description
 * Tự động kết nối đến /hubs/admin-dashboard và lắng nghe sự kiện DashboardStatsUpdated
 * để nhận cập nhật realtime cho dashboard admin.
 * 
 * @example
 * ```tsx
 * const { isConnected } = useAdminDashboardHub({
 *   onDashboardUpdated: (data) => {
 *     setDashboardData(data);
 *   }
 * });
 * ```
 */
export function useAdminDashboardHub(
  options: UseAdminDashboardHubOptions = {}
): UseAdminDashboardHubReturn {
  const { onDashboardUpdated, autoConnect = true } = options;

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Store callback ref to avoid stale closure
  const onDashboardUpdatedRef = useRef(onDashboardUpdated);
  useEffect(() => {
    onDashboardUpdatedRef.current = onDashboardUpdated;
  }, [onDashboardUpdated]);

  const connect = useCallback(async () => {
    // Nếu đã kết nối hoặc đang kết nối thì bỏ qua
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Build hub URL
      const hubUrl = getSignalRHubUrl(SIGNALR_HUBS.ADMIN_DASHBOARD);

      // Tạo connection nếu chưa có
      if (!connectionRef.current) {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            transport: signalR.HttpTransportType.WebSockets,
            withCredentials: true,
          })
          .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
          .configureLogging(signalR.LogLevel.Warning)
          .build();

        // Đăng ký event handlers
        connection.on('DashboardStatsUpdated', (data: topMostOrderedProducts) => {
          onDashboardUpdatedRef.current?.(data);
        });

        // Connection state handlers
        connection.onreconnecting((err) => {
          setIsConnected(false);
          console.warn('[AdminDashboardHub] Reconnecting...', err);
        });

        connection.onreconnected(() => {
          setIsConnected(true);
          console.info('[AdminDashboardHub] Reconnected');
          // Rejoin admin group sau khi reconnect
          connection.invoke('JoinAdminGroup').catch(() => {});
        });

        connection.onclose((err) => {
          setIsConnected(false);
          if (err) {
            console.error('[AdminDashboardHub] Connection closed with error:', err);
          }
        });

        connectionRef.current = connection;
      }

      // Start connection
      await connectionRef.current.start();
      setIsConnected(true);

      // Join admin group để nhận broadcast
      await connectionRef.current.invoke('JoinAdminGroup');
      console.info('[AdminDashboardHub] Connected and joined admin group');
    } catch (err) {
      const connectionError = err instanceof Error ? err : new Error('Failed to connect');
      setError(connectionError);
      console.error('[AdminDashboardHub] Connection error:', connectionError);
      
      // Retry sau 30 giây nếu tự động kết nối
      if (autoConnect) {
        setTimeout(connect, 30000);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [autoConnect]);

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      try {
        // Leave admin group trước khi disconnect
        if (connectionRef.current.state === signalR.HubConnectionState.Connected) {
          await connectionRef.current.invoke('LeaveAdminGroup').catch(() => {});
        }
        await connectionRef.current.stop();
        console.info('[AdminDashboardHub] Disconnected');
      } catch (err) {
        console.error('[AdminDashboardHub] Error disconnecting:', err);
      }
      setIsConnected(false);
    }
  }, []);

  // Auto connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      // Cleanup on unmount
      if (connectionRef.current) {
        connectionRef.current.off('DashboardStatsUpdated');
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
    };
  }, [autoConnect, connect]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  };
}
