import React from "react";

interface DishItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const DishItem: React.FC<DishItemProps> = ({ label, checked, onChange }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#FBBF24", // màu vàng
        padding: "12px 16px",
        margin: "8px 0",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ marginRight: 12 }}
      />
      <span style={{ fontWeight: 500 }}>{label}</span>
    </div>
  );
};

export default DishItem;
