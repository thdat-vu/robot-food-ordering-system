import React, {useState} from "react";
import {useCreateNewFeedback} from "@/hooks/customHooks/useFeedbackHooks";
import {Star} from "lucide-react";

export const Feedback: React.FC<{
    idTable: string;
    orderItemId: string;
    open: boolean;
    onClose: () => void;
}> = ({idTable, orderItemId, open, onClose}) => {
    const {run} = useCreateNewFeedback();
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            setStatusMsg({success: false, text: "Vui lòng chọn số sao đánh giá!"});
            return;
        }

        setIsSubmitting(true);
        try {
            await run(idTable, orderItemId, rating, comment);
            setStatusMsg({success: true, text: "Gửi đánh giá thành công!"});
            setTimeout(() => {
                setComment("");
                setRating(0);
                setStatusMsg(null);
                onClose();
            }, 1500);
        } catch (err) {
            setStatusMsg({success: false, text: "Gửi đánh giá thất bại!"});
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-all"
                    aria-label="Đóng"
                >
                    <span className="text-2xl leading-none">×</span>
                </button>

                <div className="text-center mb-6">
                    <div
                        className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Star className="w-8 h-8 text-white fill-white"/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Đánh giá món ăn</h2>
                    <p className="text-sm text-gray-500 mt-1">Chia sẻ trải nghiệm của bạn</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đánh giá của bạn
                        </label>
                        <div className="flex justify-center gap-2 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-colors ${
                                            star <= (hoverRating || rating)
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center text-sm text-gray-600">
                                {rating === 5 && "Tuyệt vời! ⭐"}
                                {rating === 4 && "Rất tốt! 😊"}
                                {rating === 3 && "Khá ổn 👍"}
                                {rating === 2 && "Cần cải thiện 😐"}
                                {rating === 1 && "Chưa hài lòng 😞"}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nhận xét (tùy chọn)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all resize-none"
                            rows={4}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                </div>

                {statusMsg && (
                    <div
                        className={`mt-4 p-3 rounded-xl text-center font-medium animate-in fade-in slide-in-from-bottom-2 ${
                            statusMsg.success
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                        {statusMsg.text}
                    </div>
                )}
            </div>
        </div>
    );
};