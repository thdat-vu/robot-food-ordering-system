import React from "react";
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

const DishList: React.FC<DishListProps> = ({ dishes, onToggle }) => {
  return (
    <div
      style={{
        backgroundColor: "#D1D5DB", // xám
        padding: 16,
        borderRadius: 12,
        width: "250px",
      }}
    >
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
};

export default DishList;
