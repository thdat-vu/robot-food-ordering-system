import {useApiHandler} from "@/hooks/useApiHandler";
import {CheckSS, GetAllFeedbackHome, GetFeedbackByIdtable} from "@/api/moderator/FeedbackApi";

export const useGetFeedbackByIdtable = () => {
    return useApiHandler(GetFeedbackByIdtable);
}


export const useGetAllFeedbackHome = () => {
    return useApiHandler(GetAllFeedbackHome);
}

export const useCheckSS = () => {
    return useApiHandler(CheckSS);
}