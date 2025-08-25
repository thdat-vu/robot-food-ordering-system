"use client";

import Button from "@/components/common/Button";
import {useRouter, useParams} from "next/navigation";
import {useGetTable} from "@/hooks/customHooks/useTableHooks";
import {use, useEffect, useState} from "react";
import {useTableContext} from "@/hooks/context/Context";
import {useDeviceToken} from "@/hooks/context/deviceTokenContext";
import {addProduction, loadListFromLocalStorage} from "@/store/ShoppingCart";
import {TOKEN_NAME_VALUE} from "@/name-value-env";
import {tokenAuthentic} from "@/unit/unit";
import {Table} from "@/entites/respont/Table";
import {MobileDialog} from "@/components/common/MobileDialog";
import {ErroTable} from "@/api/TableApi";

const checkTable = (obj: any): obj is Table => {
    return obj && typeof obj.id === "string" && typeof obj.name === "string";
}

export default function Home({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    const router = useRouter();
    const context = useTableContext();
    const {setTable} = context;
    const deviceToken = useDeviceToken();
    const key: string = deviceToken.deviceToken;
    const [data, setData] = useState<Table>();

    const [errlog, setErrlog] = useState<{
        status: boolean,
        message: string,
        title: string
    }>();

    const [open, setOpen] = useState<boolean>(false);

    const {run} = useGetTable();

    const handleLoad = async () => {
        return await run(id, key);
    }

    useEffect(() => {
        if (key) {
            console.log(key);
            (async () => {
                const result = await handleLoad();

                // Kiểm tra nếu result là Table
                if (checkTable(result)) {
                    setData(result);
                    // Xóa error log khi có data thành công
                    setErrlog(undefined);
                }
                // Kiểm tra nếu result là ErroTable
                else if (result && typeof result === 'object' && 'status' in result && 'message' in result) {
                    const errorResult = result as ErroTable;
                    setErrlog({
                        title: "Cảnh Báo",
                        status: errorResult.status,
                        message: errorResult.message
                    });
                    setOpen(true);
                    // Xóa data khi có lỗi
                    setData(undefined);
                }
            })();
        }
    }, [id, key]);

    useEffect(() => {
        if (data && checkTable(data)) {
            setTable(id, data.status, data.name);
        }
    }, [data, id, setTable]);

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
            })();
        } else {
            deviceToken.setDeviceToken(temp[0]);
        }
    }, [deviceToken]);

    const handlChangePage = () => {
        if (data) {
            router.push(`/productions/${data.id}`);
        }
    }

    return (
        <>
            <div
                className="w-full flex flex-col justify-end items-center bg-cover bg-center"
                style={{backgroundImage: `url('/img.png')`}}
            >
                <div className="min-h-screen flex justify-center items-end pb-10">
                    {data && !errlog && (
                        <Button
                            content="XEM THỰC ĐƠN"
                            handle={handlChangePage}
                            className="rounded-3xl bg-green-700 px-8 py-4 text-lg w-80 sm:w-96 duration-300 ease-in-out
                                  transform hover:scale-105 active:scale-110"
                        />
                    )}
                </div>
            </div>

            {errlog && (
                <MobileDialog
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    status={errlog.status ? "success" : "error"}
                    message={errlog.message}
                />
            )}
        </>
    );
}