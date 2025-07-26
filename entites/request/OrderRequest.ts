export interface item {
    productId: string;
    productSizeId: string;
    toppingIds: string[];
}

export interface OrderRequest {
    tableId: string;
    items: item[];
}

/*
"tableId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "items": [
    {
      "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "productSizeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "toppingIds": [
        "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]
    }
  ]
 */