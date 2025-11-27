import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

type SelectionItem = { itemName: string; tableNumber: number; id: number };

export interface MatchSuggestionOrder {
  id: number;
  itemName: string;
  tableNumber: number;
  sizeName?: string;
  note?: string | null;
  toppings?: string[];
  createdTime?: string;
  estimatedTime?: string;
}

export interface MatchSuggestion {
  id: string;
  itemName: string;
  sizeName?: string;
  category: string;
  note?: string | null;
  toppings?: string[];
  baseTables: number[];
  candidates: Array<{
    tableNumber: number;
    orders: MatchSuggestionOrder[];
  }>;
}

type MatchMode = 'prepare' | 'serve';

interface MatchSuggestionModalProps {
  isOpen: boolean;
  suggestions: MatchSuggestion[] | null;
  onConfirm: (selectedOrders: SelectionItem[]) => void;
  onCancel: () => void;
  mode?: MatchMode;
}

export function MatchSuggestionModal({
  isOpen,
  suggestions,
  onConfirm,
  onCancel,
  mode = 'prepare',
}: MatchSuggestionModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const allOrders = useMemo(() => {
    if (!suggestions) return [];
    return suggestions.flatMap(suggestion =>
      suggestion.candidates.flatMap(candidate => candidate.orders)
    );
  }, [suggestions]);

  useEffect(() => {
    if (!suggestions || suggestions.length === 0) {
      setSelectedIds(new Set());
      return;
    }
    const defaults = new Set<number>();
    suggestions.forEach(suggestion => {
      suggestion.candidates.forEach(candidate => {
        candidate.orders.forEach(order => defaults.add(order.id));
      });
    });
    setSelectedIds(defaults);
  }, [suggestions]);

  if (!isOpen || !suggestions || suggestions.length === 0) {
    return null;
  }

  const handleToggle = (orderId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleToggleByTable = (tableOrders: MatchSuggestionOrder[]) => {
    const allSelected = tableOrders.every(order => selectedIds.has(order.id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      tableOrders.forEach(order => {
        if (allSelected) {
          next.delete(order.id);
        } else {
          next.add(order.id);
        }
      });
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedIds.size === 0) {
      onConfirm([]);
      return;
    }

    const selectedOrders = allOrders
      .filter(order => selectedIds.has(order.id))
      .map(order => ({
        itemName: order.itemName,
        tableNumber: order.tableNumber,
        id: order.id,
      }));

    onConfirm(selectedOrders);
  };

  const renderOrderMeta = (order: MatchSuggestionOrder) => (
    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
      {order.estimatedTime && (
        <span className="inline-flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {order.estimatedTime}
        </span>
      )}
      {order.createdTime && (
        <span className="inline-flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
            <path
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {order.createdTime}
        </span>
      )}
    </div>
  );

  const modeDescription =
    mode === 'serve'
      ? 'Đã chọn bàn hiện tại có sẵn món trùng với bàn khác. Xem chi tiết trước khi chuyển sang “Bắt đầu phục vụ”.'
      : 'Đã chọn bàn hiện tại có sẵn món trùng với bàn khác. Xem chi tiết trước khi bắt đầu nấu.';
  const tableHelper =
    mode === 'serve'
      ? 'Tự động chọn để chuyển sang trạng thái "Bắt đầu phục vụ"'
      : 'Tự động chọn để chuyển sang trạng thái "Đang thực hiện"';
  const confirmLabel = mode === 'serve' ? 'Xác nhận phục vụ cùng lúc' : 'Xác nhận gộp món';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-40" onClick={onCancel} />
      <div className="relative mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Gợi ý gộp món cùng bàn</h3>
            <p className="text-sm text-gray-500">
              {modeDescription}
            </p>
          </div>
          <Button variant="ghost" onClick={onCancel} aria-label="Đóng">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-5">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {suggestion.itemName}
                      {suggestion.sizeName && (
                        <span className="text-blue-600">{` (${suggestion.sizeName})`}</span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-500">Phân loại: {suggestion.category}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    Bàn đang chọn: {suggestion.baseTables.map(table => `Bàn ${table}`).join(', ')}
                  </div>
                </div>

                {suggestion.note && (
                  <div className="text-sm text-orange-700 bg-orange-100 px-3 py-2 rounded-md border-l-4 border-orange-500">
                    <span className="font-semibold">Ghi chú:</span> {suggestion.note}
                  </div>
                )}
                {suggestion.toppings && suggestion.toppings.length > 0 && (
                  <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded-md border-l-4 border-green-500">
                    <span className="font-semibold">Toppings:</span> {suggestion.toppings.join(', ')}
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {suggestion.candidates.map(candidate => {
                  const tableOrders = candidate.orders;
                  const allSelected = tableOrders.every(order => selectedIds.has(order.id));
                  return (
                    <div key={`${suggestion.id}-table-${candidate.tableNumber}`} className="rounded-lg bg-white border border-gray-200 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={() => handleToggleByTable(tableOrders)}
                            aria-label={`Chọn tất cả món ở bàn ${candidate.tableNumber}`}
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {`Bàn ${candidate.tableNumber} • ${tableOrders.length} món`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {tableHelper}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {tableOrders.map(order => (
                          <label
                            key={order.id}
                            className="flex items-start gap-3 rounded-md border border-gray-100 px-3 py-2 hover:border-blue-200"
                          >
                            <Checkbox
                              checked={selectedIds.has(order.id)}
                              onCheckedChange={() => handleToggle(order.id)}
                              aria-label={`Chọn món ${order.itemName} ở bàn ${order.tableNumber}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-900">
                                  {order.itemName}{order.sizeName ? ` (${order.sizeName})` : ''}
                                </span>
                                <span className="text-gray-500">Bàn {order.tableNumber}</span>
                              </div>
                              {order.note && (
                                <p className="text-xs text-orange-600 mt-1">
                                  Ghi chú: {order.note}
                                </p>
                              )}
                              {order.toppings && order.toppings.length > 0 && (
                                <p className="text-xs text-green-600">
                                  Toppings: {order.toppings.join(', ')}
                                </p>
                              )}
                              <div className="mt-1">{renderOrderMeta(order)}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <Button variant="outline" onClick={onCancel}>
            Bỏ qua
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
            {confirmLabel} ({selectedIds.size})
          </Button>
        </div>
      </div>
    </div>
  );
}

