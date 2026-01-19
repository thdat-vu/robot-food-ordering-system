/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserInfo = {
  id?: string;
  fullName?: string;
  userName?: string;
  email?: string;
  roleName?: string;
  Role?: string;
  Name?: string;
};

const USER_STORAGE_KEYS = [
  'accessToken',
  'refreshToken',
  'refreshTokenExpired',
  'userInfo',
];

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 256 256"
    aria-hidden="true"
  >
    <g transform="scale(2.56 2.56)">
      <path d="M 45 0 C 20.147 0 0 20.147 0 45 c 0 24.853 20.147 45 45 45 s 45 -20.147 45 -45 C 90 20.147 69.853 0 45 0 z M 45 22.007 c 8.899 0 16.14 7.241 16.14 16.14 c 0 8.9 -7.241 16.14 -16.14 16.14 c -8.9 0 -16.14 -7.24 -16.14 -16.14 C 28.86 29.248 36.1 22.007 45 22.007 z M 45 83.843 c -11.135 0 -21.123 -4.885 -27.957 -12.623 c 3.177 -5.75 8.144 -10.476 14.05 -13.341 c 2.009 -0.974 4.354 -0.958 6.435 0.041 c 2.343 1.126 4.857 1.696 7.473 1.696 c 2.615 0 5.13 -0.571 7.473 -1.696 c 2.083 -1 4.428 -1.015 6.435 -0.041 c 5.906 2.864 10.872 7.591 14.049 13.341 C 66.123 78.957 56.135 83.843 45 83.843 z" />
    </g>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" aria-hidden="true">
    <g transform="scale(2.56 2.56)">
      <path d="M 63.854 49.825 c -0.007 -0.022 -0.021 -0.041 -0.028 -0.063 c -0.035 -0.102 -0.08 -0.201 -0.132 -0.297 c -0.02 -0.038 -0.037 -0.077 -0.06 -0.114 c -0.079 -0.126 -0.169 -0.247 -0.279 -0.357 L 36.047 21.685 c -3.574 -3.574 -9.39 -3.574 -12.964 0 l -1.398 1.398 c -3.574 3.574 -3.574 9.39 0 12.964 l 27.309 27.309 c 0.11 0.11 0.231 0.2 0.357 0.279 c 0.037 0.023 0.076 0.039 0.114 0.06 c 0.097 0.052 0.195 0.097 0.297 0.132 c 0.022 0.008 0.041 0.021 0.063 0.028 l 16.592 5.059 C 66.608 68.972 66.805 69 67 69 c 0.522 0 1.033 -0.205 1.414 -0.586 c 0.522 -0.522 0.715 -1.29 0.499 -1.997 L 63.854 49.825 z M 24.513 25.911 l 1.398 -1.398 c 2.016 -2.015 5.293 -2.014 7.308 0 l 25.895 25.895 l -8.705 8.705 L 24.513 33.219 C 22.499 31.204 22.499 27.926 24.513 25.911 z M 54.178 61 L 61 54.178 l 2.992 9.814 L 54.178 61 z" />
      <path d="M 45 0 C 20.187 0 0 20.187 0 45 c 0 24.813 20.187 45 45 45 c 24.813 0 45 -20.187 45 -45 C 90 20.187 69.813 0 45 0 z M 45 86 C 22.393 86 4 67.607 4 45 S 22.393 4 45 4 s 41 18.393 41 41 S 67.607 86 45 86 z" />
    </g>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" aria-hidden="true">
    <g transform="scale(2.56 2.56)">
      <path d="M 71.142 45.768 c 0.016 -0.038 0.023 -0.079 0.037 -0.118 c 0.029 -0.084 0.06 -0.166 0.077 -0.255 c 0.026 -0.129 0.04 -0.262 0.04 -0.395 s -0.014 -0.266 -0.04 -0.395 c -0.018 -0.088 -0.049 -0.171 -0.077 -0.255 c -0.014 -0.039 -0.021 -0.08 -0.037 -0.118 c -0.038 -0.091 -0.088 -0.176 -0.138 -0.259 c -0.016 -0.027 -0.028 -0.058 -0.046 -0.084 c -0.073 -0.109 -0.156 -0.211 -0.249 -0.303 L 60.605 33.482 c -0.781 -0.781 -2.047 -0.781 -2.828 0 c -0.781 0.781 -0.781 2.047 0 2.828 l 6.69 6.69 H 39.863 c -1.104 0 -2 0.896 -2 2 s 0.896 2 2 2 h 24.604 l -6.69 6.69 c -0.781 0.781 -0.781 2.047 0 2.828 c 0.391 0.391 0.902 0.586 1.414 0.586 s 1.023 -0.195 1.414 -0.586 l 10.103 -10.103 c 0.093 -0.092 0.176 -0.194 0.249 -0.303 c 0.018 -0.027 0.029 -0.057 0.046 -0.084 C 71.054 45.944 71.104 45.86 71.142 45.768 z" />
      <path d="M 49.887 55.336 c -1.104 0 -2 0.896 -2 2 v 6.602 H 26.704 V 26.062 h 21.183 v 6.602 c 0 1.104 0.896 2 2 2 s 2 -0.896 2 -2 v -8.602 c 0 -1.104 -0.896 -2 -2 -2 H 24.704 c -1.104 0 -2 0.896 -2 2 v 41.875 c 0 1.104 0.896 2 2 2 h 25.183 c 1.104 0 2 -0.896 2 -2 v -8.602 C 51.887 56.231 50.991 55.336 49.887 55.336 z" />
      <path d="M 45 0 C 20.187 0 0 20.187 0 45 c 0 24.813 20.187 45 45 45 c 24.813 0 45 -20.187 45 -45 C 90 20.187 69.813 0 45 0 z M 45 86 C 22.393 86 4 67.607 4 45 S 22.393 4 45 4 s 41 18.393 41 41 S 67.607 86 45 86 z" />
    </g>
  </svg>
);

