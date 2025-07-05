'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import charactersData from '../../../content/characters.json';

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  specialties: string[];
  avatar: string;
  emoji: string;
  color: string;
}

export default function CharacterSelection() {
  const router = useRouter();
  const characters: Character[] = charactersData;

  const handleCharacterClick = (characterId: string) => {
    router.push(`/chat?character=${characterId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 선배와 대화하기
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            당신의 대학생활을 도와줄 AI 선배를 선택해보세요. 각각 다른 성격과 전문 분야를 가지고 있어요!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {characters.map((character) => (
            <Card
              key={character.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-md hover:scale-105 transform"
              onClick={() => handleCharacterClick(character.id)}
            >
              <CardHeader className="text-center">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${character.color} flex items-center justify-center mx-auto mb-4 overflow-hidden`}>
                  {character.avatar.startsWith('/images/') ? (
                    <Image
                      src={character.avatar}
                      alt={character.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 이미지 로딩 실패 시 이모지로 대체
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <span className="text-3xl">{character.avatar}</span>
                  )}
                  <span className={`text-3xl ${character.avatar.startsWith('/images/') ? 'hidden' : ''}`}>
                    {character.emoji}
                  </span>
                </div>
                <CardTitle className="text-xl">{character.name}</CardTitle>
                <CardDescription>{character.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">전문 분야:</h4>
                    <div className="flex flex-wrap gap-2">
                      {character.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">성격:</h4>
                    <p className="text-sm text-gray-600">{character.personality}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            캐릭터를 클릭하면 바로 대화를 시작할 수 있어요!
          </p>
        </div>
      </div>
    </div>
  );
} 