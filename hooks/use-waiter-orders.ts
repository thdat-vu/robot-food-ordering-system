import { useState, useEffect, useMemo, useCallback } from 'react';
import { ordersApi } from '@/lib/api/orders';
import { categoriesApi, ApiCategoryResponse, ApiProductCategoryResponse } from '@/lib/api/categories';

export interface WaiterDish {
  id: number;
  name: string;
  categoryId: string;
  categoryName: string;
  selected: boolean;
  served?: boolean;
  orderId: string;
  itemId: string;
  tableNumber: number;
  quantity: number;
}

export function useWaiterOrders() {
  const [dishes, setDishes] = useState<WaiterDish[]>([]);
  const [categories, setCategories] = useState<ApiCategoryResponse[]>([]);
  const [productCategoryMap, setProductCategoryMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and product-category mappings
  const fetchCategories = useCallback(async () => {
    try {
      // Fetch categories
      const categoriesResponse = await categoriesApi.getCategories(1, 50);
      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      // Fetch product categories to create mapping
      const productCategoriesResponse = await categoriesApi.getProductCategories(1, 100);
      if (productCategoriesResponse.data) {
        const map = new Map<string, string>();
        productCategoriesResponse.data.forEach(pc => {
          map.set(pc.productName.toLowerCase(), pc.categoryName);
        });
        setProductCategoryMap(map);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Continue with default categories if API fails
      setCategories([
        { id: '1', name: 'Tráng Miệng' },
        { id: '2', name: 'Món Chính' },
        { id: '3', name: 'Đồ Uống' }
      ]);
    }
  }, []);

  // Fetch orders with status 3 (Ready) from API
  const fetchReadyOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ordersApi.getOrders(1, 100); // Get first 100 orders
      
      if (response.data && response.data.length > 0) {
        // Filter orders to only include items with status 3 (Ready)
        const readyOrders = response.data.filter(order => 
          order.items.some(item => item.status === "3" || item.status === "Ready")
        );

        // Transform API orders to waiter dishes
        const waiterDishes: WaiterDish[] = [];
        let dishId = 1;

        readyOrders.forEach(order => {
          order.items.forEach(item => {
            if (item.status === "3" || item.status === "Ready") { // Only include Ready items
              const tableNumber = parseInt(order.tableName.replace(/\D/g, '')) || 1;
              
              // Get category from product-category mapping
              const categoryName = productCategoryMap.get(item.productName.toLowerCase()) || 'Khác';
              const category = categories.find(c => c.name === categoryName);
              
              waiterDishes.push({
                id: dishId++,
                name: item.productName,
                categoryId: category?.id || 'unknown',
                categoryName: categoryName,
                selected: false,
                served: false,
                orderId: order.id,
                itemId: item.id,
                tableNumber,
                quantity: item.quantity
              });
            }
          });
        });

        setDishes(waiterDishes);
      } else {
        setDishes([]);
      }
    } catch (err) {
      console.error('Error fetching ready orders:', err);
      setError('Error fetching ready orders');
      setDishes([]);
    } finally {
      setIsLoading(false);
    }
  }, [categories, productCategoryMap]);

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
      fetchReadyOrders();
    }
  }, [fetchReadyOrders, categories]);

  // Group dishes by category
  const groupedDishes = useMemo(() => {
    return dishes.reduce<Record<string, WaiterDish[]>>((acc, dish) => {
      if (!acc[dish.categoryName]) acc[dish.categoryName] = [];
      acc[dish.categoryName].push(dish);
      return acc;
    }, {});
  }, [dishes]);

  // Check if any dishes are selected
  const hasSelected = dishes.some((d) => d.selected && !d.served);

  // Toggle dish selection
  const toggleDish = (id: number) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    );
  };

  // Handle serving dishes
  const handleServe = useCallback(async () => {
    const selectedDishes = dishes.filter((d) => d.selected && !d.served);
    if (selectedDishes.length === 0) return;

    try {
      // Update each selected dish status to Served (4)
      const updatePromises = selectedDishes.map(dish =>
        ordersApi.updateOrderItemStatus(dish.orderId, dish.itemId, 4)
      );

      await Promise.all(updatePromises);

      // Update local state
      setDishes((prev) =>
        prev.map((d) =>
          d.selected && !d.served ? { ...d, served: true, selected: false } : d
        )
      );

      return true;
    } catch (err) {
      console.error('Error serving dishes:', err);
      return false;
    }
  }, [dishes]);

  // Refresh orders
  const refreshOrders = useCallback(() => {
    fetchReadyOrders();
  }, [fetchReadyOrders]);

  return {
    dishes,
    groupedDishes,
    categories,
    hasSelected,
    isLoading,
    error,
    toggleDish,
    handleServe,
    refreshOrders
  };
} 