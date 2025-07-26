import {BaseEntity, BaseEntityData} from "@/entites/BaseEntity";
import {Topping, ToppingProduct} from "@/entites/respont/Topping";
import api from "@/api/api";
import {API_PROUCTION_TOPPING, API_TOPING} from "@/api-endpoint-env";

export const GetTopingApi = async (id: string): Promise<BaseEntity<Topping[]>> => {
    try {
        const res = await api.get(`${API_PROUCTION_TOPPING}/${id}`);
        return res.data;
    } catch (e) {
        throw e;
    }
}


export const GetToppingProduction = async (id: string): Promise<BaseEntityData<ToppingProduct[]>> => {
    try {
        const res = await api.get(`${API_TOPING}/production/${id}`)
        return res.data;
    } catch (e) {
        throw e;
    }
}