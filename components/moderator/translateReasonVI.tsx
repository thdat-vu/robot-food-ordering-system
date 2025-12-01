// components/moderator/translateReasonVI.tsx

import { ReasonTextVI } from "@/lib/utils/Reason";

type ReasonObj = { code?: unknown; text?: unknown };
export type ReasonInput = string | ReasonObj | null | undefined;

export type ReasonUI = {
  head: string; // dòng tiêu đề nhỏ (vd: "Lý do")
  body: string; // mô tả tiếng Việt
  code?: string; // mã reason.code (nếu có)
  raw?: string; // raw text (nếu có)
};

export const translateReasonVI = (reason: ReasonInput): ReasonUI => {
  if (reason == null) return { head: "Lý do", body: "Không có lý do." };

  if (typeof reason === "object") {
    const code = reason.code != null ? String(reason.code).trim() : "";
    const text = reason.text != null ? String(reason.text).trim() : "";
    return {
      head: "Lý do",
      body:
        ReasonTextVI[text] ?? ReasonTextVI[code] ?? (text || "Không có lý do."),
      code: ReasonTextVI[code] || undefined,
      raw: ReasonTextVI[text] || undefined,
    };
  }

  const s = String(reason).trim();
  if (!s) return { head: "Lý do", body: "Không có lý do." };

  const parts = s.split(":");
  if (parts.length >= 2) {
    const code = parts[0].trim();
    const text = parts.slice(1).join(":").trim();
    return {
      head: "Lý do",
      body: ReasonTextVI[text] ?? ReasonTextVI[code] ?? text,
      code: code || undefined,
      raw: text || undefined,
    };
  }

  return { head: "Lý do", body: ReasonTextVI[s] ?? s, raw: s };
};
