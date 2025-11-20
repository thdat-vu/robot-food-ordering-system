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

    const filteredProductions = useMemo(() => {
        if (!name.trim()) return listData;

        return listData.filter(product =>
            product.productName.toLowerCase().includes(name.toLowerCase())
        );
    }, [listData, name]);

    const handleChangeType = useCallback((typeNew: string) => {
        setType(typeNew);
    }, []);

    const handeChangName = useCallback((name: string) => {
        setName(name);
    }, []);

    useEffect(() => {
        runLoadCategory();
    }, []);

    useEffect(() => {
        if (categories) {
            const filtered = categories.items.filter(
                (item) => item.name !== "Phục vụ nhanh"
            );
            setListTpe([{id: "", name: "Tất cả"}, ...filtered]);
        }
    }, [categories]);


    useEffect(() => {
        runProductions({
            PageSize: 200,
            PageNumber: 1,
            CategoryName: type === 'Tất cả' ? "" : type
        });
    }, [type]);

    useEffect(() => {
        if (productions) {
            const filtered = productions.items.filter(
                (item) =>
                    item.productName !== "chén nước mắm" &&
                    item.productName !== "chén nước tương"
            );
            setListData(filtered);
        }
    }, [productions]);


    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Header Sticky */}
            <Header id={id} handeChangName={handeChangName}/>

            {/* Category List - Sticky, NO gap */}
            <div className="sticky top-[57px] bg-white z-40">
                <CategoryList category={listTpe} handleChange={handleChangeType}/>
            </div>

            {/* Main Content */}
            <main className="px-3 sm:px-4 py-3">
                {loadingProducts ? (
                    <Loading/>
                ) : filteredProductions?.length ? (
                    <ProductionsList products={filteredProductions}/>
                ) : (
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <p className="text-center text-gray-500 text-sm sm:text-base">
                            {name.trim() ? 'Không tìm thấy sản phẩm nào.' : 'Không có sản phẩm nào.'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}