import { ApiOrderResponse } from "@/lib/api/orders";
import { OrderData } from "./tableModel";
import { Response } from '@/api/moderator/TableApi';
import OrderStatus from './../../app/waiter/OrderStatus';

export interface FeedbackgGetTableId {
    complainId: string;
    idTable: string;
    feedBack: string;
    isPending: boolean;
    lastOrderUpdateTime : string;
    kitchenItemCount ?: number ;
    waiterItemCount?: number ;
    cancelledItemCount?: number ;
    totalItemCount?: number ;
    orderStatus: string  ; // trạng thái đơn hàng hiện tại
    createData: string ; // Date when feedback was created
    resolutionNote?: string; // Note from moderator, includes "Yêu cầu nhanh:" prefix when quick-serve is sent (camelCase)
    ResolutionNote?: string; // Note from moderator (PascalCase from backend) - handle both formats
    handledBy?: string; // Name of the moderator who handled the feedback
}
export interface GroupedFeedbackRow {
  complainId: string;
  feedBack: string;
  isPending: boolean;
  createData: string;
  handledBy?: string;
  resolutionNote?: string;
  groupCount: number;
  originalIds: string[];
  handledByNames?: string[];
  groupKey: string;
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
export type FeedbackRow = {
    complainId: string;
    idTable: string;
    feedBack: string;
    createData: string | Date;
    isPending: boolean;
    resolutionNote?: string | null;
    handledBy?: string | null;
  };
  
  export type FeedbackTableProps = {
    rows: FeedbackRow[];
    searchQuery: string;
    selectedIds: string[];
    selectablePendingIds: string[];
    isChecking: boolean;
    responses: Record<string, string>;
    showSuggestions: Record<string, boolean>;
    responseSuggestions: string[];
    isQuickRequest: (row: FeedbackRow) => boolean;
    hasSentQuickRequest: (row: FeedbackRow) => boolean;
    formatDate: (d: string | Date) => string;
    getRelativeTime: (d: string | Date) => string;
    highlightSearchText: (
        text: string,
        search: string
      ) => React.ReactNode;
    onToggleSelect: (id: string, isPending: boolean) => void;
    onSelectAll: () => void;
    onResponseChange: (id: string, value: string) => void;
    onToggleSuggestions: (id: string) => void;
    onSuggestionPick: (id: string, suggestion: string) => void;
    onSingleCheck: (id: string , responseText: string) => void;
    onSendQuickRequest: (id: string, feedbackText: string) => void;
  };
  export interface GroupedFeedbackRow extends FeedbackRow {
    groupCount: number;
    originalIds: string[];
    handledByNames?: string[];
    groupKey: string;
  }

