import { useState, useEffect, useMemo, useCallback } from "react";
import { ordersApi } from "@/lib/api/orders";
import {
  categoriesApi,
  ApiCategoryResponse,
  ApiProductCategoryResponse,
} from "@/lib/api/categories";
import { OrderStatus } from "@/types/kitchen";

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
  estimatedTime?: string;
  note?: string;
  sizeName?: string;
  toppings?: string[];
}

export function useWaiterOrders() {
  const [categories, setCategories] = useState<ApiCategoryResponse[]>([]);
  const [dishes, setDishes] = useState<WaiterDish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productCategoryMap, setProductCategoryMap] = useState<Map<string, string>>(new Map());

  // Memoize productCategoryMap to prevent unnecessary re-creation
  const stableProductCategoryMap = useMemo(() => productCategoryMap, [productCategoryMap.size]);

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
      console.error("Error fetching categories:", err);
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
        return "đang chờ";
      case "2":
      case "Processing":
        return "đang thực hiện";
      case "3":
      case "Ready":
        return "bắt đầu phục vụ";
      case "4":
      case "Served":
        return "đã phục vụ";
      case "5":
      case "Redo":
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

      console.log("Fetched orders:", response);

      if (response.data && response.data.length > 0) {
        // Transform API orders to waiter dishes
        const waiterDishes: WaiterDish[] = [];

        // Create a unique key for each dish to preserve selection state
        const createDishKey = (orderId: string, itemId: string) => `${orderId}-${itemId}`;

        response.data.forEach((order) => {
          order.items.forEach((item) => {
            const tableNumber =
              parseInt(order.tableName.replace(/\D/g, "")) || 1;

            // Get category from product-category mapping
            const categoryName =
              stableProductCategoryMap.get(item.productName.toLowerCase()) || "Khác";
            const category = categories.find((c) => c.name === categoryName);

            // Map API status to OrderStatus
            const orderStatus = mapApiStatusToOrderStatus(item.status);

            // Create unique key for this dish
            const dishKey = createDishKey(order.id, item.id);

            // Check if this dish was previously selected using the consistent ID
            const previouslySelected = dishes.find(d => d.id === dishKey)?.selected || false;

            waiterDishes.push({
              id: dishKey, // Use the generated key as the ID
              name: item.productName,
              categoryId: category?.id || "unknown",
              categoryName: categoryName,
              selected: previouslySelected, // Preserve selection state
              served: orderStatus === "đã phục vụ",
              orderId: order.id,
              itemId: item.id,
              tableNumber,
              quantity: item.quantity,
              status: orderStatus,
              orderTime: order.createdTime
                ? new Date(order.createdTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined,
              estimatedTime: "10 phút", // Default estimated time since API doesn't provide it
              note: item.note || undefined,
              sizeName: item.sizeName,
              toppings: item.toppings?.map(topping => topping.name) || [],
            });
          });
        });

        setDishes(waiterDishes);
      } else {
        setDishes([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error fetching orders");
      setDishes([]);
    } finally {
      setIsLoading(false);
    }
  }, [categories, stableProductCategoryMap]);

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
    }
  }, [fetchOrders, categories]);

  // Group dishes by category
  const groupedDishes = useMemo(() => {
    return dishes.reduce<Record<string, WaiterDish[]>>((acc, dish) => {
      if (!acc[dish.categoryName]) acc[dish.categoryName] = [];
      acc[dish.categoryName].push(dish);
      return acc;
    }, {});
  }, [dishes]);

  // Filter dishes by status
  const getDishesByStatus = useCallback(
    (status: OrderStatus) => {
      return dishes.filter((dish) => dish.status === status);
    },
    [dishes]
  );

  // Get count for each tab
  const getTabCount = useCallback(
    (status: OrderStatus) => {
      return getDishesByStatus(status).length;
    },
    [getDishesByStatus]
  );

  // Check if any dishes are selected
  const hasSelected = dishes.some((d) => d.selected && !d.served);

  // Toggle dish selection
  const toggleDish = (id: string) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    );
  };

  // Handle serving dishes
  const handleServe = useCallback(async () => {
    const selectedDishes = dishes.filter((d) => d.selected && !d.served);
    if (selectedDishes.length === 0) return false;

    try {
      // Update each selected dish status to Served (4)
      const updatePromises = selectedDishes.map((dish) =>
        ordersApi.updateOrderItemStatus(dish.orderId, dish.itemId, 4)
      );

      await Promise.all(updatePromises);

      // Update local state
      setDishes((prev) =>
        prev.map((d) =>
          d.selected && !d.served
            ? { ...d, served: true, selected: false, status: "đã phục vụ" }
            : d
        )
      );

      return true;
    } catch (err) {
      console.error("Error serving dishes:", err);
      return false;
    }
  }, [dishes]);

  // Refresh orders
  const refreshOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    dishes,
    groupedDishes,
    categories,
    hasSelected,
    isLoading,
    error,
    toggleDish,
    handleServe,
    refreshOrders,
    getTabCount,
    getDishesByStatus,
  };
}
