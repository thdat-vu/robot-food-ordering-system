import apiClient from '../axios';

export interface PaymentCreateRequest {
  moneyUnit?: string;
  orderId?: string;
  paymentContent?: string;
}

export interface PaymentUrlResponse {
  orderId: string;
  paymentStatus: string;
  paymentUrl?: string;
  message?: string;
}

export interface ApiBaseResponse<T> {
  statusCode: number;
  code: string;
  data: T;
  message?: string;
}

export const paymentsApi = {
  async createVNPayUrl(orderId: string, payload?: PaymentCreateRequest) {
    const body: PaymentCreateRequest = {
      moneyUnit: payload?.moneyUnit ?? 'VND',
      orderId,
      paymentContent:
        payload?.paymentContent ?? `Thanh toan don ${orderId}`,
    };

    const response = await apiClient.post<ApiBaseResponse<PaymentUrlResponse>>(
      `/Payment/create-url/${orderId}`,
      body
    );
    return response.data;
  },
};


