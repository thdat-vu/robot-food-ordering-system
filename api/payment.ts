import api from "@/api/api";
import {API_PAYMENT} from "@/api-endpoint-env";


export const Payment = async (orderId: string): Promise<any> => {
    try {
        const res = await api.post(`${API_PAYMENT}/create-link/${orderId}`, {}, {
            params: {
                isCustomer: true
            }
        });
        return res.data;
    } catch (err) {
        console.log(err);
    }
}
