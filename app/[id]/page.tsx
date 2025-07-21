"use client";

import Button from "@/components/common/Button";
import {useRouter, useParams} from "next/navigation";


export default function Home() {

    const params = useParams();
    const {id} = params;
    const router = useRouter();

    const handlChangPage = () => {
        router.push(`/productions/${params.id}`);
    }

    return (
        <>
            <div
                className="w-full flex flex-col justify-end items-center bg-cover bg-center"
                style={{backgroundImage: `url('/img.png')`}}
            >
                <div className="min-h-screen flex justify-center items-end pb-10">
                    <Button
                        content="Đặc món"
                        handle={handlChangPage}
                        className="btn btn-accent w-80 sm:w-96 transition-all duration-300 ease-in-out
                                     transform hover:scale-105 hover:rounded-3xl active:scale-110
                                     px-8 py-4 text-lg"
                    />

                </div>
            </div>

        </>
    );
}
