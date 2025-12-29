"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTableContext } from '@/hooks/context/Context';

// SignalR types (from @microsoft/signalr)
declare global {
  interface Window {
    signalR?: {
      HubConnectionBuilder: new () => {
        withUrl(url: string, options?: any): any;
        withAutomaticReconnect(): any;
        build(): {
          start(): Promise<void>;
          stop(): Promise<void>;
          on(methodName: string, callback: (...args: any[]) => void): void;
          off(methodName: string, callback?: (...args: any[]) => void): void;
          invoke(methodName: string, ...args: any[]): Promise<any>;
          onreconnected(callback: () => void): void;
          onclose(callback: (error?: Error) => void): void;
        };
      };
      HttpTransportType: {
        WebSockets: number;
      };
    };
  }
}

interface TableMovedNotification {
  oldTableId: string; // Backend sends as Guid, but SignalR serializes to string
  oldTableName: string;
  newTableId: string;
  newTableName: string;
  reason: string;
  movedBy: string;
  movedAt: string;
  notificationType: string;
  message: string;
}

// Helper to normalize table ID for comparison
function normalizeTableId(id: string | undefined): string {
  if (!id) return '';
  // Convert to string and normalize (lowercase, trim)
  return String(id).toLowerCase().trim();
}

/**
 * Hook để lắng nghe TableMoved notification từ SignalR
 * Khi moderator chuyển bàn, tự động redirect customer đến bàn mới
 */
