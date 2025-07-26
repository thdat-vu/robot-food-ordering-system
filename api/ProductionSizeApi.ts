import {BaseEntity} from "@/entites/BaseEntity";
import {ProductionSize} from "@/entites/respont/ProductionSize";
import api from "@/api/api";
import {API_PROCDUCTION_SIZE} from "@/api-endpoint-env";

export const GetProductionSire =async (id:string):Promise<BaseEntity<ProductionSize[]>> => {
    try {
        const res = await api.get(`${API_PROCDUCTION_SIZE}/${id}`)
        return res.data
    }catch (e) {
        throw e;
    }
}



