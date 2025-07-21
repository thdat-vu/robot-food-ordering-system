'use client';

import { Header } from "@/components/common/Header";
import { Productions } from "@/app/features/productions";

export default function ProductionsPage({ id }: { id: string }) {
    return (
        <div className="min-h-screen bg-yellow-100">
            <Header id={id} />

            <main className="pt-[72px] px-4 pb-4">
                <Productions />
            </main>
        </div>
    );
}