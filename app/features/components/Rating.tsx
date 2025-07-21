import React, {useState} from "react";
import {BottomModal} from "@/components/common/BottomModal";
import {Star, X} from "lucide-react";
import Button from "@/components/common/Button";

const reasons = [
    'Vệ sinh không sạch sẽ',
    'Nhân viên không nhiệt tình',
    'Món ăn không ngon',
    'Món ăn phục vụ lâu',
    'Giá không phù hợp với chất lượng',
    'Không gian bất tiện',
    'Không gian ồn'
];

type RatingProps = {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}


export const Rating: React.FC<RatingProps> = ({id, isOpen, onClose, onSave}) => {

    const [rating, setRating] = useState<number>(0);
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [customFeedback, setCustomFeedback] = useState<string>('');
    const handleReasonToggle = (reason: string) => {
        setSelectedReasons(prev =>
            prev.includes(reason)
                ? prev.filter(r => r !== reason)
                : [...prev, reason]
        );
    };

    const handleStarClick = (starIndex: number) => {
        setRating(starIndex + 1);
    };

    return (
        <>
            <BottomModal
                id={id}
                title="Đánh  "
                isOpen={isOpen}
                onClose={onClose}
                onSave={onSave}
            >
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Trải nghiệm của bạn ở nhà hàng hôm nay thế nào ?
                    </h2>

                    <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleStarClick(index)}
                                className="mx-1"
                            >
                                <Star
                                    size={32}
                                    className={`${
                                        index < rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-base font-medium text-gray-800 mb-3">
                        Bạn có điều gì chưa hài lòng phải không?
                    </h3>

                    <div className="space-y-2">
                        {reasons.map((reason, index) => (
                            <button
                                key={index}
                                onClick={() => handleReasonToggle(reason)}
                                className={`w-full text-left px-4 py-2 rounded-full text-sm transition-colors ${
                                    selectedReasons.includes(reason)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {reason}
                            </button>
                        ))}

                        <div className="mt-3">
                            <textarea
                                value={customFeedback}
                                onChange={(e) => setCustomFeedback(e.target.value)}
                                placeholder="Viết góp ý cho nhà hàng ...."
                                className="w-full p-3 rounded-lg bg-white text-gray-700 text-sm resize-none h-16 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <Button content="Gửi đánh giá" handle={() => {
                    }}
                            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"/>
                </div>
            </BottomModal>
        </>
    )
}