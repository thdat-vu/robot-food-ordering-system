import {
  ProductDetails,
  Size,
  Topping,
} from "@/entites/moderator/ProductOrder";
import SizeSelector from "./SizeSelector";
import ToppingSelector from "./ToppingSelector";
import { formatVNNumber } from "./../../../lib/utils/orderGroupingitem";

interface ProductCustomizationProps {
  productDetails: ProductDetails | null;
  sizes: Size[];
  toppings: Topping[];
  selectedSize: Size | null;
  selectedToppings: Topping[];
  onSizeSelect: (size: Size) => void;
  onToppingToggle: (topping: Topping) => void;
  onAddToCart: () => void;
  calculateItemPrice: () => number;
}
const ProductCustomization: React.FC<ProductCustomizationProps> = ({
  productDetails,
  sizes,
  toppings,
  selectedSize,
  selectedToppings,
  onSizeSelect,
  onToppingToggle,
  onAddToCart,
  calculateItemPrice,
}) => {
  if (!productDetails) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-2">{productDetails?.productName}</h3>

      <SizeSelector
        sizes={sizes}
        selectedSize={selectedSize}
        onSizeSelect={onSizeSelect}
      />
      <ToppingSelector
        toppings={toppings}
        selectedToppings={selectedToppings}
        onToppingToggle={onToppingToggle}
      />

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold">Item Total:</span>
          <span className="text-xl font-bold text-blue-600">
            {formatVNNumber(calculateItemPrice())}
          </span>
        </div>
        <button
          onClick={onAddToCart}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};
export default ProductCustomization;
