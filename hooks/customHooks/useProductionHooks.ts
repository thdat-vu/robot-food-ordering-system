import {useApiHandler} from "@/hooks/useApiHandler";
import {GetAllProduction, GetProductionID} from "@/api/ProductionApi";

export const useGetAllProduction = () => {
    return useApiHandler(GetAllProduction)
}

export const useGetProductionID = () => {
    return useApiHandler(GetProductionID)
}