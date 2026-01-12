export type Category =
  | "FOREIGN_OBJECT"
  | "ASK_STAFF_CONTACT"
  | "ADD_ON_REQUEST"
  | "MISSING_WRONG_ITEM"
  | "TOXIC"
  | "GENERAL";

const HOTLINE = "1900-xxxx"; // ✅ thay số thật

const SUGGESTIONS: Record<Category, string[]> = {
  FOREIGN_OBJECT: [
    `Dạ em xin lỗi nghiêm túc về sự cố vệ sinh an toàn thực phẩm. Bên em sẽ thu hồi món và đổi món mới ngay, đồng thời mời quản lý hỗ trợ trực tiếp ạ. (Hotline: ${HOTLINE})`,
    "Dạ anh/chị cho em xin ảnh/chi tiết vị trí dị vật để bên em xử lý đúng quy trình và báo bếp kiểm tra ngay ạ.",
    `Dạ bên em đã ghi nhận và sẽ kiểm tra toàn bộ quy trình để tránh tái diễn. Em xin phép hỗ trợ đổi món/hoàn tiền theo quy định ạ. (Hotline: ${HOTLINE})`,
  ],
  ASK_STAFF_CONTACT: [
    `Dạ em cảm ơn anh/chị. Bên em không thể cung cấp số điện thoại/thông tin cá nhân của nhân viên. Anh/chị vui lòng liên hệ hotline: ${HOTLINE} hoặc trao đổi với quản lý tại quầy ạ.`,
    `Dạ em xin phép không chia sẻ thông tin cá nhân của nhân viên. Anh/chị cần hỗ trợ gì để em chuyển quản lý xử lý ngay ạ? (Hotline: ${HOTLINE})`,
    `Dạ anh/chị có thể để lại lời nhắn, em sẽ chuyển giúp ạ. Hoặc liên hệ hotline: ${HOTLINE} để được hỗ trợ chính thức.`,
  ],
  ADD_ON_REQUEST: [
    "Dạ em đã ghi nhận yêu cầu cho thêm. Em sẽ kiểm tra với bếp/quầy và phản hồi ngay ạ.",
    "Dạ bên em sẽ hỗ trợ cho thêm theo quy định/khả năng hiện tại. Anh/chị chờ em một chút ạ.",
    `Dạ trường hợp này bên em chưa thể tặng thêm, nhưng có thể hỗ trợ đổi/ưu đãi theo quy định. (Hotline: ${HOTLINE})`,
  ],
  MISSING_WRONG_ITEM: [
    "Dạ em xin lỗi vì thiếu/sai món. Bên em sẽ làm bổ sung/đổi lại ngay và ưu tiên nhanh nhất ạ.",
    "Dạ anh/chị cho em xin xác nhận món bị thiếu/sai để em xử lý chính xác ngay ạ.",
    "Dạ em đã ghi nhận và sẽ kiểm tra lại khâu ra món để tránh lặp lại ạ.",
  ],
  TOXIC: [
    "Dạ em xin lỗi vì trải nghiệm chưa tốt làm anh/chị khó chịu. Em sẽ xử lý ngay bây giờ ạ.",
    `Dạ em xin phép mời quản lý đến hỗ trợ trực tiếp để giải quyết nhanh ạ. (Hotline: ${HOTLINE})`,
    "Dạ em rất muốn hỗ trợ anh/chị. Mình cho em xin phép trao đổi với ngôn từ lịch sự để xử lý nhanh nhất ạ.",
  ],
  GENERAL: [
    "Cảm ơn anh/chị đã góp ý. Bên em đã ghi nhận và sẽ cải thiện ạ.",
    "Dạ em xin lỗi vì sự bất tiện. Bên em sẽ kiểm tra và khắc phục ngay ạ.",
    "Dạ em đã chuyển thông tin cho bộ phận liên quan để cải thiện ạ.",
  ],
};

const removeDiacritics = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const KW = {
  // ✅ foreign mạnh - KHÔNG dùng "ban"/"do" để tránh dính "bạn/đồ"
  foreignStrong: [
    "di vat",
    "toc",
    "soi toc",
    "ruoi",
    "gian",
    "kien",
    "con trung",
    "lan vao",
    "nhua",
    "kim loai",
    "thuy tinh",
    "manh",
    "vat la",
  ],

  toxic: ["dm", "dmm", "dit", "lon", "cc", "vcl", "vl", "du ma"],

  askContact: [
    "xin so",
    "so dien thoai",
    "sdt",
    "zalo",
    "facebook",
    "instagram",
    "ig",
    "in4",
    "info",
  ],
  staffFemale: ["ban nu", "nhan vien nu", "co ay", "em ay", "chi do", "ban do"],

  missingWrong: [
    "thieu",
    "sai mon",
    "ra sai",
    "quen mon",
    "nham mon",
    "khong co mon",
  ],

  addOn: [
    "cho them",
    "xin them",
    "tang them",
    "them rau",
    "them da",
    "them dua",
    "them sot",
    "them topping",
  ],

  // ✅ bắt theo raw text có dấu (tránh nhầm "bạn/đồ")
  dirtyRaw: ["bẩn", "dơ", "dơ bẩn", "mất vệ sinh", "không vệ sinh", "bị bẩn"],
};

export function detectCategory(feedbackRaw: string): Category {
  const rawLower = (feedbackRaw || "").toLowerCase();
  const t = removeDiacritics(feedbackRaw);

  // 1) ✅ ƯU TIÊN xin số / info nhân viên trước (tránh bị foreign chụp mất)
  if (
    KW.askContact.some((w) => t.includes(w)) &&
    KW.staffFemale.some((w) => t.includes(w))
  ) {
    return "ASK_STAFF_CONTACT";
  }

  // 2) ✅ Dị vật / côn trùng / vật lạ (mạnh, ít false-positive)
  if (KW.foreignStrong.some((w) => t.includes(w))) {
    return "FOREIGN_OBJECT";
  }

  // 3) ✅ Bẩn/dơ/vệ sinh (bắt theo raw có dấu)
  if (KW.dirtyRaw.some((w) => rawLower.includes(w))) {
    return "FOREIGN_OBJECT";
  }

  // 4) Chửi
  if (KW.toxic.some((w) => t.includes(w))) {
    return "TOXIC";
  }

  // 5) Thiếu / sai món
  if (KW.missingWrong.some((w) => t.includes(w))) {
    return "MISSING_WRONG_ITEM";
  }

  // 6) Xin thêm
  if (KW.addOn.some((w) => t.includes(w))) {
    return "ADD_ON_REQUEST";
  }

  return "GENERAL";
}

export function getSuggestionsByFeedback(feedback: string): string[] {
  return SUGGESTIONS[detectCategory(feedback)];
}
