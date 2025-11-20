import React from "react";

interface FrameProps {
    onNext: () => void;
    onSkip: () => void;
    isLoading?: boolean;
}

export const Frame1: React.FC<FrameProps> = ({onNext, onSkip, isLoading = false}) => {
    return (
        <div
            className="w-full max-w-[420px] h-screen bg-white flex flex-col justify-between items-center p-6 rounded-[24px] mx-auto">
            <div className="flex flex-col items-center mt-10">
                <img
                    src="/img_1.png"
                    alt="Restaurant Illustration"
                    className="w-64 h-64 object-contain mb-6"
                />
                <h2 className="text-2xl font-bold text-gray-900 text-center font-['Poppins']">
                    Gọi món dễ dàng <br/> thưởng thức tại bàn
                </h2>

                <p className="text-center text-gray-500 text-base font-medium font-['Poppins'] leading-relaxed mt-3 px-4">
                    Xem menu, chọn món bạn yêu thích <br/> và đặt ngay trên điện thoại.<br/>
                    Nhà hàng sẽ phục vụ tận bàn cho bạn <br/> nhanh chóng và tiện lợi.
                </p>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"/>
                <span className="w-2.5 h-2.5 bg-rose-200 rounded-full"/>
                <span className="w-2.5 h-2.5 bg-rose-200 rounded-full"/>
            </div>

            <div className="flex flex-col items-center gap-5 mb-8 w-full">
                <button
                    onClick={onNext}
                    className="w-11/12 h-14 bg-amber-400 rounded-xl flex items-center justify-center shadow-md hover:bg-amber-500 transition-all duration-200"
                >
                  <span className="text-white text-lg font-semibold font-['Poppins']">
                    KẾ TIẾP
                  </span>
                </button>

                <button
                    onClick={onSkip}
                    disabled={isLoading}
                    className={`... ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? 'Đang tải...' : 'Bỏ qua'}
                </button>
            </div>
        </div>
    );
};
