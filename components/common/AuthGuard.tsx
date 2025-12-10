'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Props = {
  allowRoles: string[];
  children: ReactNode;
};

export default function AuthGuard({ allowRoles, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const refreshTokenExpired = localStorage.getItem('refreshTokenExpired');
    const raw = localStorage.getItem('userInfo');
    if (!raw || !accessToken || !refreshToken || !refreshTokenExpired) {
      router.replace('/login');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      const role = parsed?.Role ?? parsed?.role;
      const expiresAt = (() => {
        // accept numeric timestamp or date string
        const n = Number(refreshTokenExpired);
        if (!Number.isNaN(n) && n > 0) return new Date(n);
        const d = new Date(refreshTokenExpired);
        return isNaN(d.getTime()) ? null : d;
      })();

      if (!expiresAt || expiresAt.getTime() <= Date.now()) {
        router.replace('/login');
        return;
      }

      if (!role || !allowRoles.map((r) => r.toLowerCase()).includes(String(role).toLowerCase())) {
        router.replace('/login');
        return;
      }
      setAuthorized(true);
    } catch {
      router.replace('/login');
    }
  }, [allowRoles, router, pathname]);

  if (!authorized) return null;
  return <>{children}</>;
}
