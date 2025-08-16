'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ModeratorScreen from './ModeratorScreen';
import ModeratorSidebar from "@/components/moderator/ModeratorSideBar";
import ModeratorTableManagement from './ModeratorTableManagement';
import FeedbackList from "@/components/moderator/FeedbackList";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface FeedbackData {
  idFeedback: string;
  idTable: string;
  feedBack: string;
  isPending: boolean;
  createDate: string;
  orderId: string;
  orderItems: OrderItem[];
  totalPrice: number;
  rating?: number;
  customerName?: string;
}

// Sample feedback data
const dummyFeedbacks: FeedbackData[] = [
  {
    idFeedback: "fb-001",
    idTable: "T01",
    feedBack: "Món ăn rất ngon, nhân viên phục vụ nhiệt tình.",
    isPending: false,
    createDate: "2023-11-15T14:30:00Z",
    orderId: "ORD-20231115-001",
    customerName: "Nguyễn Văn A",
    rating: 5,
    totalPrice: 350000,
    orderItems: [
      {
        id: "item-1",
        name: "Phở bò",
        price: 70000,
        quantity: 2,
        imageUrl: "../assets/Picture/notificationfeedback.PNG"
      },
      {
        id: "item-2",
        name: "Bún chả",
        price: 65000,
        quantity: 1,
        imageUrl: "../assets/Picture/notificationfeedback.PNG"
      },
      {
        id: "item-3",
        name: "Nước cam",
        price: 30000,
        quantity: 2,
        imageUrl: "../assets/Picture/notificationfeedback.PNG"
      }
    ]
  },
  {
    idFeedback: "fb-002",
    idTable: "T02",
    feedBack: "Chờ đợi hơi lâu khi gọi món.",
    isPending: true,
    createDate: "2023-11-14T19:15:00Z",
    orderId: "ORD-20231114-002",
    rating: 3,
    totalPrice: 250000,
    orderItems: [
      {
        id: "item-4",
        name: "Cơm gà",
        price: 55000,
        quantity: 3,
        imageUrl:  "../assets/Picture/notificationfeedback.PNG"
      },
      {
        id: "item-5",
        name: "Trà đá",
        price: 10000,
        quantity: 2,
        imageUrl: "../assets/Picture/notificationfeedback.PNG"
        
      }
    ]
  }
];

function ModeratorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('tables');
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>(dummyFeedbacks);

  // Get tab from URL params or default to 'tables'
  useEffect(() => {
    const tab = searchParams.get('tab') || 'tables';
    setActiveTab(tab);
  }, [searchParams]);

  // Function to change tab and update URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  // Render component based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'feedback':
        return <ModeratorScreen />;
      case 'tables':
        return <ModeratorTableManagement />;
      case 'test':
        return <FeedbackList tableId="test-table" feedbacks={feedbacks} />;
      default:
        return <ModeratorTableManagement />;
    } 
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <ModeratorSidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
      
      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}

function ModeratorPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-gray-500">Đang tải...</div>
    </div>
  );
}

export default function ModeratorPage() {
  return (
    <Suspense fallback={<ModeratorPageLoading />}> 
      <ModeratorPageContent />
    </Suspense>
  );
}
