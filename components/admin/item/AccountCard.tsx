import React from "react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Edit, Eye, Trash2} from "lucide-react";

export interface AccountCard {
    id: string;
    name: string;
    role: "chef" | "admin" | "waiter" | "moderator";
    phone: string;
    status: "active" | "inactive";
    joinDate: string;
}

type AccountCardProps = {
    account: AccountCard;
    getRoleBadgeColor: (role: string) => string;
    getRoleIcon: (role: string) => React.JSX.Element;
    handleEditAccount: (account: AccountCard) => void;
    handleDeleteAccount: (account: AccountCard) => void;

}
export const AccountCard: React.FC<AccountCardProps> = ({
                                                            account,
                                                            getRoleIcon,
                                                            getRoleBadgeColor,
                                                            handleEditAccount,
                                                            handleDeleteAccount
                                                        }: AccountCardProps) => {
    return (
        <>
            <tr
                key={account.id}
                className="hover:bg-muted/30 transition-colors"
            >
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {getRoleIcon(account.role)}
                        </div>
                        <div className="min-w-0">
                            <div className="font-medium text-foreground">
                                {account.name}
                            </div>
                            <div
                                className="text-sm text-muted-foreground sm:hidden">
                                {account.phone}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">
                    {account.phone}
                </td>
                <td className="p-4">
                    <Badge
                        className={getRoleBadgeColor(account.role)}
                    >
                        {account.role}
                    </Badge>
                </td>
                <td className="p-4 hidden md:table-cell">
                    <Badge
                        variant={
                            account.status === "active"
                                ? "default"
                                : "secondary"
                        }
                    >
                        {account.status === "active"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                    </Badge>
                </td>
                <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {new Date(account.joinDate).toLocaleDateString(
                        "vi-VN"
                    )}
                </td>
                <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                        >
                            <Eye className="w-4 h-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditAccount(account)}
                        >
                            <Edit className="w-4 h-4"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteAccount(account)}
                        >
                            <Trash2 className="w-4 h-4"/>
                        </Button>
                    </div>
                </td>
            </tr>
        </>
    )
}