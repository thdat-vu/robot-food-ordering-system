import React, {use} from "react";
import {OrderList} from "@/app/features/components/OrderList";

export default function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    return (
        <>
            <OrderList id={id}/>
        </>
    )
}