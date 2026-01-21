export interface Toast {
    id: number;
    type: "success" | "error" | "warning";
    message: string;
    isVisible: boolean;
}
