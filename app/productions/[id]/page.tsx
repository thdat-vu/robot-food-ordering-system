'use client';

import React, {use, useEffect, useState} from "react";
import ProductionsPage from "@/app/features/components/ProductionsPage";
import {useGetTable} from "@/hooks/customHooks/useTableHooks";
import {TableContext, useTableContext} from "@/hooks/context/Context";
import {Table} from "@/entites/respont/Table";
import {ErroTable} from "@/api/TableApi";
import {TOKEN_Bro_VALUE} from "@/name-value-env";
import {useSignalRTableMoved} from "@/hooks/customHooks/useSignalRTableMoved";


export default function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    const {tableId, setTable} = useTableContext();
    const {run} = useGetTable();
    const [token, setToken] = useState<string>();

    // Listen for table moved notifications via SignalR
    useSignalRTableMoved(id);


    useEffect(() => {
        try {
            const token = localStorage.getItem(TOKEN_Bro_VALUE);
            if (token) {
                setToken(token);
            }
        } catch {
        }
    }, []);

    useEffect(() => {
        if (id !== tableId) {
            (async () => {
                if (!token) return;

                try {
                    const res: Table | ErroTable = await run(id, token);

                    if ("id" in res) {
                        setTable(res.id, res.status, res.name);
                    } else {
                        console.error("Error from API:", res.message);
                    }
                } catch (error) {
                    console.error("Fetch error:", error);
                }
            })();
        }
    }, [id, tableId, token, run]);


    return (
        <ProductionsPage id={id}/>
    );
}
