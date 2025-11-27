interface Session {
    id: string;
    tableName : string;
    checkIn: string;
    sessionCode: string | null;
    checkOut: string | null;
    customerName: string;
    phoneNumber: string;
    hasInvoice: boolean;
    invoiceId : string | null;
  }
  interface SessionTableProps {
    idTable: string;
  }
  interface PaginationParams {
    pageNumber?: number;
    pageSize?: number;
  }
  
  interface PaginatedResponse<T> {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  }
