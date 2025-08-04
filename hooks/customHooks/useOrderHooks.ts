import {useApiHandler} from "@/hooks/useApiHandler";
import {createOrderApi, CreatePayment, GetOrderByIdAndTaibleId, GetOrderWithIdTableAndToken} from "@/api/OrderApi";

export const useCreateOreder = () => {
   return useApiHandler(createOrderApi)
}

export const useGetOrderByIdAndTaibleId = () => {
   return useApiHandler(GetOrderByIdAndTaibleId)
}

export const useCreatePayment = () => {
  return useApiHandler(CreatePayment)
}

export const useGetOrderWithIdTableAndToken = () => {
    return useApiHandler(GetOrderWithIdTableAndToken)
}