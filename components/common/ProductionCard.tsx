'use client'
import React, {memo, useCallback} from "react";
import {useRouter} from "next/navigation";

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
        <button
            type="button"
            onClick={handle}
            className="
              group w-full max-w-[220px] sm:max-w-[240px]
              rounded-3xl border border-gray-200
              bg-white/90 backdrop-blur
              shadow-sm
              p-4 sm:p-5
              text-left
              transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-xl hover:border-gray-300
              active:translate-y-0 active:scale-[0.99]
              focus:outline-none focus:ring-2 focus:ring-blue-200
            "
        >
            <div className="flex items-center justify-center">
                <div
                    className="
                      h-20 w-20 sm:h-24 sm:w-24
                      rounded-full
                      ring-2 ring-white
                      shadow
                      overflow-hidden
                      bg-gray-100
                      transition
                      group-hover:shadow-md
                    "
                >
                    <img
                        src={url}
                        alt={name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                </div>
            </div>

            <div className="mt-4">
                <div
                    className="
                      rounded-2xl
                      bg-gray-50
                      border border-gray-100
                      px-3 py-2.5
                      transition
                      group-hover:bg-gray-100
                      group-hover:border-gray-200
                    "
                >
                    <h3 className="text-sm sm:text-[15px] font-semibold text-gray-900 line-clamp-2 text-center">
                        {name}
                    </h3>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-center">
                <span className="text-xs text-gray-500 group-hover:text-gray-700 transition">
                    Xem chi tiết →
                </span>
            </div>
        </button>
    );
});
