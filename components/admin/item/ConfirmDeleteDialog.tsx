"use client";
import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";

type Props = {
    open: boolean;
    tableName: string;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export const ConfirmDeleteDialog: React.FC<Props> = ({
                                                         open,
                                                         tableName,
                                                         loading,
                                                         onClose,
                                                         onConfirm
                                                     }) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Xác nhận xoá bàn</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xoá bàn <b>{tableName}</b>?
                        Thao tác này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>

                    <Button
                        variant="destructive"
                        disabled={loading}
                        onClick={onConfirm}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                Đang xoá...
                            </>
                        ) : (
                            "Xoá"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
