import api from "@/api/api";
import {API_TABLE_V2} from "@/api-endpoint-env";

export async function fetchTables(params: {
    pageNumber: number;
    pageSize: number;
    searchName?: string;
    status?: string
}): Promise<any> {
    const url = new URL("https://be-robo.zd-dev.xyz/api/Table");
    url.searchParams.append("PageNumber", String(params.pageNumber));
    url.searchParams.append("PageSize", String(params.pageSize));
    if (params.searchName) url.searchParams.append("tableName", params.searchName);
    if (params.status) url.searchParams.append("status", params.status);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch tables");
    return res.json();
}


export interface Response {
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    items: item[];
}

export interface item {
    id: string;
    name: string,
    status: string,
}


export const GetALlTable = async (PageNumber: number, PageSize: number): Promise<Response> => {
    const res = await api.get(`${API_TABLE_V2}`, {
        params: {
            PageNumber,
            PageSize,
            status: 0
        }
    })
    return res.data;
}

/*
{
  "statusCode": 400,
  "errorCode": "Bad request!",
  "errorMessage": "Bàn 4 không có order nào để chuyển"
}
 */

export interface messss {
    data: any;
    statusCode: number;
    message: string;
    code: string;
    additionalData?: any;
}


export const ChangeTableApi = async (
    oldTableId: string,
    newTableId: string,
    reason: string
) => {
    const res = await api.post(
        `${API_TABLE_V2}/${oldTableId}/move`,
        {
            newTableId,
            reason
        }
    );
    return res.data;
};
