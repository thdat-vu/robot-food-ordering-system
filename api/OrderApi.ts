import {OrderRequest} from "@/entites/request/OrderRequest";
import {BaseEntityData} from "@/entites/BaseEntity";
import api from "@/api/api";
import {API_ORDERING} from "@/api-endpoint-env";
import {OrderRespont, OrderRespontGetByID} from "@/entites/respont/OrderRespont";

export const createOrderApi = async (orderRequest: OrderRequest):
    Promise<BaseEntityData<OrderRespont>> => {
    try {
        const res = await api.post(`${API_ORDERING}`, orderRequest);
        console.log(res);
        return res.data;
    } catch (e) {
        throw e;
    }
}

export const GetOrderByIdAndTaibleId = async (id: string, idTable: string): Promise<BaseEntityData<OrderRespontGetByID>> => {
    try {
        const res = await api.get(`${API_ORDERING}/${id}/table/${idTable}`);
        // console.log(res.data);
        return res.data;
    } catch (e) {
        throw e;
    }
}