export interface PaginatedList<T> {
    pageNumber: number;
    totalPages: number;
    pageSize: number;
    items: T;
}