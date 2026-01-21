"use client";
import React, {useEffect} from "react";
import {useParams} from "next/navigation";
import {OrderList} from "@/app/features/components/OrderList";
import {useGetTable} from "@/hooks/customHooks/useTableHooks";
import {Table} from "@/entites/respont/Table";
import {ErroTable} from "@/api/TableApi";
import {useTableContext} from "@/hooks/context/Context";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";
import {useSignalRTableMoved} from "@/hooks/customHooks/useSignalRTableMoved";
import {useSignalRTableStatusChanged} from "@/hooks/customHooks/useSignalRTableStatusChanged";

export default function Page() {
    const {id} = useParams<{ id: string }>();

    // Listen for table moved notifications via SignalR
    useSignalRTableMoved(id || '');

    // Listen for table status changed notifications via SignalR
    // When moderator marks table as "Trống", redirect to /end
    useSignalRTableStatusChanged(id || '');

    const {setTable} = useTableContext();
    const {deviceToken} = useDeviceToken();
    const {run: runGetTable} = useGetTable();

    const loadTable = async () => {
        if (!id || !deviceToken) return;

        try {
            const res: Table | ErroTable = await runGetTable(id, deviceToken);

            if ("id" in res) {
                const t = res as Table;
                setTable(t.id, t.status, t.name);
            } else {
                console.error("Error loading table:", res.message);
            }
        } catch (e) {
            console.error("Unexpected error:", e);
        }
    };

    useEffect(() => {
        loadTable();
    }, [id, deviceToken]);

    return <OrderList id={id}/>;
}
