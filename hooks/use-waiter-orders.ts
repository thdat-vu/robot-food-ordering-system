import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ordersApi } from "@/lib/api/orders";
import {
    categoriesApi,
    ApiCategoryResponse,
    ApiProductCategoryResponse,
} from "@/lib/api/categories";
import { OrderStatus } from "@/types/kitchen";
import { useSignalR } from "@/hooks/useSignalR";
import { getApiUrl } from "@/env.config";
import { useQuickServe, QuickRequest } from "@/hooks/use-quick-serve";
import { CheckSS } from "@/api/moderator/FeedbackApi";

export interface WaiterDish {
    id: string; // Changed from number to string for consistent IDs
    name: string;
    categoryId: string;
    categoryName: string;
    selected: boolean;
    served?: boolean;
    orderId: string;
    itemId: string;
    tableNumber: number;
    quantity: number;
    status: OrderStatus; // Updated to use OrderStatus type
    orderTime?: string;
    readyTime?: string; // Ready time from API (e.g., "06:48:46 03/01/2026")
    servedTime?: string; // Served time from API (e.g., "20:30:53 03/01/2026")
    estimatedTime?: string;
    note?: string;
    sizeName?: string;
    toppings?: string[];
    // Quick-serve specific fields
    isQuickServe?: boolean;
    complainId?: string;
    tableId?: string;
}

