"use client";
import {useState, ReactNode, useContext, createContext, useMemo, useCallback} from "react";

interface TableContextType {
    tableId: string;
    tableStatus: string;
    tableName: string;
    setTable: (id: string, tableStatus: string, tableName: string) => void;
    clearTable: () => void;
}

export const TableContext = createContext<TableContextType | undefined>(undefined);

export const useTableContext = () => {
    const context = useContext(TableContext);
    if (!context) {
        throw new Error("useTableContext must be used inside TableProvider");
    }
    return context;
};

export function TableProvider({children}: { children: ReactNode }) {
    const [tableId, setId] = useState("default_id");
    const [tableStatus, setStatus] = useState("available");
    const [tableName, setName] = useState("Bàn");

    const setTable = useCallback((id: string, status: string, name: string) => {
        setId(id);
        setStatus(status);
        setName(name);
    }, []);

    const clearTable = useCallback(() => {
        setId("");
        setName("");
        setStatus("available");
    }, []);

    const value: TableContextType = useMemo(() => ({
        clearTable,
        tableId,
        tableStatus,
        tableName,
        setTable,
    }), [tableId, tableStatus, tableName, setTable, clearTable]);

    return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}
