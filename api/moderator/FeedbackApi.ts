import {BaseEntityData} from "@/entites/BaseEntity";
import {FeedbackgGetTableId, TableData} from "@/entites/moderator/FeedbackModole";
import api from "@/api/api";
import {API_FEEDBACK} from "@/api-endpoint-env";

export const GetFeedbackByIdtable = async (id: string): Promise<BaseEntityData<FeedbackgGetTableId[]>> => {
    try {
        const res = await api.get(`${API_FEEDBACK}/${id}`)
        // 👇 Nếu res.data bị null hoặc không phải mảng
        console.log("==================== res  compalain ================ : ", res);
        if (!res.data || !Array.isArray(res.data.data)) {
            console.warn(`[GetFeedbackByIdtable] API trả về null hoặc sai định dạng.`);
            return {data: [], message: 'Không có dữ liệu phản hồi.'} as any;
        }
        return res.data;
    } catch (error: any) {
        const statusCode = error?.response?.status ?? 500;
        const backendMsg =
            error?.response?.data?.errorMessage ||
            error?.response?.data?.message ||
            'Không thể tải dữ liệu feedback.';
        return {data: [], message: backendMsg} as any;
    }
};


export const GetAllFeedbackHome = async (): Promise<BaseEntityData<Record<string, TableData[]>>
> => {
    try {
        const res = await api.get(`${API_FEEDBACK}`);
        console.log(res)
        return res.data;
    } catch (e) {
        throw e;
    }
}

export const CheckSS = async (id: string, idfb: string[], content: string, isPeeding: boolean = false): Promise<any> => {
    try {
        const params = new URLSearchParams();
        idfb.forEach(idf => params.append('idFeedback', idf));
        params.append('isPeeding', String(isPeeding));
        params.append('content', content);

        const res = await api.put(`${API_FEEDBACK}/${id}?${params.toString()}`);

        console.log(res);
        return res.data;
    } catch (err) {
        throw err;
    }
};

export const CreateComplain = async (payload: { TableId: string; Title: string; ComplainNote: string; OrderItemIds?: string[] }) => {
    try {
        const res = await api.post(`${API_FEEDBACK}`, payload);
        return res.data;
    } catch (err) {
        throw err;
    }
}
