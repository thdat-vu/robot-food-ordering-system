import React from "react";
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

const ProductCustomization = ({
  productDetails,
  sizes,
  toppings,
  selectedSize,
  selectedToppings,
  onSizeSelect,
  onToppingToggle,
  onAddToCart,
  calculateItemPrice,
}: ProductCustomizationProps) => {
  if (!productDetails) return null;

  return (
    <div className="mb-6">
      <div className="flex items-start gap-3 mb-2">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-white">
          {productDetails.urlImg ? (
            <img
              src={productDetails.urlImg}
              alt={productDetails.name ?? "Product image"}
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No img
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="text-xl font-bold leading-snug truncate">
            {productDetails.name}
          </h3>
          {typeof productDetails.price === "number" && (
            <div className="text-sm text-gray-500">
              Base: {formatVNNumber(productDetails.price)}
            </div>
          )}
        </div>
      </div>

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
          className="w-full bg-green-700  text-white py-3 rounded-lg hover:bg-green-700  transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCustomization;
