import apiClient from "@/lib/axios";
import axios from "axios";

export interface Product {
    id: string;
    productName: string;
    imageUrl: string;
    durationTime: number;
  }
  
  export interface ProductDetails  {
    id: string;
    name: string;
    price: number;
    description: string;
    urlImg: string | null;
    sizes: Size[];
  };
  export interface ProductDto {
    id: string;
    name: string;
    price: number;
    
    durationTime: number;
  }
  
 export interface Size {
    id: string;
    sizeName: string;
    price: number;
  }
  
  export interface Topping {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  }
  
  export interface GetProductToppingsData {
    productId: string;
    productName: string;
    toppings: Topping[];
  }
 export interface CartItem {
    id: number;
    product: ProductDetails;
    size: Size;
    toppings: Topping[];
    quantity: number;
    price: number;
    note: string;
  }
  
export  interface OrderData {
    tableId: string;
    customerName: string;
    tableNumber: string;
    items: CartItem[];
    total: number;
    timestamp: string;
  }
  
  interface OrderResult {
    success: boolean;
    orderId: number;
  }
  export interface ApiBaseResponse<T> {
    statusCode: number;
    code: string;
    message?: string | null;
    additionalData?: any;
    data: T;
  }
  export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }
  // ===== UI (dùng trong component/state/cart) =====
export interface ProductUI {
  id: string;
  productName: string;
  imageUrl: string;
  durationTime: number;
}

export interface SizeUI {
  id: string;
  sizeName: string;
  price: number;
}

export interface ProductDetailsUI extends ProductUI {
  description: string;
  price: number;
  sizes: SizeUI[];
}

export interface ToppingUI {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
}

// ===== DTO (Backend trả về) =====
export interface ProductListDTO {
  id: string;
  productName: string;
  imageUrl: string;
  durationTime: number;
}

export interface SizeDTO {
  id: string;
  sizeName: string;
  price: number;
  productId?: string;
}

export interface ProductDetailsDTO {
  id: string;
  name: string;
  urlImg: string;
  description: string;
  price: number;
  sizes: SizeDTO[];
}

export interface GetProductToppingsDTO {
  productId: string;
  productName: string;
  toppings: Array<{
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  }>;
}



  export const ModeratorOrderApi = {
    async getProducts() {  
      const res = await apiClient.get<PaginatedResponse<Product>>("/Product");
      return res.data;
      
    },
  
    async getProductById(productId: string) {
      const res = await apiClient.get<ApiBaseResponse<ProductDetails>>(
        `/Product/${productId}`
      );
      return res.data;
    },
    async getProductsToppings(productId: string): Promise<Topping[] | null> {
      const res = await apiClient.get<ApiBaseResponse<GetProductToppingsData>>(
        `/Product/${productId}/toppings`,
        { validateStatus: (s) => s === 200 || s === 404 }
      );
    
      if (res.status === 404) return null;
      return res.data.data?.toppings ?? [];
    }
    
    
  };