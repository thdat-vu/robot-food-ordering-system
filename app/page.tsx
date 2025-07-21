"use client";

import {use} from 'react';
import Button from "@/components/common/Button";
import {useRouter, useParams} from "next/navigation";


export default function Home() {


    const router = useRouter();

    const handlChangPage = () => {
        router.push(`/productions/${undefined}`);
    }

    return (
        <>
            <div
                className="w-full flex flex-col justify-end items-center bg-cover bg-center"
                style={{backgroundImage: `url('/img.png')`}}
            >
                <div className="min-h-screen flex justify-center items-end pb-10">
                    <Button
                        content="XEM THỰC ĐƠN"
                        handle={handlChangPage}
                        className="rounded-3xl bg-green-700 px-8 py-4 text-lg w-80 sm:w-96 duration-300 ease-in-out
                                                          transform hover:scale-105 active:scale-110"
                    />

                </div>
            </div>

        </>
    );
}
