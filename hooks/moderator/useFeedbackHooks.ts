import {useApiHandler} from "@/hooks/useApiHandler";
import {CheckSS, GetAllFeedbackHome, GetFeedbackByIdtable   } from "@/api/moderator/FeedbackApi";
import { ordersApi } from "@/lib/api/orders";

 export const useGetFeedbackByIdtable = () => {
    return useApiHandler(GetFeedbackByIdtable);
}
export const UseGetOrderbytable = () => {
    return useApiHandler(ordersApi.getOrdersByTableIdOnly);
}
export const useGetAllFeedbackHome = () => {
    return useApiHandler(GetAllFeedbackHome);
}

export const useCheckSS = () => {
    return useApiHandler(CheckSS);
}