import { X } from "lucide-react";
import CartItems from "./CartItems";
import ProductCustomization from "./ProductCustomization";
import CartFooter from "./CartFooter";
import {
  CartItem,
  ProductDetails,
  Size,
  Topping,
} from "@/entites/moderator/ProductOrder";

interface CartPanelProps {
  cartExpanded: boolean;
  cart: CartItem[];
  customerName: string;
  tableNumber: string;
  productDetails: ProductDetails | null;
  sizes: Size[];
  toppings: Topping[];
  selectedSize: Size | null;
  selectedToppings: Topping[];
  onClose: () => void;
  onCustomerNameChange: (value: string) => void;
  onTableNumberChange: (value: string) => void;
  onSizeSelect: (size: Size) => void;
  onToppingToggle: (topping: Topping) => void;
  onAddToCart: () => void;
  onUpdateQuantity: (itemId: number, change: number) => void;
  onUpdateNote: (itemId: number, note: string) => void;
  onRemove: (itemId: number) => void;
  onSubmitOrder: () => void;
  calculateItemPrice: () => number;
  calculateTotal: () => number;
  loading: boolean;
}

const CartPanel: React.FC<CartPanelProps> = ({
  cartExpanded,
  cart,
  customerName,
  tableNumber,
  productDetails,
  sizes,
  toppings,
  selectedSize,
  selectedToppings,
  onClose,
  onCustomerNameChange,
  onTableNumberChange,
  onSizeSelect,
  onToppingToggle,
  onAddToCart,
  onUpdateQuantity,
  onUpdateNote,
  onRemove,
  onSubmitOrder,
  calculateItemPrice,
  calculateTotal,
  loading,
}) => {
  return (
    <div
      className={`lg:w-96 w-full bg-white border-l flex flex-col ${
        cartExpanded ? "fixed lg:relative inset-0 z-50" : "hidden lg:flex"
      }`}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Cart ({cart.length})</h2>
        <button onClick={onClose} className="lg:hidden">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <ProductCustomization
          productDetails={productDetails}
          sizes={sizes}
          toppings={toppings}
          selectedSize={selectedSize}
          selectedToppings={selectedToppings}
          onSizeSelect={onSizeSelect}
          onToppingToggle={onToppingToggle}
          onAddToCart={onAddToCart}
          calculateItemPrice={calculateItemPrice}
        />

        {/* <CustomerInfo
          customerName={customerName}
          tableNumber={tableNumber}
          onCustomerNameChange={onCustomerNameChange}
          onTableNumberChange={onTableNumberChange}
        /> */}

        <CartItems
          cart={cart}
          onUpdateQuantity={onUpdateQuantity}
          onUpdateNote={onUpdateNote}
          onRemove={onRemove}
        />
      </div>

      <div className="p-4">
        <CartFooter
          total={calculateTotal()}
          onSubmitOrder={onSubmitOrder}
          loading={loading}
          cartLength={cart.length}
        />
      </div>
    </div>
  );
};
export default CartPanel;