export function useSignalRTableMoved(tableId: string) {
  const router = useRouter();
  const { setTable } = useTableContext();
  const connectionRef = useRef<any>(null);
  const signalRRef = useRef<typeof window.signalR | null>(null);

  useEffect(() => {
    // Skip if tableId is invalid
    if (!tableId || tableId === 'default_id' || tableId.trim() === '') {
      console.log('⚠️ useSignalRTableMoved: Invalid tableId, skipping SignalR connection');
      return;
    }

    // Dynamic import SignalR để tránh SSR issues
    let isUnmounted = false;

    const initSignalR = async () => {
      try {
        // Load SignalR library dynamically
        if (typeof window === 'undefined') return;

        console.log('📦 Loading SignalR library...');

        // Check if SignalR is already loaded
        if (window.signalR) {
          signalRRef.current = window.signalR;
          console.log('✅ SignalR library already loaded');
        } else {
          // Load from CDN
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@microsoft/signalr@latest/dist/browser/signalr.min.js';
          script.async = true;
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => {
              signalRRef.current = window.signalR;
              console.log('✅ SignalR library loaded from CDN');
              resolve();
            };
            script.onerror = () => {
              console.error('❌ Failed to load SignalR library');
              reject(new Error('Failed to load SignalR'));
            };
            document.head.appendChild(script);
          });
        }

        if (!signalRRef.current || isUnmounted) {
          console.warn('⚠️ SignalR not available or component unmounted');
          return;
        }

        // Build hub URL from API base URL
        // Use the same base URL as the API calls to ensure consistency
        // For local testing: use 'http://localhost:5235'
        // For production: use 'https://be.qrcodeordering.duckdns.org'
        const getBaseUrl = () => {
          // Check if we're in development mode
          if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            // If running on localhost, use local backend
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
              return 'http://localhost:5235';
            }
          }
          // Default to production
          return 'https://be.qrcodeordering.duckdns.org';
        };
        
        const baseUrl = getBaseUrl();
        const hubUrl = `${baseUrl}/hubs/customer-table`;

        console.log('🔌 Connecting to SignalR hub:', hubUrl);
        console.log('📋 Current tableId:', tableId);

        // Create connection
        const builder = new signalRRef.current.HubConnectionBuilder();
        const connection = builder
          .withUrl(hubUrl, {
            transport: signalRRef.current.HttpTransportType.WebSockets,
            withCredentials: true,
          })
          .withAutomaticReconnect()
          .build();

        connectionRef.current = connection;

        // Listen for TableMoved event
        connection.on('TableMoved', (notification: TableMovedNotification) => {
          console.log('🚚 TableMoved notification received:', notification);
          console.log('🚚 Full notification object:', JSON.stringify(notification, null, 2));
          
          // Normalize IDs for comparison
          const oldTableIdNormalized = normalizeTableId(notification.oldTableId);
          const currentTableIdNormalized = normalizeTableId(tableId);
          const newTableIdNormalized = normalizeTableId(notification.newTableId);
          
          console.log('🔍 Comparing IDs:');
          console.log('  - Notification oldTableId (raw):', notification.oldTableId);
          console.log('  - Notification oldTableId (normalized):', oldTableIdNormalized);
          console.log('  - Current tableId (raw):', tableId);
          console.log('  - Current tableId (normalized):', currentTableIdNormalized);
          console.log('  - Match:', oldTableIdNormalized === currentTableIdNormalized);

          // Chỉ xử lý nếu notification là cho bàn hiện tại
          if (oldTableIdNormalized === currentTableIdNormalized) {
            console.log(`✅ Table moved from ${notification.oldTableName} to ${notification.newTableName}`);

            // Update table context
            setTable(
              notification.newTableId,
              'Occupied', // Status sau khi chuyển bàn
              notification.newTableName
            );

            // Leave old table group và join new table group
            const oldTableIdStr = normalizeTableId(notification.oldTableId);
            const newTableIdStr = normalizeTableId(notification.newTableId);
            
            connection.invoke('LeaveTableGroup', oldTableIdStr).catch((err: Error) => {
              console.error('❌ Failed to leave old table group:', err);
            });
            connection.invoke('JoinTableGroup', newTableIdStr).catch((err: Error) => {
              console.error('❌ Failed to join new table group:', err);
            });

            // Redirect to new table
            // Determine current route and redirect accordingly
            const currentPath = window.location.pathname;
            
            if (currentPath.includes('/productions/order/')) {
              // Đang ở trang order, redirect đến order của bàn mới
              router.push(`/productions/order/${notification.newTableId}`);
            } else if (currentPath.includes('/productions/')) {
              // Đang ở trang productions, redirect đến productions của bàn mới
              router.push(`/productions/${notification.newTableId}`);
            } else {
              // Default: redirect đến productions
              router.push(`/productions/${notification.newTableId}`);
            }

            // Reload page để refresh data
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        });

        // Connection events
        connection.onreconnected(() => {
          console.log('🔄 SignalR reconnected');
          // Rejoin table group after reconnect
          if (tableId) {
            connection.invoke('JoinTableGroup', tableId).catch(console.error);
          }
        });

        connection.onclose((error?: Error) => {
          if (error) {
            console.error('❌ SignalR connection closed with error:', error);
          } else {
            console.log('⚠️ SignalR connection closed');
          }
        });

        // Start connection
        connection.start()
          .then(() => {
            if (isUnmounted) return;
            console.log('✅ SignalR connected to CustomerTableHub');
            console.log('📋 Connection state:', connection.state);
            console.log('📋 Connection ID:', (connection as any).connectionId);
            
            // Join table group
            if (tableId && tableId !== 'default_id') {
              const normalizedTableId = normalizeTableId(tableId);
              console.log(`🔄 Joining table group: CustomerTable_${normalizedTableId}`);
              return connection.invoke('JoinTableGroup', normalizedTableId);
            } else {
              console.warn('⚠️ TableId is empty or default, skipping join group');
            }
          })
          .then(() => {
            if (tableId && tableId !== 'default_id') {
              const normalizedTableId = normalizeTableId(tableId);
              console.log(`✅ Successfully joined table group: CustomerTable_${normalizedTableId}`);
              console.log('👂 Listening for TableMoved events...');
              console.log('📋 Waiting for notifications for table:', normalizedTableId);
            }
          })
          .catch((err: Error) => {
            console.error('❌ SignalR connection error:', err);
            console.error('❌ Error message:', err.message);
            console.error('❌ Error stack:', err.stack);
          });

      } catch (error) {
        console.error('❌ Failed to initialize SignalR:', error);
      }
    };

    initSignalR();

    // Cleanup
    return () => {
      isUnmounted = true;
      if (connectionRef.current) {
        // Remove event listeners
        connectionRef.current.off('TableMoved');
        // Stop connection
        connectionRef.current.stop().catch(console.error);
      }
    };
  }, [tableId, router, setTable]);
}

