import React, {use} from "react";
import {ToppingList} from "@/app/features/components/ToppingList";

export default function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params) /// id san pham
    return (
        <>
            <ToppingList id={id}/>
        </>
    )
}