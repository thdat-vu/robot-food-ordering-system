'use client'
import React from "react";
import {FaPlus} from "react-icons/fa";
import {useRouter} from "next/navigation";


export const ProductionCard: React.FC<{
    idProduction: string,
    name: string,
    price: string,
    url: string,
    sale?: number,
}> = ({url, name, price, sale, idProduction}) => {
    const router = useRouter();


    const handle = () => {
        router.push(`/productions/detail/${idProduction}`)
        console.log(idProduction)
    }

    return (
        <span
            onClick={handle}
            key={idProduction}
            className="relative bg-white rounded-3xl border-gray-200 shadow-md p-4 h-64 w-52 sm:w-44 text-center
             transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl
             animate-fade-in"
        >

            {/*{sale && sale > 0 && (*/}
            {/*    <div*/}
            {/*        className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">*/}
            {/*        {sale}% OFF*/}
            {/*    </div>*/}
            {/*)}*/}
            <div>
                <div className="flex justify-center">
                    <img src={url} alt={name} className="w-24 h-24 object-cover mt-3 rounded-full"/>
                </div>

                <div className="mt-7 bg-gray-50 rounded-2xl p-3 transition duration-300 hover:bg-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <h3 className="text-sm font-semibold text-gray-800">{name}</h3>
                            <p className="text-green-600 font-bold text-lg">{price}</p>
                        </div>

                        <button className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition">
                            <FaPlus size={14}/>
                        </button>
                    </div>
                </div>
            </div>

        </span>

    );
}