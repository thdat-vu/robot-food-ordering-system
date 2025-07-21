'use client';
import { useCustomRouter } from '@/lib/custom-router';

export default function ChiefPage() {
  const router = useCustomRouter();

  return <div>
    <h1>Chief Main Screen - Coming Soon</h1>
    <button class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={() => router.push('/')}>Go to Home</button>
  </div>;
} 