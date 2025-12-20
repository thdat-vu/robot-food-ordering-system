import { authsApi } from "@/lib/api/auths";
import { AlertCircle, RefreshCw, Search, User, UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccountCard, AccountRow, normalizeRole } from "./item/AccountCard";

export default function AccountPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addAccountModal, setAddAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountRow | null>(
    null
  );
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [editAccountModal, setEditAccountModal] = useState(false);

  // Data state
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state (use lowercase to match API response)
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching users for page:", page);

        // API expects PageNumber (capitalized)
        const res = await authsApi.getAllUsers({
          PageNumber: page,
          PageSize: pageSize,
        });

        console.log("Full API Response:", res);
        console.log("res.data:", res?.data);

        // Handle different response structures
        // Could be res.data or res.data.data
        let payload = res?.items ?? res?.items;

        const items = payload;
        console.log("Items count:", items);

        const mapped: AccountRow[] = items.map((u: any) => ({
          id: u.employmentCode || u.email,
          name: u.fullName ?? "",
          role: normalizeRole(u.roleName),
          phone: u.phoneNumber ?? "",
          status: "active",
          joinDate: "",
          avatar: u.avatar,
          email: u.email,
          employmentCode: u.employmentCode,
        }));

        setAccounts(mapped);

        // API might return pageNumber (lowercase) or PageNumber (uppercase)
        const currentPage = payload.pageNumber ?? payload.PageNumber ?? page;
        const totPages = payload.totalPages ?? payload.TotalPages ?? 0;
        const totCount = payload.totalCount ?? payload.TotalCount ?? 0;
        const prevPage = Boolean(
          payload.hasPreviousPage ?? payload.HasPreviousPage
        );
        const nextPage = Boolean(payload.hasNextPage ?? payload.HasNextPage);

        console.log("Pagination info:", {
          currentPage,
          totPages,
          totCount,
          prevPage,
          nextPage,
        });

        setPageNumber(currentPage);
        setTotalPages(totPages);
        setTotalCount(totCount);
        setHasPrev(prevPage);
        setHasNext(nextPage);

        console.log("Successfully loaded accounts");
      } catch (e: any) {
        setAccounts([]);
        console.error("Fetch users error:", e);
        console.error("Error details:", {
          message: e?.message,
          response: e?.response,
          responseData: e?.response?.data,
        });

        setError(
          e?.response?.data?.message ??
            e?.message ??
            "Không tải được danh sách tài khoản"
        );
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Search filter
  const filteredAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q)
    );
  }, [accounts, searchQuery]);

  // Form state
  const [addAccountForm, setAddAccountForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "waiter",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
  });

  // Actions
  const handleEditAccount = (account: AccountRow) => {
    setSelectedAccount(account);
    setEditFormData({
      name: account.name,
      phone: account.phone,
      email: account.email || "",
      role: account.role,
    });
    setEditAccountModal(true);
  };

  const handleDeleteAccount = (account: AccountRow) => {
    setSelectedAccount(account);
    setDeleteAccountModal(true);
  };

  const handleCreateAccount = async () => {
    console.log("Creating account:", addAccountForm);
    setAddAccountModal(false);
    setAddAccountForm({ name: "", phone: "", email: "", role: "waiter" });
    await fetchUsers(pageNumber);
  };

  const handleSaveEdit = async () => {
    console.log("Saving account:", editFormData);
    setEditAccountModal(false);
    await fetchUsers(pageNumber);
  };

  const handleConfirmDelete = async () => {
    console.log("Deleting account:", selectedAccount);
    setDeleteAccountModal(false);
    await fetchUsers(pageNumber);
  };

  const handlePrevPage = () => {
    if (hasPrev) {
      fetchUsers(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      fetchUsers(pageNumber + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Tài Khoản
          </h1>
          <p className="text-gray-600">
            Quản lý nhân viên và phân quyền trong hệ thống
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => fetchUsers(pageNumber)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setAddAccountModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Thêm Tài Khoản
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách tài khoản...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Lỗi tải dữ liệu</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => fetchUsers(pageNumber)}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Account List */}
        {!loading && !error && (
          <>
            <div className="space-y-3 mb-6">
              {filteredAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onEdit={() => handleEditAccount(account)}
                  onDelete={() => handleDeleteAccount(account)}
                />
              ))}
            </div>

            {filteredAccounts.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Không có tài khoản nào phù hợp.</p>
              </div>
            )}

            {/* Pagination */}
            {totalCount > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Hiển thị {(pageNumber - 1) * pageSize + 1} -{" "}
                  {Math.min(pageNumber * pageSize, totalCount)} trong tổng số{" "}
                  {totalCount} tài khoản
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={!hasPrev}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <div className="text-sm text-gray-600">
                    Trang {pageNumber} / {totalPages}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={!hasNext}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add Account Modal */}
        {addAccountModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Thêm Tài Khoản Mới
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Tạo tài khoản mới cho nhân viên nhà hàng
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập họ và tên"
                    value={addAccountForm.name}
                    onChange={(e) =>
                      setAddAccountForm({
                        ...addAccountForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com"
                    value={addAccountForm.email}
                    onChange={(e) =>
                      setAddAccountForm({
                        ...addAccountForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+84 123 456 789"
                    value={addAccountForm.phone}
                    onChange={(e) =>
                      setAddAccountForm({
                        ...addAccountForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={addAccountForm.role}
                    onChange={(e) =>
                      setAddAccountForm({
                        ...addAccountForm,
                        role: e.target.value,
                      })
                    }
                  >
                    <option value="chef">Bếp trưởng</option>
                    <option value="waiter">Phục vụ</option>
                    <option value="moderator">Kiểm duyệt</option>
                    <option value="admin">Quản trị</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setAddAccountModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateAccount}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Account Modal */}
        {editAccountModal && selectedAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Chỉnh Sửa Tài Khoản
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Cập nhật thông tin tài khoản của {selectedAccount.name}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value })
                    }
                  >
                    <option value="chef">Bếp trưởng</option>
                    <option value="waiter">Phục vụ</option>
                    <option value="moderator">Kiểm duyệt</option>
                    <option value="admin">Quản trị</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditAccountModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteAccountModal && selectedAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Xác Nhận Xóa
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa tài khoản của{" "}
                <strong>{selectedAccount.name}</strong>? Hành động này không thể
                hoàn tác.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteAccountModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa Tài Khoản
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
