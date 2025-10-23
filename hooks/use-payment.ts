import {useState, useEffect, useCallback} from "react";
import {
    ordersApi,
    ApiOrderResponse,
    ApiOrderItemResponse,
    PAYMENT_METHODS,
} from "@/lib/api/orders";
import {tablesApi, ApiTableResponse} from "@/lib/api/tables";
import {Payment, paymentsApi} from "@/lib/api/payments";

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
    const [selectedTableName, setSelectedTableName] = useState<string | null>(
        null
    );
    const [tableOrders, setTableOrders] = useState<PaymentOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

    // Fetch tables
    const fetchTables = useCallback(async () => {
        try {
            setError(null);
            const response = await tablesApi.getTables(1, 50);

            // Assume data looks like [{ id: 1, name: 'Bàn 1' }, ...]
            const sorted = response.data.sort((a, b) => {
                const getNumber = (name: string): number =>
                    parseInt(name.replace(/\D/g, ""), 10);
                return getNumber(a.name) - getNumber(b.name);
            });

            setTables(sorted);
        } catch (err) {
            setError("Error fetching tables");
        }
    }, []);

    // Fetch orders for a specific table
    const fetchOrdersByTable = useCallback(
        async (tableId: string) => {
            if (!tableId) return;

            try {
                setIsLoading(true);
                setError(null);

                const tableResponse = await tablesApi.getTableById(tableId);

                let tableName = null;

                if (!tableResponse.data) {
                    const tableFromList = tables.find((t) => t.id === tableId);
                    if (tableFromList) {
                        tableName = tableFromList.name;
                    } else {
                        setTableOrders([]);
                        setSelectedTableName(null);
                        return; // Don't throw error, just return empty orders
                    }
                } else {
                    tableName = tableResponse.data.name;
                }

                // Store the table name
                setSelectedTableName(tableName);

                // Get orders for this table with Delivering status only
                const ordersResponse = await ordersApi.getOrdersByTableIdWithStatus(
                    tableId,
                    "Delivering"
                );

                if (ordersResponse.data) {
                    const paymentOrders: PaymentOrder[] = ordersResponse.data.map(
                        (order) => ({
                            id: order.id,
                            tableName: tableName || "Unknown Table", // Use the determined tableName or a fallback
                            status: order.status,
                            paymentStatus: order.paymentStatus,
                            totalPrice: order.totalPrice,
                            items: order.items.map((item) => {
                                return {
                                    id: item.id,
                                    productName: item.productName,
                                    sizeName: item.sizeName,
                                    quantity: 1, // Each API item is individual, so quantity is always 1
                                    price: item.price, // Use actual price from API (from ProductSize)
                                    status: item.status,
                                    toppings: item.toppings.map((topping) => ({
                                        name: topping.name,
                                        price: topping.price,
                                    })),
                                };
                            }),
                        })
                    );
                    console.log(ordersResponse.data);
                    setTableOrders(paymentOrders);
                } else {
                    setTableOrders([]);
                }
            } catch (err) {
                setTableOrders([]);
                setSelectedTableName(null);
            } finally {
                setIsLoading(false);
            }
        },
        [tables]
    ); // Added tables to dependency array

    // Calculate total for all orders
    const calculateTotal = useCallback(() => {
        return tableOrders.reduce((total, order) => {
            const orderTotal = order.items.reduce((itemTotal, item) => {
                const itemPrice = (item.price || 0) * (item.quantity || 1); // Add safety checks
                const toppingsPrice = item.toppings.reduce(
                    (toppingTotal, topping) =>
                        toppingTotal + (topping.price || 0) * (item.quantity || 1),
                    0
                );
                return itemTotal + itemPrice + toppingsPrice;
            }, 0);
            return total + orderTotal;
        }, 0);
    }, [tableOrders]);

    // Initiate payment
    const initiatePayment = useCallback(async (orderId: string) => {
        try {
            setPaymentStatus("processing");
            const response = await ordersApi.initiatePayment(
                orderId,
                PAYMENT_METHODS.COD
            );

            if (response.statusCode === 200) {
                setPaymentStatus("success");
                return {success: true, message: response.message};
            } else {
                setPaymentStatus("error");
                return {success: false, message: response.message};
            }
        } catch (err) {
            setPaymentStatus("error");
            return {success: false, message: "Error initiating payment"};
        }
    }, []);

    // Create VNPay URL, open in popup, and poll order status until paid (or timeout)
    const initiateOnlinePayment = useCallback(async (orderId: string) => {
        try {
            setPaymentStatus("processing");
            const res = await Payment(orderId);

            if (res.statusCode === 200 && res.data?.paymentUrl) {
                setPaymentStatus("redirect");

                // Keep popup reference at function scope; browsers allow opener to close it.
                const popup = window.open(
                    res.data
                );

                const startAt = Date.now();
                const timeoutMs = 3 * 60 * 1000; // 3 minutes

                return await new Promise<{ success: boolean; message?: string }>((resolve) => {
                    const check = async () => {
                        try {
                            const order = await ordersApi.getOrderById(orderId);
                            const rawStatus: any = order.data?.paymentStatus;
                            const statusStr = String(rawStatus).toLowerCase();
                            const isPaid = statusStr === "paid" || rawStatus === 2 || rawStatus === "2" || order.code === "PAID";
                            if (isPaid) {
                                try {
                                    if (popup && !popup.closed) {
                                        // Attempt multiple ways to ensure closure across browsers
                                        popup.close();
                                        try {
                                            popup.location.href = "about:blank";
                                            popup.close();
                                        } catch {
                                        }
                                        setTimeout(() => {
                                            try {
                                                popup.close();
                                            } catch {
                                            }
                                        }, 200);
                                    }
                                } catch {
                                }
                                setPaymentStatus("success");
                                // Redirect to success page with minimal data
                                const total = typeof order.data?.totalPrice === "number" ? order.data.totalPrice : undefined;
                                const params = new URLSearchParams({orderId});
                                if (typeof total === "number") params.set("amount", String(total));
                                params.set("message", "Payment success (VNPay)");
                                // Resolve first, then navigate
                                resolve({success: true});
                                window.location.replace(`/waiter/payment-success?${params.toString()}`);
                                return;
                            }
                        } catch (e) {
                            // ignore and keep polling
                        }

                        if (Date.now() - startAt > timeoutMs) {
                            if (popup && !popup.closed) popup.close();
                            setPaymentStatus("timeout");
                            resolve({success: false, message: "Payment timeout"});
                            return;
                        }

                        // If user closed the popup, still continue polling for a short time
                        setTimeout(check, 2000);
                    };

                    check();
                });
            }

            setPaymentStatus("error");
            return {success: false, message: res.message || "Cannot create payment URL"};
        } catch (error) {
            setPaymentStatus("error");
            return {success: false, message: "Error creating VNPay URL"};
        }
    }, []);

    // Confirm money received
    const confirmMoneyReceived = useCallback(() => {
        setPaymentStatus("confirmed");
        return {success: true, message: "Payment confirmed"};
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
        initiateOnlinePayment,
        confirmMoneyReceived,
        fetchOrdersByTable,
        refreshOrders: () => selectedTable && fetchOrdersByTable(selectedTable),
    };
}
