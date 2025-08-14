'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ModeratorScreen from './ModeratorScreen';
import ModeratorSidebar from "@/components/moderator/ModeratorSideBar";
import ModeratorTableManagement from './ModeratorTableManagement';

export default function ModeratorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('tables');

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