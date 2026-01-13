"use client";

import React, { useMemo, useState } from "react";
import {
  X,
  Zap,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowUpDown,
  MessageSquare,
  AlertCircle,
  Clock,
  LayoutGrid,
  List
} from "lucide-react";
import { TableData, Complain } from "@/entites/moderator/FeedbackModole";
import { useCheckSS } from "@/hooks/moderator/useFeedbackHooks";
import { useToastModerator } from "@/hooks/use-toast-moderator";

interface QuickServeModalProps {
  open: boolean;
  onClose: () => void;
  tables: Record<string, TableData>;
  onRefresh: () => void;
}

interface FlatComplain extends Complain {
  tableId: string;
  tableName: string;
}

export const QuickServeModal: React.FC<QuickServeModalProps> = ({
  open,
  onClose,
  tables,
  onRefresh
}) => {
  const { addToast } = useToastModerator();
  const { run: runCheck } = useCheckSS();
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Extract all "cho thêm" complaints from all tables
  const allQuickComplains = useMemo(() => {
    const list: FlatComplain[] = [];
    Object.values(tables).forEach(table => {
      if (table.listComplain && table.listComplain.length > 0) {
        table.listComplain.forEach(c => {
          const desc = c.description.toLowerCase();
          // Filter for "cho thêm" or similar keywords requested by user
          if (desc.includes("cho thêm") || desc.includes("cho them") || (c.quickServeItems && c.quickServeItems.length > 0)) {
            list.push({
              ...c,
              tableId: table.id,
              tableName: table.tableName
            });
          }
        });
      }
    });
    // Sort by created time (newest first)
    return list.sort((a, b) => {
        const dateA = parseRelativeDate(a.createdTime);
        const dateB = parseRelativeDate(b.createdTime);
        return dateB.getTime() - dateA.getTime();
    });
  }, [tables]);

  function parseRelativeDate(dateStr: string) {
    if (!dateStr) return new Date(0);
    // format might be "13/01/2026 17:48:18" or "DD/MM/YYYY HH:mm:ss"
    const parts = dateStr.split(/[\/\s:]/);
    if (parts.length < 3) return new Date(0);
    const [d, m, y, h, min, s] = parts;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), h ? parseInt(h) : 0, min ? parseInt(min) : 0, s ? parseInt(s) : 0);
  }

  const filteredComplains = useMemo(() => {
    if (!searchQuery) return allQuickComplains;
    const q = searchQuery.toLowerCase();
    return allQuickComplains.filter(c => 
      c.description.toLowerCase().includes(q) || 
      c.tableName.toLowerCase().includes(q) ||
      (c.quickServeItems && c.quickServeItems.some(item => item.toLowerCase().includes(q)))
    );
  }, [allQuickComplains, searchQuery]);

  const handleToggleSelect = (complainId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(complainId)) next.delete(complainId);
      else next.add(complainId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredComplains.length && filteredComplains.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredComplains.map(c => c.complainId)));
    }
  };

  const handleBulkProcess = async () => {
    if (selectedIds.size === 0) return;

    setIsProcessing(true);
    try {
      // Group selected complaints by tableId
      const groupedByTable: Record<string, string[]> = {};
      filteredComplains.forEach(c => {
        if (selectedIds.has(c.complainId)) {
          if (!groupedByTable[c.tableId]) groupedByTable[c.tableId] = [];
          groupedByTable[c.tableId].push(c.complainId);
        }
      });

      // Sequential processing for each table
      const tableIds = Object.keys(groupedByTable);
      for (const tId of tableIds) {
        const fbIds = groupedByTable[tId];
        // Content "Nhân viên đã tiếp nhận và phục vụ" indicates handled
        await runCheck(tId, fbIds, "Nhân viên đã tiếp nhận yêu cầu phục vụ nhanh", false);
      }

      addToast(`Đã xử lý ${selectedIds.size} yêu cầu phục vụ nhanh`, "success");
      setSelectedIds(new Set());
      onRefresh(); // Refresh parent data
    } catch (error) {
      console.error("Quick process error:", error);
      addToast("Có lỗi xảy ra khi xử lý hàng loạt", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-gray-100 ring-1 ring-black/5">
        
        {/* Header - Modern Gradient */}
        <div className="p-8 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-white/20 p-4 rounded-[1.25rem] backdrop-blur-md border border-white/30 shadow-inner">
              <Zap className="w-10 h-10 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]" />
            </div>
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                Quick Serve <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">Moderator Tool</span>
              </h2>
              <p className="text-indigo-100 text-lg font-medium opacity-90">Xử lý nhanh các yêu cầu "Cho thêm" từ khách hàng</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:rotate-90 text-white border border-white/20 backdrop-blur-md group"
          >
            <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Toolbar Section */}
        <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-6 backdrop-blur-sm">
          <div className="relative flex-1 min-w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Tìm món, số bàn hoặc mô tả..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-700 font-medium placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-2xl border-2 border-gray-200 flex shadow-sm">
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-indigo-600 text-white shadow-indigo-200 shadow-lg" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white shadow-indigo-200 shadow-lg" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            
            <button 
              onClick={handleSelectAll}
              className="px-6 py-4 bg-white text-gray-700 rounded-2xl border-2 border-gray-200 font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              {selectedIds.size === filteredComplains.length && filteredComplains.length > 0 ? "Bỏ chọn" : "Chọn tất cả"}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {filteredComplains.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="bg-gray-100 p-10 rounded-[3rem] text-gray-300 mb-8 border-4 border-dashed border-gray-200">
                <MessageSquare className="w-24 h-24" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Không có yêu cầu "Cho thêm"</h3>
              <p className="text-gray-500 text-xl max-w-md mx-auto leading-relaxed">Hiện tại không có phản hồi nào chứa yêu cầu phục vụ nhanh hoặc gia vị.</p>
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-4">
              {filteredComplains.map(c => (
                <div 
                  key={c.complainId}
                  onClick={() => handleToggleSelect(c.complainId)}
                  className={`group relative p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer ${
                    selectedIds.has(c.complainId) 
                      ? "border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-500/20" 
                      : "border-gray-100 bg-white hover:border-indigo-300 hover:shadow-xl hover:shadow-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedIds.has(c.complainId) 
                        ? "bg-indigo-600 border-indigo-600 text-white scale-110" 
                        : "bg-white border-gray-300 text-transparent"
                    }`}>
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-tight">
                            {c.tableName}
                          </span>
                          <span className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            {c.createdTime}
                          </span>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-800 line-clamp-2 leading-relaxed">{c.description}</p>
                      
                      {c.quickServeItems && c.quickServeItems.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {c.quickServeItems.map((item, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider">
                              + {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComplains.map(c => (
                <div 
                  key={c.complainId}
                  onClick={() => handleToggleSelect(c.complainId)}
                  className={`relative p-8 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col h-full ${
                    selectedIds.has(c.complainId) 
                      ? "border-indigo-500 bg-indigo-50/50 shadow-lg" 
                      : "border-gray-100 bg-white hover:border-indigo-300 hover:shadow-xl"
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-indigo-100 text-indigo-700 px-5 py-2 rounded-2xl text-base font-bold">
                      {c.tableName}
                    </span>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      selectedIds.has(c.complainId) ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"
                    }`}>
                      {selectedIds.has(c.complainId) && <CheckCircle2 className="w-5 h-5" />}
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-black text-gray-800 mb-6 leading-tight flex-1">{c.description}</h4>
                  
                  {c.quickServeItems && c.quickServeItems.length > 0 && (
                    <div className="mt-auto pt-6 border-t border-gray-100/50 flex flex-wrap gap-2">
                      {c.quickServeItems.map((item, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    {c.createdTime}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-8 bg-white border-t border-gray-100 flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
             <div className="bg-indigo-50 text-indigo-700 px-6 py-4 rounded-2xl border border-indigo-100">
                <span className="text-3xl font-black mr-3">{selectedIds.size}</span>
                <span className="font-bold text-indigo-900/60 uppercase tracking-widest text-xs">Mục đã chọn</span>
             </div>
             
             {selectedIds.size > 0 && (
                <button 
                  onClick={() => setSelectedIds(new Set())}
                  className="text-gray-400 hover:text-red-500 font-bold px-4 py-2 hover:bg-red-50 rounded-xl transition-all"
                >
                  Hủy chọn
                </button>
             )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-8 py-5 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all border-2 border-transparent hover:border-gray-100"
            >
              Để sau
            </button>
            <button 
              disabled={selectedIds.size === 0 || isProcessing}
              onClick={handleBulkProcess}
              className={`px-12 py-5 rounded-[1.5rem] font-black text-xl flex items-center gap-4 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed ${
                selectedIds.size > 0 
                  ? "bg-indigo-600 text-white shadow-indigo-300 hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-2xl" 
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  Xử lý...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 fill-current" />
                  Xử lý ngay
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