export function useWaiterOrders() {
    const [categories, setCategories] = useState<ApiCategoryResponse[]>([]);
    const [dishes, setDishes] = useState<WaiterDish[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [productCategoryMap, setProductCategoryMap] = useState<Map<string, string>>(new Map());
    const [quickServeSelections, setQuickServeSelections] = useState<Set<string>>(new Set());
    const realtimeFetchInFlight = useRef(false);

    const signalRHubUrl = useMemo(() => {
        const apiUrl = getApiUrl();
        const normalizedBase = apiUrl.replace(/\/api\/?$/, "");
        return `${normalizedBase}/orderNotificationHub`;
    }, []);

    // Moderator dashboard hub URL for table status change notifications (checkout)
    const moderatorHubUrl = useMemo(() => {
        const apiUrl = getApiUrl();
        const normalizedBase = apiUrl.replace(/\/api\/?$/, "");
        return `${normalizedBase}/hubs/moderator-dashboard`;
    }, []);

    // Memoize productCategoryMap to prevent unnecessary re-creation
    const stableProductCategoryMap = useMemo(
        () => productCategoryMap,
        [productCategoryMap.size]
    );

    // Fetch categories and product-category mappings
    const fetchCategories = useCallback(async () => {
        try {
            // Fetch categories
            const categoriesResponse = await categoriesApi.getCategories(1, 50);
            if (categoriesResponse.data) {
                setCategories(categoriesResponse.data);
            }

            // Fetch product categories to create mapping
            const productCategoriesResponse =
                await categoriesApi.getProductCategories(1, 100);
            if (productCategoriesResponse.data) {
                const map = new Map<string, string>();
                productCategoriesResponse.data.forEach((pc) => {
                    map.set(pc.productName.toLowerCase(), pc.categoryName);
                });
                setProductCategoryMap(map);
            }
        } catch (err) {
            // Continue with default categories if API fails
            setCategories([
                { id: "1", name: "Tráng Miệng" },
                { id: "2", name: "Món Chính" },
                { id: "3", name: "Đồ Uống" },
            ]);
        }
    }, []);

    // Helper function to map API status to OrderStatus
    const mapApiStatusToOrderStatus = (status: string): OrderStatus => {
        switch (status) {
            case "1":
            case "Waiting":
            case "Pending":
                return "đang chờ";
            case "2":
            case "Processing":
            case "Preparing":
                return "đang thực hiện";
            case "3":
            case "Ready":
                return "bắt đầu phục vụ";
            case "4":
            case "Served":
                return "đã phục vụ";
            case "5":
            case "Completed":
                return "đã phục vụ";
            case "7":
            case "Remark":
                return "yêu cầu làm lại";
            default:
                return "đang chờ";
        }
    };

    // Fetch orders with different statuses from API
    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await ordersApi.getOrders(1, 100); // Get first 100 orders

            if (response.data && response.data.length > 0) {
                // Transform API orders to waiter dishes
                const rawDishes: Omit<WaiterDish, "selected">[] = [];

                // Create a unique key for each dish
                const createDishKey = (orderId: string, itemId: string) =>
                    `${orderId}-${itemId}`;

                response.data.forEach((order) => {
                    order.items.forEach((item) => {
                        const tableNumber =
                            parseInt(order.tableName.replace(/\D/g, "")) || 1;

                        const categoryName =
                            stableProductCategoryMap.get(item.productName.toLowerCase()) ||
                            "Khác";
                        const category = categories.find((c) => c.name === categoryName);

                        const orderStatus = mapApiStatusToOrderStatus(item.status);

                        const dishKey = createDishKey(order.id, item.id);

                        rawDishes.push({
                            id: dishKey as any, // will set selected later
                            name: item.productName,
                            categoryId: category?.id || "unknown",
                            categoryName: categoryName,
                            served: orderStatus === "đã phục vụ",
                            orderId: order.id,
                            itemId: item.id,
                            tableNumber,
                            quantity: 1,
                            status: orderStatus,
                            orderTime: item.createdTime || order.createdTime || undefined,
                            readyTime: item.readyTime || undefined,
                            servedTime: item.servedTime || undefined,
                            estimatedTime: "10 phút",
                            note: item.note || undefined,
                            sizeName: item.sizeName,
                            toppings: item.toppings?.map((topping) => topping.name) || [],
                        } as any);
                    });
                });

                // Preserve selection using latest state in functional update to avoid stale closures
                // BUG FIX: Only preserve selection for dishes in "bắt đầu phục vụ" status
                // This prevents served dishes from remaining selected
                setDishes((prev) => {
                    const selectedIds = new Set(
                        prev.filter(d => d.selected && d.status === "bắt đầu phục vụ").map(d => d.id)
                    );
                    return rawDishes.map((d) => ({
                        ...(d as WaiterDish),
                        selected: selectedIds.has((d as WaiterDish).id) &&
                            (d as WaiterDish).status === "bắt đầu phục vụ",
                    }));
                });
            } else {
                setDishes([]);
            }
        } catch (err) {
            setError("Error fetching orders");
            setDishes([]);
        } finally {
            setIsLoading(false);
        }
    }, [categories, stableProductCategoryMap]);

    // Silent fetch orders (no loading/error UI) for polling
    const silentFetchOrders = useCallback(async () => {
        try {
            const response = await ordersApi.getOrders(1, 100);

            if (response.data && response.data.length > 0) {
                const rawDishes: Omit<WaiterDish, "selected">[] = [];

                const createDishKey = (orderId: string, itemId: string) =>
                    `${orderId}-${itemId}`;

                response.data.forEach((order) => {
                    order.items.forEach((item) => {
                        const tableNumber = parseInt(order.tableName.replace(/\D/g, "")) || 1;

                        const categoryName =
                            stableProductCategoryMap.get(item.productName.toLowerCase()) ||
                            "Khác";
                        const category = categories.find((c) => c.name === categoryName);

                        const orderStatus = mapApiStatusToOrderStatus(item.status);

                        const dishKey = createDishKey(order.id, item.id);

                        rawDishes.push({
                            id: dishKey as any,
                            name: item.productName,
                            categoryId: category?.id || "unknown",
                            categoryName: categoryName,
                            served: orderStatus === "đã phục vụ",
                            orderId: order.id,
                            itemId: item.id,
                            tableNumber,
                            quantity: 1,
                            status: orderStatus,
                            orderTime: item.createdTime || order.createdTime || undefined,
                            readyTime: item.readyTime || undefined,
                            servedTime: item.servedTime || undefined,
                            estimatedTime: "10 phút",
                            note: item.note || undefined,
                            sizeName: item.sizeName,
                            toppings: item.toppings?.map((topping) => topping.name) || [],
                        } as any);
                    });
                });

                // Preserve latest selection using functional update
                // BUG FIX: Only preserve selection for dishes that are still in "bắt đầu phục vụ" status
                // OLD CODE (BUGGY): preserved selection for ALL dishes regardless of status
                // This caused served dishes to remain selected, leading to accidental re-serving
                setDishes((prev) => {
                    // Only preserve selection for dishes in "bắt đầu phục vụ" status
                    const selectedIds = new Set(
                        prev.filter(d => d.selected && d.status === "bắt đầu phục vụ").map(d => d.id)
                    );
                    return rawDishes.map((d) => ({
                        ...(d as WaiterDish),
                        // Only set selected=true if: 1) was selected before, AND 2) still in "bắt đầu phục vụ" status
                        selected: selectedIds.has((d as WaiterDish).id) &&
                            (d as WaiterDish).status === "bắt đầu phục vụ",
                    }));
                });
            } else {
                setDishes([]);
            }
        } catch (err) {
            // Silent error: do not set error state to avoid UI disruption
        }
    }, [categories, stableProductCategoryMap]);

    const triggerRealtimeRefresh = useCallback(async () => {
        if (realtimeFetchInFlight.current) {
            return;
        }
        realtimeFetchInFlight.current = true;
        try {
            await silentFetchOrders();
        } finally {
            realtimeFetchInFlight.current = false;
        }
    }, [silentFetchOrders]);

    // Quick-serve integration - must be before hubMethods
    const {
        requests: quickServeRequests,
        servedRequests: servedQuickServeRequests,
        fetchQuickRequestsForActiveTables,
        fetchServedQuickRequests,
        serveQuickRequest
    } = useQuickServe();

    const hubMethods = useMemo(
        () => ({
            OrderItemStatusChanged: () => {
                triggerRealtimeRefresh();
                fetchQuickRequestsForActiveTables();
            },
            OrderStatusChanged: () => {
                triggerRealtimeRefresh();
                fetchQuickRequestsForActiveTables();
            },
            WaiterNotification: () => {
                triggerRealtimeRefresh();
                fetchQuickRequestsForActiveTables();
            },
            // Also listen for kitchen notifications (fires when new orders placed)
            KitchenNotification: () => {
                triggerRealtimeRefresh();
                fetchQuickRequestsForActiveTables();
            },
        }),
        [triggerRealtimeRefresh, fetchQuickRequestsForActiveTables]
    );

    const { isConnected: isRealtimeConnected } = useSignalR({
        url: signalRHubUrl,
        groupName: "Waiters",
        hubMethods,
    });

    // Hub methods for moderator dashboard - listen for table status changes (checkout/freed)
    const moderatorHubMethods = useMemo(
        () => ({
            // When table status changes (freed/checked out), refresh orders to sync data
            DashboardTableUpdated: () => {
                triggerRealtimeRefresh();
                fetchQuickRequestsForActiveTables();
            },
            // Handle snapshot updates as fallback
            PendingComplainsSnapshotUpdated: () => {
                triggerRealtimeRefresh();
                fetchQuickRequestsForActiveTables();
            },
        }),
        [triggerRealtimeRefresh, fetchQuickRequestsForActiveTables]
    );

    // Second SignalR connection for moderator dashboard table status changes
    useSignalR({
        url: moderatorHubUrl,
        groupName: 'Moderators', // Join as Moderator to receive table update notifications
        hubMethods: moderatorHubMethods,
    });

    // Hub methods for Kitchen group - listen for new order notifications
    const kitchenHubMethods = useMemo(
        () => ({
            // When new orders are placed or order status changes, refresh
            KitchenNotification: () => {
                triggerRealtimeRefresh();
                fetchQuickRequestsForActiveTables();
            },
            OrderItemStatusChanged: () => {
                triggerRealtimeRefresh();
                fetchQuickRequestsForActiveTables();
            },
            OrderStatusChanged: () => {
                triggerRealtimeRefresh();
                fetchQuickRequestsForActiveTables();
            },
        }),
        [triggerRealtimeRefresh, fetchQuickRequestsForActiveTables]
    );

    // Third SignalR connection for Kitchen group notifications (new orders)
    useSignalR({
        url: signalRHubUrl,
        groupName: 'Kitchen', // Join Kitchen group to receive new order notifications
        hubMethods: kitchenHubMethods,
    });

    // Transform quick-serve requests to WaiterDish format (each QuickServeItem is already a single item)
    const quickServeDishes = useMemo(() => {
        const dishes: WaiterDish[] = [];

        const mapToDish = (req: QuickRequest, isServed: boolean) => {
            const tableNumber = parseInt(req.tableName.replace(/\D/g, "")) || 1;
            const categoryName = "Phục vụ nhanh";
            const category = categories.find((c) => c.name === categoryName) || categories[0];

            const dishId = `quick-serve-${req.id}`;

            dishes.push({
                id: dishId,
                name: req.itemName,
                categoryId: category?.id || "unknown",
                categoryName: categoryName,
                selected: quickServeSelections.has(dishId),
                served: isServed,
                orderId: `quick-${req.complainId}`,
                itemId: req.id,
                tableNumber,
                quantity: 1,
                status: isServed ? ("đã phục vụ" as OrderStatus) : ("phục vụ nhanh" as OrderStatus),
                estimatedTime: "Ngay lập tức",
                note: "Yêu cầu phục vụ nhanh",
                isQuickServe: true,
                complainId: req.complainId,
                tableId: req.tableId,
                orderTime: req.createdTime,
                servedTime: req.lastUpdatedTime,
            });
        };

        quickServeRequests.forEach((req) => mapToDish(req, false));
        servedQuickServeRequests.forEach((req) => mapToDish(req, true));

        return dishes;
    }, [quickServeRequests, servedQuickServeRequests, categories, quickServeSelections]);

    // Merge regular dishes with quick-serve dishes
    const allDishes = useMemo(() => {
        return [...dishes, ...quickServeDishes];
    }, [dishes, quickServeDishes]);

    // Load categories first, then orders
    useEffect(() => {
        const loadData = async () => {
            await fetchCategories();
        };
        loadData();
    }, [fetchCategories]);

    // Load orders after categories are loaded
    useEffect(() => {
        if (categories.length > 0) {
            fetchOrders();
            fetchQuickRequestsForActiveTables();
            fetchServedQuickRequests();
        }
    }, [fetchOrders, categories, fetchQuickRequestsForActiveTables, fetchServedQuickRequests]);

    // Group dishes by category
    const groupedDishes = useMemo(() => {
        return allDishes.reduce<Record<string, WaiterDish[]>>((acc, dish) => {
            if (!acc[dish.categoryName]) acc[dish.categoryName] = [];
            acc[dish.categoryName].push(dish);
            return acc;
        }, {});
    }, [allDishes]);

    // Filter dishes by status
    const getDishesByStatus = useCallback(
        (status: OrderStatus) => {
            return allDishes.filter((dish) => dish.status === status);
        },
        [allDishes]
    );

    // Get count for each tab
    const getTabCount = useCallback(
        (status: OrderStatus) => {
            return getDishesByStatus(status).length;
        },
        [getDishesByStatus]
    );

    // Check if any dishes are selected
    const hasSelected = allDishes.some((d) => d.selected && !d.served);

    // Toggle dish selection - handle both regular and quick-serve dishes
    const toggleDish = (id: string) => {
        if (id.startsWith("quick-serve-")) {
            setQuickServeSelections((prev) => {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            });
        } else {
            // For regular dishes, update dishes state
            setDishes((prev) =>
                prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
            );
        }
    };

    // Handle serving dishes
    const handleServe = useCallback(async () => {
        // Get selected dishes from allDishes (includes both regular and quick-serve)
        const selectedDishes = allDishes.filter(
            (dish) => dish.selected && (dish.status === "bắt đầu phục vụ" || dish.status === "phục vụ nhanh")
        );
        if (selectedDishes.length === 0) return false;

        try {
            // Separate regular dishes and quick-serve dishes
            const regularDishes = selectedDishes.filter((d) => !d.isQuickServe);
            const quickServeDishes = selectedDishes.filter((d) => d.isQuickServe);

            // Handle regular dishes
            if (regularDishes.length > 0) {
                const updatePromises = regularDishes.map((dish) =>
                    ordersApi.updateOrderItemStatus(dish.orderId, dish.itemId, 4, "")
                );
                await Promise.all(updatePromises);

                // Update local state for regular dishes
                setDishes((prev) =>
                    prev.map((d) =>
                        d.selected && !d.served && d.status === "bắt đầu phục vụ"
                            ? { ...d, served: true, selected: false, status: "đã phục vụ" }
                            : d
                    )
                );
            }

            // Handle quick-serve dishes - call backend QuickServe serve API
            if (quickServeDishes.length > 0) {
                const servePromises = quickServeDishes.map((dish) =>
                    serveQuickRequest({
                        id: dish.itemId,
                        complainId: dish.complainId!,
                        tableId: dish.tableId!,
                        tableName: `Bàn ${dish.tableNumber}`,
                        itemName: dish.name,
                        isServed: dish.served!,
                    })
                );
                await Promise.all(servePromises);

                // Remove served quick-serve items from selection
                setQuickServeSelections((prev) => {
                    const next = new Set(prev);
                    quickServeDishes.forEach((dish) => {
                        next.delete(dish.id);
                    });
                    return next;
                });

                // Refresh quick-serve requests to remove processed ones
                await fetchQuickRequestsForActiveTables();
                await fetchServedQuickRequests();
            }

            return true;
        } catch (err) {
            console.error("Error serving dishes:", err);
            return false;
        }
    }, [allDishes, fetchQuickRequestsForActiveTables, serveQuickRequest]);

    // Handle requesting remake for dishes
    const handleRequestRemake = useCallback(async (reason?: string) => {
        const selectedDishes = allDishes.filter((dish) => dish.selected);
        if (selectedDishes.length === 0) return false;

        try {
            const remarkNote = reason?.trim() || "Yêu cầu làm lại";

            // Step 1: Mark the selected items as Remark so only those specific items are affected
            const updatePromises = selectedDishes.map(async (dish) => {
                await ordersApi.updateOrderItemStatus(
                    dish.orderId,
                    dish.itemId,
                    7,
                    remarkNote
                );

                // Step 2: Immediately move the same item back to Processing status
                // IMPORTANT: Include remarkNote to preserve it in the backend
                await ordersApi.updateOrderItemStatus(
                    dish.orderId,
                    dish.itemId,
                    2,
                    remarkNote
                );
            });

            await Promise.all(updatePromises);

            // Update local state
            setDishes((prev) =>
                prev.map((d) =>
                    d.selected
                        ? {
                            ...d,
                            selected: false,
                            status: "đang thực hiện",
                            served: false,
                        }
                        : d
                )
            );

            // Optionally we could persist `reason` here if API supports later
            return true;
        } catch (err) {
            return false;
        }
    }, [dishes]);

    // Refresh orders
    const refreshOrders = useCallback(
        (silent?: boolean) => {
            if (silent) {
                silentFetchOrders();
            } else {
                fetchOrders();
            }
        },
        [fetchOrders, silentFetchOrders]
    );

    return {
        dishes: allDishes, // Return merged dishes (regular + quick-serve)
        groupedDishes,
        categories,
        hasSelected,
        isLoading,
        error,
        toggleDish,
        handleServe,
        handleRequestRemake,
        refreshOrders,
        getTabCount,
        getDishesByStatus,
        isRealtimeConnected,
    };
}
