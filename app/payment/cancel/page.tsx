'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function PaymentCancelPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const reason = searchParams.get('reason')

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-red-300 bg-red-50 p-6 text-center">
        <h1 className="text-2xl font-semibold text-red-700">Thanh toán thất bại / bị hủy</h1>
        <p className="mt-2 text-sm text-red-800">Vui lòng thử lại hoặc chọn phương thức khác.</p>

        {(orderId || reason) && (
          <div className="mt-4 text-left text-sm text-red-900">
            {orderId && <p><span className="font-medium">Order Id:</span> {orderId}</p>}
            {reason && <p><span className="font-medium">Lý do:</span> {reason}</p>}
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/" className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">
            Về trang chủ
          </Link>
          <Link href="/cart" className="inline-flex items-center rounded-md border border-red-400 px-4 py-2 text-red-700 hover:bg-red-100">
            Thử thanh toán lại
          </Link>
        </div>
      </div>
    </main>
  )
}


