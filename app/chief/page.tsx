'use client';
import { useCustomRouter } from '@/lib/custom-router';

export default function ChiefPage() {
  const router = useCustomRouter();

  return <div>
    <h1>Chief Main Screen - Coming Soon</h1>
    <button onClick={() => router.push('/')}>Go to Home</button>
  </div>;
} 