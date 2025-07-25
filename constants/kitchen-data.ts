import { Order, Category } from '@/types/kitchen';

export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    itemName: "Nước chanh dây",
    category: "Đồ uống",
    tableNumber: 1,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/passion-fruit-juice.jpg",
    orderTime: "10:30",
    estimatedTime: "5 phút"
  },
  {
    id: 2,
    itemName: "Nước chanh dây",
    category: "Đồ uống", 
    tableNumber: 4,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/passion-fruit-juice.jpg",
    orderTime: "10:32",
    estimatedTime: "5 phút"
  },
  {
    id: 3,
    itemName: "Nước chanh dây",
    category: "Đồ uống",
    tableNumber: 6,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/passion-fruit-juice.jpg",
    orderTime: "10:35",
    estimatedTime: "5 phút"
  },
  {
    id: 4,
    itemName: "Nước chanh dây",
    category: "Đồ uống",
    tableNumber: 8,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/passion-fruit-juice.jpg",
    orderTime: "10:37",
    estimatedTime: "5 phút"
  },
  {
    id: 5,
    itemName: "Trà đào ối hồng",
    category: "Đồ uống",
    tableNumber: 2,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/peach-tea.jpg",
    orderTime: "10:28",
    estimatedTime: "7 phút"
  },
  {
    id: 6,
    itemName: "Trà đào ối hồng",
    category: "Đồ uống",
    tableNumber: 5,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/peach-tea.jpg",
    orderTime: "10:33",
    estimatedTime: "7 phút"
  },
  {
    id: 7,
    itemName: "Cacao đá xay",
    category: "Đồ uống",
    tableNumber: 3,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/iced-cacao.jpg",
    orderTime: "10:25",
    estimatedTime: "8 phút"
  },
  // Món chính
  {
    id: 8,
    itemName: "Phở bò",
    category: "Món chính",
    tableNumber: 7,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/pho-bo.jpg",
    orderTime: "10:40",
    estimatedTime: "20 phút"
  },
  {
    id: 9,
    itemName: "Phở bò",
    category: "Món chính",
    tableNumber: 9,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/pho-bo.jpg",
    orderTime: "10:45",
    estimatedTime: "20 phút"
  },
  {
    id: 10,
    itemName: "Bún bò Huế",
    category: "Món chính",
    tableNumber: 10,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/bun-bo-hue.jpg",
    orderTime: "10:50",
    estimatedTime: "25 phút"
  },
  {
    id: 11,
    itemName: "Bún bò Huế",
    category: "Món chính",
    tableNumber: 12,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/bun-bo-hue.jpg",
    orderTime: "10:55",
    estimatedTime: "25 phút"
  },
  // Tráng miệng
  {
    id: 12,
    itemName: "Gỏi cuốn",
    category: "Tráng miệng",
    tableNumber: 11,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/goi-cuon.jpg",
    orderTime: "11:00",
    estimatedTime: "12 phút"
  },
  {
    id: 13,
    itemName: "Gỏi cuốn",
    category: "Tráng miệng",
    tableNumber: 13,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/goi-cuon.jpg",
    orderTime: "11:05",
    estimatedTime: "12 phút"
  },
  {
    id: 14,
    itemName: "Chả cá",
    category: "Tráng miệng",
    tableNumber: 14,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/cha-ca.jpg",
    orderTime: "11:10",
    estimatedTime: "15 phút"
  }
];

export const CATEGORIES: Category[] = [
  { id: 1, name: "Tất cả", color: "bg-blue-500" },
  { id: 2, name: "Đồ uống", color: "bg-yellow-500" },
  { id: 3, name: "Món chính", color: "bg-green-500" },
  { id: 4, name: "Tráng miệng", color: "bg-purple-500" }
];

export const TOAST_AUTO_DISMISS_TIME = 3000;
export const TOAST_ANIMATION_DURATION = 300;
export const SIDEBAR_ANIMATION_DURATION = 500;

export const TAB_DISPLAY_NAMES = {
  "đang chờ": "Đang chờ",
  "đang thực hiện": "Đang thực hiện", 
  "bắt đầu phục vụ": "Bắt đầu phục vụ"
} as const;

export const DEFAULT_IMAGE_PLACEHOLDER = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em">No Image</text></svg>`; 