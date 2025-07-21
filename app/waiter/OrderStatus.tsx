import "@google/model-viewer";

export default function OrderStatus({ dish }: { dish: any }) {
  if (!dish) {
    return (
      <div className="w-2/3 p-4 flex items-center justify-center">
        <p>Chọn món để xem trạng thái phục vụ</p>
      </div>
    );
  }

  return (
    <div className="w-2/3 p-4 space-y-6">
      {/* Thông tin đơn hàng */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-2xl font-bold mb-2">Đơn hàng: {dish.name}</h2>
        <p>Mã đơn: {dish.id}</p>
        <p>Bàn: {dish.table}</p>
        <p>Thời gian: {dish.time || "12:00"}</p>
        <p>Ghi chú: {dish.note || "Không có"}</p>
      </div>

      {/* Tiến trình phục vụ */}
      <div>
        <label className="block mb-1 font-semibold">Tiến trình phục vụ</label>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: "70%" }}
          />
        </div>
        <p className="text-sm mt-1 text-green-700">Đang phục vụ ✅</p>
      </div>

      {/* Sơ đồ phục vụ với overlay vị trí bàn */}
      <div className="relative w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <model-viewer
          src="/assets/map1.glb"
          alt="Mô hình phục vụ"
          auto-rotate
          camera-controls
          shadow-intensity="1"
          exposure="1"
          interaction-prompt="none"
          style={{ width: "100%", height: "100%" }}
        />
        {/* Overlay vị trí bàn mẫu */}
        <div
          className="absolute"
          style={{
            left: "60%", // chỉnh lại theo vị trí thực tế
            top: "40%", // chỉnh lại theo vị trí thực tế
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          <div
            className="w-6 h-6 bg-red-500 rounded-full border-4 border-white animate-pulse"
            title="Bàn 5"
          ></div>
          <div className="text-xs text-red-700 font-bold text-center">
            Bàn 5
          </div>
        </div>
      </div>

      {/* Danh sách món đã phục vụ */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-2">Món đã phục vụ</h3>
        <ul className="list-disc pl-5">
          <li>Nước chanh dây #1</li>
          <li>Nước chanh dây #2</li>
        </ul>
      </div>

      {/* Nút hoàn thành */}
      <button className="mt-4 px-6 py-2 bg-yellow-400 rounded-lg text-white font-bold">
        Hoàn thành
      </button>
    </div>
  );
}
