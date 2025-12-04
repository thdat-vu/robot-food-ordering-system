import React, {useEffect, useState} from "react";
import {ProductionDetail, ProductToppingList, Topping} from "@/api/admin/adminApi";
import {
    useDeleteTopping,
    usePostFileExcelTopping,
    useProductionDetailApi,
    useProductToppingApi
} from "@/hooks/admin/useAdminHooks";
import {BaseEntityDataError} from "@/entites/BaseEntity";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Loader2, Trash2, Upload, X, Plus} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {ImportFile} from "@/components/admin/item/ImportFile";

type Props = {
    id: string;
    isOpen: boolean;
    isClosed: () => void;
}

export const ProductionDetailDialog: React.FC<Props> = ({isOpen, isClosed, id}) => {

    const [product, setProduct] = useState<ProductionDetail>();
    const [toppings, setToppings] = useState<Topping[]>([])
    const [loadingProduction, setLoadingProduction] = useState<boolean>(false)
    const [loadingTopping, setLoadingTopping] = useState<boolean>(false)
    const [toppingFile, setToppingFile] = useState<File | null>(null);
    const [importToppingModal, setImportToppingModal] = useState<boolean>(false);
    const [deleteProductAlert, setDeleteProductAlert] = useState<boolean>(false);
    const [deleteToppingAlert, setDeleteToppingAlert] = useState<boolean>(false);
    const [selectedToppingId, setSelectedToppingId] = useState<string>("");
    const [importing, setImporting] = useState<boolean>(false);

    const {run: runGetProductionDetail} = useProductionDetailApi();
    const {run: runGetAllProductTopping} = useProductToppingApi();
    const {run: runDeleteTopping} = useDeleteTopping();
    const {run: runPostFileExcelTopping} = usePostFileExcelTopping();

    const handleLoadingTopping = async () => {
        if (!id) return;

        try {
            setLoadingTopping(true)
            const res: BaseEntityDataError<ProductToppingList> = await runGetAllProductTopping(id);

            setToppings(res.data.toppings as Topping[])
        } finally {
            setLoadingTopping(false)
        }
    }

    const handleLoadingProductDetail = async () => {
        try {
            setLoadingProduction(true);
            const res: BaseEntityDataError<ProductionDetail> = await runGetProductionDetail(id);
            setProduct(res.data as ProductionDetail);
        } finally {
            setLoadingProduction(false);
        }
    }

    useEffect(() => {
        if (id && isOpen) {
            handleLoadingProductDetail();
            handleLoadingTopping();
        }
    }, [id, isOpen]);

    const handleImportTopping = async () => {
        if (!toppingFile) return;
        setImporting(true);
        try {

            await runPostFileExcelTopping(id, toppingFile);


            await handleLoadingTopping();
            setImportToppingModal(false);
            setToppingFile(null);
        } finally {
            setImporting(false);
        }
    };

    const handleDeleteProduct = async () => {
        try {

            setDeleteProductAlert(false);
            isClosed();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const handleDeleteTopping = async () => {
        try {
            await runDeleteTopping(selectedToppingId)
            await handleLoadingTopping();
            setDeleteToppingAlert(false);
            setSelectedToppingId("");
        } catch (error) {
            console.error("Error deleting topping:", error);
        }
    };

    const formatPrice = (price: number | string) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(Number(price));
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={isClosed}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi tiết món ăn</DialogTitle>
                        <DialogDescription>
                            Xem thông tin chi tiết và quản lý topping cho món ăn
                        </DialogDescription>
                    </DialogHeader>

                    {loadingProduction ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                        </div>
                    ) : product ? (
                        <div className="space-y-6">
                            {/* Product Info */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex gap-6">
                                        <img
                                            src={product.urlImg}
                                            alt={product.name}
                                            className="w-32 h-32 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-xl font-semibold">{product.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {product.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sizes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Kích cỡ & Giá</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {product.sizes.map((size) => (
                                            <div
                                                key={size.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <Badge variant="secondary">{size.sizeName}</Badge>
                                                <span className="font-semibold">
                                                    {formatPrice(size.price)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Toppings */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <CardTitle className="text-lg">Topping</CardTitle>
                                    <Button
                                        size="sm"
                                        onClick={() => setImportToppingModal(true)}
                                    >
                                        <Upload className="w-4 h-4 mr-2"/>
                                        Import Topping
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {loadingTopping ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/>
                                        </div>
                                    ) : toppings.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {toppings.map((topping) => (
                                                <div
                                                    key={topping.id}
                                                    className="flex items-center gap-3 p-3 border rounded-lg"
                                                >
                                                    <img
                                                        src={topping.imageUrl}
                                                        alt={topping.name}
                                                        className="w-12 h-12 rounded object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{topping.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatPrice(topping.price)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setSelectedToppingId(topping.id);
                                                            setDeleteToppingAlert(true);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive"/>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Chưa có topping nào
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            Không tìm thấy thông tin món ăn
                        </div>
                    )}

                    <DialogFooter className="flex flex-row gap-2 justify-between">
                        {/*<Button*/}
                        {/*    variant="destructive"*/}
                        {/*    onClick={() => setDeleteProductAlert(true)}*/}
                        {/*>*/}
                        {/*    <Trash2 className="w-4 h-4 mr-2"/>*/}
                        {/*    Xóa món ăn*/}
                        {/*</Button>*/}
                        <Button variant="outline" onClick={isClosed}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ImportFile open={importToppingModal}
                        conten="Chọn file Excel chứa danh sách topping để thêm vào món ăn"
                        loading={importing}
                        excelFile={toppingFile}
                        setExcelFile={setToppingFile}
                        isClose={() => setImportToppingModal(false)}
                        handle={handleImportTopping}/>


            <AlertDialog open={deleteProductAlert} onOpenChange={setDeleteProductAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa món ăn</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa món ăn "{product?.name}"? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProduct}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteToppingAlert} onOpenChange={setDeleteToppingAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa topping</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa topping này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTopping}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}