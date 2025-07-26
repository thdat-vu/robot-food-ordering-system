'use client';

import {Header} from "@/components/common/Header";
import {ProductionsList} from "@/app/features/productions";
import {useGetAllProduction} from "@/hooks/customHooks/useProductionHooks";
import {useGetAllCategory} from "@/hooks/customHooks/useCategoryHooks";
import {Loading} from "@/components/common/Loading";
import {useEffect, useState} from "react";
import {Catagory} from "@/entites/respont/Catagory";
import {CategoryList} from "@/components/common/CatagoryList";


export default function ProductionsPage({id}: { id: string }) {

    const [type, setType] = useState<string>('');
    const [listTpe, setListTpe] = useState<Catagory[]>([]);


    const {
        data: productions,
        loading: loadingProducts,
        run: runProductions,
    } = useGetAllProduction();

    const {
        data: categories,
        run: runLoadCategory
    } = useGetAllCategory();

    useEffect(() => {
        if (categories)
            setListTpe(categories.items)
    }, [categories]);

    const handleChangeType = (typeNew: string) => {
        setType(typeNew);
    }

    useEffect(() => {
        (async () => {
            await runLoadCategory()
        })()
    }, []);

    useEffect(() => {
        if (categories)
            setListTpe([{id: "", name: "tất cả"}, ...categories.items])
    }, [categories]);

    useEffect(() => {

        (async () => {
            await runProductions({
                PageSize: 200,
                PageNumber: 1,
                CategoryName: type === 'tất cả' ? "" : type
            })
        })()
    }, [type]);

    return (
        <div className="min-h-screen w-full">
            <Header id={id}/>

            <div className="top-2 bg-white left-0 z-40 mb-3">
                <CategoryList category={listTpe} handleChange={handleChangeType}/>
            </div>
            <main className="pt-3 px-4 pb-4">

                {
                    loadingProducts ? (
                        <Loading/>
                    ) : productions?.items?.length ? (
                        <ProductionsList products={productions.items}/>

                    ) : (
                        <p className="text-center text-gray-500">Không có sản phẩm nào.</p>
                    )
                }
            </main>
        </div>
    );
}