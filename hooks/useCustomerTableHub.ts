import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { getSignalRHubUrl } from '@/env.config';

interface UseCustomerTableHubOptions {
  tableId: string;
  onTableMoved?: (notification: TableMovedNotification) => void;
  onHandleOrderResponse?: (response: any) => void;
  onGetOrdersResponse?: (response: any) => void;
  onGetComplainsResponse?: (response: any) => void;
  onChangeTableResponse?: (response: any) => void;
}

interface TableMovedNotification {
  oldTableId: string;
  oldTableName: string;
  newTableId: string;
  newTableName: string;
  reason: string;
  movedBy: string;
  movedAt: string;
  notificationType: string;
  message: string;
}

interface CreateOrderRequest {
  tableId: string;
  deviceToken?: string;
  items: Array<{
    productId: string;
    productSizeId: string;
    toppingIds: string[];
    note?: string;
  }>;
}

interface MoveTableRequest {
  newTableId: string;
  reason: string;
}

/**
 * Hook để kết nối với CustomerTableHub cho customer view
 * 
 * @example
 * ```tsx
 * const { 
 *   isConnected, 
 *   handleOrder, 
 *   getOrders, 
 *   getComplains, 
 *   changeTable,
 *   currentTableId 
 * } = useCustomerTableHub(tableId, {
 *   onTableMoved: (notification) => {
 *     // Handle table moved
 *     router.push(`/table/${notification.newTableId}`);
 *   }
 * });
 * ```
 */
export function useCustomerTableHub(
  tableId: string,
  options: Omit<UseCustomerTableHubOptions, 'tableId'> = {}
) {
  const {
    onTableMoved,
    onHandleOrderResponse,
    onGetOrdersResponse,
    onGetComplainsResponse,
    onChangeTableResponse,
  } = options;

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTableId, setCurrentTableId] = useState(tableId);

  useEffect(() => {
    let isUnmounted = false;

    // Build hub URL từ environment config
    const hubUrl = getSignalRHubUrl('/hubs/customer-table');
    console.log('🔌 Connecting to CustomerTableHub:', hubUrl);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        transport: signalR.HttpTransportType.WebSockets,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    // Event handlers
    connection.on('HandleOrderResponse', (response) => {
      console.log('📦 HandleOrderResponse:', response);
      onHandleOrderResponse?.(response);
    });

    connection.on('GetOrdersByTableResponse', (response) => {
      console.log('📋 GetOrdersByTableResponse:', response);
      onGetOrdersResponse?.(response);
    });

    connection.on('GetComplainsByTableResponse', (response) => {
      console.log('📝 GetComplainsByTableResponse:', response);
      onGetComplainsResponse?.(response);
    });

    connection.on('ChangeTableResponse', (response) => {
      console.log('🔄 ChangeTableResponse:', response);
      onChangeTableResponse?.(response);
    });

    // TableMoved notification từ OrderNotificationHub hoặc CustomerTableHub
    connection.on('TableMoved', (notification: TableMovedNotification) => {
      console.log('🚚 TableMoved notification:', notification);
      
      // Chỉ xử lý nếu notification là cho bàn hiện tại
      if (notification.oldTableId === currentTableId) {
        // Leave group bàn cũ và join group bàn mới
        connection.invoke('LeaveTableGroup', notification.oldTableId).catch(console.error);
        connection.invoke('JoinTableGroup', notification.newTableId).catch(console.error);
        
        // Cập nhật current table ID
        setCurrentTableId(notification.newTableId);
        
        // Call callback
        onTableMoved?.(notification);
      }
    });

    // Connection events
    connection.onreconnecting(() => {
      console.log('🔄 Reconnecting to CustomerTableHub...');
    });

    connection.onreconnected(() => {
      console.log('✅ Reconnected to CustomerTableHub');
      setIsConnected(true);
      // Rejoin table group
      connection.invoke('JoinTableGroup', currentTableId).catch(console.error);
    });

    connection.onclose(() => {
      console.log('⚠️ CustomerTableHub connection closed');
      setIsConnected(false);
    });

    // Start connection
    const start = async () => {
      try {
        await connection.start();
        if (isUnmounted) return;
        
        console.log('✅ Connected to CustomerTableHub');
        setIsConnected(true);
        
        // Join table group
        await connection.invoke('JoinTableGroup', currentTableId);
        console.log(`✅ Joined table group: ${currentTableId}`);
      } catch (err) {
        console.error('❌ CustomerTableHub connection error:', err);
        setIsConnected(false);
        // Retry after 2 minutes
        setTimeout(start, 120000);
      }
    };

    start();

    return () => {
      isUnmounted = true;
      connection.off('HandleOrderResponse');
      connection.off('GetOrdersByTableResponse');
      connection.off('GetComplainsByTableResponse');
      connection.off('ChangeTableResponse');
      connection.off('TableMoved');
      connection.stop();
    };
  }, [currentTableId, onTableMoved, onHandleOrderResponse, onGetOrdersResponse, onGetComplainsResponse, onChangeTableResponse]);

  // Methods
  const handleOrder = async (request: CreateOrderRequest) => {
    if (connectionRef.current && isConnected) {
      try {
        return await connectionRef.current.invoke('HandleOrder', currentTableId, request);
      } catch (err) {
        console.error('❌ HandleOrder error:', err);
        throw err;
      }
    } else {
      throw new Error('Not connected to CustomerTableHub');
    }
  };

  const getOrders = async (startDate?: Date, endDate?: Date) => {
    if (connectionRef.current && isConnected) {
      try {
        return await connectionRef.current.invoke(
          'GetOrdersByTable',
          currentTableId,
          startDate?.toISOString(),
          endDate?.toISOString()
        );
      } catch (err) {
        console.error('❌ GetOrdersByTable error:', err);
        throw err;
      }
    } else {
      throw new Error('Not connected to CustomerTableHub');
    }
  };

  const getComplains = async (isCustomer: boolean = true) => {
    if (connectionRef.current && isConnected) {
      try {
        return await connectionRef.current.invoke('GetComplainsByTable', currentTableId, isCustomer);
      } catch (err) {
        console.error('❌ GetComplainsByTable error:', err);
        throw err;
      }
    } else {
      throw new Error('Not connected to CustomerTableHub');
    }
  };

  const changeTable = async (newTableId: string, reason: string) => {
    if (connectionRef.current && isConnected) {
      try {
        const request: MoveTableRequest = { newTableId, reason };
        return await connectionRef.current.invoke('ChangeTable', currentTableId, request);
      } catch (err) {
        console.error('❌ ChangeTable error:', err);
        throw err;
      }
    } else {
      throw new Error('Not connected to CustomerTableHub');
    }
  };

  return {
    isConnected,
    currentTableId,
    handleOrder,
    getOrders,
    getComplains,
    changeTable,
  };
}

