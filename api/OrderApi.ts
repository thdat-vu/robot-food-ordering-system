import {OrderRequest} from "@/entites/request/OrderRequest";
import {BaseEntityData} from "@/entites/BaseEntity";
import api from "@/api/api";
import {API_ORDERING} from "@/api-endpoint-env";

export const createOrderApi = async (orderRequest: OrderRequest): Promise<BaseEntityData<string>> => {
    try {
        const res = await api.post(`${API_ORDERING}`, orderRequest);
        return res.data;
    } catch (e) {
        throw e;
    }
}