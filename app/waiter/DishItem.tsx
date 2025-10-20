// waiter/DishItem.tsx
import { Checkbox } from "@/components/ui/checkbox";

interface DishItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export default function DishItem({ label, checked, onChange }: DishItemProps) {
  return (
    <label className="flex items-center px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50 cursor-pointer gap-3 transition-all hover:bg-yellow-100 shadow-sm">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span className="font-medium text-sm text-yellow-900">{label}</span>
    </label>
  );
}
