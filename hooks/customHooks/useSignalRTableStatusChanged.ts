"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTableContext } from '@/hooks/context/Context';
import { TABLE_STORE } from "@/name-value-env";
import { SHOPPING_CARTS } from "@/key-store";

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

interface TableStatusChangedNotification {
    tableId: string;
    tableName: string;
    oldStatus: number; // 0 = Available, 1 = Occupied, 2 = Reserved
    newStatus: number;
    reason: string;
    updatedBy: string;
    updatedAt: string;
    notificationType: string;
}

// Helper to normalize table ID for comparison
function normalizeTableId(id: string | undefined): string {
    if (!id) return '';
    return String(id).toLowerCase().trim();
}

/**
 * Hook để lắng nghe TableStatusChanged notification từ SignalR
 * Khi moderator đánh dấu bàn "Trống", tự động redirect customer đến /end
 */
export function useSignalRTableStatusChanged(tableId: string) {
    const router = useRouter();
    const { setTable } = useTableContext();
    const connectionRef = useRef<any>(null);
    const signalRRef = useRef<typeof window.signalR | null>(null);

    useEffect(() => {
        // Skip if tableId is invalid
        if (!tableId || tableId === 'default_id' || tableId.trim() === '') {
            return;
        }

        let isUnmounted = false;

        const initSignalR = async () => {
            try {
                // Load SignalR library dynamically
                if (typeof window === 'undefined') return;

                // Check if SignalR is already loaded
                if (window.signalR) {
                    signalRRef.current = window.signalR;
                } else {
                    // Load from CDN
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/@microsoft/signalr@latest/dist/browser/signalr.min.js';
                    script.async = true;

                    await new Promise<void>((resolve, reject) => {
                        script.onload = () => {
                            signalRRef.current = window.signalR;
                            resolve();
                        };
                        script.onerror = () => {
                            reject(new Error('Failed to load SignalR'));
                        };
                        document.head.appendChild(script);
                    });
                }

                if (!signalRRef.current || isUnmounted) {
                    return;
                }

                // Build hub URL - use local backend for development
                const getBaseUrl = () => {
                    if (typeof window !== 'undefined') {
                        const hostname = window.location.hostname;
                        if (hostname === 'localhost' || hostname === '127.0.0.1') {
                            return 'http://localhost:5235';
                        }
                    }
                    return 'https://be.qrcodeordering.duckdns.org';
                };

                const baseUrl = getBaseUrl();
                const hubUrl = `${baseUrl}/hubs/customer-table`;

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

                // Listen for TableStatusChanged event
                connection.on('TableStatusChanged', (notification: TableStatusChangedNotification) => {
                    // Normalize IDs for comparison
                    const notificationTableId = normalizeTableId(notification.tableId);
                    const currentTableId = normalizeTableId(tableId);

                    // Only process if notification is for current table
                    if (notificationTableId === currentTableId) {
                        // Check if status changed to Available (0)
                        // This means moderator marked table as "Trống"
                        if (notification.newStatus === 0) {
                            // Clear table context
                            setTable("", "", "");

                            // Clear localStorage
                            try {
                                localStorage.removeItem(TABLE_STORE);
                                localStorage.removeItem(SHOPPING_CARTS);
                            } catch (e) {
                                // Silent fail
                            }

                            // Redirect to end page
                            router.replace('/end');
                        }
                    }
                });

                // Connection events
                connection.onreconnected(() => {
                    if (tableId) {
                        const normalizedTableId = normalizeTableId(tableId);
                        connection.invoke('JoinTableGroup', normalizedTableId).catch(() => {});
                    }
                });

                connection.onclose(() => {});

                // Start connection
                connection.start()
                    .then(() => {
                        if (isUnmounted) return;

                        // Join table group
                        if (tableId && tableId !== 'default_id') {
                            const normalizedTableId = normalizeTableId(tableId);
                            return connection.invoke('JoinTableGroup', normalizedTableId);
                        }
                    })
                    .catch(() => {});

            } catch (error) {
                // Silent fail
            }
        };

        initSignalR();

        // Cleanup
        return () => {
            isUnmounted = true;
            if (connectionRef.current) {
                connectionRef.current.off('TableStatusChanged');
                connectionRef.current.stop().catch(() => {});
            }
        };
    }, [tableId, router, setTable]);
}
