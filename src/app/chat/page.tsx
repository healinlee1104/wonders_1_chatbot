'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ChatInterface = dynamic(
  () => import('@/components/dashboard/chat-interface'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">채팅을 준비 중입니다...</p>
        </div>
      </div>
    )
  }
);

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 로딩 중입니다...</p>
        </div>
      </div>
    }>
      <ChatInterface />
    </Suspense>
  );
} 