type UserMenuProps = {
  onProfile?: () => void;
  profileHref?: string;
  className?: string;
};

export function UserMenu({ onProfile, profileHref = '/profile', className }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const router = useRouter();
  const roleLabel = (() => {
    const role = (userInfo?.Role || userInfo?.roleName || '').toString().toLowerCase();
    if (role === 'chef') return 'Chef Manager';
    if (role === 'waiter') return 'Waiter Manager';
    return userInfo?.Role || userInfo?.roleName || userInfo?.email || 'Account';
  })();
  const displayName = userInfo?.Name || userInfo?.fullName || userInfo?.userName || 'User';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('userInfo');
    if (raw) {
      try {
        setUserInfo(JSON.parse(raw));
      } catch {
        setUserInfo(null);
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      USER_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    }
    router.push('/login');
  };

  const handleProfile = () => {
    if (onProfile) {
      onProfile();
    } else {
      router.push(profileHref);
    }
    setOpen(false);
  };

  return (
    <div className={`relative ${className ?? ''}`}>
      <button
        aria-label="User menu"
        className="flex items-center gap-3 rounded-full border border-gray-300 bg-white px-3 py-2 shadow-sm hover:shadow-md transition min-h-[48px] min-w-[220px]"
        onClick={() => setOpen((prev) => !prev)}
      >
        <UserIcon />
        <div className="text-left text-sm leading-tight hidden sm:block w-full">
          <div className="font-semibold text-gray-900 truncate">Chào mừng trở lại, {displayName}</div>
          <div className="text-gray-500 text-xs truncate">{roleLabel}</div>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-900">{userInfo?.fullName || userInfo?.userName || 'User'}</div>
            {userInfo?.email && <div className="text-xs text-gray-500">{userInfo.email}</div>}
            {userInfo?.roleName && <div className="text-xs text-gray-500">{userInfo.roleName}</div>}
          </div>
          {/* <button
            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
            onClick={handleProfile}
          >
            <EditIcon />
            <span>Chỉnh sửa hồ sơ</span>
          </button> */}
          <button
            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-gray-50"
            onClick={handleLogout}
          >
            <LogoutIcon />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;

