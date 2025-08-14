import {OrderRequest} from "@/entites/request/OrderRequest";
import {BaseEntityData} from "@/entites/BaseEntity";
import api from "@/api/api";
import {API_ORDERING} from "@/api-endpoint-env";
import {OrderRespont, OrderRespontGetByID} from "@/entites/respont/OrderRespont";
import {PaymentRequest} from "@/entites/request/PaymentRequest";
import {PaymentRespont} from "@/entites/respont/Payment";

export const createOrderApi = async (orderRequest: OrderRequest):
    Promise<BaseEntityData<OrderRespont>> => {

    console.log(orderRequest);
    try {
        const res = await api.post(`${API_ORDERING}/handle`, orderRequest);
        return res.data;
    } catch (e) {
        throw e;
    }
}

export const GetOrderByIdAndTaibleId = async (id: string, idTable: string): Promise<BaseEntityData<OrderRespontGetByID>> => {
    try {
        const res = await api.get(`${API_ORDERING}/${id}/table/${idTable}`);
        console.log(res)
        return res.data;
    } catch (e) {
        throw e;
    }
}


export const CreatePayment = async (id: string, paymentMethor: PaymentRequest): Promise<BaseEntityData<PaymentRespont>> => {
    try {
        console.log(paymentMethor);
        console.log(id);

        const res = await api.post(`${API_ORDERING}/${id}/pay`, paymentMethor);
        console.log(res);
        return res.data;
    } catch (e) {
        throw e;
    }
}

export const GetOrderWithIdTableAndToken = async (idTable: string, token: string): Promise<BaseEntityData<OrderRespontGetByID>> => {
    try {
        const res = await api.get(`${API_ORDERING}/get-table-token/${idTable}/${token}`);
        console.log(res);
        return res.data;
    } catch (e) {
        throw e;
    }
}