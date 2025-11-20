import {Table} from "@/entites/respont/Table";
import api from "@/api/api";
import {API_TABLE} from "@/api-endpoint-env";
import {BaseEntityResponse_v2} from "@/entites/BaseEntity";

export type ErroTable = {
    message: string;
    status: boolean;
}

export const GetTableForID = async (id: string, key: string): Promise<Table | ErroTable> => {
    const res = await api.get(`${API_TABLE}/${id}/scanQrCode/${key}`)
    return res.data.data;
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

export const CheckoutTable = async (idTable: string): Promise<any> => {
    const res = await api.patch(`${API_TABLE}/${idTable}/Checkout`, {})
    return res.data;
}

export interface checkTable {
    isMatch: boolean;
}

export const CheckTable = async (idTable: string, token: string): Promise<BaseEntityResponse_v2<checkTable>> => {
    const res = await api.get(`${API_TABLE}/${idTable}/checkDeviceToken/${token}`);
    return res.data;
}