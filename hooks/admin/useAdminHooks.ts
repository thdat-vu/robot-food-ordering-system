import {
    CategoryApi, DashboadApi, DeleteTable, DeleteTopping,
    DishsApi,
    GetExportExcel, GetExportExcelTable, GetTableApi,
    PostFileExcel, PostFileExcelTable, PostFileExcelTopping,
    ProductionDetailApi,
    ProductToppingApi
} from "@/api/admin/adminApi";
import { useApiHandler } from "@/hooks/useApiHandler";

export const usePostFileExcel = () => {
    return useApiHandler(PostFileExcel)
}

export const usePostFileExcelTable = () => {
    return useApiHandler(PostFileExcelTable)
}

export const useGetExportExcel = () => {
    return useApiHandler(GetExportExcel)
}

export const useGetExportExcelTable = () => {
    return useApiHandler(GetExportExcelTable)
}

export const useCategoryApi = () => {
    return useApiHandler(CategoryApi)
}
export const useDishsApi = () => {
    return useApiHandler(DishsApi)
}

export const useProductionDetailApi = () => {
    return useApiHandler(ProductionDetailApi)
}

export const useProductToppingApi = () => {
    return useApiHandler(ProductToppingApi)
}
export const useDeleteTopping = () => {
    return useApiHandler(DeleteTopping)
}


export const useGetTableApi = () => {
    return useApiHandler(GetTableApi)
}
export const useDeleteTable = () => {
    return useApiHandler(DeleteTable)
}

export const usePostFileExcelTopping = () => {
    return useApiHandler(PostFileExcelTopping)
}
export const useDashboadApi = () => {
    return useApiHandler(DashboadApi)
}