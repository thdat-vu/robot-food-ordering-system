interface Session {
    id: string;
    tableName : string;
    checkIn: string;
    checkOut: string | null;
    customerName: string;
    phoneNumber: string;
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