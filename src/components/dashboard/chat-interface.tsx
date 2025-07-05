'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, BookOpen, Calendar, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import charactersData from '../../../content/characters.json';
import type { Character } from '@/components/marketing/character-selection';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'academic' | 'library';
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const characters: Character[] = charactersData;

  useEffect(() => {
    const characterId = searchParams.get('character');
    if (characterId) {
      const character = characters.find(c => c.id === characterId);
      if (character) {
        setSelectedCharacter(character);
        // 환영 메시지 추가
        setTimeout(() => {
          const welcomeMessage: Message = {
            id: 'welcome_' + Date.now(),
            content: `안녕하세요! 저는 ${character.name}입니다. ${character.description} 무엇을 도와드릴까요?`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'text'
          };
          setMessages([welcomeMessage]);
        }, 100);
      }
    }
  }, [searchParams, characters]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          character: selectedCharacter,
          history: messages
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          content: data.message,
          sender: 'ai',
          timestamp: new Date(),
          type: data.type || 'text'
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    { icon: User, text: '학교 적응이 어려워요', category: '고민상담' },
    { icon: Calendar, text: '이번 학기 학사일정 알려주세요', category: '학사일정' },
    { icon: BookOpen, text: '전공 관련 도서 추천해주세요', category: '도서관' },
    { icon: User, text: '진로 고민이 있어요', category: '진로상담' }
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">캐릭터를 선택해주세요</h2>
          <Button onClick={() => router.push('/character-select')}>
            캐릭터 선택하러 가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/character-select')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              캐릭터 변경
            </Button>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedCharacter.color} flex items-center justify-center overflow-hidden`}>
                {selectedCharacter.avatar.startsWith('/images/') ? (
                  <Image
                    src={selectedCharacter.avatar}
                    alt={selectedCharacter.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // 이미지 로딩 실패 시 이모지로 대체
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <span className="text-lg">{selectedCharacter.avatar}</span>
                )}
                <span className={`text-lg ${selectedCharacter.avatar.startsWith('/images/') ? 'hidden' : ''}`}>
                  {selectedCharacter.emoji}
                </span>
              </div>
              <div>
                <h2 className="font-semibold">{selectedCharacter.name}</h2>
                <p className="text-sm text-gray-600">{selectedCharacter.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start items-start'}`}
              >
                {message.sender === 'ai' && selectedCharacter && (
                  <div className="mr-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                      {selectedCharacter.avatar.startsWith('/images/') ? (
                        <Image
                          src={selectedCharacter.avatar}
                          alt={selectedCharacter.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <span className="text-sm flex items-center justify-center h-full">{selectedCharacter.avatar}</span>
                      )}
                      <span className={`text-sm flex items-center justify-center h-full ${selectedCharacter.avatar.startsWith('/images/') ? 'hidden' : ''}`}>
                        {selectedCharacter.emoji}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col">
                  {message.sender === 'ai' && selectedCharacter && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">{selectedCharacter.name}</p>
                  )}
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`} suppressHydrationWarning>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs md:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">자주 묻는 질문:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto py-2"
                    onClick={() => handleQuickQuestion(question.text)}
                  >
                    <question.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{question.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 