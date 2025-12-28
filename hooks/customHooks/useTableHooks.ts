import {useApiHandler} from "@/hooks/useApiHandler";
import {AcceptShareTable, AddPoind, CheckoutTable, CheckTable, GetTableForID, ShareTable} from "@/api/TableApi";

export const useGetTable = () => {
    return useApiHandler(GetTableForID);
}

export const useShareTable = () => {
    return useApiHandler(ShareTable);
}

export const useAcceptShareTable = () => {
    return useApiHandler(AcceptShareTable);
}


export const useCheckoutTable = () => {
    return useApiHandler(CheckoutTable);
}

export const useCheckTable = () => {
    return useApiHandler(CheckTable);
}

export const useAddPoind = () => {
    return useApiHandler(AddPoind);
}