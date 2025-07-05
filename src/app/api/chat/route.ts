import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import academicData from '../../../../content/academic-calendar.json';
import libraryData from '../../../../content/library-books.json';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// 캐릭터별 Assistant ID 매핑 (실제 사용 시 환경변수로 관리)
const ASSISTANT_IDS = {
  sunny: process.env.SUNNY_ASSISTANT_ID || 'asst_sunny_default',
  sage: process.env.SAGE_ASSISTANT_ID || 'asst_sage_default', 
  spark: process.env.SPARK_ASSISTANT_ID || 'asst_spark_default',
  calm: process.env.CALM_ASSISTANT_ID || 'asst_calm_default',
  buddy: process.env.BUDDY_ASSISTANT_ID || 'asst_buddy_default'
};

// 학사일정 검색 함수
async function searchAcademicEvents(query: string) {
  const currentDate = new Date();
  const year = '2024';
  const yearData = academicData[year as keyof typeof academicData];
  
  if (!yearData) return [];

  let events: any[] = [];
  const semesters = ['semester1', 'summer', 'semester2', 'winter'];
  
  semesters.forEach(semester => {
    const semesterData = yearData[semester as keyof typeof yearData];
    if (semesterData && typeof semesterData === 'object' && 'events' in semesterData) {
      events = events.concat((semesterData as any).events);
    }
  });

  // 검색 쿼리에 따라 필터링
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(query.toLowerCase()) ||
    event.description.toLowerCase().includes(query.toLowerCase()) ||
    event.type.toLowerCase().includes(query.toLowerCase())
  );

  // 현재 날짜와 가까운 순으로 정렬
  return filteredEvents.sort((a, b) => {
    const dateA = Math.abs(new Date(a.startDate).getTime() - currentDate.getTime());
    const dateB = Math.abs(new Date(b.startDate).getTime() - currentDate.getTime());
    return dateA - dateB;
  }).slice(0, 5); // 최대 5개
}

