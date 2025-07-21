import React from "react";
import {BottomModal} from "@/components/common/BottomModal";
import Button from "@/components/common/Button";
import {RiBankCard2Line} from "react-icons/ri";


type PaymentProps = {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}
export const Payment: React.FC<PaymentProps> = ({id, isOpen, onClose, onSave}) => {
  return (
    <>
      <BottomModal
        id={id}
        title="Đánh  "
        isOpen={isOpen}
        onClose={onClose}
        onSave={onSave}
      >

        <div className="text-lg text-black mb-4">Gói thanh toán</div>
        <p className="text-gray-900 mb-6">Bạn muốn thanh toán bằng</p>

        <div className="space-y-4">
          <label className="flex items-center p-3 bg-gray-100 text-black rounded-lg cursor-pointer hover:bg-gray-200">
            <input type="radio" name="payment" className="mr-3"/>
            <div className="flex items-center">
              <img src="https://img.icons8.com/color/48/000000/money.png" alt="Cash" className="w-6 h-6 mr-2"/>
              <span>Tiền mặt</span>
            </div>
          </label>

          <label className="flex items-center p-3 bg-gray-100 text-black rounded-lg cursor-pointer hover:bg-gray-200">
            <input type="radio" name="payment" className="mr-3 "/>
            <div className="flex items-center">
              <RiBankCard2Line className="w-6 h-6 mr-2"/>
              <span>Thẻ ngân hàng</span>
            </div>
          </label>

          <label className="flex items-center p-3 bg-gray-100 text-black rounded-lg cursor-pointer hover:bg-gray-200">
            <input type="radio" name="payment" className="mr-3"/>
            <div className="flex items-center">
              <img
                src="/momo.png"
                alt="MoMo" className="w-9 h-6 mr-2"/>
              <span>Ứng dụng MoMo</span>
            </div>
          </label>
        </div>

        <Button className="w-full mt-6 bg-yellow-500 text-white py-3 rounded-3xl font-semibold hover:bg-yellow-600"
                content="Gửi yêu cầu"
                handle={() => {
                }}
        />
      </BottomModal>
    </>
  )
}