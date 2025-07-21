'use client';

import {Header} from "@/components/common/Header";
import {Productions} from "@/app/features/productions";

export default function ProductionsPage({id}: { id: string }) {
    return (
        <main className="min-h-screen bg-yellow-100 flex flex-col items-center justify-start px-4 pt-8">
            <Header id={id}/>
            <Productions/>
        </main>
    );
}