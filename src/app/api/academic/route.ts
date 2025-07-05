import { NextRequest, NextResponse } from 'next/server';
import academicData from '../../../../content/academic-calendar.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'current', 'upcoming', 'all'
    const year = searchParams.get('year') || '2024';
    const category = searchParams.get('category'); // 'exam', 'registration', 'semester', etc.

    const yearData = academicData[year as keyof typeof academicData];
    if (!yearData) {
      return NextResponse.json(
        { error: '해당 연도의 학사일정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const currentDate = new Date();
    let events: Array<{
      id: string;
      title: string;
      startDate: string;
      endDate: string;
      type: string;
      description: string;
      priority?: string;
    }> = [];

    // 모든 학기의 이벤트를 수집
    const semesters = ['semester1', 'summer', 'semester2', 'winter'];
    semesters.forEach(semester => {
      const semesterData = yearData[semester as keyof typeof yearData];
      if (semesterData && typeof semesterData === 'object' && 'events' in semesterData) {
        events = events.concat((semesterData as { events: typeof events }).events);
      }
    });

    // 공휴일 정보 추가
    if (academicData.holidays) {
      const holidays = academicData.holidays.map(holiday => ({
        ...holiday,
        id: `holiday_${holiday.name}`,
        title: holiday.name,
        startDate: holiday.date,
        endDate: holiday.date,
        type: 'holiday',
        description: `${holiday.name} 공휴일입니다.`,
        priority: 'medium'
      }));
      events = events.concat(holidays);
    }

    // 필터링 적용
    if (category) {
      events = events.filter(event => event.type === category);
    }

    // 날짜 기준 필터링
    if (type === 'current') {
      events = events.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return currentDate >= eventStart && currentDate <= eventEnd;
      });
    } else if (type === 'upcoming') {
      events = events.filter(event => {
        const eventStart = new Date(event.startDate);
        return eventStart > currentDate;
      });
      // 가까운 날짜 순으로 정렬
      events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      events = events.slice(0, 10); // 최대 10개
    }

    // 날짜 순으로 정렬
    events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return NextResponse.json({
      success: true,
      events,
      total: events.length,
      year: year
    });

  } catch (error) {
    console.error('Academic API Error:', error);
    return NextResponse.json(
      { error: '학사일정 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: '검색 쿼리가 필요합니다.' },
        { status: 400 }
      );
    }

    const year = '2024';
    const yearData = academicData[year as keyof typeof academicData];
    
    if (!yearData) {
      return NextResponse.json(
        { error: '학사일정 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    let events: Array<{
      id: string;
      title: string;
      startDate: string;
      endDate: string;
      type: string;
      description: string;
      priority?: string;
    }> = [];
    const semesters = ['semester1', 'summer', 'semester2', 'winter'];
    
    semesters.forEach(semester => {
      const semesterData = yearData[semester as keyof typeof yearData];
      if (semesterData && typeof semesterData === 'object' && 'events' in semesterData) {
        events = events.concat((semesterData as { events: typeof events }).events);
      }
    });

    // 검색 쿼리에 따라 필터링
    const filteredEvents = events.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      event.type.toLowerCase().includes(query.toLowerCase())
    );

    // 날짜 순으로 정렬
    filteredEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return NextResponse.json({
      success: true,
      events: filteredEvents,
      total: filteredEvents.length,
      query: query
    });

  } catch (error) {
    console.error('Academic Search API Error:', error);
    return NextResponse.json(
      { error: '학사일정 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 