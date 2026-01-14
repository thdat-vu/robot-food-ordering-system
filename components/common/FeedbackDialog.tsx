import React, {useEffect, useState, useRef} from "react";
import {X, MessageSquare, Plus} from "lucide-react";
import {useCreateFeedback} from "@/hooks/customHooks/useFeedbackHooks";
import {useTableContext} from "@/hooks/context/Context";
import {FeedbackRequest} from "@/entites/request/FeedbackRequest";

interface AutocompleteSuggestion {
    id: string;
    text: string;
    keywords: string[];
    category: string;
}

interface FeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

interface StoredFeedback {
    tableId: string;
    content: string;
    timestamp: number;
}

interface SelectedItem {
    id: string;
    text: string;
    isCustom?: boolean;
}

const FEEDBACK_SENT_KEY = "feedback_sent";
const EXPIRY_TIME = 30 * 60 * 1000;

// =================== PROFANITY FILTER ===================
// Bạn thêm/bớt tuỳ ý
const BAD_WORDS = [
    "dm", "dmm", "clm", "cmn", "vcl", "vkl",
    "dit", "du", "lon", "lol", "cac", "buoi", "dai",
    "oc cho", "khon nan", "mat day", "vo hoc"
];

function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Mask từ tục => "**" (giữ nguyên phần còn lại)
 * - match theo "biên" từ (không dính trong chữ khác)
 * - không phân biệt hoa/thường
 * - hỗ trợ unicode (tiếng Việt)
 */
function maskBadWords(text: string) {
    if (!text) return text;

    const sorted = [...BAD_WORDS].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(
        `(^|[^\\p{L}\\p{N}])(${sorted.map(escapeRegExp).join("|")})(?=[^\\p{L}\\p{N}]|$)`,
        "giu"
    );

    return text.replace(pattern, (_m, p1) => `${p1}**`);
}

/**
 * Check còn từ tục hay không (dựa trên regex y hệt)
 */
function hasBadWords(text: string) {
    if (!text) return false;

    const sorted = [...BAD_WORDS].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(
        `(^|[^\\p{L}\\p{N}])(${sorted.map(escapeRegExp).join("|")})(?=[^\\p{L}\\p{N}]|$)`,
        "giu"
    );

    return pattern.test(text);
}

// =========================================================

