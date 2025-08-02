export interface FeedbackgGetTableId {
    idFeedback: string;
    idTable: string;
    feedBack: string;
    isPeeding: boolean;
    createData: Date;
}

export interface TableData {
    tableName: string;
    counter: number;
    isDelivery : boolean;
    isPayment : boolean;
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
