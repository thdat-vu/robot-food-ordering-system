// Custom Router Utility for Next.js App Router
// This utility wraps Next.js navigation primitives and is ready for future

'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useCustomRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Example: Add custom navigation logic here (guards, analytics, etc.)
  function push(path: string) {
    // Add custom logic before navigation if needed
    router.push(path);
  }

  function replace(path: string) {
    // Add custom logic before navigation if needed
    router.replace(path);
  }

  function back() {
    router.back();
  }

  return {
    push,
    replace,
    back,
    pathname,
    searchParams,
    // Expose more router methods as needed
  };
} 