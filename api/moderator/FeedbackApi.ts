import {BaseEntityData, BaseEntityDataError} from "@/entites/BaseEntity";
import {FeedbackgGetTableId, TableData} from "@/entites/moderator/FeedbackModole";
import api from "@/api/api";
import {API_FEEDBACK} from "@/api-endpoint-env";
import { STATUS_CODES } from "http";

export const GetFeedbackByIdtable = async (
    id: string
  ): Promise<BaseEntityDataError<FeedbackgGetTableId[]>> => {
    try {
      // Có thể giữ log này nếu muốn, hoặc bỏ luôn cho sạch
      if (process.env.NODE_ENV === "development") {
        console.log(`[FeedbackApi] Calling GET ${API_FEEDBACK}/${id}`);
      }
  
      const res = await api.get<BaseEntityDataError<FeedbackgGetTableId[]>>(
        `${API_FEEDBACK}/${id}`
      );
  
      const body = res.data;
  
      // Đảm bảo luôn trả về mảng
      const list = Array.isArray(body?.data) ? body.data : [];
  
     
      // Nếu BE trả sai format hoặc không có data thì vẫn trả mảng rỗng
      return {
        ...body,
        data: list,
        message:
          body?.message ??
          (list.length === 0 ? "Không có dữ liệu phản hồi." : ""),
      };
    } catch (error: any) {
      const statusCode: number | undefined = error?.response?.status;
  
      const backendMsg =
        error?.response?.data?.errorMessage ||
        error?.response?.data?.message ||
        (statusCode === 404
          ? "Không có dữ liệu phản hồi."
          : "Không thể tải dữ liệu feedback.");
  
      // 👇 Không dùng console.error nữa để tránh error đỏ trong console
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[FeedbackApi] (${statusCode ?? "NETWORK"}) for table ${id}:`,
          backendMsg
        );
      }
  
      // Luôn trả về mảng rỗng + message để FE xử lý UI (toast / hiển thị “không có dữ liệu”)
      const fallback: BaseEntityDataError<FeedbackgGetTableId[]> = {
        data: [] as FeedbackgGetTableId[],
        message: backendMsg,
        statusCodes: statusCode ? statusCode.toString() : "NETWORK",
        codes: STATUS_CODES.toString(),
      };
  
      return fallback;
    }
  };
  


export const GetAllFeedbackHome = async (): Promise<BaseEntityData<Record<string, TableData[]>>
> => {
    try {
        const res = await api.get(`${API_FEEDBACK}`);
        
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
