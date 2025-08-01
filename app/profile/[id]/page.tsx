'use client'
import {use} from 'react'
import Profile from "@/app/features/components/Profile";

export default function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)

    return (
        <Profile id={id}/>
    )
}