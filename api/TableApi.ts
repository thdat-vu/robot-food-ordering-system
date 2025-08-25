import {Table} from "@/entites/respont/Table";
import api from "@/api/api";
import {API_TABLE} from "@/api-endpoint-env";

export type ErroTable = {
    message: string;
    status: boolean;
}

export const GetTableForID = async (id: string, key: string): Promise<Table | ErroTable> => {
    try {
        console.log(key)
        const res = await api.get(`${API_TABLE}/${id}/scanQrCode/${key}`)
        return res.data.data;
    } catch (e) {
        console.log(e)
        const erro: ErroTable = {message: 'Bàn đã có người sử dụng, vui lòng chuyển sang bàn khác', status: false};
        console.log(erro);
        return erro;
    }
}