'use client';

import dynamic from 'next/dynamic';

const BattlePage = dynamic(() => import('@/components/BattlePage'), { ssr: false });

export default function Home() {
  return <BattlePage />;
}
