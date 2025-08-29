import { useState, useEffect, useCallback } from "react";
import { invoicesApi,  InvoiceResponse } from "@/lib/api/invoices";

export function useInvoice() {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  // Fetch all invoices
//   const fetchInvoices = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const response = await invoicesApi.getInvoices(1, 50);
//       setInvoices(response.data || []);
//     } catch (err) {
//       console.error("Error fetching invoices:", err);
//       setError("Failed to fetch invoices");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

  // Fetch single invoice by id
  const fetchInvoiceByTableId = useCallback(async (id: string, page: number = 1, pageSize: number = 50) => {
    try {
        setIsLoading(true);
        setError(null);
        const response = await invoicesApi.getInvoiceByTableId(id, page, pageSize);
        
       
        const invoice = response.items && response.items.length > 0 ? response.items[0] : null;
        setSelectedInvoice(invoice);
       
    } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("Failed to fetch invoice");
        setSelectedInvoice(null);
    } finally {
        setIsLoading(false);
    }
}, []);

  // Calculate total for selected invoice
  const calculateInvoiceTotal = useCallback(() => {
    if (!selectedInvoice) return 0;
    return selectedInvoice.details.reduce((sum, item) => sum + item.totalMoney, 0);
  }, [selectedInvoice]);

//   useEffect(() => {
//     fetchInvoices();
//   }, [fetchInvoices]);

  return {
    invoices,
    selectedInvoice,
    isLoading,
    error,
    // fetchInvoices,
    fetchInvoiceByTableId,
    setSelectedInvoice,
    calculateInvoiceTotal,
  };
}
