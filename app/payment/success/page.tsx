'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const orderCode = searchParams.get('orderCode')

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-green-300 bg-green-50 p-6 text-center">
        <h1 className="text-2xl font-semibold text-green-700">Thanh toán thành công</h1>
        <p className="mt-2 text-sm text-green-800">Cảm ơn bạn đã thanh toán qua PayOS.</p>

        {(orderId || orderCode) && (
          <div className="mt-4 text-left text-sm text-green-900">
            {orderId && <p><span className="font-medium">Order Id:</span> {orderId}</p>}
            {orderCode && <p><span className="font-medium">Order Code:</span> {orderCode}</p>}
          </div>
        )}

        <div className="mt-6">
          <Link href="/" className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}


