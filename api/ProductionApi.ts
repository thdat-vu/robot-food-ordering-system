import {GetAllProductionRequest} from "@/entites/request/ProductionRequest";
import {PaginatedList} from "@/entites/PaginatedList";
import {Production, ProductionDetail} from "@/entites/respont/Production";
import api from "@/api/api";
import {API_PRODUCT} from "@/api-endpoint-env";
import {BaseEntity, BaseEntityData} from "@/entites/BaseEntity";

export const GetAllProduction = async ({
                                    PageSize,
                                    PageNumber,
                                    CategoryName
                                }: GetAllProductionRequest): Promise<PaginatedList<Production[]>> => {
    try {
        const res = await api.get(API_PRODUCT, {
            params: {
                PageSize,
                PageNumber,
                CategoryName
            }
        })
        return res.data;
    } catch (e) {
        throw e;
    }
}


export const GetProductionID = async (id:string):Promise<BaseEntityData<ProductionDetail>> => {
    try {
        const res = await api.get(`${API_PRODUCT}/${id}`)
        return res.data;
    }catch (e) {
        throw e;
    }
}

