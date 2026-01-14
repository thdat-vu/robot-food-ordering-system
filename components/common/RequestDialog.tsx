import React, {useState, useRef, useEffect} from "react";
import {Autocomplete, TextField, Chip, Popper} from "@mui/material";
import top1000request from "@/components/common/top1000request";
import {X, Plus, Send, Sparkles} from "lucide-react";
import {useTableContext} from "@/hooks/context/Context";
import {useCreateFeedback} from "@/hooks/customHooks/useFeedbackHooks";
import {FeedbackRequest} from "@/entites/request/FeedbackRequest";

type Prop = {
    open: boolean;
    onClose: () => void;
};

// =================== SENSITIVE WORD FILTER ===================
const SENSITIVE_WORDS = [
    "đm", "dmm", "dm",
    "địt", "đụ",
    "cặc", "lồn",
    "vcl", "vl",
    "đéo", "deo",
    "cc", "chó"
];

function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function maskSensitiveWords(text: string) {
    if (!text) return text;

    const sorted = [...SENSITIVE_WORDS].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(
        `(^|[^\\p{L}\\p{N}])(${sorted.map(escapeRegExp).join("|")})(?=[^\\p{L}\\p{N}]|$)`,
        "giu"
    );

    return text.replace(pattern, (_m, p1) => `${p1}**`);
}
// =============================================================

export const RequestDialog: React.FC<Prop> = ({open, onClose}) => {
    const [items, setItems] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // Fix MUI Autocomplete tự "reset" input về option vừa chọn
    const ignoreNextResetRef = useRef(false);

    const {tableId} = useTableContext();
    const {run} = useCreateFeedback();

    useEffect(() => {
        if (open) {
            setIsAnimating(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setIsAnimating(false);
        }
    }, [open]);

    if (!open) return null;

    const clearInputAndFocus = () => {
        ignoreNextResetRef.current = true;
        setInputValue("");
        setTimeout(() => {
            ignoreNextResetRef.current = false;
            inputRef.current?.focus();
        }, 0);
    };

    const handleAddItem = (value: string) => {
        const vRaw = value.trim();
        if (!vRaw) {
            clearInputAndFocus();
            return;
        }

        const v = maskSensitiveWords(vRaw);

        // ✅ Chống x2 tuyệt đối (dù bị gọi 2 lần trong 1 tick)
        setItems(prev => (prev.includes(v) ? prev : [...prev, v]));

        clearInputAndFocus();
    };

    const handleRemoveItem = (idx: number) => {
        setItems(prev => prev.filter((_, i) => i !== idx));
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            const submitBtn = document.getElementById("submit-btn");
            submitBtn?.classList.add("animate-shake");
            setTimeout(() => submitBtn?.classList.remove("animate-shake"), 500);
            return;
        }

        const content = maskSensitiveWords(items.join(", "));

        const payload: FeedbackRequest = {
            tableId,
            complainNote: content,
            title: " Phản hồi",
        };

        await run(payload);

        setItems([]);
        setInputValue("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isAnimating ? "opacity-100" : "opacity-0"
                }`}
                onClick={onClose}
            />

            {/* Dialog */}
            <div
                className={`relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
                    isAnimating
                        ? "translate-y-0 sm:scale-100 opacity-100"
                        : "translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
                }`}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5"/>
                            <h3 className="font-bold text-lg">Yêu cầu mới</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                    <p className="text-blue-100 text-sm mt-1">
                        Thêm các yêu cầu của bạn vào danh sách
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                    {/* Empty State */}
                    {items.length === 0 && (
                        <div className="text-center py-8 animate-fade-in">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                <Plus className="w-10 h-10 text-blue-600"/>
                            </div>
                            <p className="text-gray-600 font-medium">Chưa có yêu cầu nào</p>
                            <p className="text-gray-400 text-sm mt-1">Bắt đầu bằng cách gõ bên dưới</p>
                        </div>
                    )}

                    {/* Chips */}
                    {items.length > 0 && (
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700">
                                    Danh sách yêu cầu ({items.length})
                                </span>
                                <button
                                    onClick={() => setItems([])}
                                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="animate-scale-in"
                                        style={{animationDelay: `${idx * 50}ms`}}
                                    >
                                        <Chip
                                            label={item}
                                            onDelete={() => handleRemoveItem(idx)}
                                            variant="outlined"
                                            sx={{
                                                borderRadius: "12px",
                                                borderColor: "#3b82f6",
                                                borderWidth: "2px",
                                                color: "#1e40af",
                                                fontWeight: 600,
                                                fontSize: "0.875rem",
                                                padding: "4px 8px",
                                                transition: "all 0.2s",
                                                "&:hover": {
                                                    borderColor: "#2563eb",
                                                    backgroundColor: "#eff6ff",
                                                    transform: "translateY(-2px)",
                                                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
                                                },
                                                "& .MuiChip-deleteIcon": {
                                                    color: "#3b82f6",
                                                    "&:hover": {
                                                        color: "#1e40af",
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Autocomplete */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Thêm yêu cầu
                        </label>

                        <Autocomplete
                            freeSolo
                            openOnFocus
                            clearOnBlur={false}
                            options={top1000request.map(o => o.label)}
                            inputValue={inputValue}
                            onInputChange={(_, v, reason) => {
                                // chặn MUI reset input về option vừa chọn
                                if (ignoreNextResetRef.current && reason === "reset") return;
                                setInputValue(maskSensitiveWords(v));
                            }}
                            onChange={(_, value, reason) => {
                                // ✅ Chỉ add ở đây để tránh x2
                                // - createOption: user gõ + Enter
                                // - selectOption: chọn từ dropdown (click/Enter)
                                if ((reason === "createOption" || reason === "selectOption") && typeof value === "string") {
                                    handleAddItem(value);
                                }
                            }}
                            PopperComponent={(props) => (
                                <Popper {...props} placement="bottom-start" sx={{zIndex: 2000}}/>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    inputRef={inputRef}
                                    placeholder="Gõ hoặc chọn từ gợi ý..."
                                    fullWidth
                                    // ❌ Bỏ onKeyDown Enter để tránh add lần 2
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "16px",
                                            paddingY: "8px",
                                            backgroundColor: "#f9fafb",
                                            transition: "all 0.2s",
                                            "&:hover": {backgroundColor: "#f3f4f6"},
                                            "&.Mui-focused": {
                                                backgroundColor: "white",
                                                "& fieldset": {
                                                    borderColor: "#3b82f6",
                                                    borderWidth: "2px",
                                                },
                                            },
                                        },
                                    }}
                                />
                            )}
                        />

                        <p className="text-xs text-gray-500">💡 Nhấn Enter để thêm nhanh</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-5 bg-gray-50 border-t flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 font-semibold transition-all duration-200 hover:shadow-md"
                    >
                        Hủy
                    </button>

                    <button
                        id="submit-btn"
                        disabled={items.length === 0}
                        onClick={handleSubmit}
                        className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none flex items-center justify-center gap-2 group"
                    >
                        <span>Gửi</span>
                        {items.length > 0 && (
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                                {items.length}
                            </span>
                        )}
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.8); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-scale-in { animation: scale-in 0.3s ease-out backwards; }
                .animate-shake { animation: shake 0.3s ease-in-out; }
            `}</style>
        </div>
    );
};
