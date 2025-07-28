// "use client";

// import React, { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { ChevronDown, ChevronUp } from "lucide-react";
// import { toast } from "sonner";

// interface Dish {
//   id: number;
//   name: string;
//   type: string;
//   selected: boolean;
//   served?: boolean;
// }

// const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// export default function PaymentPanel({ dishes }: { dishes: Dish[] }) {
//   const [selectedTable, setSelectedTable] = useState<number | null>(null);
//   const [showList, setShowList] = useState(true);

//   const servedDishes = dishes.filter((d) => d.served);
//   const total = servedDishes.length * 30000;

//   const handlePrint = () => {
//     const printWindow = window.open("", "_blank");
//     if (printWindow) {
//       printWindow.document.write(`
//         <html>
//           <head>
//             <title>Hóa đơn bàn ${selectedTable}</title>
//             <style>
//               body { font-family: sans-serif; padding: 20px; }
//               h2 { margin-bottom: 8px; }
//               ul { list-style: none; padding: 0; margin: 8px 0; }
//               li { display: flex; justify-content: space-between; margin-bottom: 4px; }
//               .total { font-weight: bold; margin-top: 10px; font-size: 16px; }
//               .footer { font-size: 12px; margin-top: 8px; }
//             </style>
//           </head>
//           <body>
//             <h2>HÓA ĐƠN THANH TOÁN</h2>
//             <p><strong>Bàn:</strong> ${selectedTable}</p>
//             <ul>
//               ${servedDishes
//                 .map(
//                   (dish) =>
//                     `<li><span>${dish.name}</span><span>30.000đ</span></li>`
//                 )
//                 .join("")}
//             </ul>
//             <div class="total">Tổng cộng: ${total.toLocaleString(
//               "vi-VN"
//             )}đ</div>
//             <div class="footer">Thời gian: ${new Date().toLocaleString()}</div>
//           </body>
//         </html>
//       `);
//       printWindow.document.close();
//       printWindow.focus();
//       printWindow.print();
//       printWindow.close();
//     }
//   };

//   const handlePayment = () => {
//     toast("Thanh toán thành công", {
//       description: `Bàn ${selectedTable} - ${total.toLocaleString("vi-VN")}đ`,
//     });
//     handlePrint(); // in hóa đơn
//     setSelectedTable(null); // reset chọn bàn
//   };

//   return (
//     <div className="flex flex-col md:flex-row gap-6 w-full">
//       {/* Danh sách bàn */}
//       <div className="flex flex-wrap gap-4 md:w-1/2">
//         {TABLES.map((table) => (
//           <Button
//             key={table}
//             variant={selectedTable === table ? "default" : "outline"}
//             className="basis-[48%] md:basis-[30%] h-20 text-lg font-bold"
//             onClick={() => setSelectedTable(table)}
//           >
//             Bàn {table}
//           </Button>
//         ))}
//       </div>

//       {/* Panel thanh toán */}
//       <div className="w-full md:w-1/2 space-y-6">
//         {selectedTable !== null && (
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-xl">
//                 Thanh toán - Bàn {selectedTable}
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Button
//                 variant="ghost"
//                 className="px-0 mb-3"
//                 onClick={() => setShowList(!showList)}
//               >
//                 {showList ? (
//                   <>
//                     <ChevronUp className="w-4 h-4 mr-1" /> Ẩn món đã phục vụ
//                   </>
//                 ) : (
//                   <>
//                     <ChevronDown className="w-4 h-4 mr-1" /> Xem món đã phục vụ
//                   </>
//                 )}
//               </Button>

//               {showList && (
//                 <>
//                   {servedDishes.length === 0 ? (
//                     <p className="text-muted-foreground text-sm italic">
//                       Chưa có món nào được phục vụ.
//                     </p>
//                   ) : (
//                     <ul className="space-y-2">
//                       {servedDishes.map((dish) => (
//                         <li
//                           key={dish.id}
//                           className="flex justify-between border-b pb-1 text-sm"
//                         >
//                           <span>{dish.name}</span>
//                           <span className="font-semibold text-emerald-600">
//                             30.000đ
//                           </span>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </>
//               )}

