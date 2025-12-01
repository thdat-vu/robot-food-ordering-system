import type { Size } from "@/entites/moderator/ProductOrder";

interface SizeSelectorProps {
  sizes: Size[];
  selectedSize: Size | null;
  onSizeSelect: (size: Size) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
}) => {
  return (
    <div className="mb-4">
      <h4 className="font-semibold mb-2">Size:</h4>
      <div className="flex gap-2">
        {sizes.map((size) => (
          <button
            key={size.id}
            onClick={() => onSizeSelect(size)}
            className={`flex-1 py-2 px-3 rounded border-2 transition-colors ${
              selectedSize?.id === size.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-gray-300 hover:border-blue-400"
            }`}
          >
            <div>{size.sizeName}</div>
            {size.price > 0 && <div className="text-xs">{size.price}</div>}
          </button>
        ))}
      </div>
    </div>
  );
};
export default SizeSelector;
