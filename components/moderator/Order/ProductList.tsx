import { Product } from "@/entites/moderator/ProductOrder";
import ProductCard from "./ProductCard";

interface ProductListProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  loading: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onProductSelect,
  loading,
}) => {
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading products...</div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map((product) => {
        return (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={onProductSelect}
          />
        );
      })}
    </div>
  );
};
export default ProductList;
