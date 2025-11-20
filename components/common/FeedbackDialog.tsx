import React, {useEffect, useState, useRef} from "react";
import {X, MessageSquare, Lightbulb} from "lucide-react";
import {useCreateFeedback} from "@/hooks/customHooks/useFeedbackHooks";
import {FeedbackRequest} from "@/entites/request/FeedbackRequest";
import {useTableContext} from "@/hooks/context/Context";
import {InForProductOrderDetail} from "@/entites/respont/OrderRespont";

interface AutocompleteSuggestion {
    id: string;
    text: string;
    keywords: string[];
    category: string;
}

interface FeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productInfo?: InForProductOrderDetail;
    listIds?: string[];
}

interface StoredFeedback {
    tableId: string;
    content: string;
    timestamp: number;
}

const FEEDBACK_DRAFT_KEY = "feedback_draft";
const FEEDBACK_SENT_KEY = "feedback_sent";
const AUTOCACHE_KEY = "cached_suggestions";
const EXPIRY_TIME = 30 * 60 * 1000;

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
                                                                  isOpen,
                                                                  onClose,
                                                                  listIds
                                                              }) => {

    const [customFeedback, setCustomFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [sentFeedbackList, setSentFeedbackList] = useState<StoredFeedback[]>([]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const {tableId} = useTableContext();
    const {run} = useCreateFeedback();

    // ================= DEFAULT SUGGESTIONS ====================
    const defaultSuggestions: AutocompleteSuggestion[] = [
        {id: "nuocmam", text: "Cho thêm nước mắm", keywords: ["nuoc", "mam"], category: "Nước chấm"},
        {id: "nuoctuong", text: "Cho thêm nước tương", keywords: ["nuoc", "tuong"], category: "Nước chấm"},
        {id: "tuongot", text: "Cho thêm tương ớt", keywords: ["tuong", "ot"], category: "Gia vị"},
        {id: "khonghanh", text: "Không hành", keywords: ["khong", "hanh"], category: "Loại bỏ"},
        {id: "khongtoi", text: "Không tỏi", keywords: ["khong", "toi"], category: "Loại bỏ"},
        {id: "itcay", text: "Ít cay", keywords: ["it", "cay"], category: "Độ cay"},
        {id: "cayvua", text: "Cay vừa", keywords: ["cay", "vua"], category: "Độ cay"},
        {id: "ratcay", text: "Rất cay", keywords: ["rat", "cay"], category: "Độ cay"},
        {id: "itdau", text: "Ít dầu", keywords: ["it", "dau"], category: "Dầu mỡ"},
        {id: "nonghoi", text: "Nóng hổi", keywords: ["nong", "hoi"], category: "Nhiệt độ"},
        {id: "themrau", text: "Thêm rau sống", keywords: ["them", "rau"], category: "Phần ăn"},
        {id: "taikhong", text: "Tái hơn", keywords: ["tai", "song"], category: "Chế biến"},
    ];

    // Load cache
    const [autocompleteSuggestions] = useState<AutocompleteSuggestion[]>(() => {
        try {
            const raw = localStorage.getItem(AUTOCACHE_KEY);
            if (raw) return JSON.parse(raw);
        } catch {
        }

        localStorage.setItem(AUTOCACHE_KEY, JSON.stringify(defaultSuggestions));
        return defaultSuggestions;
    });

    // Build keyword map
    const keywordMap = useRef<Map<string, AutocompleteSuggestion[]>>(new Map());

    useEffect(() => {
        const map = new Map<string, AutocompleteSuggestion[]>();

        autocompleteSuggestions.forEach(s => {
            s.keywords.forEach(k => {
                const key = k.toLowerCase();
                if (!map.has(key)) map.set(key, []);
                map.get(key)!.push(s);
            });
        });

        keywordMap.current = map;
    }, [autocompleteSuggestions]);

    // Validate only suggestion text allowed
    const isValidFeedback = (text: string) => {
        if (!text.trim()) return false;

        const allowed = autocompleteSuggestions.map(s => s.text.toLowerCase());
        const parts = text.toLowerCase().split(",");

        return parts.every(p =>
            allowed.some(a => p.trim().includes(a))
        );
    };

    // Save feedback
    const saveSentFeedback = (content: string) => {
        let list: StoredFeedback[] = [];

        try {
            const raw = localStorage.getItem(FEEDBACK_SENT_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) list = parsed;
            }
        } catch {
        }

        list.push({
            tableId,
            content,
            timestamp: Date.now()
        });

        list = list.filter(f => Date.now() - f.timestamp < EXPIRY_TIME);

        localStorage.setItem(FEEDBACK_SENT_KEY, JSON.stringify(list));
    };

    // Save draft
    const saveDraft = () => {
        if (!customFeedback.trim()) return;

        localStorage.setItem(FEEDBACK_DRAFT_KEY, JSON.stringify({
            tableId,
            content: customFeedback,
            timestamp: Date.now()
        }));
    };

    // Load storage
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

        try {
            const raw = localStorage.getItem(FEEDBACK_DRAFT_KEY);
            if (raw) {
                const d = JSON.parse(raw);
                if (d.tableId === tableId && Date.now() - d.timestamp < EXPIRY_TIME) {
                    setCustomFeedback(d.content);
                }
            }
        } catch {
        }
    };

    useEffect(() => {
        if (isOpen) loadStorage();
    }, [isOpen, tableId]);

    useEffect(() => {
        if (customFeedback) saveDraft();
    }, [customFeedback]);

    // FIXED: Smart fuzzy suggestion filter
    const getFilteredSuggestions = (text: string) => {
        const cleaned = text.toLowerCase().trim();
        if (!cleaned) return [];

        const lastWord = cleaned.split(/[\s,]/).pop()!.trim();
        if (!lastWord) return [];

        const results: AutocompleteSuggestion[] = [];

        for (const [key, list] of keywordMap.current.entries()) {
            if (key.startsWith(lastWord)) {
                results.push(...list);
            }
        }

        return Array.from(new Set(results)); // remove duplicates
    };

    const filteredSuggestions = React.useMemo(
        () => getFilteredSuggestions(customFeedback),
        [customFeedback]
    );

    useEffect(() => {
        setShowAutocomplete(filteredSuggestions.length > 0);
        setSelectedIndex(0);
    }, [filteredSuggestions]);

    // Insert suggestion
    const insertSuggestion = (s: AutocompleteSuggestion) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const text = customFeedback;
        const cursor = textarea.selectionStart;

        let start = cursor - 1;
        while (start >= 0 && ![" ", ",", "\n"].includes(text[start])) start--;
        start++;

        let end = cursor;
        while (end < text.length && ![" ", ",", "\n"].includes(text[end])) end++;

        const newText = text.substring(0, start) + s.text + text.substring(end);

        setCustomFeedback(newText);
        setShowAutocomplete(false);

        setTimeout(() => {
            const pos = start + s.text.length;
            textarea.setSelectionRange(pos, pos);
            textarea.focus();
        }, 0);
    };

    // Submit
    const handleSubmit = async () => {
        if (!isValidFeedback(customFeedback)) {
            alert("Chỉ được dùng gợi ý có sẵn!");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload: FeedbackRequest = {
                tableId,
                complainNote: customFeedback,
                orderItemIds: listIds || [],
                title: "",
            };

            const ok = await run(payload);
            if (ok) {
                saveSentFeedback(customFeedback);
                localStorage.removeItem(FEEDBACK_DRAFT_KEY);
                alert("Gửi feedback thành công!");
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">

            <div className="absolute inset-0 bg-black/50" onClick={onClose}/>

            <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:w-96 max-h-[90vh] shadow-xl">

                <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white flex justify-between items-center">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5"/> Feedback
                    </h2>
                    <button onClick={onClose}>
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                {/* Sent recent */}
                {sentFeedbackList.length > 0 && (
                    <div
                        className="bg-green-50 text-green-700 px-4 py-3 text-sm border-b border-green-200 max-h-32 overflow-y-auto">
                        <p className="font-medium mb-2">Feedback đã gửi:</p>
                        {sentFeedbackList.map((f, i) => (
                            <div key={i} className="mb-2 pb-2 border-b border-green-200">
                                {f.content}
                            </div>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="px-6 py-5 space-y-4 max-h-80 overflow-y-auto">

                    <label className="text-sm font-medium flex items-center gap-1">
                        Gợi ý
                        {showAutocomplete && <Lightbulb className="w-4 h-4 text-blue-600"/>}
                    </label>

                    <textarea
                        ref={textareaRef}
                        value={customFeedback}
                        onChange={(e) => setCustomFeedback(e.target.value)}
                        onKeyDown={(e) => {
                            if (showAutocomplete && e.key === "Tab") {
                                e.preventDefault();
                                insertSuggestion(filteredSuggestions[selectedIndex]);
                            }
                        }}
                        className="w-full px-4 py-3 border rounded-xl"
                        placeholder="Nhập để hiện gợi ý..."
                        rows={4}
                    />

                    {showAutocomplete && (
                        <div className="bg-white border rounded-xl shadow max-h-60 overflow-y-auto">
                            {filteredSuggestions.map((s, idx) => (
                                <button
                                    key={s.id}
                                    onClick={() => insertSuggestion(s)}
                                    className={`w-full px-4 py-3 text-left text-sm border-b hover:bg-blue-50 ${
                                        selectedIndex === idx ? "bg-blue-100" : ""
                                    }`}
                                >
                                    {s.text}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
                    <button className="flex-1 py-3 rounded-xl border" onClick={onClose}>
                        Hủy
                    </button>

                    <button
                        disabled={!isValidFeedback(customFeedback) || isSubmitting}
                        onClick={handleSubmit}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-50"
                    >
                        {isSubmitting ? "Đang gửi..." : "Gửi feedback"}
                    </button>
                </div>
            </div>
        </div>
    );
};
