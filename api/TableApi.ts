import {Table} from "@/entites/respont/Table";
import api from "@/api/api";
import {API_TABLE} from "@/api-endpoint-env";

export const GetTableForID = async (id: string): Promise<Table> => {
    try {
        const res = await api.get(`${API_TABLE}/${id}`)
        return res.data;
    } catch (e) {
        throw e;
    }
}