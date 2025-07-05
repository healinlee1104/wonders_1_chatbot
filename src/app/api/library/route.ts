import { NextRequest, NextResponse } from 'next/server';
import libraryData from '../../../../content/library-books.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'search', 'category', 'recommendations', 'available'
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const available = searchParams.get('available') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    let books = libraryData.books;
    let result: Record<string, unknown> = {};

    switch (type) {
      case 'search':
        if (query) {
          books = books.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.description.toLowerCase().includes(query.toLowerCase()) ||
            book.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
          );
        }
        result = {
          success: true,
          books: books.slice(0, limit),
          total: books.length,
          query: query
        };
        break;

      case 'category':
        if (category) {
          books = books.filter(book => 
            book.category.toLowerCase() === category.toLowerCase()
          );
        }
        result = {
          success: true,
          books: books.slice(0, limit),
          total: books.length,
          category: category,
          categories: libraryData.categories
        };
        break;

      case 'recommendations':
        const recommendations = libraryData.recommendations.map(rec => ({
          ...rec,
          books: rec.books.map(bookId => 
            libraryData.books.find(book => book.id === bookId)
          ).filter(Boolean)
        }));
        result = {
          success: true,
          recommendations: recommendations
        };
        break;

      case 'available':
        books = books.filter(book => book.available && book.availableCopies > 0);
        result = {
          success: true,
          books: books.slice(0, limit),
          total: books.length
        };
        break;

      default:
        // 기본적으로 모든 도서 반환
        if (available) {
          books = books.filter(book => book.available && book.availableCopies > 0);
        }
        result = {
          success: true,
          books: books.slice(0, limit),
          total: books.length,
          categories: libraryData.categories
        };
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Library API Error:', error);
    return NextResponse.json(
      { error: '도서관 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, filters } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: '검색 쿼리가 필요합니다.' },
        { status: 400 }
      );
    }

    let books = libraryData.books;

    // 텍스트 검색
    books = books.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.description.toLowerCase().includes(query.toLowerCase()) ||
      book.category.toLowerCase().includes(query.toLowerCase()) ||
      book.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    // 추가 필터 적용
    if (filters) {
      if (filters.category) {
        books = books.filter(book => book.category === filters.category);
      }
      if (filters.available) {
        books = books.filter(book => book.available && book.availableCopies > 0);
      }
      if (filters.year) {
        books = books.filter(book => book.publishYear >= filters.year);
      }
    }

    // 관련성 점수 계산 (간단한 버전)
    const scoredBooks = books.map(book => {
      let score = 0;
      const searchTerms = query.toLowerCase().split(' ');
      
      searchTerms.forEach((term: string) => {
        if (book.title.toLowerCase().includes(term)) score += 3;
        if (book.author.toLowerCase().includes(term)) score += 2;
        if (book.description.toLowerCase().includes(term)) score += 1;
        if (book.tags.some(tag => tag.toLowerCase().includes(term))) score += 1;
      });
      
      return { ...book, relevanceScore: score };
    });

    // 관련성 점수 순으로 정렬
    scoredBooks.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 추천 도서 찾기
    const recommendations = libraryData.recommendations.find(rec => 
      rec.books.some(bookId => books.find(book => book.id === bookId))
    );

    return NextResponse.json({
      success: true,
      books: scoredBooks.slice(0, 20), // 최대 20개
      total: scoredBooks.length,
      query: query,
      recommendations: recommendations ? {
        category: recommendations.category,
        description: recommendations.description,
        books: recommendations.books.map(bookId => 
          libraryData.books.find(book => book.id === bookId)
        ).filter(Boolean)
      } : null
    });

  } catch (error) {
    console.error('Library Search API Error:', error);
    return NextResponse.json(
      { error: '도서 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 