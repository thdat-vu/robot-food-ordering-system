import { ShoppingCart } from "lucide-react";

interface FloatingCartButtonProps {
  cartLength: number;
  onClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  cartLength,
  onClick,
}) => {
  if (cartLength === 0) return null;

  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
    >
      <ShoppingCart size={24} />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
        {cartLength}
      </span>
    </button>
  );
};
export default FloatingCartButton;
