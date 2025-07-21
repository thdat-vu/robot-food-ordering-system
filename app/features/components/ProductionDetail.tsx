'use client'
import Button from "@/components/common/Button";
import {useState} from "react";
import {Star} from "lucide-react";
import {IoIosArrowBack} from "react-icons/io";
import {useRouter} from "next/navigation";


interface Size {
    id: string;
    size: 'S' | 'M' | 'L'
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
        url: "https://cdn.tgdd.vn/Files/2021/03/29/1338675/4-cach-lam-nuoc-chanh-ngon-mieng-giai-nhiet-cuc-tot-202203281346563401.jpg",
        name: "Nước Chanh",
        price: "20000",
        rating: "4.8",
        des: "Giải khát, thanh lọc cơ thể.",
        seze: [
            {id: '1', size: "S", price: "15000"},
            {id: '2', size: "M", price: "20000"},
            {id: '3', size: "L", price: "25000"},
        ],
    },
    {
        id: '2',
        url: "https://cdn.tgdd.vn/2020/11/CookProduct/nuoc-cam-800x450.jpg",
        name: "Nước Cam",
        price: "25000",
        rating: "4.7",
        des: "Bổ sung vitamin C, tăng sức đề kháng.",
        seze: [
            {id: '4', size: "S", price: "20000"},
            {id: '5', size: "M", price: "25000"},
            {id: '6', size: "L", price: "30000"},
        ],
    },
    {
        id: '3',
        url: "https://cdn.tgdd.vn/Files/2022/01/10/1409844/cach-lam-tra-dao-cuc-ngon-giai-nhiet-mua-he-202201101137327321.jpg",
        name: "Trà Đào",
        price: "30000",
        rating: "4.6",
        des: "Thơm ngon, vị đào mát lạnh.",
        seze: [
            {id: '7', size: "S", price: "25000"},
            {id: '8', size: "M", price: "30000"},
            {id: '9', size: "L", price: "35000"},
        ],
    },
    {
        id: '4',
        url: "https://cdn.tgdd.vn/Files/2021/06/09/1361806/cach-lam-tra-tac-ngon-don-gian-giai-nhiet-mua-he-202206090055150369.jpg",
        name: "Trà Tắc",
        price: "15000",
        rating: "4.4",
        des: "Mát lạnh, vị chua nhẹ, dễ uống.",
        seze: [
            {id: '10', size: "S", price: "10000"},
            {id: '11', size: "M", price: "15000"},
            {id: '12', size: "L", price: "20000"},
        ],
    },
    {
        id: '5',
        url: "https://cdn.tgdd.vn/Files/2020/07/02/1267140/cach-lam-nuoc-ep-co-rot-ngon-202006301055554543.jpg",
        name: "Nước Ép Cà Rốt",
        price: "25000",
        rating: "4.5",
        des: "Tốt cho mắt, đẹp da.",
        seze: [
            {id: '13', size: "S", price: "20000"},
            {id: '14', size: "M", price: "25000"},
            {id: '15', size: "L", price: "30000"},
        ],
    },
    {
        id: '6',
        url: "https://cdn.tgdd.vn/Files/2021/06/09/1361817/tra-sua-la-gi-co-hai-cho-suc-khoe-khong-202206090056120719.jpg",
        name: "Trà Sữa",
        price: "35000",
        rating: "4.9",
        des: "Ngọt ngào, béo ngậy, thêm topping tùy chọn.",
        seze: [
            {id: '16', size: "S", price: "30000"},
            {id: '17', size: "M", price: "35000"},
            {id: '18', size: "L", price: "40000"},
        ],
    },
    {
        id: '7',
        url: "https://cdn.tgdd.vn/2021/08/content/tra-xanh-matcha-800x450.jpg",
        name: "Trà Xanh Matcha",
        price: "40000",
        rating: "4.6",
        des: "Đậm vị matcha, nhiều năng lượng.",
        seze: [
            {id: '19', size: "S", price: "35000"},
            {id: '20', size: "M", price: "40000"},
            {id: '21', size: "L", price: "45000"},
        ],
    },
    {
        id: '8',
        url: "https://cdn.tgdd.vn/Files/2021/06/01/1358073/cach-lam-sinh-to-bo-thom-ngon-bo-duong-cho-ca-nha-202201201552079687.jpg",
        name: "Sinh Tố Bơ",
        price: "35000",
        rating: "4.8",
        des: "Béo ngậy, nhiều dinh dưỡng.",
        seze: [
            {id: '22', size: "S", price: "30000"},
            {id: '23', size: "M", price: "35000"},
            {id: '24', size: "L", price: "40000"},
        ],
    },
    {
        id: '9',
        url: "https://cdn.tgdd.vn/Files/2020/07/07/1269179/cach-lam-nuoc-ep-dua-hau-ngon-202007070853246864.jpg",
        name: "Nước Ép Dưa Hấu",
        price: "20000",
        rating: "4.3",
        des: "Mát lạnh, ngọt tự nhiên.",
        seze: [
            {id: '25', size: "S", price: "15000"},
            {id: '26', size: "M", price: "20000"},
            {id: '27', size: "L", price: "25000"},
        ],
    },
    {
        id: '10',
        url: "https://cdn.tgdd.vn/Files/2022/06/02/1436447/cach-lam-nuoc-ep-coi-dua-thom-ngon-giai-nhiet-cho-mua-he-202206021307222146.jpg",
        name: "Nước Dừa",
        price: "20000",
        rating: "4.7",
        des: "Tươi mát, bổ dưỡng, tốt cho tiêu hóa.",
        seze: [
            {id: '28', size: "S", price: "15000"},
            {id: '29', size: "M", price: "20000"},
            {id: '30', size: "L", price: "25000"},
        ],
    },
];

export default function ProductionDetailPage({id}: { id: string }) {
    const router = useRouter();
    const [selectedSize, setSelectedSize] = useState<string>('S');


    const data: Production | undefined = Productions.find(value => value.id === id);


    return (
        <>{
            data && (
                <div className="mx-auto bg-white h-full w-full">
                    <img src={data.url} rel="img"/>
                    <button className="btn-circle mb-4 ml-4 items-center "
                            onClick={() => {
                                router.back()
                            }}
                    >
                        <IoIosArrowBack className="text-black text-4xl "/>
                    </button>
                    <div className="p-6 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
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

                            <Button
                                className="btn btn-accent px-6 py-2 bg-green-600 transition-all duration-300 ease-in-out
                                transform rounded-full font-medium active:scale-110 "
                                content="Thêm topping"
                                handle={() => {
                                    router.push(`/productions/topping/${id}`)
                                }}/>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{data.name}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {data.des}
                            </p>
                        </div>

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
                                            <div className="font-medium">{value.size} : {value.price}</div>
                                        </button>
                                    ))
                                }

                            </div>
                        </div>

                        <div className="flex justify-center items-center ">
                            <Button
                                content="Gọi món ngay"
                                handle={() => {
                                    router.push(`/productions/order/${id}`);
                                }}
                                className="bg-green-600 w-80 sm:w-96 transition-all duration-300 ease-in-out
                                         transform hover:scale-105 rounded-3xl active:scale-110
                                         px-8 py-4 text-lg"
                            />
                        </div>

                    </div>
                </div>
            )
        }
        </>
    )
}