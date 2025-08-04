export interface item {
    note: string | undefined;
    productId: string;
    productSizeId: string;
    toppingIds: string[];
}

export interface OrderRequest {
    tableId: string;
    items: item[];
    deviceToken: string;
}
