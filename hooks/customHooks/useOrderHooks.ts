import {useApiHandler} from "@/hooks/useApiHandler";
import {createOrderApi} from "@/api/OrderApi";

export const useCreateOreder = () => {
   return useApiHandler(createOrderApi)
}