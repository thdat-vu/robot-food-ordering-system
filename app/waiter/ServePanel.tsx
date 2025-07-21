import React, { useState } from "react";
import { Coffee, CupSoda, GlassWater, Milk } from "lucide-react";

const Toast = ({ message }: { message: string }) => (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-lg z-50 animate-fade-in">
    {message}
  </div>
);

const MapPanel = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-white rounded-2xl shadow-2xl border-4 border-transparent bg-clip-padding relative overflow-hidden group transition-all duration-300">
    <div className="absolute inset-0 rounded-2xl pointer-events-none border-4 border-emerald-200 group-hover:border-emerald-400 transition-all duration-300"></div>
    <iframe
      src="https://map-doan-nhattruowngs-projects.vercel.app/map/5"
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      className="rounded-2xl h-full w-full shadow-lg"
      title="Map Embed"
      style={{ border: "none" }}
    />
  </div>
);

interface Dish {
  id: number;
  name: string;
  type: string;
  selected: boolean;
  served?: boolean;
}

const initialDishes: Dish[] = [
  { id: 1, name: "Nước chanh dây", type: "juice", selected: false },
  { id: 2, name: "Nước cam", type: "juice", selected: false },
  { id: 3, name: "Cà phê sữa", type: "coffee", selected: false },
  { id: 4, name: "Cà phê đen", type: "coffee", selected: false },
  { id: 5, name: "Trà đào", type: "tea", selected: false },
  { id: 6, name: "Trà sữa", type: "tea", selected: false },
  { id: 7, name: "Trà chanh", type: "tea", selected: false },
  { id: 8, name: "Sữa tươi", type: "milk", selected: false },
  { id: 9, name: "Nước suối", type: "water", selected: false },
  { id: 10, name: "Soda chanh", type: "soda", selected: false },
];

const typeStyle: Record<
  string,
  { label: string; bg: string; border: string; icon: React.ReactNode }
> = {
  juice: {
    label: "Nước ép",
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    icon: <CupSoda className="w-5 h-5 text-yellow-500 mr-3" />,
  },
  coffee: {
    label: "Cà phê",
    bg: "bg-amber-50",
    border: "border-amber-300",
    icon: <Coffee className="w-5 h-5 text-amber-700 mr-3" />,
  },
  tea: {
    label: "Trà",
    bg: "bg-green-50",
    border: "border-green-300",
    icon: <GlassWater className="w-5 h-5 text-green-600 mr-3" />,
  },
  milk: {
    label: "Sữa",
    bg: "bg-gray-50",
    border: "border-gray-300",
    icon: <Milk className="w-5 h-5 text-gray-400 mr-3" />,
  },
  water: {
    label: "Nước suối",
    bg: "bg-blue-50",
    border: "border-blue-300",
    icon: <GlassWater className="w-5 h-5 text-blue-400 mr-3" />,
  },
  soda: {
    label: "Soda",
    bg: "bg-cyan-50",
    border: "border-cyan-300",
    icon: <CupSoda className="w-5 h-5 text-cyan-500 mr-3" />,
  },
};

const ServePanel: React.FC = () => {
  const [dishes, setDishes] = useState(initialDishes);
  const [toast, setToast] = useState<string | null>(null);

  const grouped = dishes.reduce<Record<string, Dish[]>>((acc, dish) => {
    if (!acc[dish.type]) acc[dish.type] = [];
    acc[dish.type].push(dish);
    return acc;
  }, {});

  const hasSelected = dishes.some((d) => d.selected && !d.served);

  const toggleDish = (id: number) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    );
  };

  const handleServe = () => {
    const selectedDishes = dishes.filter((d) => d.selected && !d.served);
    if (selectedDishes.length === 0) return;
    setToast(`Đã phục vụ: ${selectedDishes.map((d) => d.name).join(", ")}`);
    setDishes((prev) =>
      prev.map((d) =>
        d.selected && !d.served ? { ...d, served: true, selected: false } : d
      )
    );
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-emerald-50 to-white">
      {toast && <Toast message={toast} />}

      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 h-full overflow-y-auto p-4 border-r border-emerald-200">
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, items]) => {
            const style = typeStyle[type] || {
              label: type,
              bg: "bg-white",
              border: "border-gray-200",
              icon: null,
            };
            return (
              <div key={type} className="w-full">
                <div className="flex items-center mb-3">
                  {style.icon}
                  <span className="font-bold text-lg text-emerald-700">
                    {style.label}
                  </span>
                </div>
                <ul className="space-y-2 w-full">
                  {items
                    .filter((dish) => !dish.served)
                    .map((dish) => (
                      <li key={dish.id}>
                        <label
                          className={`flex items-center px-4 py-3 rounded-xl border-2 ${style.bg} ${style.border} cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:bg-emerald-50 focus-within:ring-2 focus-within:ring-emerald-400 group w-full`}
                        >
                          <input
                            type="checkbox"
                            checked={dish.selected}
                            onChange={() => toggleDish(dish.id)}
                            className="accent-emerald-500 w-5 h-5 mr-3 transition-all duration-200 focus:ring-2 focus:ring-emerald-400 rounded"
                          />
                          <span className="font-medium select-none text-base group-hover:text-emerald-700 transition-colors duration-150">
                            {dish.name}
                          </span>
                        </label>
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-emerald-700 text-center">
            Chọn món để phục vụ
          </h2>

          <div className="flex-1 w-full">
            {hasSelected ? (
              <MapPanel />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                Vui lòng chọn ít nhất 1 món...
              </div>
            )}
          </div>

          {hasSelected && (
            <div className="w-full flex justify-center mt-6">
              <button
                className="py-4 px-8 rounded-full font-semibold text-white text-xl bg-emerald-500 hover:bg-emerald-600 transition duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-300 active:scale-95"
                onClick={handleServe}
              >
                🚀 Phục vụ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServePanel;
