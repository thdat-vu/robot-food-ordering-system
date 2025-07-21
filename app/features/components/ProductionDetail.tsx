'use client'
import Button from "@/components/common/Button";
import {useState} from "react";
import {Star} from "lucide-react";

interface Size {
    id: string;
    size: "S" | "M" | "L"
    price: string
}

interface Production {
    id: string;
    url: string,
    name: string;
    price: string;
    rating: string;
    des: string;
    seze: Size[];
}


const Productions: Production[] = [
    {
        id: '1',
        url: "https://s3.remagan.com/pro.remagan.uploads/product/2023/11/lime-juice-nuoc-da-chanh-20231125111848_656175a86c75f.webp",
        name: "T-Shirt Trơn",
        price: "150000",
        rating: "4.5",
        des: "Áo thun cotton mềm mại, thoáng mát.",
        seze: [
            {id: '1', size: "S", price: "140000"},
            {id: '2', size: "M", price: "150000"},
            {id: '3', size: "L", price: "160000"},
        ],
    },
    {
        id: '2',
        url: "https://s3.remagan.com/pro.remagan.uploads/product/2023/11/lime-juice-nuoc-da-chanh-20231125111848_656175a86c75f.webp",
        name: "T-Shirt Trơn",
        price: "150000",
        rating: "4.5",
        des: "Áo thun cotton mềm mại, thoáng mát.",
        seze: [
            {id: '4', size: "S", price: "140000"},
            {id: '5', size: "M", price: "150000"},
            {id: '6', size: "L", price: "160000"},
        ],
    },
    {
        id: '3',
        url: "https://s3.remagan.com/pro.remagan.uploads/product/2023/11/lime-juice-nuoc-da-chanh-20231125111848_656175a86c75f.webp",
        name: "T-Shirt Trơn",
        price: "150000",
        rating: "4.5",
        des: "Áo thun cotton mềm mại, thoáng mát.",
        seze: [
            {id: '7', size: "S", price: "140000"},
            {id: '8', size: "M", price: "150000"},
            {id: '9', size: "L", price: "160000"},
        ],
    }
]

export default function ProductionDetailPage({id}: { id: string }) {
    const [selectedSize, setSelectedSize] = useState<string>('S');

    const data: Production | undefined = Productions.find(value => value.id === id);

    return (
        <>{
            data && (
                <div className="max-w-sm mx-auto bg-white min-h-screen">
                    <div className="p-6 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">Matcha</h1>
                            <div className="flex items-center gap-1">
                                <Star className="w-5 h-5 fill-green-500 text-green-500"/>
                                <span className="text-gray-700 font-medium">4.6 (1,250)</span>
                            </div>
                        </div>

                        <p className="text-gray-600 text-lg mb-6">With Chocolate</p>

                        <div className="flex items-center justify-between mb-6">
                            <div className="text-3xl font-bold text-green-600">
                                ₫ {data.price}
                            </div>
                            <button className="bg-green-500 text-white px-6 py-2 rounded-full font-medium">
                                Thêm topping
                            </button>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{data.name}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {data.des}
                            </p>
                        </div>

                        {/* Size Selection */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Size</h3>
                            <div className="flex gap-4">
                                {
                                    data.seze.map(value => (
                                        <button
                                            key={value.id}
                                            onClick={() => setSelectedSize(value.size)}
                                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                                                selectedSize === value.size
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-200 bg-white text-gray-700'
                                            }`}
                                        >
                                            <div className="font-medium">{value.size}: {value.price}</div>
                                        </button>
                                    ))
                                }

                            </div>
                        </div>

                        <Button
                            content="Gọi món ngay"
                            handle={() => {
                            }}
                            className="btn btn-accent w-80 sm:w-96 transition-all duration-300 ease-in-out
                                         transform hover:scale-105 hover:rounded-3xl active:scale-110
                                         px-8 py-4 text-lg"
                        />
                    </div>
                </div>
            )
        }
        </>
    )
}