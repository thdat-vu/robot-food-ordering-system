import { ApiOrderResponse } from "@/lib/api/orders";
import { OrderData } from "./tableModel";

export interface FeedbackgGetTableId {
    complainId: string;
    idTable: string;
    feedBack: string;
    isPending: boolean;
    createData: Date;
  
    resolutionNote?: string; // Note from moderator, includes "Yêu cầu nhanh:" prefix when quick-serve is sent (camelCase)
    ResolutionNote?: string; // Note from moderator (PascalCase from backend) - handle both formats
}



export interface TableData {
    id : string;
    sessionId: string | null;
    tableName: string;
    counter: number;
    deliveredCount: number; 
    serveredCount: number;
    totalItems: number;
    paidCount: number;
    tableStatus:number; // 0 la Trong, 1 cokhach 2dactruoc
    paymentStatus:number; //  1 chua 2 roi 3 that bai 4 hoantien
    lastOrderUpdatedTime?: string | null; // ví dụ: "16:23" hoặc "16:23:05"
    pendingItems: number;
    isWaitingDish: boolean;
    waitingDurationInMinutes: number | null;
}
export interface OrderCardProps {
    tableId : string ;
    orders: OrderData[];
    onToggleExpand?: (orderId: string) => void;
    expandedOrderId?: string | null;
    
    // New props for filter functionality
    fetchOrders?: ( startDate: string | null, endDate: string | null) => Promise<OrderData[]>;
    initialOrders?: OrderData[];
    showDateFilter?: boolean; // Option to show/hide date filter
   
        onOrdersChange?: (orders: ApiOrderResponse[], tableId: string) => void;
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

