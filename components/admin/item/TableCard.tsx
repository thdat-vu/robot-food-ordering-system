import React, {useState} from "react";
import {Table} from "@/api/admin/adminApi";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {MdDelete} from "react-icons/md";
import {ConfirmDeleteDialog} from "@/components/admin/item/ConfirmDeleteDialog";


type Props = {
    table: Table;
    handle: (id: string) => void;
};

export const TableCard: React.FC<Props> = ({table, handle}) => {

    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const [selected, setSelected] = useState<Table | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const statusColor = {
        available: "bg-green-500/15 text-green-600 border-green-300",
        busy: "bg-orange-500/15 text-orange-600 border-orange-300",
        disabled: "bg-red-500/15 text-red-600 border-red-300",
    } as const;

    return (
        <>
            <Card className="hover:shadow-md transition-all cursor-pointer border rounded-xl">
                <CardContent className="p-4 flex flex-col gap-2">

                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{table.name}</h3>

                        <Badge
                            variant="outline"
                            className={
                                statusColor[
                                (table.status.toLowerCase() as keyof typeof statusColor)
                                ?? "available"
                                    ]
                            }
                        >
                            {table.status}
                        </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        ID: {table.id}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 bg-transparent"
                            onClick={() => handle(table.id)}
                        >
                            <MdDelete className="w-4 h-4"/>
                            <span className="hidden sm:inline">Xóa</span>
                        </Button>
                    </div>

                </CardContent>
            </Card>

            <ConfirmDeleteDialog
                open={openDelete}
                tableName={selected?.name ?? ""}
                loading={loading}
                onClose={() => setOpenDelete(false)}
                onConfirm={() => handle(table.id)}
            />

        </>
    );
};
