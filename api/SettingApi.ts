import {BaseEntityResponse_v2} from "@/entites/BaseEntity";
import api from "@/api/api";
import {API_SETTING} from "@/api-endpoint-env";

export const GetSetting = async (): Promise<BaseEntityResponse_v2<number>> => {
    const res = await api.get(`${API_SETTING}/payment-policy`)
    return res.data;
}