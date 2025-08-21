import React, {useEffect, useState} from 'react';
import {X, Send, MessageSquare, RefreshCw, Users, Clock, Star, LucideIcon} from 'lucide-react';
import {DetailType} from "@/components/common/OrderDisplay";
import {useCreateFeedback} from "@/hooks/customHooks/useFeedbackHooks";
import {FeedbackRequest} from "@/entites/request/FeedbackRequest";
import {useTableContext} from "@/hooks/context/Context";

interface FeedbackSuggestion {
    id: string;
    text: string;
    icon: LucideIcon;
    color: string;
}

interface FeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productInfo?: DetailType;
    listIds?: string[];
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({isOpen, onClose, productInfo, listIds}) => {
    const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
    const [customFeedback, setCustomFeedback] = useState<string>('');
    const [rating, setRating] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const {tableId} = useTableContext();
    const {run} = useCreateFeedback();

    useEffect(() => {
        if (!isOpen) {
            setSelectedSuggestions([]);
            setCustomFeedback('');
            setRating(0);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const feedbackSuggestions: FeedbackSuggestion[] = [
        {id: 'remake', text: 'Làm lại món', icon: RefreshCw, color: 'bg-orange-100 text-orange-600'},
        {id: 'service', text: 'Yêu cầu phục vụ', icon: Users, color: 'bg-blue-100 text-blue-600'},
        {id: 'slow', text: 'Phục vụ chậm', icon: Clock, color: 'bg-red-100 text-red-600'},
        {id: 'cold', text: 'Món bị nguội', icon: RefreshCw, color: 'bg-purple-100 text-purple-600'},
        {id: 'taste', text: 'Vị không đúng', icon: MessageSquare, color: 'bg-yellow-100 text-yellow-600'},
        {id: 'missing', text: 'Thiếu món', icon: MessageSquare, color: 'bg-gray-100 text-gray-600'},
    ];

    const handleSuggestionToggle = (suggestionId: string): void => {
        setSelectedSuggestions(prev =>
            prev.includes(suggestionId)
                ? prev.filter(id => id !== suggestionId)
                : [...prev, suggestionId]
        );
    };

    const handleSubmit = async (): Promise<void> => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            let combinedNote = '';

            if (selectedSuggestions.length > 0) {
                const suggestionTexts = selectedSuggestions
                    .map(id => feedbackSuggestions.find(s => s.id === id)?.text)
                    .filter(Boolean);
                combinedNote += `Phản hồi: ${suggestionTexts.join(', ')}`;
            }

            if (customFeedback.trim()) {
                if (combinedNote) combinedNote += '\n';
                combinedNote += `Chi tiết: ${customFeedback.trim()}`;
            }

            if (rating > 0) {
                if (combinedNote) combinedNote += '\n';
                combinedNote += `Đánh giá: ${rating}/5 sao`;
            }

            const feedbackRequest: FeedbackRequest = {
                idTable: tableId,
                note: combinedNote || 'Feedback không có nội dung cụ thể',
                idOrderItem: listIds || []
            };

            const result = await run(feedbackRequest);

            if (result) {
                onClose();
            }

        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const value = e.target.value;
        if (value.length <= 200) {
            setCustomFeedback(value);
        }
    };

    const isSubmitDisabled = isSubmitting || (
        !rating &&
        selectedSuggestions.length === 0 &&
        !customFeedback.trim()
    );

    const totalItems = listIds ? listIds.length : 1;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        onClose();
                    }
                }}
            />

            <div
                className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:w-96 sm:max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-6 h-6"/>
                            <h2 className="text-lg font-semibold">
                                Feedback {totalItems > 1 ? `(${totalItems} món)` : ''}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                            aria-label="Đóng dialog"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>

                    <div className="mt-3 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                        <p className="text-sm opacity-90">Món ăn:</p>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="font-medium truncate">
                                    {productInfo?.shc.productName || 'Tên món ăn'}
                                </p>
                                <div className="flex items-center gap-2 text-xs opacity-75 mt-1">
                                    <span>Size: {productInfo?.shc.sizeName}</span>
                                    <span>•</span>
                                    <span>SL: {productInfo?.quantity}</span>
                                    {totalItems > 1 && (
                                        <>
                                            <span>•</span>
                                            <span className="bg-white bg-opacity-30 px-2 py-0.5 rounded-full">
                                                +{totalItems - 1} tương tự
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {productInfo?.shc.imageUrl && (
                                <img
                                    src={productInfo.shc.imageUrl}
                                    alt={productInfo.shc.productName}
                                    className="w-12 h-12 rounded-lg object-cover ml-3"
                                />
                            )}
                        </div>

                        {productInfo?.shc.toppings && productInfo.shc.toppings.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white border-opacity-20">
                                <p className="text-xs opacity-75 mb-1">Topping:</p>
                                <div className="flex flex-wrap gap-1">
                                    {productInfo.shc.toppings.map((topping) => (
                                        <span
                                            key={topping.id}
                                            className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full"
                                        >
                                            {topping.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-6 space-y-6 max-h-96 overflow-y-auto">
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Gợi ý phản hồi
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {feedbackSuggestions.map((suggestion) => {
                                const Icon = suggestion.icon;
                                const isSelected = selectedSuggestions.includes(suggestion.id);

                                return (
                                    <button
                                        key={suggestion.id}
                                        onClick={() => handleSuggestionToggle(suggestion.id)}
                                        className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                                            isSelected
                                                ? `${suggestion.color} border-current scale-95 shadow-md`
                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                                        }`}
                                        aria-pressed={isSelected}
                                    >
                                        <Icon className="w-5 h-5 mx-auto mb-2"/>
                                        <p className="text-xs font-medium text-center leading-tight">
                                            {suggestion.text}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="custom-feedback"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Nội dung khác (tùy chọn)
                        </label>
                        <textarea
                            id="custom-feedback"
                            value={customFeedback}
                            onChange={handleTextareaChange}
                            placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            rows={4}
                            maxLength={200}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {customFeedback.length}/200 ký tự
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4"/>
                                    Gửi feedback
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};