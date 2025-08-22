export interface FeedbackgGetTableId {
    idFeedback: string;
    idTable: string;
    feedBack: string;
    isPeeding: boolean;
    createData: string;
    dtos: dto[];
}

export interface dto {
    imageUrl: string;
    orderItemId: string;
    orderItemName: string;
    status: number;
}

export interface TableData {
    tableName: string;
    counter: number;
    deliveredCount: number;
    totalItems: number;
    paidCount: number;

}

export interface ResponseType {
    data: {
        [key: string]: TableData;
    };
    additionalData: string;
    message: string;
    statusCode: number;
    code: string;
}
