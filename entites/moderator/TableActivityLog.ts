// Các type activity (match enum bên BE)
export type TableActivityType =
  | 'CheckIn'
  | 'ScanAgain'
  | 'CreateOrder'
  | 'CreateInvoice'
  | 'AddOrderItems'
  | 'PartialPayment'
  |'UpdateOrderItemStatus'
  | 'FullPayment'
  | 'MoveTable'
  | 'ShareStart'
  | 'ShareJoin'
  | 'ShareStop'
  | 'RequestCheckout'
  | 'CloseSession'
  | 'AutoRelease'
  | 'AttachDeviceFromModerator'
  |'AutoReleaseNoOrderTimeout';

// Interface cho 1 activity log
export interface TableActivityLog {
  tableSessionId: string;
  id: string;
  deviceId: string | null;
  type: TableActivityType;
  data: any;          // có thể refine sau thành union
  createdTime: string; // ISO string
}

// Props cho component
export interface TableActivityTrackerProps {
  propSessionId? : string | null; // hoặc string | null nếu FE cho phép null
}
