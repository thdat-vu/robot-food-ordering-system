// "use client";

// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { toast } from "sonner";
// import PaymentPanel from "./PaymentPanel";

// const MapPanel = () => (
//   <div className="w-full h-[340px] md:h-[460px] flex items-center justify-center bg-muted rounded-2xl shadow-inner border border-border overflow-hidden">
//     <iframe
//       src="https://map-doan-nhattruowngs-projects.vercel.app/map/5"
//       allowFullScreen
//       loading="lazy"
//       referrerPolicy="strict-origin-when-cross-origin"
//       className="w-full h-full"
//       title="Map Embed"
//       style={{ border: "none" }}
//     />
//   </div>
// );

// interface Dish {
//   id: number;
//   name: string;
//   type: string;
//   selected: boolean;
//   served?: boolean;
// }

// const initialDishes: Dish[] = [
//   { id: 1, name: "Nước chanh dây", type: "juice", selected: false },
//   { id: 2, name: "Nước cam", type: "juice", selected: false },
//   { id: 3, name: "Cà phê sữa", type: "coffee", selected: false },
//   { id: 4, name: "Cà phê đen", type: "coffee", selected: false },
//   { id: 5, name: "Trà đào", type: "tea", selected: false },
//   { id: 6, name: "Trà sữa", type: "tea", selected: false },
//   { id: 7, name: "Trà chanh", type: "tea", selected: false },
//   { id: 8, name: "Sữa tươi", type: "milk", selected: false },
//   { id: 9, name: "Nước suối", type: "water", selected: false },
//   { id: 10, name: "Soda chanh", type: "soda", selected: false },
// ];

// const typeStyle: Record<
//   string,
//   { label: string; bg: string; border: string; icon?: React.ReactNode }
// > = {
//   juice: { label: "Nước ép", bg: "bg-muted", border: "border-border" },
//   coffee: { label: "Cà phê", bg: "bg-muted", border: "border-border" },
//   tea: { label: "Trà", bg: "bg-muted", border: "border-border" },
//   milk: { label: "Sữa", bg: "bg-muted", border: "border-border" },
//   water: { label: "Nước suối", bg: "bg-muted", border: "border-border" },
//   soda: { label: "Soda", bg: "bg-muted", border: "border-border" },
// };

// const ServePanel: React.FC = () => {
//   const [dishes, setDishes] = useState(initialDishes);
//   const [panel, setPanel] = useState<"control" | "payment">("control");

//   const grouped = dishes.reduce<Record<string, Dish[]>>((acc, dish) => {
//     if (!acc[dish.type]) acc[dish.type] = [];
//     acc[dish.type].push(dish);
//     return acc;
//   }, {});

//   const hasSelected = dishes.some((d) => d.selected && !d.served);

//   const toggleDish = (id: number) => {
//     setDishes((prev) =>
//       prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
//     );
//   };

//   const handleServe = () => {
//     const selectedDishes = dishes.filter((d) => d.selected && !d.served);
//     if (selectedDishes.length === 0) return;
//     toast("Đã phục vụ", {
//       description: selectedDishes.map((d) => d.name).join(", "),
//     });
//     setDishes((prev) =>
//       prev.map((d) =>
//         d.selected && !d.served ? { ...d, served: true, selected: false } : d
//       )
//     );
//   };

//   return (
//     <div className="flex flex-col md:flex-row p-4 gap-6 min-h-screen w-full bg-background">
//       {/* Sidebar chuyển panel */}
//       <div className="flex flex-col gap-4 items-center mr-4">
//         <Button
//           variant={panel === "control" ? "default" : "outline"}
//           className="w-32"
//           onClick={() => setPanel("control")}
//         >
//           Điều khiển
//         </Button>
//         <Button
//           variant={panel === "payment" ? "default" : "outline"}
//           className="w-32"
//           onClick={() => setPanel("payment")}
//         >
//           Thanh toán
//         </Button>
//       </div>

//       {panel === "control" ? (
//         <>
//           {/* Sidebar món ăn */}
//           <div className="w-full md:max-w-[300px] overflow-y-auto max-h-[80vh] pr-2 space-y-6">
//             {Object.entries(grouped).map(([type, items]) => {
//               const style = typeStyle[type];
//               return (
//                 <div key={type} className="w-full">
//                   <div className="mb-2 text-sm font-semibold text-foreground uppercase tracking-wide">
//                     {style.label}
//                   </div>
//                   <ul className="space-y-3 w-full">
//                     {items
//                       .filter((dish) => !dish.served)
//                       .map((dish) => (
//                         <li key={dish.id}>
//                           <label
//                             className={`flex items-center px-4 py-3 rounded-xl border ${style.bg} ${style.border} cursor-pointer transition hover:bg-accent`}
//                           >
//                             <Checkbox
//                               checked={dish.selected}
//                               onCheckedChange={() => toggleDish(dish.id)}
//                               className="mr-3"
//                             />
//                             <span className="text-sm font-medium text-foreground">
//                               {dish.name}
//                             </span>
//                           </label>
//                         </li>
//                       ))}
//                   </ul>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Nội dung chính */}
//           <div className="flex-1 px-2 md:px-4 flex flex-col items-center">
//             <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground text-center">
//               Chọn món để phục vụ
//             </h2>

