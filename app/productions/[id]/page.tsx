'use client';

import React, {use} from "react";
import {useParams} from "next/navigation";
import ProductionsPage from "@/app/features/components/ProductionsPage";


export default function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    return (
        <ProductionsPage id={id}/>
    );
}
