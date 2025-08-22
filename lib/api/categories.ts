import apiClient from '../axios';
import { ApiPaginatedResponse, ApiBaseResponse } from './orders';

export interface ApiCategoryResponse {
  id: string;
  name: string;
}

export interface ApiProductCategoryResponse {
  productId: string;
  productName: string;
  description: string;
  urlImg: string;
  categoryId: string;
  categoryName: string;
}

// API service functions for categories
export const categoriesApi = {
  // Get all categories
  async getCategories(page: number = 1, pageSize: number = 50) {
    const response = await apiClient.get<ApiPaginatedResponse<ApiCategoryResponse>>('/Category', {
      params: { page, pageSize }
    });
    return {
      success: true,
      data: response.data.items,
      message: 'Categories retrieved successfully',
      statusCode: 200
    };
  },

  // Get product categories (products with their category information)
  async getProductCategories(page: number = 1, pageSize: number = 100) {
    const response = await apiClient.get<ApiPaginatedResponse<ApiProductCategoryResponse>>('/ProductCategory', {
      params: { page, pageSize }
    });
    return {
      success: true,
      data: response.data.items,
      message: 'Product categories retrieved successfully',
      statusCode: 200
    };
  }
}; 