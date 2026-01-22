import { BaseEntity, BaseEntityDataError } from "@/entites/BaseEntity";
import api from "@/api/api";
import { API_ADMIN, API_CATEGORY, API_DASHBOARD, API_PRODUCTION, API_TABLE_V2, API_TOPPING } from "@/api-endpoint-env";

export const PostFileExcel = async (
    file: File
): Promise<BaseEntityDataError<boolean>> => {

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await api.post(`${API_ADMIN}/import-excel`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return res.data;
    } catch (error: any) {
        return {
            codes: error?.response?.status?.toString() ?? '500',
            message: error?.response?.data?.message ?? "Upload thất bại",
            data: false,
        };
    }
};

export const PostFileExcelTopping = async (
    id: string,
    file: File
): Promise<BaseEntityDataError<boolean>> => {

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await api.post(`${API_ADMIN}/import-excel-topping/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return res.data;
    } catch (error: any) {
        return {
            codes: error?.response?.status?.toString() ?? '500',
            message: error?.response?.data?.message ?? "Upload thất bại",
            data: false,
        };
    }
};

export const PostFileExcelTable = async (
    file: File
): Promise<BaseEntityDataError<boolean>> => {

    const formData = new FormData();
    formData.append("file", file);

    try {
        console.log("POST /api/Admin/import-excel-table - Sending request...");
        const res = await api.post(`${API_ADMIN}/import-excel-table`, formData);
        console.log("POST /api/Admin/import-excel-table - Response received:", res.data);
        console.log(res.data);

        return res.data;
    } catch (error: any) {
        console.error("POST /api/Admin/import-excel-table - Error:", error?.response?.data || error.message);
        return {
            codes: error?.response?.status?.toString() ?? '500',
            message: error?.response?.data?.message ?? "Upload thất bại",
            data: false,
        };
    }
};

export const GetExportExcel = async (): Promise<BaseEntityDataError<boolean>> => {
    try {
        const res = await api.get(`${API_ADMIN}/export-excel`, {
            responseType: "blob",
        });

        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `DanhSachMon_${new Date().getTime()}.xlsx`;
        link.click();

        window.URL.revokeObjectURL(url);
        return {
            codes: "200",
            message: "Export thành công",
            data: true
        };

    } catch (error: any) {
        console.error("Export Excel lỗi:", error);
        return {
            codes: error?.response?.status?.toString() ?? '500',
            message: error?.response?.data?.message ?? "Export thất bại",
            data: false,
        };
    }
};

export const GetExportExcelTable = async (): Promise<BaseEntityDataError<boolean>> => {
    try {
        const res = await api.get(`${API_ADMIN}/export-excel-table`, {
            responseType: "blob",
        });

        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `DanhSachBan_${new Date().getTime()}.xlsx`;
        link.click();

        window.URL.revokeObjectURL(url);
        return {
            codes: "200",
            message: "Export thành công",
            data: true
        };

    } catch (error: any) {
        console.error("Export Excel Table lỗi:", error);
        return {
            codes: error?.response?.status?.toString() ?? '500',
            message: error?.response?.data?.message ?? "Export thất bại",
            data: false,
        };
    }
};

export interface Category {
    id: string;
    name: string;
}

export const CategoryApi = async (): Promise<BaseEntity<Category[]>> => {
    const res = await api.get(`${API_CATEGORY}`, {
        params: {
            PageNumber: 1,
            PageSize: 100
        }
    })
    return res.data;
}


export interface Production {
    id: string;
    productName: string;
    durationTime: number;
    imageUrl: string;
}

export const DishsApi = async (CategoryName: string, Search: string | undefined): Promise<BaseEntity<Production[]>> => {
    const res = await api.get(`${API_PRODUCTION}`, {
        params: {
            CategoryName,
            Search
        }
    })
    return res.data;
}

export interface ProductionDetail {
    id: string;
    name: string;
    urlImg: string;
    description: string;
    sizes: size[];
}

export interface size {
    id: string;
    sizeName: string;
    price: string;
    productId: string;
}

export const ProductionDetailApi = async (id: string): Promise<BaseEntityDataError<ProductionDetail>> => {
    const res = await api.get(`${API_PRODUCTION}/${id}`)
    return res.data;
}

export interface Topping {
    id: string,
    name: string,
    price: number;
    imageUrl: string;
}

export interface ProductToppingList {
    productId: string,
    productName: string,
    toppings: Topping[],
}

export const ProductToppingApi = async (id: string): Promise<BaseEntityDataError<ProductToppingList>> => {
    const res = await api.get(`${API_PRODUCTION}/${id}/toppings`)
    return res.data;
}

export const DeleteTopping = async (id: string): Promise<any> => {

    const res = await api.delete(`${API_TOPPING}/${id}`)
    return res.data;
}

export const DeleteProduct = async (id: string): Promise<any> => {
    const res = await api.delete(`${API_TOPPING}/${id}`)
}


export interface Table {
    id: string;
    name: string;
    status: string;
}

export const GetTableApi = async (): Promise<BaseEntity<Table[]>> => {
    const res = await api.get(`${API_TABLE_V2}?PageSize=100`)
    return res.data;
}



export const DeleteTable = async (id: string): Promise<BaseEntityDataError<any>> => {
    const res = await api.delete(`${API_TABLE_V2}/${id}`)
    return res.data;
}


export interface topMostOrderedProducts {
    totalUsers: number;
    totalProducts: number;
    mostOrderedProduct: topMostOrderedProduct;
    leastOrderedProduct: topMostOrderedProduct;
    totalCancelledItems: number;
    totalComplains: number;
    totalComplainsPending: number;
    totalComplainsHandled: number;
    totalRemakeItems: number;
    totalOrderItems: number;
    top5MostOrderedProducts: topMostOrderedProducts[];
}

export interface topMostOrderedProduct {
    productId: string;
    productName: string;
    orderCount: number;
}export const DashboadApi = async (Year?: string, Month?: string, Day?: string): Promise<BaseEntityDataError<topMostOrderedProducts>> => {
    const res = await api.get(`${API_DASHBOARD}`, {
        params: {
            Year,
            Month,
            Day
        }
    })
    return res.data;
}