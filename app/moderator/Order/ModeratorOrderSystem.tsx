import CartPanel from "@/components/moderator/Order/CartPanel";
import FloatingCartButton from "@/components/moderator/Order/FloatingCartButton";
import ProductList from "@/components/moderator/Order/ProductList";
import SearchBar from "@/components/moderator/Order/SearchBar";
import {
  CartItem,
  GetProductToppingsData,
  ModeratorOrderApi,
  OrderData,
  Product,
  ProductDetails,
  Size,
  Topping,
} from "@/entites/moderator/ProductOrder";
import { productsApi } from "@/lib/api/products";
import { useEffect, useState } from "react";

const ModeratorOrderSystem: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(
    null
  );
  const [sizes, setSizes] = useState<Size[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [cartExpanded, setCartExpanded] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>("");
  const [tableNumber, setTableNumber] = useState<string>("");

  useEffect(() => {
    loadProducts();
  }, []);
  const loadProducts = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await ModeratorOrderApi.getProducts();
      setProducts(res.items);
    } catch (error) {
      console.error("Error loading products:", error);
    }
    setLoading(false);
  };

  const handleProductSelect = async (product: Product): Promise<void> => {
    setLoading(true);
    setSelectedProduct(product);
    setCartExpanded(true);

    try {
      const [details, toppingsData] = await Promise.all([
        ModeratorOrderApi.getProductById(product.id),
        ModeratorOrderApi.getProductsToppings(product.id),
      ]);

      setProductDetails(details.data);
      setSizes(details.data.sizes);
      setToppings(toppingsData ?? []);
      setSelectedSize(sizes[0]);
      setSelectedToppings([]);
    } catch (error) {
      console.error("Error loading product details:", error);
    }
    setLoading(false);
  };

  const handleToppingToggle = (topping: Topping): void => {
    setSelectedToppings((prev) => {
      const exists = prev.find((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const calculateItemPrice = (): number => {
    if (!productDetails || !selectedSize) return 0;
    const sizePrice = selectedSize.price;
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    return sizePrice + toppingsPrice;
  };

  const addToCart = (): void => {
    if (!productDetails || !selectedSize) return;

    console.log(
      "Adding to cart:",
      productDetails?.productName,
      selectedSize.sizeName,
      selectedToppings
    );
    const cartItem: CartItem = {
      id: Date.now(),
      product: productDetails,
      size: selectedSize,
      toppings: [...selectedToppings],
      quantity: 1,
      price: calculateItemPrice(),
      note: "",
    };

    setCart((prev) => [...prev, cartItem]);
    setSelectedProduct(null);
    setProductDetails(null);
    setSelectedToppings([]);
  };

  const updateCartQuantity = (itemId: number, change: number): void => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const updateCartNote = (itemId: number, note: string): void => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, note };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: number): void => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const calculateTotal = (): number => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmitOrder = async (): Promise<void> => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    // if (!customerName || !tableNumber) {
    //   alert("Please enter customer name and table number");
    //   return;
    // }

    setLoading(true);
    try {
      const orderData: OrderData = {
        customerName,
        tableNumber,
        items: cart,
        total: calculateTotal(),
        timestamp: new Date().toISOString(),
      };

      // const result = await mockAPI.submitOrder(orderData);

      // if (result.success) {
      //   alert(`Order #${result.orderId} submitted successfully!`);
      //   setCart([]);
      //   setCustomerName("");
      //   setTableNumber("");
      //   setCartExpanded(false);
      // }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order");
    }
    setLoading(false);
  };
  const closeProductCustomization = () => {
    setProductDetails(null);
    setSelectedToppings([]);
    setSelectedSize(null);
  };
  const filteredProducts = products.filter(
    (p) => p.productName.toLowerCase().includes(searchTerm.toLowerCase())
    // p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const shouldShowCart = productDetails !== null || cart.length > 0;
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Products */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Order Management</h1>
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <ProductList
          products={filteredProducts}
          onProductSelect={handleProductSelect}
          loading={loading}
        />
      </div>

      {/* === CART PANEL – CHỈ HIỆN KHI CẦN === */}
      <div
        className={`absolute lg:relative inset-y-0 right-0 bg-white border-l shadow-2xl transition-all duration-500 ease-in-out ${
          shouldShowCart
            ? "w-full lg:w-96 translate-x-0"
            : "w-0 translate-x-full lg:w-0"
        } overflow-hidden`}
      >
        {shouldShowCart && (
          <CartPanel
            cart={cart}
            customerName={customerName}
            tableNumber={tableNumber}
            productDetails={productDetails}
            sizes={sizes}
            toppings={toppings}
            selectedSize={selectedSize}
            selectedToppings={selectedToppings}
            onClose={closeProductCustomization} // bấm nút X hoặc ngoài → đóng
            onCustomerNameChange={setCustomerName}
            onTableNumberChange={setTableNumber}
            onSizeSelect={setSelectedSize}
            onToppingToggle={handleToppingToggle}
            onAddToCart={addToCart}
            onUpdateQuantity={updateCartQuantity}
            onUpdateNote={updateCartNote}
            onRemove={removeFromCart}
            onSubmitOrder={handleSubmitOrder}
            calculateItemPrice={calculateItemPrice}
            calculateTotal={calculateTotal}
            loading={loading}
            cartExpanded={false}
          />
        )}
      </div>

      {/* === NÚT NHỎ GỌI CART KHI BỊ ẨN (rất cần cho nhân viên) === */}
      {!shouldShowCart && cart.length > 0 && (
        <FloatingCartButton
          cartLength={cart.length}
          onClick={() => setProductDetails({} as ProductDetails)} // hack nhỏ: mở cart bằng cách giả lập đang chọn món
        />
      )}
    </div>
  );
};
export default ModeratorOrderSystem;
