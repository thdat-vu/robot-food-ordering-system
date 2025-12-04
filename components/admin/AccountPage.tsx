import React, {useCallback, useState} from "react";
import {ChefHat, Edit, Eye, Search, Shield, Trash2, User, UserPlus} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {AccountCard} from "@/components/admin/item/AccountCard";


const accounts: AccountCard[] = [
    {
        id: "1",
        name: "John Smith",
        role: "chef",
        phone: "+84 123 456 789",
        status: "active",
        joinDate: "2024-01-15",
    },
    {
        id: "2",
        name: "Sarah Johnson",
        role: "waiter",
        phone: "+84 987 654 321",
        status: "active",
        joinDate: "2024-02-20",
    },
    {
        id: "3",
        name: "Mike Wilson",
        role: "moderator",
        phone: "+84 555 123 456",
        status: "active",
        joinDate: "2024-03-10",
    },
    {
        id: "4",
        name: "Emily Brown",
        role: "chef",
        phone: "+84 444 789 012",
        status: "inactive",
        joinDate: "2023-12-05",
    },
    {
        id: "5",
        name: "David Lee",
        role: "waiter",
        phone: "+84 333 456 789",
        status: "active",
        joinDate: "2024-01-25",
    },
];
export const AccountPage: React.FC = () => {

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [addAccountModal, setAddAccountModal] = useState<boolean>(false);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [deleteAccountModal, setDeleteAccountModal] = useState<boolean>(false);
    const [editAccountModal, setEditAccountModal] = useState<boolean>(false);


    const getRoleIcon = useCallback((role: string) => {
        switch (role) {
            case "chef":
                return <ChefHat className="w-4 h-4"/>;
            case "moderator":
                return <Shield className="w-4 h-4"/>;
            default:
                return <User className="w-4 h-4"/>;
        }
    }, []);

    const getRoleBadgeColor = useCallback((role: string) => {
        switch (role) {
            case "chef":
                return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            case "waiter":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "moderator":
                return "bg-purple-500/10 text-purple-500 border-purple-500/20";
            default:
                return "bg-muted text-muted-foreground";
        }
    }, []);

    const [addAccountForm, setAddAccountForm] = useState({
        name: "",
        phone: "",
        role: "waiter",
        status: "active",
    });

    const [editFormData, setEditFormData] = useState({
        name: "",
        phone: "",
        role: "",
        status: "",
    });

    const handleEditAccount = (account: any) => {
        setSelectedAccount(account);
        setEditFormData({
            name: account.name,
            phone: account.phone,
            role: account.role,
            status: account.status,
        });
        setEditAccountModal(true);
    };

    const handleDeleteAccount = (account: any) => {
        setSelectedAccount(account);
        setDeleteAccountModal(true);
    };

    const handleCreateAccount = () => {
        console.log("[v0] Creating new account:", addAccountForm);
        // TODO: Implement actual create logic
        setAddAccountModal(false);
        // Reset form
        setAddAccountForm({
            name: "",
            phone: "",
            role: "waiter",
            status: "active",
        });
    };

    const handleSaveEdit = () => {
        console.log("[v0] Saving account:", editFormData);
        // TODO: Implement actual save logic
        setEditAccountModal(false);
    };


    const handleConfirmDelete = () => {
        console.log("[v0] Deleting account:", selectedAccount);
        // TODO: Implement actual delete logic
        setDeleteAccountModal(false);
    };


    return (
        <>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                        <Input
                            placeholder="Tìm theo tên, số điện thoại hoặc vai trò..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>


                    <Button
                        className="gap-2"
                        onClick={() => setAddAccountModal(true)}
                    >
                        <UserPlus className="w-4 h-4"/>
                        Thêm Tài Khoản
                    </Button>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Người Dùng
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                                    Liên Hệ
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                                    Vai Trò
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                                    Trạng Thái
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                                    Ngày Tham Gia
                                </th>
                                <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                                    Thao Tác
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                            {accounts.map((account) => (
                                <AccountCard key={account.id} account={account}
                                             getRoleBadgeColor={getRoleBadgeColor}
                                             getRoleIcon={getRoleIcon}
                                             handleDeleteAccount={handleDeleteAccount}
                                             handleEditAccount={handleEditAccount}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>Hiển thị 5 trong 24 tài khoản</div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>
                            Trước
                        </Button>
                        <Button variant="outline" size="sm">
                            Sau
                        </Button>
                    </div>
                </div>
            </div>


            <Dialog open={addAccountModal} onOpenChange={setAddAccountModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Thêm Tài Khoản Mới</DialogTitle>
                        <DialogDescription>
                            Tạo tài khoản mới cho nhân viên nhà hàng
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-name">Họ và tên *</Label>
                            <Input
                                id="add-name"
                                value={addAccountForm.name}
                                onChange={(e) =>
                                    setAddAccountForm({...addAccountForm, name: e.target.value})
                                }
                                placeholder="Nhập họ và tên"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-phone">Số điện thoại *</Label>
                            <Input
                                id="add-phone"
                                value={addAccountForm.phone}
                                onChange={(e) =>
                                    setAddAccountForm({
                                        ...addAccountForm,
                                        phone: e.target.value,
                                    })
                                }
                                placeholder="+84 123 456 789"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-role">Vai trò *</Label>
                            <Select
                                value={addAccountForm.role}
                                onValueChange={(value) =>
                                    setAddAccountForm({...addAccountForm, role: value})
                                }
                            >
                                <SelectTrigger id="add-role">
                                    <SelectValue placeholder="Chọn vai trò"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="chef">Bếp trưởng</SelectItem>
                                    <SelectItem value="waiter">Phục vụ</SelectItem>
                                    <SelectItem value="moderator">Kiểm duyệt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-status">Trạng thái</Label>
                            <Select
                                value={addAccountForm.status}
                                onValueChange={(value) =>
                                    setAddAccountForm({...addAccountForm, status: value})
                                }
                            >
                                <SelectTrigger id="add-status">
                                    <SelectValue placeholder="Chọn trạng thái"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Hoạt động</SelectItem>
                                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddAccountModal(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleCreateAccount}>Tạo Tài Khoản</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <Dialog open={editAccountModal} onOpenChange={setEditAccountModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh Sửa Tài Khoản</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin tài khoản của {selectedAccount?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Họ và tên</Label>
                            <Input
                                id="edit-name"
                                value={editFormData.name}
                                onChange={(e) =>
                                    setEditFormData({...editFormData, name: e.target.value})
                                }
                                placeholder="Nhập họ và tên"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-phone">Số điện thoại</Label>
                            <Input
                                id="edit-phone"
                                value={editFormData.phone}
                                onChange={(e) =>
                                    setEditFormData({...editFormData, phone: e.target.value})
                                }
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Vai trò</Label>
                            <Select
                                value={editFormData.role}
                                onValueChange={(value) =>
                                    setEditFormData({...editFormData, role: value})
                                }
                            >
                                <SelectTrigger id="edit-role">
                                    <SelectValue placeholder="Chọn vai trò"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="chef">Bếp trưởng</SelectItem>
                                    <SelectItem value="waiter">Phục vụ</SelectItem>
                                    <SelectItem value="moderator">Kiểm duyệt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-status">Trạng thái</Label>
                            <Select
                                value={editFormData.status}
                                onValueChange={(value) =>
                                    setEditFormData({...editFormData, status: value})
                                }
                            >
                                <SelectTrigger id="edit-status">
                                    <SelectValue placeholder="Chọn trạng thái"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Hoạt động</SelectItem>
                                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditAccountModal(false)}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleSaveEdit}>Lưu Thay Đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <Dialog open={deleteAccountModal} onOpenChange={setDeleteAccountModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác Nhận Xóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa tài khoản của{" "}
                            <span className="font-semibold text-foreground">
                                {selectedAccount?.name}
                              </span>
                            ? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteAccountModal(false)}
                        >
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            Xóa Tài Khoản
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}