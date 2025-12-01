import { formatVNNumber } from "./../../../lib/utils/orderGroupingitem";
import { Topping } from "./../../../entites/moderator/ProductOrder";
interface ToppingSelectorProps {
  toppings: Topping[];
  selectedToppings: Topping[];
  onToppingToggle: (topping: Topping) => void;
}

const ToppingSelector: React.FC<ToppingSelectorProps> = ({
  toppings,
  selectedToppings,
  onToppingToggle,
}) => {
  return (
    <div className="mb-4">
      <h4 className="font-semibold mb-2">Toppings:</h4>
      <div className="space-y-2">
        {toppings.map(
          (topping) => (
            console.log("Rendering topping:", topping),
            (
              <label
                key={topping.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedToppings.some((t) => t.id === topping.id)}
                  onChange={() => onToppingToggle(topping)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{topping.name}</span>
                <span className="text-sm text-gray-500">
                  +{formatVNNumber(topping.price)}đ
                </span>
              </label>
            )
          )
        )}
      </div>
    </div>
  );
};
export default ToppingSelector;
