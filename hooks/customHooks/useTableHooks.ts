import {useApiHandler} from "@/hooks/useApiHandler";
import {GetTableForID} from "@/api/TableApi";

export const useGetTable = () => {
    return useApiHandler(GetTableForID);
}