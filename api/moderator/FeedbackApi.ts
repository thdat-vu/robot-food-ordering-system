import {BaseEntityData} from "@/entites/BaseEntity";
import {FeedbackgGetTableId, TableData} from "@/entites/moderator/FeedbackModole";
import api from "@/api/api";
import {API_FEEDBACK} from "@/api-endpoint-env";

import { Order } from "@/types/kitchen";
import { ordersApi } from "@/lib/api/orders";


export const GetFeedbackByIdtable = async (id: string): Promise<BaseEntityData<FeedbackgGetTableId[]>> => {
    try {
        const res = await api.get(`${API_FEEDBACK}/${id}`)
        return res.data;
    } catch (err) {
        throw err;
    }
}
export const getOrdersByTableId = async (id: string): Promise<any> => {
    try {
        const res = await ordersApi.getOrdersByTableIdOnly(id);
       
    } catch (err) {
        throw err;
    }
}



export const GetAllFeedbackHome = async (): Promise<BaseEntityData<Record<string, TableData[]>>
> => {
    try {
        const res = await api.get(`${API_FEEDBACK}`);
        return res.data;
    } catch (e) {
        throw e;
    }
}

export const CheckSS = async (id: string, idfb: string[]): Promise<any> => {
    try {
        const params = new URLSearchParams();
        idfb.forEach(idf => params.append('idFeedback', idf));
        params.append('isPeeding', 'false');
        console.log(params);

        const res = await api.put(`${API_FEEDBACK}/${id}?${params.toString()}`);
        console.log(res);
        return res.data;
    } catch (err) {
        throw err;
    }
};