//               <Separator className="my-4" />
//               <div className="flex justify-between text-base font-semibold mb-4">
//                 <span>Tổng cộng</span>
//                 <span className="text-emerald-700">
//                   {total.toLocaleString("vi-VN")}đ
//                 </span>
//               </div>

//               {/* ✅ Nút xác nhận thanh toán */}
//               {servedDishes.length > 0 && (
//                 <Button
//                   className="w-full text-base font-semibold"
//                   onClick={handlePayment}
//                 >
//                   ✅ Xác nhận thanh toán & In hóa đơn
//                 </Button>
//               )}
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Dish {
  id: number;
  name: string;
  type: string;
  selected: boolean;
  served?: boolean;
}

const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function PaymentPanel({
  dishes,
  onPaymentComplete,
}: {
  dishes: Dish[];
  onPaymentComplete: () => void;
}) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showList, setShowList] = useState(true);

  const servedDishes = dishes.filter((d) => d.served);
  const total = servedDishes.length * 30000;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa đơn bàn ${selectedTable}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              h2 { margin-bottom: 8px; }
              ul { list-style: none; padding: 0; margin: 8px 0; }
              li { display: flex; justify-content: space-between; margin-bottom: 4px; }
              .total { font-weight: bold; margin-top: 10px; font-size: 16px; }
              .footer { font-size: 12px; margin-top: 8px; }
            </style>
          </head>
          <body>
            <h2>HÓA ĐƠN THANH TOÁN</h2>
            <p><strong>Bàn:</strong> ${selectedTable}</p>
            <ul>
              ${servedDishes
                .map(
                  (dish) =>
                    `<li><span>${dish.name}</span><span>30.000đ</span></li>`
                )
                .join("")}
            </ul>
            <div class="total">Tổng cộng: ${total.toLocaleString(
              "vi-VN"
            )}đ</div>
            <div class="footer">Thời gian: ${new Date().toLocaleString()}</div>
            <script>
              window.onload = function () {
                window.print();
                window.onafterprint = function () {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const handlePayment = () => {
    handlePrint(); // 👈 gọi in ngay khi click
    toast("Thanh toán thành công", {
      description: `Bàn ${selectedTable} - ${total.toLocaleString("vi-VN")}đ`,
    });
    setSelectedTable(null);
    onPaymentComplete();
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      <div className="flex flex-wrap gap-4 md:w-1/2">
        {TABLES.map((table) => (
          <Button
            key={table}
            variant={selectedTable === table ? "default" : "outline"}
            className="basis-[48%] md:basis-[30%] h-20 text-lg font-bold"
            onClick={() => setSelectedTable(table)}
          >
            Bàn {table}
          </Button>
        ))}
      </div>

      <div className="w-full md:w-1/2 space-y-6">
        {selectedTable !== null && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Thanh toán - Bàn {selectedTable}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="px-0 mb-3"
                onClick={() => setShowList(!showList)}
              >
                {showList ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" /> Ẩn món đã phục vụ
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" /> Xem món đã phục vụ
                  </>
                )}
              </Button>

              {showList && (
                <>
                  {servedDishes.length === 0 ? (
                    <p className="text-muted-foreground text-sm italic">
                      Chưa có món nào được phục vụ.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {servedDishes.map((dish) => (
                        <li
                          key={dish.id}
                          className="flex justify-between border-b pb-1 text-sm"
                        >
                          <span>{dish.name}</span>
                          <span className="font-semibold text-emerald-600">
                            30.000đ
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              <Separator className="my-4" />
              <div className="flex justify-between text-base font-semibold mb-4">
                <span>Tổng cộng</span>
                <span className="text-emerald-700">
                  {total.toLocaleString("vi-VN")}đ
                </span>
              </div>

              {servedDishes.length > 0 && (
                <Button
                  className="w-full text-base font-semibold"
                  onClick={handlePayment}
                >
                  Xác nhận thanh toán & In hóa đơn
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
