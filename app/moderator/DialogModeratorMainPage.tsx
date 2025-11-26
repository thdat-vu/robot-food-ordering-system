import React, { useEffect, useState } from "react";
import { FeedbackPage } from "@/app/moderator/FeedbackPage";
import { HistoryPage } from "@/app/moderator/HistoryPage";
import { Home } from "@/app/moderator/Home";
import { MdPayments } from "react-icons/md";
import { FaExchangeAlt } from "react-icons/fa";

import {
  X,
  MessageSquare,
  History as HistoryIcon,
  Home as HomeIcon,
} from "lucide-react";
import { PaymentPage } from "@/app/moderator/PaymentPage";
import TableActivityTracker from "./TableActivityTracker";
import { ChangeTable } from "@/app/moderator/ChangeTable";
import { SessionTable } from "./SessionTable";

interface DialogModeratorMainPageProps {
  open: boolean;
  onClose: () => void;
  idTable: string;
  tableSessionId?: string | null;
  tableName?: string;
  initialTab?: string; // Thêm prop mới
}

export const DialogModeratorMainPage: React.FC<
  DialogModeratorMainPageProps
> = ({
  idTable,
  tableSessionId,
  open,
  onClose,
  tableName = "Bàn",
  initialTab = "home", // Thêm prop mới
}) => {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
    }
  }, [open, initialTab]);

  if (!open) return null;

  const tabs = [
    { id: "home", label: "Trang chủ", icon: HomeIcon },
    { id: "payment", label: "Thanh toán", icon: MdPayments },
    { id: "feedback", label: "Phản hồi", icon: MessageSquare },
    { id: "history", label: "Lịch sử", icon: HistoryIcon },
    { id: "change", label: "Đổi bàn", icon: FaExchangeAlt },
    { id: "activityTracking", label: "Hoạt động", icon: HistoryIcon },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl h-[90vh] flex overflow-hidden border border-gray-200">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-emerald-600 to-emerald-700 p-6 flex flex-col space-y-3">
          {/* Header */}
          <div className="mb-4 pb-4 border-b border-white/20">
            <h3 className="text-white font-bold text-lg mb-1">Quản lý bàn</h3>
            <p className="text-emerald-100 text-sm">{tableName}</p>
          </div>

          {/* Tab Buttons */}
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                  tab === t.id
                    ? "bg-white text-emerald-700 shadow-lg transform scale-105"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{t.label}</span>
              </button>
            );
          })}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-auto flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-md"
          >
            <X className="w-5 h-5" />
            <span>Đóng</span>
          </button>
        </aside>

        <main className="flex-1 bg-gray-50 p-8 overflow-auto">
          {tab === "home" && <Home idTable={idTable} />}
          {tab === "feedback" && <FeedbackPage idTable={idTable} />}
          {tab === "history" && <HistoryPage idTable={idTable} />}
          {tab === "payment" && <PaymentPage idTable={idTable} />}
          {tab === "change" && <ChangeTable id={idTable} onClose={onClose} />}
          {tab === "activityTracking" && <SessionTable idTable={idTable} />}
        </main>
      </div>
    </div>
  );
};
