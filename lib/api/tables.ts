import apiClient from '../axios';
import { ApiPaginatedResponse, ApiBaseResponse } from './orders';

export interface ApiTableResponse {
  id: string;
  name: string;
  status: string;
  capacity: number;
}

// API service functions for tables
export const tablesApi = {
  // Get all tables
  async getTables(page: number = 1, pageSize: number = 50) {
    const response = await apiClient.get<ApiPaginatedResponse<ApiTableResponse>>('/Table', {
      params: { page, pageSize }
    });
    return {
      success: true,
      data: response.data.items,
      message: 'Tables retrieved successfully',
      statusCode: 200
    };
  },

  // Get table by ID
  async getTableById(tableId: string) {
    const response = await apiClient.get<ApiBaseResponse<ApiTableResponse>>(`/Table/${tableId}`);
    console.log('Raw table response:', response);
    console.log('Table response data:', response.data);
    return response.data;
  }
}; 