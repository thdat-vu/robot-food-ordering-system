import {Payment} from "@/api/payment";
import {useApiHandler} from "@/hooks/useApiHandler";

export const usePayment = () => {
    return useApiHandler(Payment);
}