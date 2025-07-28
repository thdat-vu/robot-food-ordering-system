import {OrderRequest} from "@/entites/request/OrderRequest";
import {BaseEntityData} from "@/entites/BaseEntity";
import api from "@/api/api";
import {API_ORDERING} from "@/api-endpoint-env";
import {OrderRespont, OrderRespontGetByID} from "@/entites/respont/OrderRespont";
import {PaymentRequest} from "@/entites/request/PaymentRequest";
import { PaymentRespont} from "@/entites/respont/Payment";

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
        return res.data;
    } catch (e) {
        throw e;
    }
}


export const CreatePayment = async (id: string, paymentMethor: PaymentRequest): Promise<BaseEntityData<PaymentRespont>> => {
    try {
        const res = await api.post(`${API_ORDERING}/${id}/pay`, paymentMethor);
        console.log(res);
        return res.data;
    } catch (e) {
        throw e;
    }
}