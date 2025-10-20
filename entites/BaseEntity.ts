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