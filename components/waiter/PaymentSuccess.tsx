import Link from "next/link"
import type { SVGProps } from "react";

interface PaymentSuccessProps {
  amount?: number;
  orderId?: string;
  payDate?: string;
  message?: string;
  onBack?: () => void;
}

export default function Component({ amount, orderId, payDate, message, onBack }: PaymentSuccessProps) {
  // Format helpers
  const amountText = typeof amount === "number" ? amount.toLocaleString("vi-VN") + "đ" : "--";

  const formattedDate = payDate
    ? `${payDate.substring(6, 8)}/${payDate.substring(4, 6)}/${payDate.substring(0, 4)} ${payDate.substring(8, 10)}:${payDate.substring(10, 12)}:${payDate.substring(12, 14)}`
    : new Date().toLocaleString();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 py-2 border-b">
        <Link href="/waiter" prefetch={false}>
          <MountainIcon className="h-6 w-6" />
          <span className="sr-only">SEB</span>
        </Link>
      </header>
      <main className="flex flex-col items-center justify-center flex-grow text-center p-4 md:p-6">
        <CircleCheckIcon className="h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-semibold">Thanh toán thành công</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{message || "Cảm ơn bạn!"}</p>
        <div className="mt-6 border rounded-lg p-4 w-full max-w-md">
          <div className="flex justify-between text-sm">
            <span>Số tiền:</span>
            <span className="font-medium">{amountText}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span>Thời gian:</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span>Mã đơn hàng:</span>
            <span className="font-medium">{orderId ?? "--"}</span>
          </div>
        </div>
        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Quay về trang phục vụ
        </button>
      </main>
      <footer className="flex items-center justify-center h-14 border-t">
        <p className="text-sm text-gray-500 dark:text-gray-400">&copy; 2025 SEB. All rights reserved.</p>
      </footer>
    </div>
  )
}

function CircleCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}


function MountainIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}