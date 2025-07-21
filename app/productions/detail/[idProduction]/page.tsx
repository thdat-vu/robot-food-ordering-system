'use client'

import {use} from 'react'
import ProductionDetailPage from "@/app/features/components/ProductionDetail";

export default function Page({params}: { params: Promise<{ idProduction: string }> }) {


    const {idProduction} = use(params)

    return (
        <ProductionDetailPage id={idProduction}/>
    )
}