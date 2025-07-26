import {GetAllCategory} from "@/api/CategogyApi";
import {useApiHandler} from "@/hooks/useApiHandler";

export const useGetAllCategory = () => {
   return useApiHandler(GetAllCategory)
}


