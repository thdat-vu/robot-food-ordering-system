import {useApiHandler} from "@/hooks/useApiHandler";
import {GetTopingApi, GetToppingProduction} from "@/api/ToppingApi";

export const useGetTopping = () => {
    return useApiHandler(GetTopingApi)
}

export const useGetToppingForProduct = () => {
  return useApiHandler(GetToppingProduction)
}