import React, {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Clock, Edit, Eye, MoreVertical} from "lucide-react";
import {Button} from "@/components/ui/button";
import {MdDelete} from "react-icons/md";
import {Production} from "@/api/admin/adminApi";
import {ProductionDetailDialog} from "@/components/admin/ProductionDetailDialog";

type Props = {
    dish: Production
}

export const DishCard: React.FC<Props> = ({dish}: Props) => {

    const [open, setOpen] = useState<boolean>(false);

    return (
        <>
            <Card
                key={dish.id}
                className="hover:shadow-md transition-shadow"
            >
                <CardContent className="p-4">
                    <div
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <h3 className="font-semibold text-foreground text-lg">
                                        {dish.productName}
                                    </h3>
                                    {/*<p className="text-sm text-muted-foreground">*/}
                                    {/*    {dish.category}*/}
                                    {/*</p>*/}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div
                                    className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="w-4 h-4"/>
                                    {dish.durationTime}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-transparent"
                                onClick={() => setOpen(true)}
                            >
                                <Eye className="w-4 h-4"/>
                                <span className="hidden sm:inline">Xem</span>
                            </Button>
                            {/*<Button*/}
                            {/*    variant="outline"*/}
                            {/*    size="sm"*/}
                            {/*    className="gap-2 bg-transparent"*/}
                            {/*>*/}
                            {/*    <MdDelete className="w-4 h-4"/>*/}
                            {/*    <span className="hidden sm:inline">Xóa</span>*/}
                            {/*</Button>*/}
                            {/*<Button*/}
                            {/*    variant="ghost"*/}
                            {/*    size="icon"*/}
                            {/*    className="h-9 w-9"*/}
                            {/*>*/}
                            {/*    <MoreVertical className="w-4 h-4"/>*/}
                            {/*</Button>*/}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <ProductionDetailDialog id={dish.id} isOpen={open} isClosed={() => setOpen(false)}/>
        </>
    )
}