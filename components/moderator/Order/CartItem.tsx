import { ImageIcon, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/entites/moderator/ProductOrder";
import { formatVNNumber } from "./../../../lib/utils/orderGroupingitem";

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, change: number) => void;
  onUpdateNote: (itemId: number, note: string) => void;
  onRemove: (itemId: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onUpdateNote,
  onRemove,
}) => {
  const imgSrc = item.product?.urlImg; // đổi field nếu cần

  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-3">
      <div className="flex gap-3">
        {/* Image */}
        <div className="h-16 w-16 shrink-0 rounded-md border bg-white overflow-hidden flex items-center justify-center">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={item.product?.name ?? "Product image"}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                // fallback nếu ảnh lỗi
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={18} />
              <span className="text-[10px] mt-1">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-2">
              <h4 className="font-semibold leading-snug">
                {item.product?.name}
              </h4>
              <p className="text-sm text-gray-600">{item.size.sizeName}</p>
              {item.toppings.length > 0 && (
                <p className="text-xs text-gray-500">
                  + {item.toppings.map((t) => t.name).join(", ")}
                </p>
              )}
            </div>

            <button
              onClick={() => onRemove(item.id)}
              className="text-red-500 hover:text-red-700 p-1"
              aria-label="Remove item"
              title="Remove"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <input
            type="text"
            placeholder="Add note..."
            value={item.note}
            onChange={(e) => onUpdateNote(item.id, e.target.value)}
            className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.id, -1)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Decrease quantity"
                title="Decrease"
              >
                <Minus size={16} />
              </button>

              <span className="font-semibold w-6 text-center">
                {item.quantity}
              </span>

              <button
                onClick={() => onUpdateQuantity(item.id, 1)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Increase quantity"
                title="Increase"
              >
                <Plus size={16} />
              </button>
            </div>

            <span className="font-bold text-blue-600">
              {formatVNNumber(item.price * item.quantity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CartItem;
