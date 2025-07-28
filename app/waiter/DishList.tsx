// waiter/DishList.tsx
import DishItem from "./DishItem";

interface Dish {
  id: number;
  name: string;
  selected: boolean;
}

interface DishListProps {
  dishes: Dish[];
  onToggle: (id: number) => void;
}

export default function DishList({ dishes, onToggle }: DishListProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-xl w-full space-y-3">
      {dishes.map((dish) => (
        <DishItem
          key={dish.id}
          label={dish.name}
          checked={dish.selected}
          onChange={() => onToggle(dish.id)}
        />
      ))}
    </div>
  );
}