// 도서 검색 함수
async function searchBooks(query: string) {
  const books = libraryData.books.filter(book => 
    book.title.toLowerCase().includes(query.toLowerCase()) ||
    book.author.toLowerCase().includes(query.toLowerCase()) ||
    book.description.toLowerCase().includes(query.toLowerCase()) ||
    book.category.toLowerCase().includes(query.toLowerCase()) ||
    book.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  return books.slice(0, 5); // 최대 5개
}

// 추천 도서 가져오기 함수
async function getRecommendations(category?: string) {
  if (category) {
    const recommendation = libraryData.recommendations.find(rec => 
      rec.category.toLowerCase().includes(category.toLowerCase())
    );
    if (recommendation) {
      return {
        category: recommendation.category,
        description: recommendation.description,
                 books: recommendation.books.map(bookId => 
           libraryData.books.find(book => book.id === bookId)
         ).filter(Boolean).slice(0, 3) as any[]
      };
    }
  }
  
  // 기본 추천 (신입생 추천)
  const defaultRec = libraryData.recommendations.find(rec => 
    rec.category.includes('신입생')
  );
  if (defaultRec) {
    return {
      category: defaultRec.category,
      description: defaultRec.description,
           books: defaultRec.books.map(bookId => 
       libraryData.books.find(book => book.id === bookId)
     ).filter(Boolean).slice(0, 3) as any[]
    };
  }
  
  return null;
}

interface Character {
  id: string;
  name: string;
  specialties: string[];
  personality: string;
}

// MessageHistory interface removed as it's no longer used

export async function POST(request: NextRequest) {
  let message = '';
  let character: Character | null = null;
  
  try {
    const requestData = await request.json();
    message = requestData.message;
    character = requestData.character;

    if (!message || !character) {
      return NextResponse.json(
        { error: '메시지와 캐릭터 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 질문 분석 및 관련 데이터 조회
    let additionalInfo = '';
    let responseType = 'text';

    // 학사일정 관련 질문
    if (message.includes('학사일정') || message.includes('시험') || message.includes('수강신청') || 
        message.includes('개강') || message.includes('방학') || message.includes('졸업식')) {
      responseType = 'academic';
      const events = await searchAcademicEvents(message);
      if (events.length > 0) {
        additionalInfo = '\n\n📅 관련 학사일정:\n';
        events.forEach(event => {
          const startDate = new Date(event.startDate).toLocaleDateString('ko-KR');
          const endDate = new Date(event.endDate).toLocaleDateString('ko-KR');
          additionalInfo += `• ${event.title}: ${startDate}${startDate !== endDate ? ` ~ ${endDate}` : ''}\n`;
          additionalInfo += `  ${event.description}\n`;
        });
      }
    }

    // 도서관 관련 질문
    if (message.includes('도서') || message.includes('책') || message.includes('도서관') || 
        message.includes('추천') || message.includes('전공')) {
      responseType = 'library';
      
      // 도서 검색
      const books = await searchBooks(message);
      if (books.length > 0) {
        additionalInfo = '\n\n📚 관련 도서:\n';
        books.forEach(book => {
          additionalInfo += `• ${book.title} (${book.author})\n`;
          additionalInfo += `  ${book.description}\n`;
          additionalInfo += `  위치: ${book.location}, 대출가능: ${book.available ? '가능' : '불가능'}\n`;
        });
      }
      
      // 추천 도서 (도서 추천 요청 시)
      if (message.includes('추천')) {
        let recCategory = '';
        if (message.includes('컴퓨터') || message.includes('프로그래밍')) recCategory = '컴퓨터공학과';
        else if (message.includes('신입생') || message.includes('새내기')) recCategory = '신입생';
        else if (message.includes('인문') || message.includes('철학')) recCategory = '인문학';
        else if (message.includes('이공계') || message.includes('과학')) recCategory = '이공계';
        
        const recommendations = await getRecommendations(recCategory);
        if (recommendations) {
          additionalInfo += `\n\n⭐ ${recommendations.category} 추천:\n`;
          additionalInfo += `${recommendations.description}\n`;
                     recommendations.books.forEach((book: any) => {
             additionalInfo += `• ${book.title} (${book.author})\n`;
           });
        }
      }
    }

        // 캐릭터 성격에 맞는 시스템 프롬프트 생성
    let systemPrompt = '';
    
    if (character.id === 'spark') {
      systemPrompt = `당신은 ${character.name}이라는 이름의 대학생 AI 선배입니다.

성격 및 말투:
${character.personality}

전문 분야:
${character.specialties.join(', ')}

역할 및 지침:
1. 도서관 정보를 잘 알고 있는 똑똑한 친구로서 행동하세요
2. 지적이고 박학다식하며 정확하고 친절하게 정보를 제공하세요
3. 도서 검색, 자료 대출/반납, 열람실 이용 등 도서관 이용 안내를 전문으로 하세요
4. 학술 데이터베이스, 논문 검색 방법 등 정보 탐색 지원을 제공하세요
5. 도서관 행사, 새로운 자료 입수 등 최신 정보를 제공하세요

응답할 때 주의사항:
- "도서관 이용에 궁금한 점이 있으신가요? 무엇이든 물어보세요."와 같은 친근한 톤으로 시작하세요
- "이 자료는 도서관 몇 층에서 찾으실 수 있습니다."와 같이 구체적인 위치 정보를 제공하세요
- "온라인 학술 데이터베이스를 활용하면 더 많은 정보를 얻을 수 있습니다."와 같이 추가 정보 탐색 방법을 제안하세요
- 📚 이모지를 적절히 사용하여 도서관 관련 정보임을 표현하세요
- 정확하고 상세한 정보를 제공하되, 이해하기 쉽게 설명하세요

${additionalInfo ? `\n참고 정보:\n${additionalInfo}` : ''}`;
    } else {
      systemPrompt = `당신은 ${character.name}이라는 이름의 대학생 AI 선배입니다.

성격 및 말투:
${character.personality}

전문 분야:
${character.specialties.join(', ')}

역할 및 지침:
1. 대학생의 고민을 듣고 친근하게 상담해주세요
2. 학사일정, 학교생활, 진로 등에 대한 실용적인 조언을 제공하세요
3. 도서관 이용이나 도서 추천에 대한 질문에 답변하세요
4. 항상 긍정적이고 격려하는 톤으로 대화하세요
5. 대학생의 눈높이에 맞는 언어를 사용하세요
6. 구체적이고 실용적인 조언을 제공하세요

응답할 때 주의사항:
- 짧고 친근한 문장으로 답변하세요
- 이모지를 적절히 사용하여 친근함을 표현하세요
- 질문에 대한 구체적인 답변을 제공하세요
- 추가 질문이나 도움이 필요한지 물어보세요

${additionalInfo ? `\n참고 정보:\n${additionalInfo}` : ''}`;
    }  

    // 기본 OpenAI 호출을 위한 메시지 배열 (Assistant API에서는 사용하지 않음)

    // OpenAI Assistant API 호출
    let aiResponse: string;
    
    if (openai) {
      try {
        const assistantId = ASSISTANT_IDS[character.id as keyof typeof ASSISTANT_IDS];
        
        if (assistantId) {
          // Assistant API 사용
          const thread = await openai.beta.threads.create();
          
          await openai.beta.threads.messages.create(thread.id, {
            role: 'user',
            content: message + (additionalInfo ? `\n\n참고 정보:\n${additionalInfo}` : '')
          });
          
          const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId,
            max_completion_tokens: 600,
            temperature: 0.7
          });
          
          // Run 완료 대기
          let runStatus = await openai.beta.threads.runs.retrieve(run.id, {
            thread_id: thread.id
          });
          while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(run.id, {
              thread_id: thread.id
            });
          }
          
          if (runStatus.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(thread.id);
            const lastMessage = messages.data[0];
            
            if (lastMessage && lastMessage.content && lastMessage.content.length > 0) {
              const content = lastMessage.content[0];
              if (content.type === 'text') {
                aiResponse = content.text.value;
              } else {
                aiResponse = '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.';
              }
            } else {
              aiResponse = '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.';
            }
          } else {
            console.error('Run failed:', runStatus);
            throw new Error('Assistant run failed');
          }
        } else {
          // Assistant ID가 없으면 기본 Chat Completions 사용
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user', 
                content: message
              }
            ],
            max_tokens: 600,
            temperature: 0.7
          });

          aiResponse = completion.choices[0]?.message?.content || '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.';
        }
      } catch (error) {
        console.error('OpenAI API Error:', error);
        // Fallback to dummy response
        aiResponse = `안녕하세요! 저는 ${character?.name || 'AI 선배'}입니다. 😊\n\nAPI 연결에 문제가 있어 기본 응답을 드리고 있어요.`;
      }
    } else {
      // API 키가 없을 때 더미 응답
      let dummyResponse = `안녕하세요! 저는 ${character?.name || 'AI 선배'}입니다. 😊\n\n`;
      
      // 질문에 따른 더미 응답
      if (message.includes('학사일정') || message.includes('시험')) {
        dummyResponse += '학사일정에 대해 궁금하시군요! 현재 API 설정이 필요한 상태이지만, 실제 환경에서는 최신 학사일정 정보를 제공해드릴 수 있어요. 📅\n\n수강신청, 시험 일정, 방학 기간 등 궁금한 것이 있으시면 언제든지 물어보세요!';
      } else if (message.includes('도서') || message.includes('책')) {
        dummyResponse += '도서 관련 질문이시네요! 📚 실제 환경에서는 도서관의 모든 책 정보를 검색하고 추천해드릴 수 있어요.\n\n전공 관련 도서부터 교양 도서까지, 어떤 분야의 책을 찾고 계신가요?';
        dummyResponse += additionalInfo; // 실제 도서 정보 추가
      } else {
        dummyResponse += '무엇을 도와드릴까요? 학교생활, 학사일정, 도서관 이용 등 궁금한 것이 있으시면 언제든지 말씀해주세요!\n\n실제 환경에서는 .env.local 파일에 OPENAI_API_KEY를 설정해주세요. 🔧';
      }
      
      aiResponse = dummyResponse;
    }

    return NextResponse.json({
      message: aiResponse,
      type: responseType,
      character: character.name
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // OpenAI API 키가 없는 경우 더미 응답
    if (error instanceof Error && error.message.includes('API key')) {
      let dummyResponse = `안녕하세요! 저는 ${character?.name || 'AI 선배'}입니다. 😊\n\n`;
      
      // 질문에 따른 더미 응답
      if (message.includes('학사일정') || message.includes('시험')) {
        dummyResponse += '학사일정에 대해 궁금하시군요! 현재 API 설정이 필요한 상태이지만, 실제 환경에서는 최신 학사일정 정보를 제공해드릴 수 있어요. 📅\n\n수강신청, 시험 일정, 방학 기간 등 궁금한 것이 있으시면 언제든지 물어보세요!';
      } else if (message.includes('도서') || message.includes('책')) {
        dummyResponse += '도서 관련 질문이시네요! 📚 실제 환경에서는 도서관의 모든 책 정보를 검색하고 추천해드릴 수 있어요.\n\n전공 관련 도서부터 교양 도서까지, 어떤 분야의 책을 찾고 계신가요?';
      } else {
        dummyResponse += '무엇을 도와드릴까요? 학교생활, 학사일정, 도서관 이용 등 궁금한 것이 있으시면 언제든지 말씀해주세요!\n\n실제 환경에서는 OpenAI API 키를 설정해주세요. 🔧';
      }
      
      return NextResponse.json({
        message: dummyResponse,
        type: 'text',
        character: character?.name || 'AI 선배'
      });
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 