import {ProductionSize} from "@/entites/respont/ProductionSize";

export interface Production {
    id: string,
    productName: string,
    imageUrl: string
}

export interface ProductionDetail {
    id: string,
    name: string,
    urlImg: string;
    price: number;
    description: string;
    sizes: ProductionSize[]
}

export type Status = "GIAOXONG" | "ĐANGGIAO" | "LAMXONG" | "ĐANGLAM" | "CHO" | null