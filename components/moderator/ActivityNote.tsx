// Tone = tông màu của card (viền + nền + chữ + badge)
export type Tone = "rose" | "amber" | "emerald" | "slate" | "blue" | "indigo";

export const toneMap: Record<
  Tone,
  {
    wrap: string; // class cho container
    badge: string; // class cho chip/badge
    title: string; // class cho title
    body: string; // class cho message
  }
> = {
  rose: {
    wrap: "border-rose-200 bg-rose-50",
    badge: "bg-rose-100 text-rose-700",
    title: "text-rose-700",
    body: "text-rose-700",
  },
  amber: {
    wrap: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
    title: "text-amber-800",
    body: "text-amber-900",
  },
  emerald: {
    wrap: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    title: "text-emerald-700",
    body: "text-emerald-800",
  },
  slate: {
    wrap: "border-slate-200 bg-slate-50",
    badge: "bg-slate-100 text-slate-700",
    title: "text-slate-700",
    body: "text-slate-800",
  },
  blue: {
    wrap: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    title: "text-blue-700",
    body: "text-blue-800",
  },
  indigo: {
    wrap: "border-indigo-200 bg-indigo-50",
    badge: "bg-indigo-100 text-indigo-700",
    title: "text-indigo-700",
    body: "text-indigo-800",
  },
};

type NoteReasonProps = {
  tone?: Tone;
  title: string;
  message: string;
  badges?: string[]; // ✅ thay badgeRight bằng badges
  footer?: string;
};

export const ActivityNote: React.FC<NoteReasonProps> = ({
  tone = "slate",
  title,
  message,
  badges,
  footer,
}) => {
  const cls = toneMap[tone];

  return (
    <div className={`mt-2 rounded-xl border p-3 ${cls.wrap}`}>
      <div className="flex items-center justify-between gap-3">
        <div className={`text-xs font-semibold ${cls.title}`}>{title}</div>

        {badges?.length ? (
          <div className="flex items-center gap-2">
            {badges.map((b) => (
              <span
                key={b}
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${cls.badge}`}
              >
                {b}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div
        className={`mt-1 text-sm whitespace-pre-line break-words leading-relaxed ${cls.body}`}
      >
        {message}
      </div>

      {footer ? (
        <div className="mt-2 text-xs text-gray-500">{footer}</div>
      ) : null}
    </div>
  );
};
