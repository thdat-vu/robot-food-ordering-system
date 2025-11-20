"use client";
import React, {useEffect} from "react";
import {useParams} from "next/navigation";
import {OrderList} from "@/app/features/components/OrderList";
import {useGetTable} from "@/hooks/customHooks/useTableHooks";
import {Table} from "@/entites/respont/Table";
import {ErroTable} from "@/api/TableApi";
import {useTableContext} from "@/hooks/context/Context";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";

export default function Page() {
    const {id} = useParams<{ id: string }>();

    const {run} = useGetTable();
    const {tableId, setTable} = useTableContext();
    const {deviceToken} = useDeviceToken();

    useEffect(() => {
        if (!id || !deviceToken) return;
        if (id === tableId) return;

        (async () => {
            try {
                const res: Table | ErroTable = await run(id, deviceToken);

                if ("id" in res) {
                    setTable(res.id, res.status, res.name);
                } else {
                    console.error("Error from API:", res.message);
                }
            } catch (e) {
                console.error("Fetch error:", e);
            }
        })();
    }, [id, tableId, deviceToken, run]);

    return <OrderList id={id}/>;
}
