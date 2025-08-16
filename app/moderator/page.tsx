'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ModeratorScreen from './ModeratorScreen';
import ModeratorSidebar from "@/components/moderator/ModeratorSideBar";
import ModeratorTableManagement from './ModeratorTableManagement';
import FeedbackList from "@/components/moderator/FeedbackList";


export interface FeedbackData {
  idFeedback: string;
  idTable: string;
  feedBack: string;
  isPending: boolean;
  createDate: string;
  orderId: string;
  orderItems: {
    name: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  rating?: number;
  customerName?: string;
}

function ModeratorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('tables');

  
  
  const dummyFeedbacks: FeedbackData[] = [
    {
      idFeedback: "fb1",
      idTable: "1",
      feedBack: "Món ăn rất ngon, phục vụ nhanh",
      isPending: true,
      createDate: "2025-08-16",
      orderId: "O-123",
      orderItems: [
        { name: "Phở bò", price: 50000, quantity: 2 },
        { name: "Trà đá", price: 5000, quantity: 3 },
      ],
      totalPrice: 115000,
      rating: 4,
      customerName: "Nguyễn Văn A",
    },
    {
      idFeedback: "fb2",
      idTable: "3",
      feedBack: "Món ăn hơi mặn, mong cải thiện",
      isPending: false,
      createDate: "2025-08-15",
      orderId: "O-456",
      orderItems: [{ name: "Cơm gà", price: 45000, quantity: 1 }],
      totalPrice: 45000,
      rating: 3,
      customerName: "Lê Thị B",
    },
  ];

  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>(dummyFeedbacks);


  // Lấy tab từ URL params hoặc mặc định là 'tables'
  useEffect(() => {
    const tab = searchParams.get('tab') || 'tables';
    setActiveTab(tab);
  }, [searchParams]);

  // Function để thay đổi tab và update URL
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