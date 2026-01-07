import {Table} from "@/entites/respont/Table";
import api from "@/api/api";
import {API_ADD_POIND, API_TABLE} from "@/api-endpoint-env";
import {BaseEntityResponse_v2} from "@/entites/BaseEntity";
import {AxiosError} from "axios";

export type ErroTable = {
    message: string;
    status: boolean;
}

export type Erro = {
    errorCode: string;
    errorMessage: string;
    statusCode: string;
}

export type Additional = {
    redirectTableId: string;
    redirectUrl: string;
}

export type AdditionalData = {
    additionalData: Additional;
}

export const GetTableForID = async (id: string, key: string): Promise<Table | ErroTable | Erro> => {
    try {
        const res = await api.get(`${API_TABLE}/${id}/scanQrCode/${key}`)
        return res.data.data;
    } catch (error) {
        console.log(error);
        const err = error as AxiosError<Erro>;
        return err.response?.data as Erro;
    }

}

export const ShareTable = async (
    tableId: string,
    currentDeviceId?: string
): Promise<BaseEntityResponse_v2<{
    qrCodeBase64: string;
    shareToken: string;
    shareUrl: string;
    expireAt: string;
}>> => {
    const res = await api.post(
        `${API_TABLE}/${tableId}/share`,
        {},
        {
            params: {
                currentDeviceId,
            },
        }
    );
    return res.data;
};

export const AcceptShareTable = async (
    tableId: string,
    shareToken: string,
    newDeviceId: string
): Promise<
    BaseEntityResponse_v2<{
        id: string;
        name: string;
        status: string;
        isQrLocked: boolean;
        isShared: boolean;
        lockedAt: string;
        qrCode: string;
    }>
> => {
    const res = await api.post(
        `${API_TABLE}/${tableId}/accept-share`,
        {},
        {
            params: {
                shareToken,
                newDeviceId,
            },
        }
    );
    return res.data;
};

export interface CheckoutSuccessResponse {
    id: string;
    tableSessionId: string | null;
    name: string;
    status: string;
    isQrLocked: boolean;
    isShared: boolean;
    lockedAt: string | null;
    qrCode: string | null;
}

export interface CheckoutErrorResponse {
    statusCode: number;     // 400
    errorCode: string;      // "INVALID_OPERATION"
    errorMessage: string;   // "Không thể checkout khi order ..."
}

export const CheckoutTable = async (
    idTable: string
): Promise<any> => {
    try {
        const res = await api.patch(`${API_TABLE}/${idTable}/Checkout`, {});
        return res.data;
    } catch (err: any) {
        if (err.response?.data) {
            return err.response.data as CheckoutErrorResponse;
        }

        return {
            statusCode: 500,
            errorCode: "NETWORK_ERROR",
            errorMessage: "Không thể kết nối máy chủ"
        };
    }
};


export interface checkTable {
    isMatch: boolean;
}

export const CheckTable = async (idTable: string, token: string): Promise<BaseEntityResponse_v2<checkTable>> => {
    const res = await api.get(`${API_TABLE}/${idTable}/checkDeviceToken/${token}`);
    return res.data;
}

export const AddPoind = async (tableId: string, deviceId: string, phoneNumber: string, name: string): Promise<BaseEntityResponse_v2<any>> => {
    const res = await api.post(`${API_ADD_POIND}/${tableId}/customer?deviceId=${deviceId}`, {
        phoneNumber,
        name
    });
    return res.data;
}