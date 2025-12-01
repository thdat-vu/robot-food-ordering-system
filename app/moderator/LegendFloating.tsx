import React from "react";
import {
  Circle,
  CircleDot,
  Coffee,
  CheckCircle2,
  Utensils,
  Receipt,
} from "lucide-react";

interface LegendFloatingProps {
  isFloating: boolean;
}

interface LegendItemProps {
  label: string;
  borderClassName: string;
  outerBgClassName?: string;
  innerBgClassName?: string;
  icon?: React.ReactNode;
  iconOnly?: boolean;
}

const LegendItem: React.FC<LegendItemProps> = ({
  label,
  borderClassName,
  outerBgClassName,
  innerBgClassName,
  icon,
  iconOnly = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 ${borderClassName} ${
          outerBgClassName ?? ""
        }`}
      >
        {icon ? (
          icon
        ) : innerBgClassName ? (
          <span className={`w-3.5 h-3.5 rounded-full ${innerBgClassName}`} />
        ) : (
          <Circle className="w-3.5 h-3.5 text-slate-400" />
        )}
      </span>
      {!iconOnly && (
        <span className="text-xs leading-tight text-slate-700 font-medium">
          {label}
        </span>
      )}
    </div>
  );
};

const LegendCard: React.FC = () => (
  <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl px-3.5 py-3 space-y-1.5 text-xs border border-slate-200/80 w-52">
    <h3 className="font-semibold text-slate-800 flex items-center gap-2 pb-1 border-b border-slate-100 text-[13px]">
      <Coffee className="w-4 h-4" />
      <span>Trạng thái bàn</span>
    </h3>

    <LegendItem
      label="Bàn trống"
      borderClassName="border-slate-300"
      outerBgClassName="bg-white"
      icon={<Circle className="w-4 h-4 text-slate-300" />}
    />

    <LegendItem
      label="Có khách"
      borderClassName="border-cyan-400"
      outerBgClassName="bg-cyan-50"
      icon={<CircleDot className="w-4 h-4 text-cyan-600" />}
    />

    <LegendItem
      label="Đã order"
      borderClassName="border-blue-400"
      outerBgClassName="bg-blue-50"
      icon={<Utensils className="w-3.5 h-3.5 text-blue-600" />}
    />

    <LegendItem
      label="Đã phục vụ"
      borderClassName="border-amber-400"
      outerBgClassName="bg-amber-50"
      icon={<Coffee className="w-3.5 h-3.5 text-amber-600" />}
    />

    <LegendItem
      label="Đã giao món"
      borderClassName="border-purple-400"
      outerBgClassName="bg-purple-50"
      icon={<CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
    />

    <LegendItem
      label="Đã thanh toán"
      borderClassName="border-green-500"
      outerBgClassName="bg-green-50"
      icon={<Receipt className="w-3.5 h-3.5 text-green-600" />}
    />
  </div>
);

export const LegendFloating: React.FC<LegendFloatingProps> = ({
  isFloating,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // 🔹 Chưa scroll: card nhỏ góc trái trên, xích lên để không che filter
  if (!isFloating) {
    return (
      <div className="hidden lg:block absolute left-6 top-20 z-30">
        <LegendCard />
      </div>
    );
  }

  // 🔹 Đã scroll: NÚT TRÒN CHỈ ICON COFFEE ở góc trái dưới
  return (
    <div className="hidden lg:flex fixed left-4 bottom-4 z-50 flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group inline-flex items-center justify-center w-10 h-10 rounded-full 
                   bg-gradient-to-br from-white to-slate-100 border border-slate-300 
                   shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
        aria-label="Trạng thái bàn"
      >
        <Coffee
          className={`w-5 h-5 text-slate-800 transition-transform duration-300 ${
            isOpen ? "scale-110" : ""
          }`}
        />
      </button>

      <div
        className={`transition-all duration-300 ease-out origin-bottom-left ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-3 scale-95 pointer-events-none"
        }`}
      >
        <LegendCard />
      </div>
    </div>
  );
};
