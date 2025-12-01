import { formatVNNumber } from "./../../../lib/utils/orderGroupingitem";
interface CartFooterProps {
  total: number;
  onSubmitOrder: () => void;
  loading: boolean;
  cartLength: number;
}

const CartFooter: React.FC<CartFooterProps> = ({
  total,
  onSubmitOrder,
  loading,
  cartLength,
}) => {
  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xl font-bold">Total:</span>
        <span className="text-2xl font-bold text-blue-600">
          {formatVNNumber(total)} đ
        </span>
      </div>
      <button
        onClick={onSubmitOrder}
        disabled={loading || cartLength === 0}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Submit Order"}
      </button>
    </div>
  );
};
export default CartFooter;
