'use client'
import React from "react";
import {useRouter} from "next/navigation";

export const ProductionCard: React.FC<{
    idProduction: string,
    name: string,
    // price: string,
    url: string,
    // sale?: number,
}> = ({url, name, idProduction}) => {
    const router = useRouter();

    const handle = () => {
        router.push(`/productions/detail/${idProduction}`);
    };

    return (
        <div
            onClick={handle}
            key={idProduction}
            className="bg-white rounded-3xl border border-gray-200 shadow-md
                       p-4 sm:p-6 w-full max-w-[200px] sm:w-44 text-center
                       transition transform duration-300 ease-in-out
                       hover:scale-105 hover:shadow-xl cursor-pointer"
        >
            <div className="flex justify-center">
                <img
                    src={url}
                    alt={name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover mt-2 rounded-full"
                />
            </div>

            <div className="mt-5 bg-gray-50 rounded-2xl p-2 sm:p-3 transition hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-medium sm:font-semibold text-gray-800 line-clamp-1">
                        {name}
                    </h3>
                    {/*<p className="text-green-600 font-bold text-sm sm:text-base">*/}
                    {/*    {price}*/}
                    {/*</p>*/}
                </div>
            </div>

        </div>
    );
};
