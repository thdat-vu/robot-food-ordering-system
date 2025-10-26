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
           console.log("Sign-in response1:", response.data.data.accessToken);
      
           const data = response.data?.data;
           console.log("✅ accessToken:", data?.accessToken);
           
      
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
            console.error("Sign-in error:", error);
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
};