import {PagingRequest} from "@/entites/PagingRequest";

export interface GetAllProductionRequest extends PagingRequest{
    CategoryName:string;
}