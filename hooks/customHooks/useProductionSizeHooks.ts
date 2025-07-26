import {useApiHandler} from "@/hooks/useApiHandler";
import {GetProductionSire} from "@/api/ProductionSizeApi";

export const useGetSizeProduction = () => {
   return useApiHandler(GetProductionSire);
}