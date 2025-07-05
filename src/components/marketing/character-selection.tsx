'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
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
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const router = useRouter();
  const characters: Character[] = charactersData;

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const handleStartChat = () => {
    if (selectedCharacter) {
      router.push(`/chat?character=${selectedCharacter}`);
    }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {characters.map((character) => (
            <Card
              key={character.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedCharacter === character.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleCharacterSelect(character.id)}
            >
              <CardHeader className="text-center">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${character.color} flex items-center justify-center mx-auto mb-4 overflow-hidden`}>
                  {character.avatar.startsWith('/images/') ? (
                    <img 
                      src={character.avatar} 
                      alt={character.name}
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

        <div className="text-center">
          <Button
            onClick={handleStartChat}
            disabled={!selectedCharacter}
            className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedCharacter ? '대화 시작하기' : '캐릭터를 선택해주세요'}
          </Button>
        </div>
      </div>
    </div>
  );
} 