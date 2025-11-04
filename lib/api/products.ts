import apiClient from "../axios";

export interface ProductDetailResponse {
  id: string;
  name: string;
  sizes: Array<{ id: string; sizeName: string; price: number }>; // minimal
}

export interface ApiBaseResponse<T> {
  statusCode: number;
  code: string;
  data: T;
  message?: string;
}

export const productsApi = {
  async getProductById(productId: string) {
    const res = await apiClient.get<ApiBaseResponse<ProductDetailResponse>>(
      `/Product/${productId}`
    );
    return res.data;
  },
};


