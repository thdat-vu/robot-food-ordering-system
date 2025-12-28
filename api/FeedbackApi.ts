import api from "@/api/api";
import {api_feedback, API_FEEDBACK} from "@/api-endpoint-env";
import {BaseEntityData, BaseEntityResponse_v2} from "@/entites/BaseEntity";
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

export const CreateNewFeedback = async (tableId: string, orderItemId: string, rating: number, comment: string): Promise<BaseEntityData<string>> => {
    console.log({
        tableId,
        orderItemId,
        rating,
        comment,
        type: 0,
    });

    const res = await api.post(`${api_feedback}`, {
        tableId,
        orderItemId,
        rating,
        comment,
        type: 0
    })
    return res.data;
}

export interface Camplanin {
    complainId: string,
    idTable: string,
    feedBack: string,
    isPending: boolean,
    createData: Date,
    dtos: dto[]
    resolutionNote: string,
}

export interface dto {
    orderItemId: string,
    orderItemName: string,
    status: string,
}

export const GetCamplain = async (idTable: string): Promise<BaseEntityResponse_v2<Camplanin[]>> => {
    const res = await api.get(`${API_FEEDBACK}/${idTable}?isCustomer=true`);
    return res.data;
}