import api from "@/api/api";
import {API_FEEDBACK} from "@/api-endpoint-env";
import {BaseEntityData} from "@/entites/BaseEntity";
import {Feedback} from "@/entites/respont/Feedback";

export const CreateFeedback = async (id: string, feedback: string): Promise<BaseEntityData<Feedback>> => {
    try {
        const res = await api.post(`${API_FEEDBACK}/${id}?feedback=${feedback}`)
        return res.data
    } catch (err) {
        throw err;
    }
}