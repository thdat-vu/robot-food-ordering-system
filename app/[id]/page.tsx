"use client";

import Button from "@/components/common/Button";
import {useRouter, useParams} from "next/navigation";
import {useGetTable} from "@/hooks/customHooks/useTableHooks";
import {use, useEffect} from "react";
import {useTableContext} from "@/hooks/context/Context";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";
import {addProduction, loadListFromLocalStorage} from "@/store/ShoppingCart";
import {TOKEN_NAME_VALUE} from "@/name-value-env";
import {tokenAuthentic} from "@/unit/unit";


export default function Home({params}: { params: Promise<{ id: string }> }) {

    const {id} = use(params)
    const router = useRouter();
    const context = useTableContext();
    const {setTable} = context;
    const deviceToken = useDeviceToken();


    const {
        run,
        data
    } = useGetTable();

    useEffect(() => {
        (async () => {
            await run(id)
        })()
    }, [id]);

    useEffect(() => {
        if (data)
            setTable(id, data.status, data.name);
    }, [data]);

    useEffect(() => {
        const temp: string[] = loadListFromLocalStorage(`${TOKEN_NAME_VALUE}`);
        if (temp.length === 0) {
            (async () => {
                const token = await tokenAuthentic();
                console.log(token);
                if (token) {
                    deviceToken.setDeviceToken(token);
                    addProduction<string>(`${TOKEN_NAME_VALUE}`, token);
                }
            })()
        } else {
            deviceToken.setDeviceToken(temp[0])
        }
    }, []);

    const handlChangPage = () => {
        if (data)
            router.push(`/productions/${data.id}`);
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
                                                          transform hover:scale-105 active:scale-110  "

                    />
                </div>
            </div>
        </>
    );
}
