'use client'
import React, {useEffect, useState} from "react";
import {Topping} from "@/components/common/Topping";
import {IoIosArrowBack} from "react-icons/io";
import {useRouter} from "next/navigation";
import {useGetToppingForProduct} from "@/hooks/customHooks/userTopingHooks";
import {Loading} from "@/components/common/Loading";
import {ToppingProduct} from "@/entites/respont/Topping";


export const ToppingList: React.FC<{ id: string }> = ({id}) => {

    const router = useRouter();

    const [data, setData] = useState<ToppingProduct[]>([]);


    const {
        run: runGetToppingForProduct,
        loading: loadinggetToppingsForProduct,
        data: dataToppings
    } = useGetToppingForProduct();

    useEffect(() => {
        (async () => {
            await runGetToppingForProduct(id);
        })()
    }, [id]);

    useEffect(() => {
        if (dataToppings)
            setData(dataToppings.data)
    }, [dataToppings]);


    return (
        <>
            {
                loadinggetToppingsForProduct ? (
                    <Loading/>
                ) : data ? (

                    <div className="flex w-full flex-col h-screen p-4">

                        <div className="bg-white rounded-xl shadow-md p-4 mb-4 relative">
                            <button
                                className="btn-circle absolute left-4 top-1/2 -translate-y-1/2"
                                onClick={() => {
                                    router.back();
                                }}
                            >
                                <IoIosArrowBack className="text-black text-3xl"/>
                            </button>
                            <h2 className="text-xl font-bold text-gray-800 text-center">Topping</h2>
                        </div>

                        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.map(value => (
                                <Topping
                                    topping={{
                                        id: value.id,
                                        name: value.name,
                                        price: value.price,
                                        imageUrl: value.imageUrl,
                                    }}
                                    key={value.id}
                                />
                            ))}
                        </div>


                    </div>

                ) : (
                    <p className="text-center text-gray-500">Không có Topping.</p>
                )
            }
        </>
    );
};

