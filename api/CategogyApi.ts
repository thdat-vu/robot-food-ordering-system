import {PaginatedList} from "@/entites/PaginatedList";
import {Catagory} from "@/entites/respont/Catagory";
import api from "@/api/api";
import {API_CATEGORY} from "@/api-endpoint-env";

export const GetAllCategory = async (): Promise<PaginatedList<Catagory[]>> => {
    try {
        const res = await api.get(`${API_CATEGORY}`);
        return res.data;
    } catch (error) {
        throw error;
    }
}


