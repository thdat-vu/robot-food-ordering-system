import {API_PAYMENT} from "@/api-endpoint-env";
import api from "@/api/api";

export const Payment = async (orderId: string): Promise<any> => {
    try {
        const res = await api.post(`${API_PAYMENT}/create-link/${orderId}`, {}, {
            params: {
                isCustomer: false
            }
        });
        return res.data;
    } catch (err) {
        console.log(err);
    }
}
