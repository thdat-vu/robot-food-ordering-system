import {ChangeTableApi, GetALlTable} from "@/api/moderator/TableApi";
import {useApiHandler} from "@/hooks/useApiHandler";

export const useGetALlTable = () => {
    return useApiHandler(GetALlTable)
}

export const useChangeTableApi = () => {
    return useApiHandler(ChangeTableApi)
}