"use client";
import {useState, ReactNode, useContext, createContext} from "react";

interface TableContextType {
    tableId: string;
    tableStatus: string;
    tableName: string;
    setTable: (id: string, tableStatus: string,
               tableName: string) =>
        void;
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
    const [tableName, setName] = useState("Bàn số 1");

    const setTable = (id: string, status: string, name: string) => {
        setId(id);
        setStatus(status);
        setName(name);
    };
    const value: TableContextType = {
        tableId,
        tableStatus,
        tableName,
        setTable,
    };

    return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}
