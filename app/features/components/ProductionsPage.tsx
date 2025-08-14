'use client';

import {Header} from "@/components/common/Header";
import {ProductionsList} from "@/app/features/productions";
import {useGetAllProduction} from "@/hooks/customHooks/useProductionHooks";
import {useGetAllCategory} from "@/hooks/customHooks/useCategoryHooks";
import {Loading} from "@/components/common/Loading";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Catagory} from "@/entites/respont/Catagory";
import {CategoryList} from "@/components/common/CatagoryList";
import {Production} from "@/entites/respont/Production";


export default function ProductionsPage({id}: { id: string }) {

    const [type, setType] = useState<string>('');
    const [listTpe, setListTpe] = useState<Catagory[]>([]);
    const [name, setName] = useState<string>('');
    const [listData, setListData] = useState<Production[]>([]);

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

    const filteredProductions = useMemo(() => {
        if (!name.trim()) return listData;

        return listData.filter(product =>
            product.productName.toLowerCase().includes(name.toLowerCase())
        );
    }, [listData, name]);

    const handleChangeType = useCallback((typeNew: string) => {
        setType(typeNew);
        console.log(typeNew);
    }, []);

    const handeChangName = useCallback((name: string) => {
        setName(name);
    }, []);

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

    useEffect(() => {
        if (productions) {
            setListData(productions.items);
        }
    }, [productions]);

    return (
        <div className="min-h-screen w-full">
            <Header id={id} handeChangName={handeChangName}/>

            <div className="top-2 bg-white left-0 z-40 mb-3">
                <CategoryList category={listTpe} handleChange={handleChangeType}/>
            </div>

            <main className="pt-3 px-4 pb-4">
                {loadingProducts ? (
                    <Loading/>
                ) : filteredProductions?.length ? (
                    <ProductionsList products={filteredProductions}/>
                ) : (
                    <p className="text-center text-gray-500">
                        {name.trim() ? 'Không tìm thấy sản phẩm nào.' : 'Không có sản phẩm nào.'}
                    </p>
                )}
            </main>
        </div>
    );
}