export default function FeedbackDialog({isOpen, onClose}: FeedbackDialogProps) {
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
    const [customText, setCustomText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sentFeedbackList, setSentFeedbackList] = useState<StoredFeedback[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const customInputRef = useRef<HTMLInputElement>(null);
    const {tableId} = useTableContext();
    const {run} = useCreateFeedback();

    const suggestions: AutocompleteSuggestion[] = [
        {id: "nuocmam", text: "Cho thêm nước mắm", keywords: ["nuoc", "mam"], category: "Nước chấm"},
        {id: "nuoctuong", text: "Cho thêm nước tương", keywords: ["nuoc", "tuong"], category: "Nước chấm"},
        {id: "xidau", text: "Cho thêm xì dầu", keywords: ["xi", "dau"], category: "Nước chấm"},

        {id: "tuongot", text: "Cho thêm tương ớt", keywords: ["tuong", "ot"], category: "Gia vị"},
        {id: "chaneo", text: "Cho thêm chanh ớt", keywords: ["chanh", "ot"], category: "Gia vị"},
        {id: "muoi", text: "Cho thêm muối tiêu", keywords: ["muoi", "tieu"], category: "Gia vị"},

        {id: "khonghanh", text: "Không hành", keywords: ["khong", "hanh"], category: "Loại bỏ"},
        {id: "khongtoi", text: "Không tỏi", keywords: ["khong", "toi"], category: "Loại bỏ"},
        {id: "khongot", text: "Không ớt", keywords: ["khong", "ot"], category: "Loại bỏ"},
        {id: "khongrau", text: "Không rau mùi", keywords: ["khong", "rau"], category: "Loại bỏ"},
        {id: "khonggia", text: "Không giá", keywords: ["khong", "gia"], category: "Loại bỏ"},
        {id: "khongngo", text: "Không ngò", keywords: ["khong", "ngo"], category: "Loại bỏ"},
        {id: "khongmui", text: "Không mùi tây", keywords: ["khong", "mui"], category: "Loại bỏ"},
        {id: "khongchanh", text: "Không chanh", keywords: ["khong", "chanh"], category: "Loại bỏ"},

        {id: "khongcay", text: "Không cay", keywords: ["khong", "cay"], category: "Độ cay"},
        {id: "itcay", text: "Ít cay", keywords: ["it", "cay"], category: "Độ cay"},
        {id: "cayvua", text: "Cay vừa", keywords: ["cay", "vua"], category: "Độ cay"},
        {id: "ratcay", text: "Rất cay", keywords: ["rat", "cay"], category: "Độ cay"},
        {id: "caydacbiet", text: "Cay đặc biệt", keywords: ["cay", "dac"], category: "Độ cay"},

        {id: "itdau", text: "Ít dầu", keywords: ["it", "dau"], category: "Dầu mỡ"},
        {id: "khongdau", text: "Không dầu mỡ", keywords: ["khong", "dau"], category: "Dầu mỡ"},
        {id: "itmo", text: "Ít mỡ", keywords: ["it", "mo"], category: "Dầu mỡ"},
        {id: "khongbeo", text: "Không béo", keywords: ["khong", "beo"], category: "Dầu mỡ"},

        {id: "nonghoi", text: "Nóng hổi", keywords: ["nong", "hoi"], category: "Nhiệt độ"},
        {id: "amnguoi", text: "Ấm nguội", keywords: ["am", "nguoi"], category: "Nhiệt độ"},
        {id: "nongbong", text: "Nóng bỏng tay", keywords: ["nong", "bong"], category: "Nhiệt độ"},

        {id: "themrau", text: "Thêm rau sống", keywords: ["them", "rau"], category: "Phần ăn"},
        {id: "themthit", text: "Thêm thịt", keywords: ["them", "thit"], category: "Phần ăn"},
        {id: "themdotot", text: "Thêm đồ tôm", keywords: ["them", "do"], category: "Phần ăn"},
        {id: "themtrung", text: "Thêm trứng", keywords: ["them", "trung"], category: "Phần ăn"},
        {id: "thembanh", text: "Thêm bánh phở", keywords: ["them", "banh"], category: "Phần ăn"},
        {id: "themchanh", text: "Thêm chanh", keywords: ["them", "chanh"], category: "Phần ăn"},
        {id: "themga", text: "Thêm gà", keywords: ["them", "ga"], category: "Phần ăn"},
        {id: "thembo", text: "Thêm bò", keywords: ["them", "bo"], category: "Phần ăn"},
        {id: "themheo", text: "Thêm heo", keywords: ["them", "heo"], category: "Phần ăn"},
        {id: "themcom", text: "Thêm cơm", keywords: ["them", "com"], category: "Phần ăn"},

        {id: "taikhong", text: "Tái hơn", keywords: ["tai", "song"], category: "Chế biến"},
        {id: "chinky", text: "Chín kỹ", keywords: ["chin", "ky"], category: "Chế biến"},
        {id: "giontan", text: "Giòn tan", keywords: ["gion", "tan"], category: "Chế biến"},
        {id: "memdiu", text: "Mềm dịu", keywords: ["mem", "diu"], category: "Chế biến"},
        {id: "chammon", text: "Chậm món", keywords: ["cham", "mon"], category: "Chế biến"},
        {id: "lamlien", text: "Yêu cầu làm liền", keywords: ["nhanh", "lien"], category: "Chế biến"},
        {id: "ranvang", text: "Rán vàng giòn", keywords: ["ran", "vang"], category: "Chế biến"},
        {id: "luocsong", text: "Luộc sống", keywords: ["luoc", "song"], category: "Chế biến"},

        {id: "itman", text: "Ít mặn", keywords: ["it", "man"], category: "Vị"},
        {id: "manvua", text: "Mặn vừa", keywords: ["man", "vua"], category: "Vị"},
        {id: "itngot", text: "Ít ngọt", keywords: ["it", "ngot"], category: "Vị"},
        {id: "themngot", text: "Thêm ngọt", keywords: ["them", "ngot"], category: "Vị"},
        {id: "itchua", text: "Ít chua", keywords: ["it", "chua"], category: "Vị"},
        {id: "damda", text: "Đậm đà", keywords: ["dam", "da"], category: "Vị"},
        {id: "nhatvi", text: "Nhạt vị", keywords: ["nhat", "vi"], category: "Vị"},

        {id: "catbeo", text: "Cắt bỏ phần béo", keywords: ["cat", "bo"], category: "Khác"},
        {id: "riengphan", text: "Tách riêng phần", keywords: ["rieng", "tach"], category: "Khác"},
        {id: "danhop", text: "Đánh hộp riêng", keywords: ["danh", "hop"], category: "Khác"},
        {id: "monkhac", text: "Ra món khác", keywords: ["ra", "mon"], category: "Khác"},
        {id: "catnho", text: "Cắt nhỏ", keywords: ["cat", "nho"], category: "Khác"},
        {id: "catmong", text: "Cắt mỏng", keywords: ["cat", "mong"], category: "Khác"},
        {id: "xaynho", text: "Xay nhỏ", keywords: ["xay", "nho"], category: "Khác"},
    ];

    const groupedSuggestions = suggestions.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, AutocompleteSuggestion[]>);

    useEffect(() => {
        if (isOpen) {
            loadStorage();
            setSelectedItems([]);
            setShowCustomInput(false);
            setCustomText("");
            setExpandedCategories(new Set());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (showCustomInput && customInputRef.current) {
            customInputRef.current.focus();
        }
    }, [showCustomInput]);

    const loadStorage = () => {
        try {
            const raw = localStorage.getItem(FEEDBACK_SENT_KEY);
            if (raw) {
                let list = JSON.parse(raw);
                if (!Array.isArray(list)) list = [];
                list = list.filter(
                    (f: StoredFeedback) =>
                        f.tableId === tableId &&
                        Date.now() - f.timestamp < EXPIRY_TIME
                );
                setSentFeedbackList(list);
            }
        } catch {
        }
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) newSet.delete(category);
            else newSet.add(category);
            return newSet;
        });
    };

    const handleSelectItem = (item: AutocompleteSuggestion) => {
        const exists = selectedItems.find(i => i.id === item.id);
        if (!exists) {
            setSelectedItems([...selectedItems, {id: item.id, text: item.text}]);
        }
    };

    const handleRemoveItem = (id: string) => {
        setSelectedItems(selectedItems.filter(i => i.id !== id));
    };

    const handleAddCustom = () => {
        const raw = customText.trim();
        if (!raw) return;

        // mask ngay khi add
        const masked = maskBadWords(raw);

        const customId = `custom_${Date.now()}`;
        setSelectedItems([
            ...selectedItems,
            {id: customId, text: masked, isCustom: true}
        ]);

        setCustomText("");
        setShowCustomInput(false);
    };

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            alert("Vui lòng chọn ít nhất một mục feedback!");
            return;
        }

        setIsSubmitting(true);
        try {
            // mask toàn bộ lần cuối trước khi gửi
            const feedbackContentRaw = selectedItems.map(i => i.text).join(", ");
            const feedbackContent = maskBadWords(feedbackContentRaw);

            // OPTIONAL: nếu bạn muốn CHẶN gửi khi user vẫn cố nhập từ tục (trước khi mask)
            // Ở đây vì ta đã mask, nên thường không cần chặn.
            // Nếu bạn muốn chặn theo raw customText trước khi add thì đã có thể check ở handleAddCustom().
            // if (hasBadWords(feedbackContentRaw)) {
            //     alert("Nội dung có từ ngữ không phù hợp!");
            //     return;
            // }

            const payload: FeedbackRequest = {
                tableId,
                complainNote: feedbackContent,
                title: " Yêu cầu thêm ",
            };

            const ok = await run(payload);

            let list: StoredFeedback[] = [];
            try {
                const raw = localStorage.getItem(FEEDBACK_SENT_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) list = parsed;
                }
            } catch {
            }

            list.push({tableId, content: feedbackContent, timestamp: Date.now()});
            list = list.filter(f => Date.now() - f.timestamp < EXPIRY_TIME);
            localStorage.setItem(FEEDBACK_SENT_KEY, JSON.stringify(list));

            alert("Gửi feedback thành công!");
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}/>

            <div
                className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:w-[600px] max-h-[90vh] shadow-xl overflow-hidden flex flex-col">
                {/* Header */}
                <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5"/> Gửi yêu cầu
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                {sentFeedbackList.length > 0 && (
                    <div
                        className="bg-green-50 text-green-700 px-4 py-3 text-sm border-b border-green-200 max-h-32 overflow-y-auto flex-shrink-0">
                        <p className="font-medium mb-2">✅ Feedback đã gửi:</p>
                        {sentFeedbackList.map((f, i) => (
                            <div key={i} className="mb-2 pb-2 border-b border-green-200 last:border-b-0">
                                {f.content}
                            </div>
                        ))}
                    </div>
                )}

                {selectedItems.length > 0 && (
                    <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex-shrink-0">
                        <p className="text-sm font-medium text-blue-900 mb-3">📝 Đã chọn ({selectedItems.length}):</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="inline-flex items-center gap-2 bg-white border-2 border-blue-300 rounded-full px-4 py-2 text-sm font-medium text-gray-800 shadow-sm"
                                >
                                    <span>{item.text}</span>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="hover:bg-red-100 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-red-500"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showCustomInput && (
                    <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200 flex-shrink-0">
                        <div className="flex gap-2">
                            <input
                                ref={customInputRef}
                                type="text"
                                value={customText}
                                onChange={(e) => {
                                    // mask ngay khi gõ
                                    const raw = e.target.value;
                                    setCustomText(maskBadWords(raw));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddCustom();
                                    } else if (e.key === 'Escape') {
                                        setShowCustomInput(false);
                                        setCustomText("");
                                    }
                                }}
                                placeholder="Nhập nội dung khác..."
                                className="flex-1 px-4 py-2 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                            />
                            <button
                                onClick={handleAddCustom}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                            >
                                Thêm
                            </button>
                            <button
                                onClick={() => {
                                    setShowCustomInput(false);
                                    setCustomText("");
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Hủy
                            </button>
                        </div>

                        {/* OPTIONAL: cảnh báo nếu còn từ tục (trước mask) - ở đây đã mask nên thường false */}
                        {/* {hasBadWords(customText) && (
                            <p className="mt-2 text-xs text-red-600">Nội dung có từ ngữ không phù hợp.</p>
                        )} */}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {!showCustomInput && (
                        <button
                            onClick={() => setShowCustomInput(true)}
                            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 flex items-center justify-center gap-2 text-gray-600 hover:text-yellow-600 font-medium transition-all"
                        >
                            <Plus className="w-5 h-5"/>
                            <span>Khác (Nhập tùy chỉnh)</span>
                        </button>
                    )}

                    <div className="space-y-3">
                        {Object.entries(groupedSuggestions).map(([category, items]) => (
                            <div key={category} className="border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 flex justify-between items-center transition-colors"
                                >
                                    <span className="font-semibold text-gray-800">{category}</span>
                                    <span className="text-xs bg-blue-500 text-white px-2.5 py-1 rounded-full">
                                        {items.length}
                                    </span>
                                </button>

                                {expandedCategories.has(category) && (
                                    <div className="p-2 bg-white">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {items.map((item) => {
                                                const isSelected = selectedItems.some(i => i.id === item.id);
                                                return (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => handleSelectItem(item)}
                                                        disabled={isSelected}
                                                        className={`px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                                                            isSelected
                                                                ? "bg-blue-100 text-blue-700 cursor-not-allowed border-2 border-blue-300"
                                                                : "bg-white hover:bg-blue-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300"
                                                        }`}
                                                    >
                                                        {item.text}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t flex gap-3 flex-shrink-0">
                    <button
                        className="flex-1 py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-colors font-medium text-gray-700"
                        onClick={onClose}
                    >
                        Hủy
                    </button>

                    <button
                        disabled={selectedItems.length === 0 || isSubmitting}
                        onClick={handleSubmit}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all font-medium"
                    >
                        {isSubmitting ? "Đang gửi..." : `Gửi (${selectedItems.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
}
