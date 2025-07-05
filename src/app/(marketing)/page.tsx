import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, Calendar, MessageCircle, Users } from 'lucide-react';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            대학생활의 모든 고민을
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI 선배와 함께
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            학교생활 적응부터 학사일정 관리, 도서관 이용까지. 
            당신만의 AI 선배가 24시간 언제든지 도움을 드려요!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/character-select">
              <Button className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                지금 시작하기
              </Button>
            </Link>
            <Button variant="outline" className="px-8 py-4 text-lg">
              서비스 둘러보기
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            AI 선배가 도와드리는 것들
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle>학교생활 고민상담</CardTitle>
                <CardDescription>
                  대학 적응, 인간관계, 진로 고민 등 무엇이든 편하게 물어보세요
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <CardTitle>학사일정 안내</CardTitle>
                <CardDescription>
                  수강신청, 시험기간, 학사일정 등 중요한 날짜를 놓치지 마세요
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle>도서관 서비스</CardTitle>
                <CardDescription>
                  도서 검색, 추천, 대출 현황 등 도서관 이용을 편리하게
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle>개성 있는 AI 선배</CardTitle>
                <CardDescription>
                  5가지 성격의 AI 선배 중 나와 맞는 선배를 선택하세요
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Characters Preview Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            나만의 AI 선배를 선택해보세요
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { name: '버디', avatar: '😄', color: 'from-indigo-400 to-blue-500' },
              { name: '스파크', avatar: '⚡', color: 'from-pink-400 to-red-500' },
              { name: '세이지', avatar: '🧠', color: 'from-blue-400 to-purple-500' },
              { name: '칼름', avatar: '💚', color: 'from-green-400 to-teal-500' }
            ].map((character, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${character.color} flex items-center justify-center mb-3`}>
                  <span className="text-2xl">{character.avatar}</span>
                </div>
                <span className="font-semibold text-gray-800">{character.name}</span>
              </div>
            ))}
          </div>
          <Link href="/character-select">
            <Button className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              캐릭터 선택하러 가기
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            대학생활이 더 이상 혼자가 아니에요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            AI 선배와 함께 더 즐겁고 성공적인 대학생활을 시작해보세요
          </p>
          <Link href="/character-select">
            <Button className="px-8 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-100">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
} 