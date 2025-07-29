import { useState, useEffect, useCallback } from 'react';
import { ordersApi, ApiOrderResponse, ApiOrderItemResponse, PAYMENT_METHODS } from '@/lib/api/orders';
import { tablesApi, ApiTableResponse } from '@/lib/api/tables';

export interface PaymentOrderItem {
  id: string;
  productName: string;
  sizeName: string;
  quantity: number;
  price: number; // This will be the actual price from ProductSize
  status: string;
  toppings: Array<{ name: string; price: number }>;
}

export interface PaymentOrder {
  id: string;
  tableName: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  items: PaymentOrderItem[];
}

export function usePayment() {
  const [tables, setTables] = useState<ApiTableResponse[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedTableName, setSelectedTableName] = useState<string | null>(null);
  const [tableOrders, setTableOrders] = useState<PaymentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // Fetch tables
  const fetchTables = useCallback(async () => {
    try {
      setError(null);
      console.log('Fetching tables...');
      const response = await tablesApi.getTables(1, 50);
      console.log('Tables response:', response);
      if (response.data) {
        setTables(response.data);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Error fetching tables');
    }
  }, []);

  // Fetch orders for a specific table
  const fetchOrdersByTable = useCallback(async (tableId: string) => {
    if (!tableId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching orders for table:', tableId);

      // First, get the table information to get the table name
      const tableResponse = await tablesApi.getTableById(tableId);
      console.log('Table response:', tableResponse);
      console.log('Table response.data:', tableResponse.data);
      console.log('Table response.data?.name:', tableResponse.data?.name);
      
      let tableName = null;
      
      if (!tableResponse.data) {
        console.log('Table not found in API, trying to find in tables list');
        // Fallback: try to find the table in the tables list
        const tableFromList = tables.find(t => t.id === tableId);
        if (tableFromList) {
          tableName = tableFromList.name;
          console.log('Found table in list:', tableName);
        } else {
          console.log('Table not found in list either, setting empty orders');
          setTableOrders([]);
          setSelectedTableName(null);
          return; // Don't throw error, just return empty orders
        }
      } else {
        tableName = tableResponse.data.name;
        console.log('Setting table name to:', tableName);
      }

      // Store the table name
      setSelectedTableName(tableName);

      // Get orders for this table with Delivering status only
      const ordersResponse = await ordersApi.getOrdersByTableIdWithStatus(tableId, 'Delivering');
      console.log('Orders response (Delivering only):', ordersResponse);
      
      if (ordersResponse.data) {
        const paymentOrders: PaymentOrder[] = ordersResponse.data.map(order => ({
          id: order.id,
          tableName: tableName || 'Unknown Table', // Use the determined tableName or a fallback
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalPrice: order.totalPrice,
          items: order.items.map(item => {
            console.log('Order item details:', {
              id: item.id,
              productName: item.productName,
              sizeName: item.sizeName,
              quantity: item.quantity,
              price: item.price,
              status: item.status,
              toppings: item.toppings
            });
            return {
              id: item.id,
              productName: item.productName,
              sizeName: item.sizeName,
              quantity: item.quantity, // Use actual quantity from API (should be 1)
              price: item.price, // Use actual price from API (from ProductSize)
              status: item.status,
              toppings: item.toppings.map(topping => ({
                name: topping.name,
                price: topping.price
              }))
            };
          })
        }));
        setTableOrders(paymentOrders);
        console.log('Filtered orders (Delivering only):', paymentOrders);
      } else {
        setTableOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders for table:', err);
      // Don't set error for table not found, just set empty orders
      setTableOrders([]);
      setSelectedTableName(null);
    } finally {
      setIsLoading(false);
    }
  }, [tables]); // Added tables to dependency array

  // Calculate total for all orders
  const calculateTotal = useCallback(() => {
    return tableOrders.reduce((total, order) => {
      const orderTotal = order.items.reduce((itemTotal, item) => {
        const itemPrice = (item.price || 0) * (item.quantity || 1); // Add safety checks
        const toppingsPrice = item.toppings.reduce((toppingTotal, topping) => 
          toppingTotal + ((topping.price || 0) * (item.quantity || 1)), 0);
        return itemTotal + itemPrice + toppingsPrice;
      }, 0);
      return total + orderTotal;
    }, 0);
  }, [tableOrders]);

  // Initiate payment
  const initiatePayment = useCallback(async (orderId: string) => {
    try {
      setPaymentStatus('processing');
      const response = await ordersApi.initiatePayment(orderId, PAYMENT_METHODS.COD);
      
      if (response.statusCode === 200) {
        setPaymentStatus('success');
        return { success: true, message: response.message };
      } else {
        setPaymentStatus('error');
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
      setPaymentStatus('error');
      return { success: false, message: 'Error initiating payment' };
    }
  }, []);

  // Confirm money received
  const confirmMoneyReceived = useCallback(() => {
    setPaymentStatus('confirmed');
    return { success: true, message: 'Payment confirmed' };
  }, []);

  // Load tables on mount
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Fetch orders when table is selected
  useEffect(() => {
    if (selectedTable) {
      fetchOrdersByTable(selectedTable);
    } else {
      setTableOrders([]);
      setSelectedTableName(null);
    }
  }, [selectedTable, fetchOrdersByTable]);

  return {
    tables,
    selectedTable,
    selectedTableName,
    setSelectedTable,
    tableOrders,
    isLoading,
    error,
    paymentStatus,
    calculateTotal,
    initiatePayment,
    confirmMoneyReceived,
    refreshOrders: () => selectedTable && fetchOrdersByTable(selectedTable)
  };
} 