//             <div className="w-full min-h-[320px]">
//               {hasSelected ? (
//                 <MapPanel />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-muted-foreground text-base italic">
//                   Vui lòng chọn ít nhất 1 món...
//                 </div>
//               )}
//             </div>

//             {hasSelected && (
//               <div className="w-full flex justify-center">
//                 <Button
//                   onClick={handleServe}
//                   className="mt-6 mb-4 px-6 py-3 text-lg rounded-full"
//                 >
//                   🚀 Phục vụ
//                 </Button>
//               </div>
//             )}

//             {/* Món đã phục vụ */}
//             {dishes.some((d) => d.served) && (
//               <div className="w-full mt-2 bg-muted rounded-xl p-4 shadow-sm">
//                 <h3 className="font-semibold text-sm text-foreground mb-2">
//                   Món đã phục vụ
//                 </h3>
//                 <ul className="list-disc pl-5 text-sm text-muted-foreground">
//                   {dishes
//                     .filter((d) => d.served)
//                     .map((d) => (
//                       <li key={d.id}>{d.name}</li>
//                     ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </>
//       ) : (
//         <PaymentPanel dishes={dishes} />
//       )}
//     </div>
//   );
// };

// export default ServePanel;
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import PaymentPanel from "./PaymentPanel";

const MapPanel = () => (
  <div className="w-full h-[340px] md:h-[460px] flex items-center justify-center bg-muted rounded-2xl shadow-inner border border-border overflow-hidden">
    <iframe
      src="https://map-doan-nhattruowngs-projects.vercel.app/map/5"
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      className="w-full h-full"
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
  { label: string; bg: string; border: string; icon?: React.ReactNode }
> = {
  juice: { label: "Nước ép", bg: "bg-muted", border: "border-border" },
  coffee: { label: "Cà phê", bg: "bg-muted", border: "border-border" },
  tea: { label: "Trà", bg: "bg-muted", border: "border-border" },
  milk: { label: "Sữa", bg: "bg-muted", border: "border-border" },
  water: { label: "Nước suối", bg: "bg-muted", border: "border-border" },
  soda: { label: "Soda", bg: "bg-muted", border: "border-border" },
};

const ServePanel: React.FC = () => {
  const [dishes, setDishes] = useState(initialDishes);
  const [panel, setPanel] = useState<"control" | "payment">("control");

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
    toast("Đã phục vụ", {
      description: selectedDishes.map((d) => d.name).join(", "),
    });
    setDishes((prev) =>
      prev.map((d) =>
        d.selected && !d.served ? { ...d, served: true, selected: false } : d
      )
    );
  };

  const handlePaymentComplete = () => {
    setDishes((prev) => prev.map((d) => ({ ...d, served: false })));
    setPanel("control");
  };

  return (
    <div className="flex flex-col md:flex-row p-4 gap-6 min-h-screen w-full bg-background">
      <div className="flex flex-col gap-4 items-center mr-4">
        <Button
          variant={panel === "control" ? "default" : "outline"}
          className="w-32"
          onClick={() => setPanel("control")}
        >
          Điều khiển
        </Button>
        <Button
          variant={panel === "payment" ? "default" : "outline"}
          className="w-32"
          onClick={() => setPanel("payment")}
        >
          Thanh toán
        </Button>
      </div>

      {panel === "control" ? (
        <>
          <div className="w-full md:max-w-[300px] overflow-y-auto max-h-[80vh] pr-2 space-y-6">
            {Object.entries(grouped).map(([type, items]) => {
              const style = typeStyle[type];
              return (
                <div key={type} className="w-full">
                  <div className="mb-2 text-sm font-semibold text-foreground uppercase tracking-wide">
                    {style.label}
                  </div>
                  <ul className="space-y-3 w-full">
                    {items
                      .filter((dish) => !dish.served)
                      .map((dish) => (
                        <li key={dish.id}>
                          <label
                            className={`flex items-center px-4 py-3 rounded-xl border ${style.bg} ${style.border} cursor-pointer transition hover:bg-accent`}
                          >
                            <Checkbox
                              checked={dish.selected}
                              onCheckedChange={() => toggleDish(dish.id)}
                              className="mr-3"
                            />
                            <span className="text-sm font-medium text-foreground">
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

          <div className="flex-1 px-2 md:px-4 flex flex-col items-center">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground text-center">
              Chọn món để phục vụ
            </h2>

            <div className="w-full min-h-[320px]">
              {hasSelected ? (
                <MapPanel />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-base italic">
                  Vui lòng chọn ít nhất 1 món...
                </div>
              )}
            </div>

            {hasSelected && (
              <div className="w-full flex justify-center">
                <Button
                  onClick={handleServe}
                  className="mt-6 mb-4 px-6 py-3 text-lg rounded-full"
                >
                  🚀 Phục vụ
                </Button>
              </div>
            )}

            {dishes.some((d) => d.served) && (
              <div className="w-full mt-2 bg-muted rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-sm text-foreground mb-2">
                  Món đã phục vụ
                </h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {dishes
                    .filter((d) => d.served)
                    .map((d) => (
                      <li key={d.id}>{d.name}</li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </>
      ) : (
        <PaymentPanel dishes={dishes} onPaymentComplete={handlePaymentComplete} />
      )}
    </div>
  );
};

export default ServePanel;
