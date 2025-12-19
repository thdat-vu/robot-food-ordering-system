export interface TableData {
    id: string;
    name: string;
    status: string;
    qrCode: string;
}

export interface TableItem {
  id: string;
  name: string;
  status: string | number;
  qrCode: string;
}
type Props = {
  rows: FeedbackRow[];
  searchQuery: string;
  selectedIds: Set<string>;
  selectablePendingIds: string[];
  isChecking: boolean;
  responses: Record<string, string>;
  showSuggestions: Record<string, boolean>;
  responseSuggestions: string[];
  isQuickRequest: (row: FeedbackRow) => boolean;
  hasSentQuickRequest: (row: FeedbackRow) => boolean;
  formatDate: (d: string | Date) => string;
  getRelativeTime: (d: string | Date) => string;
  highlightSearchText: (text: string, search: string) => string;
  onToggleSelect: (id: string, isPending: boolean) => void;
  onSelectAll: () => void;
  onResponseChange: (id: string, value: string) => void;
  onToggleSuggestions: (id: string) => void;
  onSuggestionPick: (id: string, suggestion: string) => void;
  onSingleCheck: (id: string) => void;
  onSendQuickRequest: (id: string, feedbackText: string) => void;
};
export interface OrderData {
  id: string;
  tableId: string;
  tableName: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  orderCode: string;
  createdTime?: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSizeId: string;
  sizeName: string;
  note: string;
  remarkNote: string;
  quantity: number;
  price: number;
  status: string;
  imageUrl: string;
  createdTime: string;
  toppings: Topping[];
}

interface Topping {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}