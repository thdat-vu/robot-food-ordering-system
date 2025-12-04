export interface BaseEntity<T> {
    items: T;
    message: string;
    statusCode: string;
    code: string;
}

export interface BaseEntityData<T> {
    data: T;
    statusCode:string;
    code:string;
}
export interface BaseEntityDataError<T> {
    data: T;
    message?: string;       // thêm nếu chưa có
    statusCodes?: string;    // nếu API có
    codes?: string;          // nếu API có
  }
  