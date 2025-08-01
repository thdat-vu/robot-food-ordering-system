import {BottomModal} from "@/components/common/BottomModal";
import React, {useState} from "react";
import Button from "@/components/common/Button";
import {useCreateFeedback} from "@/hooks/customHooks/useFeedbackHooks";

type CallStaffProps = {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}
export const CallStaff: React.FC<CallStaffProps> = ({id, isOpen, onClose, onSave}) => {
    const [Feedback, setFeedback] = useState<string>();

    const {
        run
    } = useCreateFeedback();


    const handle = () => {
        (async () => {
            if (Feedback)
                await run(id, Feedback);
        })()
    }

    return (
        <BottomModal
            id={id}
            title="Call Staff"
            isOpen={isOpen}
            onClose={onClose}
            onSave={onSave}
        >
            <div className="space-y-4">
                <div className="text-center mb-6">
                    <div
                        className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900/20">
                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                             viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        Gọi phục vụ
                    </h4>
                    <p className="text-gray-800">
                        Bạn muốn yêu cầu nhân viên làm gì ?
                    </p>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="ml-2 block text-sm font-medium text-gray-800 mb-2">
                            Ghi chú
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập Thông Tin"
                            onChange={event => setFeedback(event.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-center items-center">
                    <Button content=" Gửi yêu cầu "
                            handle={handle}
                            className="rounded-3xl bg-yellow-700 px-8 py-4 text-lg w-80 sm:w-96 duration-300 ease-in-out
                            transform hover:scale-105 active:scale-110"/>
                </div>
            </div>
        </BottomModal>
    );
};