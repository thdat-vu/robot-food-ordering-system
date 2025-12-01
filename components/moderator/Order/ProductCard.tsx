import { Product } from "@/entites/moderator/ProductOrder";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(product)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 text-left border-2 border-transparent hover:border-emerald-500 hover:scale-105 relative overflow-hidden group"
    >
      {/* Duration badge */}
      {product.durationTime && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {product.durationTime} phút
        </div>
      )}

      {/* Image container with gradient overlay */}
      <div className="mb-3 flex justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity rounded-xl"></div>
        <img
          src={product.imageUrl ?? "/images/placeholder.png"}
          alt={product.productName ?? "Product"}
          className="h-28 w-28 rounded-xl object-cover ring-2 ring-gray-100 group-hover:ring-emerald-200 transition-all"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "/images/placeholder.png";
          }}
        />
      </div>

      {/* Product name */}
      <h3 className="font-bold text-base text-gray-800 line-clamp-2 min-h-[3rem] group-hover:text-emerald-600 transition-colors">
        {product.productName}
      </h3>

      {/* Decorative bottom bar */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 text-emerald-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Sẵn sàng
          </span>
          <span className="text-emerald-600 font-semibold group-hover:scale-110 transition-transform">
            Chọn món →
          </span>
        </div>
      </div>
    </button>
  );
};
export default ProductCard;
