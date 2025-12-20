import { jwtDecode } from 'jwt-decode';
import apiClient from '../axios';
export const authsApi = {
    // Login API
    async SignIn(username: string, password: string) {
        try {
            const response = await apiClient.post("/Auths/sign-in", {
              username,
              password
            });
      
           const data = response.data?.data;
      
            // Save tokens locally
            if (data?.accessToken) {
              localStorage.setItem("accessToken", data.accessToken);
              localStorage.setItem("refreshToken", data.refreshToken);
              localStorage.setItem("refreshTokenExpired", data.refreshTokenExpired);
            }
      
            return {
              success: true,
              data: data,
              message: "User signed in successfully",
              statusCode: 200,
            };
          } catch (error: any) {
            return {
              success: false,
              data: null,
              message: error.response?.data?.message || "Failed to sign in",
              statusCode: error.response?.status || 500,
            };
          }
        },
      
    
    
    // Logout API
    async logout() {
        const response = await apiClient.post('/Auth/logout');
        return response.data;
    },
    async getAllUsers(params?: { PageNumber?: number; PageSize?: number }) {
      const response = await apiClient.get("Auths/users", { params });
      return response.data; // ✅ trả full: {items, pageNumber, totalPages,...}
    }
};