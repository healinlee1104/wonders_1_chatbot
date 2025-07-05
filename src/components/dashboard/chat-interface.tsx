'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, BookOpen, Calendar, User, Heart, Zap, Brain, Smile } from 'lucide-react';
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

interface QuickQuestion {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  text: string;
  category: string;
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

  // 캐릭터별 빠른 질문 데이터
  const getQuickQuestions = (characterId: string): QuickQuestion[] => {
    const quickQuestionsByCharacter: Record<string, QuickQuestion[]> = {
      buddy: [
        { icon: Smile, text: '재미있는 학과 이벤트 있을까요?', category: '캠퍼스 생활' },
        { icon: Heart, text: '스트레스 풀 수 있는 방법 알려주세요', category: '스트레스 해소' },
        { icon: User, text: '대학생 취미생활 추천해주세요', category: '취미 활동' },
        { icon: User, text: '동기들과 친해지는 방법이 있나요?', category: '인간관계' }
      ],
      spark: [
        { icon: BookOpen, text: '도서관 열람실 예약 방법 알려주세요', category: '도서관 이용' },
        { icon: BookOpen, text: '전공 관련 도서 추천해주세요', category: '도서 추천' },
        { icon: BookOpen, text: '논문 검색 방법이 궁금해요', category: '학술 검색' },
        { icon: BookOpen, text: '도서 대출 기간이 얼마나 되나요?', category: '대출 서비스' }
      ],
      sage: [
        { icon: Brain, text: '효율적인 학습 방법 알려주세요', category: '학습 방법' },
        { icon: User, text: '진로 선택에 고민이 있어요', category: '진로 상담' },
        { icon: Calendar, text: '학점 관리 팁 알려주세요', category: '학점 관리' },
        { icon: Brain, text: '시험 준비 전략이 궁금해요', category: '시험 준비' }
      ],
      calm: [
        { icon: Heart, text: '대학생활 스트레스가 심해요', category: '스트레스 관리' },
        { icon: User, text: '친구 관계에 고민이 있어요', category: '인간관계' },
        { icon: Heart, text: '마음의 여유를 갖는 방법이 있나요?', category: '심리 상담' },
        { icon: Zap, text: '자신감을 기르고 싶어요', category: '자기계발' }
      ]
    };
    return quickQuestionsByCharacter[characterId] || [];
  };

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

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4">캐릭터를 선택해주세요</h2>
          <Button onClick={() => router.push('/character-select')}>
            캐릭터 선택하러 가기
          </Button>
        </div>
      </div>
    );
  }

  const quickQuestions = getQuickQuestions(selectedCharacter.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/character-select')}
                className="px-2 md:px-3"
              >
                <ArrowLeft className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">캐릭터 변경</span>
              </Button>
              <div className="flex items-center space-x-2 md:space-x-3 flex-1">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${selectedCharacter.color} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                  {selectedCharacter.avatar.startsWith('/images/') ? (
                    <Image
                      src={selectedCharacter.avatar}
                      alt={selectedCharacter.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <span className="text-sm md:text-lg">{selectedCharacter.avatar}</span>
                  )}
                  <span className={`text-sm md:text-lg ${selectedCharacter.avatar.startsWith('/images/') ? 'hidden' : ''}`}>
                    {selectedCharacter.emoji}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm md:text-base">{selectedCharacter.name}</h2>
                  <p className="text-xs md:text-sm text-gray-600 truncate hidden md:block">{selectedCharacter.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-2 md:px-4 py-4 md:py-6">
        <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-120px)] md:h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start items-start'}`}
              >
                {message.sender === 'ai' && selectedCharacter && (
                  <div className="mr-2 flex-shrink-0">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden bg-gray-200">
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
                        <span className="text-xs md:text-sm flex items-center justify-center h-full">{selectedCharacter.avatar}</span>
                      )}
                      <span className={`text-xs md:text-sm flex items-center justify-center h-full ${selectedCharacter.avatar.startsWith('/images/') ? 'hidden' : ''}`}>
                        {selectedCharacter.emoji}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
                  {message.sender === 'ai' && selectedCharacter && (
                    <p className="text-xs text-gray-500 mb-1 ml-1">{selectedCharacter.name}</p>
                  )}
                  <div
                    className={`px-3 md:px-4 py-2 md:py-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
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
                <div className="bg-gray-100 text-gray-800 max-w-[85%] md:max-w-[70%] px-3 md:px-4 py-2 md:py-3 rounded-lg">
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
          {messages.length === 1 && quickQuestions.length > 0 && (
            <div className="px-3 md:px-4 py-2 border-t bg-gray-50">
              <p className="text-xs md:text-sm text-gray-600 mb-2">자주 묻는 질문:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto py-2 md:py-3 px-3 md:px-4 hover:bg-gray-100 transition-colors"
                    onClick={() => handleQuickQuestion(question.text)}
                  >
                    <question.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs md:text-sm">{question.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 md:p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1 text-sm md:text-base"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 px-3 md:px-4"
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