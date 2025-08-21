import api from "@/api/api";
import {API_FEEDBACK} from "@/api-endpoint-env";
import {BaseEntityData} from "@/entites/BaseEntity";
import {Feedback} from "@/entites/respont/Feedback";
import {FeedbackRequest} from "@/entites/request/FeedbackRequest";

export const CreateFeedback = async (feedback: FeedbackRequest): Promise<BaseEntityData<Feedback>> => {
    try {
        const res = await api.post(`${API_FEEDBACK}`, feedback);
        return res.data
    } catch (err) {
        throw err;
    }
}