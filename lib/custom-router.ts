// Custom Router Utility for Next.js App Router
// This utility wraps Next.js navigation primitives and is ready for future

'use client';

import { useRouter, usePathname } from 'next/navigation';

export function useCustomRouter() {
  const router = useRouter();
  const pathname = usePathname();

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
    // Note: searchParams removed to avoid Suspense boundary requirement
    // Add back when needed with proper Suspense wrapping
  };
} 