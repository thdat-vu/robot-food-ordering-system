import { OrderData } from "./tableModel";

export interface FeedbackgGetTableId {
    idFeedback: string;
    idTable: string;
    feedBack: string;
    isPeeding: boolean;
    createData: Date;
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
    serveredCount: number;
    totalItems: number;
    paidCount: number;

}
export interface OrderCardProps {
    orders: OrderData[];
    onToggleExpand?: (orderId: string) => void;
    expandedOrderId?: string | null;
  }
  export interface OrderCardProps {
    orders: OrderData[];
    onToggleExpand?: (orderId: string) => void;
    expandedOrderId?: string | null;
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

