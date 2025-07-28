import {useApiHandler} from "@/hooks/useApiHandler";
import {createOrderApi, CreatePayment, GetOrderByIdAndTaibleId} from "@/api/OrderApi";

export const useCreateOreder = () => {
   return useApiHandler(createOrderApi)
}

export const useGetOrderByIdAndTaibleId = () => {
   return useApiHandler(GetOrderByIdAndTaibleId)
}

export const useCreatePayment = () => {
  return useApiHandler(CreatePayment)
}