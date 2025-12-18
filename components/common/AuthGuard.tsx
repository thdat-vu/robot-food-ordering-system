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
        
        // Parse DD/MM/YYYY HH:mm:ss format (e.g., "13/12/2026 10:06:47")
        const ddmmyyyyMatch = refreshTokenExpired.match(
          /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/
        );
        if (ddmmyyyyMatch) {
          const [, day, month, year, hours, minutes, seconds] = ddmmyyyyMatch;
          return new Date(
            parseInt(year, 10),
            parseInt(month, 10) - 1, // Month is 0-indexed
            parseInt(day, 10),
            parseInt(hours, 10),
            parseInt(minutes, 10),
            parseInt(seconds, 10)
          );
        }
        
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
