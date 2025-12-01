import CartItem from "./CartItem";

interface CartItemsProps {
  cart: CartItem[];
  onUpdateQuantity: (itemId: number, change: number) => void;
  onUpdateNote: (itemId: number, note: string) => void;
  onRemove: (itemId: number) => void;
}

const CartItems: React.FC<CartItemsProps> = ({
  cart,
  onUpdateQuantity,
  onUpdateNote,
  onRemove,
}) => {
  if (cart.length === 0) {
    return <div className="text-center py-8 text-gray-500">Cart is empty</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {cart.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onUpdateNote={onUpdateNote}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
export default CartItems;
