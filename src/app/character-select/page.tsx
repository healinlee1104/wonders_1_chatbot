'use client';

import dynamic from 'next/dynamic';

const CharacterSelection = dynamic(
  () => import('@/components/marketing/character-selection'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">AI 선배들을 준비 중입니다...</p>
        </div>
      </div>
    )
  }
);

export default function CharacterSelectPage() {
  return <CharacterSelection />;
} 