'use client'
import React, {memo, useCallback} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";

interface ProductionCardProps {
    idProduction: string;
    name: string;
    url: string;
}

export const ProductionCard: React.FC<ProductionCardProps> = memo(({url, name, idProduction}) => {
    const router = useRouter();

    const handle = useCallback(() => {
        router.push(`/productions/detail/${idProduction}`);
    }, [router, idProduction]);

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
                {/*<Image*/}
                {/*    src={url}*/}
                {/*    alt={name}*/}
                {/*    width={96}*/}
                {/*    height={96}*/}
                {/*    className="w-20 h-20 sm:w-24 sm:h-24 object-cover mt-2 rounded-full"*/}
                {/*    loading="lazy"*/}
                {/*    quality={75}*/}
                {/*/>*/}
                <img className="w-20 h-20 sm:w-24 sm:h-24 object-cover mt-2 rounded-full" src={url} alt=""/>
            </div>

            <div className="mt-5 bg-gray-50 rounded-2xl p-2 sm:p-3 transition hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-medium sm:font-semibold text-gray-800 line-clamp-1">
                        {name}
                    </h3>
                </div>
            </div>

        </div>
    );
});
