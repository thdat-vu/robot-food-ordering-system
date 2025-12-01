import { Minus, Plus, Trash2 } from "lucide-react";
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
  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold">{item.product?.productName}</h4>
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
            className="p-1 hover:bg-gray-100"
          >
            <Minus size={16} />
          </button>
          <span className="font-semibold">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="p-1 hover:bg-gray-100"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="font-bold text-blue-600">
          {formatVNNumber(item.price * item.quantity)}
        </span>
      </div>
    </div>
  );
};
export default CartItem;
