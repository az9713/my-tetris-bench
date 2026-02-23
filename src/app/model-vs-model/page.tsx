'use client';

import dynamic from 'next/dynamic';

const ModelVsModelPage = dynamic(() => import('@/components/ModelVsModelPage'), { ssr: false });

export default function Page() {
  return <ModelVsModelPage />;
}
