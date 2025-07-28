import {useApiHandler} from "@/hooks/useApiHandler";
import {createOrderApi, GetOrderByIdAndTaibleId} from "@/api/OrderApi";

export const useCreateOreder = () => {
   return useApiHandler(createOrderApi)
}

export const useGetOrderByIdAndTaibleId = () => {
   return useApiHandler(GetOrderByIdAndTaibleId)
}