'use client'

import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import stopwordsKo from 'stopwords-ko'

// WordCloudChart를 동적 import로 변경 (SSR 문제 해결)
const WordCloudChart = dynamic(() => import('./WordCloudChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[350px] bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">워드클라우드 로딩 중...</p>
      </div>
    </div>
  )
})

// NormalDistributionChart를 동적 import로 변경 (SSR 문제 해결)
const NormalDistributionChart = dynamic(() => import('./NormalDistributionChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
        <p className="text-gray-600">분포도 로딩 중...</p>
      </div>
    </div>
  )
})

interface ExcelData {
  [key: string]: any
}

interface ExcelDataViewerProps {
  data: ExcelData[]
  fileName: string
}

interface SummaryStats {
  column: string
  average: number
  count: number
  min: number
  max: number
  sum: number
  values: number[]
}

interface SatisfactionStats {
  column: string
  average: number
  count: number
  min: number
  max: number
  sum: number
  verySatisfied: number
  somewhatSatisfied: number
  neutral: number
  somewhatDissatisfied: number
  veryDissatisfied: number
}

interface WordCloudData {
  text: string
  value: number
  frequency: number // 실제 빈도 추가
}

interface TextAnalysisStats {
  column: string
  totalWords: number
  uniqueWords: number
  positiveWords: number
  negativeWords: number
  suggestWords: number
  neutralWords: number
  positiveRatio: number
  negativeRatio: number
  suggestRatio: number
  neutralRatio: number
  wordCloud: WordCloudData[]
  sentimentKeywords: {
    positive: Array<{ word: string; frequency: number }>
    negative: Array<{ word: string; frequency: number }>
    suggest: Array<{ word: string; frequency: number }>
  }
  sentimentScore: number // -1 (부정) ~ 1 (긍정)
}

interface CorrelationMatrix {
  columns: string[]
  matrix: number[][]
}

interface DistributionData {
  columnName: string
  data: number[]
  mean: number
  std: number
  min: number
  max: number
}

// 긍정 단어 사전
const positiveWords = [
  '만족', '아주만족', '대만족', '최고', '매우좋', '좋았', '좋았습', '좋음', '좋습니다', '좋아요', '좋았어요', '좋네요',
  '훌륭', '탁월', '알차', '탄탄', '충실', '충분', '풍부', '짱', '베리굿', '굿', '추천', '강추',
  '유익', '유용', '도움', '도움되', '도움이됐', '유의미', '보탬', '기여', '효율', '효과', '효과적',
  '이해', '이해가잘', '이해하기쉽', '쉽게', '쉬웠', '명확', '명료', '분명', '깔끔', '정리잘', '정돈', '체계', '체계적', '구성좋', '구성이좋', '구성이잘',
  '친절', '배려', '상냥', '차분', '침착', '겸손', '열정', '열의', '성실', '꼼꼼', '정성', '세심', '정확', '책임감',
  '전문', '전문성', '경험많', '노하우', '현업경험', '실무경험', '사례중심', '케이스중심', '표준비교', '산출물비교', '비교설명',
  '소통원활', '소통좋', '질문잘받', 'QnA좋', '피드백좋', '응답빠', '응대좋',
  '실무', '현업', '연계', '연결', '적용가능', '바로적용', '실용', '실용적', '현장감', '구체적', '현실적',
  '밸런스', '균형', '속도적절', '페이스적절', '적절', '적당', '적합', '맞춤', '맞춤형',
  '재밌', '재미', '흥미', '몰입', '집중', '유쾌', '즐거', '활기',
  '자료좋', '교재좋', '예제좋', '실습좋', '설명잘', '설명이잘', '명강의', '명품강의'
]

// 부정 단어 사전
const negativeWords = [
  '아쉽', '아쉬웠', '아쉬움', '미흡', '부족', '부족했', '모자라', '모자람',
  '어렵', '어려움', '난해', '복잡', '헷갈', '혼동', '혼란', '산만', '정리안', '정돈안', '두서없',
  '불만', '불편', '불친절', '무성의', '소극', '무관심', '일방향', '일방적', '일방통행', '소통부족', '피드백없', '응답늦',
  '문제', '오류', '에러', '버그', '실수', '틀렸', '오타', '교재오타', '자료오류', '부정확', '애매',
  '지연', '지각', '늦었', '늦게', '늦음', '딜레이', '스케줄문제', '일정문제', '변경잦',
  '빠르', '빨랐', '급했', '졸속', '느리', '느렸', '지루', '졸리', '따분', '루즈',
  '짧', '짧었', '짧아서', '시간부족', '타임부족', '길', '길었', '장황',
  '과도', '과했다', '과부하', '빡세', '부담', '과제많', '숙제많', '평가부담', '진도과',
  '실습부족', '실습없', '예제부족', '케이스부족', '자료부족', '자료늦', '자료미제공', '자료공유안', '자료안',
  '설명부족', '설명모호', '설명빨라', '설명느려', '설명없', '설명부정확',
  '난이도높', '난이도낮', '수준차', '대상안맞', '대상부적', '초급자힘들', '고급자지루',
  '접속문제', '끊김', '렉', '버퍼링', '음질', '잡음', '소음', '화질', '화면문제', '마이크문제', '프로젝터문제', '프젝터',
  '환경문제', '냉난방', '춥', '덥', '의자불편', '책상불편', '공간협소', '좌석불편', '장비부족', '주차불편', '식사불편', '편의불편',
  '네트워크', 'wifi', '와이파이', '네트웍', '네트웤', '같습니다', '좋을것', '같네요', '같아요', '시간'
]

// 제안 단어 사전
const suggestWords = [
  '실습', '실습시간', '실습확대', '실습추가', '실습보강', '핸즈온', '워크숍', '워크샵', '케이스', '사례추가', '예제추가', '예시추가',
  '시간', '시간확대', '시간늘려', '시간늘리', '시간조정', '시간배분', '휴식시간', '쉬는시간', '페이스조정', '진도조정', '속도조정', '타임박스',
  '운영', '운영개선', '운영보완', '운영방식', '운영안', '운영변경', '운영정비', '운영재정렬',
  '공지', '사전안내', '사전공유', '사전자료', '사전숙지', '사전과제', '오리엔테이션', 'OT',
  '가이드', '템플릿', '체크리스트', '매뉴얼', '레퍼런스', '참고자료', '링크', '자료실', '슬라이드공유', '자료공유', '업데이트', '정리본', '요약본', '핸드아웃',
  'QnA', '질의응답', 'FAQ', '멘토링', '상담', '피드백세션', '코칭', '스터디', '커뮤니티',
  '심화', '고급', '기초', '입문', '트랙', '선택형', '맞춤형', '분리', '통합', '모듈화',
  '실무적용', '현업적용', '표준', '산출물', '케이스스터디', '튜토리얼', '데모',
  '녹화', '복습', '재수강', '추가세션', '보충수업', '리마인드', '리캡',
  '온라인', '오프라인', '하이브리드', '원격', '화상', '줌', 'zoom', '팀즈', 'Teams',
  '장비', '모니터', '좌석', '공간', '주차', '편의', '간식', '음료'
]

// 불용어 목록 (일반적인 단어들 제거)
const stopWords = [
  '좋을', '있는', '되는', '많은', '많이', '쉽게', '내용을',
  '특별히', '수고하셨습니다', '같습니다', '감사합니다', '좋았습니다', '주셨습니다', '되었습니다', '좋습니다', '부탁드립니다',
  '좋겠습니다', '있었습니다', '없어요', '같아요', '있으면', '좋겠음', '좋을것', '유익했습니다', '좋았음', '도움이', '없음', '없습니다',
  '좋을것', '있는것', '되는것', '많은것', '교육', '너무', '좀더', '있어', '대해', '비해', '통해', '좋은', '내용', '관련', '주셔서', '적절한', '감사', '좋았', '되었',
  '좋겠', '대한', '합니', '아직', '주세요', '필요', '활용한', '고생하셨', '이해하기', '때문', '이해', '쉽지', '쉬운', '살짝', '쉽고', '않았', '이미',
  '적당한', '적절', '적당히', '해주', '전박적', '설명', '부분', '보통', '전반적', '없는', '있음', '아주', '적절함', '않은', '생각', '점이', '진행', '아쉬웠',
  '수고', '고생', '감사하겠', '특히', '많았으면', '딱히', '했으면', '좋을듯', '이해할', '만족', '주셨', '위주', '설명해', '만족스러웠', '등의', '지금', '도움될', '도움'
]

// 의미 없는 어미나 접미사 목록
const meaninglessEndings = [
  '습니', '합니', '었습', '았습', '겠습', '했습', '되었', '되어', '었어', '았어', '겠어',
  '었음', '았음', '겠음', '했음', '되었음', '되어줬', '하셨', '셨습', '였습', '였어',
  '였음', '였겠', '해주', '해줘', '드리', '드려', '셔서', '해서', '여서', '어서', '해주', '있었', '내용이었', '하지',
  '어렵지'
]

// 한국어 조사 및 어미 제거 함수
const removeParticles = (word: string): string => {
  // 한국어 조사 패턴들 (끝에 오는 조사들) - 길이 순으로 정렬 (긴 것부터)
  const particles = [
    '합니다','습니다', '이든지', '든지', '이든가', '든가', '라도', '조차', '마저', '이나', '이라', '이야', '이다', '더라', '거나', '던가',
    '에서', '으로', '부터', '까지', '을', '를', '이', '가', '은', '는', '와', '의', '에', '로',
    '만', '나', '라', '야', '아', '다', '님', '도', '과'
  ]
  
  let cleaned = word
  
  // 1단계: 조사 제거 (길이가 긴 조사부터 우선 제거)
  for (const particle of particles) {
    if (cleaned.endsWith(particle)) {
      const withoutParticle = cleaned.slice(0, -particle.length)
      // 조사를 제거한 후에도 최소 2글자 이상 남아있어야 함
      if (withoutParticle.length >= 2) {
        cleaned = withoutParticle
        break // 첫 번째로 매칭되는 조사만 제거
      }
    }
  }
  
  // 2단계: 의미 없는 어미가 남았는지 확인하고 제거하거나 무효화
  for (const ending of meaninglessEndings) {
    if (cleaned === ending || cleaned.endsWith(ending)) {
      // 의미 없는 어미만 남았거나 어미로 끝나는 경우
      const withoutEnding = cleaned.slice(0, -ending.length)
      if (withoutEnding.length >= 2) {
        cleaned = withoutEnding
        break
      } else {
        // 의미 있는 단어가 남지 않으면 빈 문자열 반환 (필터링됨)
        return ''
      }
    }
  }
  
  // 3단계: 최종 검증 - 너무 짧거나 의미 없는 패턴 제거
  if (cleaned.length < 2 || 
      /^[ㄱ-ㅎㅏ-ㅣ]+$/.test(cleaned) || 
      /^(ㅋ|ㅎ|ㅠ|ㅜ|ㅇ)+$/.test(cleaned)) {
    return ''
  }
  
  return cleaned
}

// 텍스트 전처리 함수 (불용어 제거 및 특징적인 단어만 추출)
// 한국어 텍스트 정규화 및 클린업
const normalizeText = (text: string): string => {
  return String(text)
    .toLowerCase()
    // URL, 이메일, 특수문자 제거
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    .replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3a-zA-Z\s]/g, '')
    // 중복 공백 제거
    .replace(/\s+/g, ' ')
    .trim()
}

// 바이그램 생성 (문장 경계 내에서, 조사 제거 적용)
const generateBigrams = (tokens: string[]): string[] => {
  const bigrams: string[] = []
  for (let i = 0; i < tokens.length - 1; i++) {
    // 각 토큰에서 조사 제거 후 바이그램 생성
    const cleanToken1 = removeParticles(tokens[i])
    const cleanToken2 = removeParticles(tokens[i + 1])
    
    // 빈 문자열이 생성되지 않은 경우만 바이그램 생성
    if (cleanToken1 && cleanToken2 && 
        cleanToken1.length >= 2 && cleanToken2.length >= 2 &&
        !stopwordsKo.includes(cleanToken1) && !stopwordsKo.includes(cleanToken2) &&
        !stopWords.includes(cleanToken1) && !stopWords.includes(cleanToken2)) {
      const bigram = `${cleanToken1} ${cleanToken2}`
      bigrams.push(bigram)
    }
  }
  return bigrams
}

// 개선된 한국어 전처리 함수 (조사 제거 포함)
const preprocessText = (text: string): string[] => {
  const normalized = normalizeText(text)
  
  // 문장 분리 (한국어 문장 종결 기준)
  const sentences = normalized.split(/[.!?。]+/).filter(s => s.trim().length > 0)
  
  const allTokens: string[] = []
  
  sentences.forEach(sentence => {
    // 단어 토크나이징 (공백 기준, 추후 형태소 분석기로 교체 가능)
    const tokens = sentence
      .split(/\s+/)
      .map(token => token.trim())
      .map(token => removeParticles(token)) // 조사 제거 적용
      .filter(token => 
        token && // 빈 문자열 제거 (조사 제거 후 의미 없는 어미만 남은 경우)
        token.length >= 2 && // 2글자 이상
        token.length <= 15 && // 15글자 이하 (복합어 허용)
        !stopwordsKo.includes(token) && // 한국어 불용어 제거
        !stopWords.includes(token) && // 커스텀 불용어 제거
        !/^\d+$/.test(token) && // 숫자만 있는 단어 제거
        !/^[가-힣]{1}$/.test(token) && // 1글자 한글 제거
        // 의미 없는 패턴 제거
        !/^(ㅋ|ㅎ|ㅠ|ㅜ)+$/.test(token) &&
        !/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(token)
      )
    
    // 유니그램 추가
    allTokens.push(...tokens)
    
    // 바이그램 추가 (문장 내에서만)
    if (tokens.length >= 2) {
      const bigrams = generateBigrams(tokens)
      allTokens.push(...bigrams)
    }
  })
  
  return allTokens
}

// 개선된 단어 빈도 계산 함수 (로그 스케일링 포함)
const calculateWordFrequency = (words: string[]): { [key: string]: number } => {
  const frequency: { [key: string]: number } = {}
  
  // 기본 빈도 계산
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })
  
  // 빈도 필터링 및 가중치 적용
  const filtered: { [key: string]: number } = {}
  
  Object.entries(frequency).forEach(([word, count]) => {
    // 최소 빈도 조건 (바이그램은 2회 이상, 유니그램은 1회 이상)
    const minFreq = word.includes(' ') ? 2 : 1
    
    if (count >= minFreq) {
      // 로그 스케일링으로 극값 완화 (참고 자료의 추천)
      const scaledValue = Math.round(Math.log2(count + 1) * 10)
      
      // 바이그램에 가중치 부여 (더 의미있는 구문이므로)
      const weight = word.includes(' ') ? 1.5 : 1
      
      filtered[word] = Math.round(scaledValue * weight)
    }
  })
  
  return filtered
}

// 워드클라우드용 상위 단어 추출 (실제 빈도와 표시용 값 분리)
const extractTopWords = (frequency: { [key: string]: number }, originalFrequency: { [key: string]: number }, topN: number = 100): Array<{ text: string; value: number; frequency: number }> => {
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([text, value]) => ({ 
      text, 
      value, // 표시용 값 (로그 스케일링 적용)
      frequency: originalFrequency[text] // 실제 빈도
    }))
}

// 개선된 감정 분석 함수 (바이그램 포함, 가중치 적용)
const classifyWords = (words: string[]): { 
  positive: number; 
  negative: number; 
  suggest: number; 
  neutral: number;
  positiveWords: string[];
  negativeWords: string[];
  suggestWords: string[];
  neutralWords: string[];
} => {
  let positive = 0
  let negative = 0
  let suggest = 0
  let neutral = 0
  
  const foundPositiveWords: string[] = []
  const foundNegativeWords: string[] = []
  const foundSuggestWords: string[] = []
  const foundNeutralWords: string[] = []

  words.forEach(word => {
    // 바이그램에는 가중치 적용 (더 의미있는 구문이므로)
    const weight = word.includes(' ') ? 2 : 1
    
    if (positiveWords.some(pw => word.includes(pw) || pw.includes(word))) {
      positive += weight
      if (!foundPositiveWords.includes(word)) foundPositiveWords.push(word)
    } else if (negativeWords.some(nw => word.includes(nw) || nw.includes(word))) {
      negative += weight
      if (!foundNegativeWords.includes(word)) foundNegativeWords.push(word)
    } else if (suggestWords.some(sw => word.includes(sw) || sw.includes(word))) {
      suggest += weight
      if (!foundSuggestWords.includes(word)) foundSuggestWords.push(word)
    } else {
      neutral += weight
      if (!foundNeutralWords.includes(word)) foundNeutralWords.push(word)
    }
  })

  return { 
    positive, 
    negative, 
    suggest, 
    neutral,
    positiveWords: foundPositiveWords,
    negativeWords: foundNegativeWords,
    suggestWords: foundSuggestWords,
    neutralWords: foundNeutralWords
  }
}

// 감정별 키워드 추출 함수
const extractSentimentKeywords = (words: string[], sentimentType: 'positive' | 'negative' | 'suggest'): Array<{ word: string; frequency: number }> => {
  const targetWords = sentimentType === 'positive' ? positiveWords : 
                     sentimentType === 'negative' ? negativeWords : suggestWords
  
  const sentimentWords = words.filter(word => 
    targetWords.some(tw => word.includes(tw) || tw.includes(word))
  )
  
  const frequency: { [key: string]: number } = {}
  sentimentWords.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })
  
  return Object.entries(frequency)
    .map(([word, freq]) => ({ word, frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10) // 상위 10개
}

// 피어슨 상관계수 계산 함수
const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0
  
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)
  
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  
  if (denominator === 0) return 0
  
  return numerator / denominator
}

// 상관관계 행렬 계산 함수
const calculateCorrelationMatrix = (data: ExcelData[], targetColumnIndices: number[], columns: string[]): CorrelationMatrix => {
  // 유효한 컬럼 인덱스만 필터링
  const validIndices = targetColumnIndices.filter(idx => idx >= 0 && idx < columns.length)
  const targetColumns = validIndices.map(idx => columns[idx]).filter(Boolean)
  const matrix: number[][] = []
  
  console.log('상관관계 계산 시작:')
  console.log('전체 컬럼 수:', columns.length)
  console.log('요청된 컬럼 인덱스:', targetColumnIndices)
  console.log('유효한 컬럼 인덱스:', validIndices)
  console.log('대상 컬럼명:', targetColumns)
  console.log('전체 데이터 행 수:', data.length)
  
  if (targetColumns.length === 0) {
    console.log('❌ 유효한 컬럼이 없습니다.')
    return { columns: [], matrix: [] }
  }
  
  // 각 컬럼별 숫자 데이터 추출 (동일한 행 인덱스 기준으로 정렬)
  const validRowIndices: number[] = []
  const columnData: number[][] = []
  
  // 먼저 모든 대상 컬럼에서 유효한 숫자 데이터가 있는 행들을 찾기
  data.forEach((row, rowIndex) => {
    const rowValues = targetColumns.map(column => {
      const value = row[column]
      const num = Number(value)
      return isNaN(num) || value === '' || value === null || value === undefined ? null : num
    })
    
    // 모든 컬럼에 유효한 데이터가 있는 행만 선택
    if (rowValues.every(val => val !== null)) {
      validRowIndices.push(rowIndex)
    }
  })
  
  console.log(`모든 컬럼에 유효한 데이터가 있는 행 개수: ${validRowIndices.length}`)
  
  // 각 컬럼별로 유효한 행들의 데이터만 추출
  targetColumns.forEach((column, index) => {
    const columnValues = validRowIndices.map(rowIndex => {
      const value = data[rowIndex][column]
      const num = Number(value)
      return num
    })
    
    columnData.push(columnValues)
    
    console.log(`컬럼 "${column}" (인덱스 ${validIndices[index]}):`)
    console.log(`- 유효한 숫자 데이터 개수: ${columnValues.length}`)
    console.log(`- 샘플 데이터 (처음 5개):`, columnValues.slice(0, 5))
    console.log(`- 평균: ${columnValues.length > 0 ? (columnValues.reduce((a, b) => a + b, 0) / columnValues.length).toFixed(2) : 'N/A'}`)
    console.log(`- 표준편차: ${columnValues.length > 0 ? Math.sqrt(columnValues.reduce((sum, val) => sum + Math.pow(val - (columnValues.reduce((a, b) => a + b, 0) / columnValues.length), 2), 0) / columnValues.length).toFixed(2) : 'N/A'}`)
  })
  
  if (validRowIndices.length < 3) {
    console.log('❌ 상관관계 계산에 필요한 최소 데이터가 부족합니다. (최소 3개 행 필요)')
    return { columns: [], matrix: [] }
  }
  
  // 상관관계 행렬 계산
  for (let i = 0; i < targetColumns.length; i++) {
    matrix[i] = []
    for (let j = 0; j < targetColumns.length; j++) {
      if (i === j) {
        matrix[i][j] = 1 // 자기 자신과의 상관관계는 1
      } else {
        const correlation = calculateCorrelation(columnData[i], columnData[j])
        matrix[i][j] = correlation
        console.log(`상관관계 ${targetColumns[i]} vs ${targetColumns[j]}: ${correlation.toFixed(3)}`)
      }
    }
  }
  
  console.log('최종 상관관계 행렬:', matrix)
  
  return {
    columns: targetColumns,
    matrix
  }
}

export default function ExcelDataViewer({ data, fileName }: ExcelDataViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchColumn, setSearchColumn] = useState('전체') // 검색할 컬럼 선택
  const [viewMode, setViewMode] = useState<'raw' | 'summary'>('raw')
  const [selectedWord, setSelectedWord] = useState<{
    word: string
    column: string
    details: Array<{ text: string; author: string; rowIndex: number }>
  } | null>(null)
  
  const [selectedLevelData, setSelectedLevelData] = useState<{
    column: string
    level: string
    levelValue: number
    data: Array<{ row: any; rowIndex: number }>
  } | null>(null)
  
  const [statisticFilter, setStatisticFilter] = useState<{
    column: string
    type: string
    condition: (value: number) => boolean
    description: string
  } | null>(null)

  // 컬럼명 추출
  const columns = Object.keys(data[0] || {})
  const numericColumns = columns.filter(column =>
    data.some(row => {
      const v = row[column]
      return v !== '' && v !== null && !isNaN(Number(v))
    })
  )

  // L열부터 V열까지의 만족도 컬럼 찾기 (12번째부터 22번째까지)
  const satisfactionColumns = columns.slice(11, 22) // L(12)부터 V(22)까지

  // W열, X열, Z열 찾기 (23, 24, 26번째)
  const textAnalysisColumns = [columns[22], columns[23], columns[25]].filter(Boolean) // W, X, Z

  // 검색 및 통계 필터링
  const filteredData = useMemo(() => {
    let result = data
    
    // 먼저 검색 필터 적용
    if (searchTerm.trim()) {
      result = result.filter(row => {
        if (searchColumn === '전체') {
          // 전체 컬럼에서 검색
          return Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        } else {
          // 특정 컬럼에서 검색
          return String(row[searchColumn] || '').toLowerCase().includes(searchTerm.toLowerCase())
        }
      })
    }
    
    // 통계 필터 적용
    if (statisticFilter) {
      result = result.filter(row => {
        const cellValue = row[statisticFilter.column]
        let numericValue = 0
        
        // 만족도 컬럼인지 확인 (L~V열)
        if (satisfactionColumns.includes(statisticFilter.column)) {
          // 만족도 데이터의 경우 텍스트를 숫자로 변환
          numericValue = convertSatisfactionToNumber(String(cellValue || '').trim())
        } else {
          // 일반 숫자 데이터의 경우 직접 변환
          const parsed = Number(cellValue)
          numericValue = isNaN(parsed) ? 0 : parsed
        }
        
        return statisticFilter.condition(numericValue)
      })
    }
    
    return result
  }, [data, searchTerm, searchColumn, statisticFilter, satisfactionColumns])

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  // 만족도 텍스트를 숫자로 변환하는 함수
  const convertSatisfactionToNumber = (text: string): number => {
    const satisfactionMap: { [key: string]: number } = {
      '매우만족': 5,
      '매우 만족': 5,
      '다소만족': 4,
      '다소 만족': 4,
      '보통': 3,
      '약간불만족': 2,
      '약간 불만족': 2,
      '매우불만족': 1,
      '매우 불만족': 1
    }
    
    const normalizedText = String(text).trim()
    return satisfactionMap[normalizedText] || 0
  }

  // 요약 통계 계산 (각 컬럼별 평균, 개수, 최솟값, 최댓값, 합계)
  const summaryStats = useMemo(() => {
    const stats: SummaryStats[] = []
    
    columns.forEach(column => {
      const values = filteredData
        .map(row => row[column])
        .filter(val => val !== '' && val !== null && !isNaN(Number(val)))
        .map(val => Number(val))
      
      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0)
        const average = sum / values.length
        const min = Math.min(...values)
        const max = Math.max(...values)
        
        stats.push({
          column,
          average,
          count: values.length,
          min,
          max,
          sum,
          values
        })
      }
    })
    
    return stats
  }, [filteredData, columns])


  // 만족도 통계 계산 (L열부터 V열까지)
  const satisfactionStats = useMemo(() => {
    const stats: SatisfactionStats[] = []
    
    satisfactionColumns.forEach(column => {
      const values = filteredData
        .map(row => convertSatisfactionToNumber(row[column]))
        .filter(val => val > 0) // 0은 유효하지 않은 값으로 제외
      
      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0)
        const average = sum / values.length
        const min = Math.min(...values)
        const max = Math.max(...values)
        
        // 각 만족도별 개수 계산
        const verySatisfied = values.filter(v => v === 5).length
        const somewhatSatisfied = values.filter(v => v === 4).length
        const neutral = values.filter(v => v === 3).length
        const somewhatDissatisfied = values.filter(v => v === 2).length
        const veryDissatisfied = values.filter(v => v === 1).length
        
        stats.push({
          column,
          average,
          count: values.length,
          min,
          max,
          sum,
          verySatisfied,
          somewhatSatisfied,
          neutral,
          somewhatDissatisfied,
          veryDissatisfied
        })
      }
    })
    
    return stats
  }, [filteredData, satisfactionColumns])

  // 텍스트 분석 통계 계산 (W열, X열, Z열)
  const textAnalysisStats = useMemo(() => {
    const stats: TextAnalysisStats[] = []
    
    textAnalysisColumns.forEach(column => {
      const texts = filteredData
        .map(row => row[column])
        .filter(text => text && String(text).trim() !== '')
        .map(text => String(text))
      
      if (texts.length > 0) {
        // 모든 텍스트를 합쳐서 단어 추출 (개선된 전처리 사용)
        const allWords = texts.flatMap(text => preprocessText(text))
        
        // 원본 빈도 계산 (로그 스케일링 적용 전)
        const originalFrequency: { [key: string]: number } = {}
        allWords.forEach(word => {
          originalFrequency[word] = (originalFrequency[word] || 0) + 1
        })
        
        const wordFrequency = calculateWordFrequency(allWords)
        const classification = classifyWords(allWords)
        
        // 워드클라우드용 상위 단어 추출 (바이그램 포함, 로그 스케일링 적용)
        const meaningfulWords = extractTopWords(wordFrequency, originalFrequency, 50) // 상위 50개로 확장
        
        const totalWords = allWords.length
        const uniqueWords = Object.keys(wordFrequency).length
        
        // 감정별 키워드 추출
        const sentimentKeywords = {
          positive: extractSentimentKeywords(allWords, 'positive'),
          negative: extractSentimentKeywords(allWords, 'negative'),
          suggest: extractSentimentKeywords(allWords, 'suggest')
        }
        
        // 감정 점수 계산 (-1 ~ 1)
        const totalSentimentWords = classification.positive + classification.negative
        const sentimentScore = totalSentimentWords > 0 
          ? (classification.positive - classification.negative) / totalSentimentWords 
          : 0
        
        stats.push({
          column,
          totalWords,
          uniqueWords,
          positiveWords: classification.positive,
          negativeWords: classification.negative,
          suggestWords: classification.suggest,
          neutralWords: classification.neutral,
          positiveRatio: totalWords > 0 ? (classification.positive / totalWords) * 100 : 0,
          negativeRatio: totalWords > 0 ? (classification.negative / totalWords) * 100 : 0,
          suggestRatio: totalWords > 0 ? (classification.suggest / totalWords) * 100 : 0,
          neutralRatio: totalWords > 0 ? (classification.neutral / totalWords) * 100 : 0,
          wordCloud: meaningfulWords,
          sentimentKeywords,
          sentimentScore
        })
      }
    })
    
    return stats
  }, [filteredData, textAnalysisColumns])

  // 상관관계 행렬 계산 (3, 4, 5, 8번 컬럼) - 원본 데이터 기준
  const correlationMatrix = useMemo(() => {
    const targetIndices = [7, 9, 10, 24]
    return calculateCorrelationMatrix(filteredData, targetIndices, columns)
  }, [filteredData, columns])

  // 정규분포 데이터 계산
  const distributionData = useMemo(() => {
    const targetIndices = [7, 9, 10, 24]
    const validIndices = targetIndices.filter(idx => idx >= 0 && idx < columns.length)
    const targetColumns = validIndices.map(idx => columns[idx]).filter(Boolean)
    
    if (targetColumns.length === 0) return []
    
    // 모든 컬럼에 유효한 데이터가 있는 행들 찾기
    const validRowIndices: number[] = []
    filteredData.forEach((row, rowIndex) => {
      const rowValues = targetColumns.map(column => {
        const value = row[column]
        const num = Number(value)
        return isNaN(num) || value === '' || value === null || value === undefined ? null : num
      })
      
      if (rowValues.every(val => val !== null)) {
        validRowIndices.push(rowIndex)
      }
    })
    
    // 각 컬럼별 분포 데이터 계산
    return targetColumns.map((column, index) => {
      const columnValues = validRowIndices.map(rowIndex => {
        const value = filteredData[rowIndex][column]
        return Number(value)
      })
      
      if (columnValues.length === 0) return null
      
      // 안전한 통계 계산
      const validValues = columnValues.filter(val => isFinite(val))
      if (validValues.length < 2) return null
      
      const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length
      const variance = validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validValues.length
      const std = Math.sqrt(variance)
      const min = Math.min(...validValues)
      const max = Math.max(...validValues)
      
      // 추가 유효성 검사
      if (!isFinite(mean) || !isFinite(std) || !isFinite(min) || !isFinite(max)) {
        console.warn(`컬럼 ${column}에서 유효하지 않은 통계값이 계산됨`)
        return null
      }
      
      return {
        columnName: column,
        data: validValues, // 유효한 데이터만 전달
        mean,
        std,
        min,
        max
      } as DistributionData
    }).filter(Boolean) as DistributionData[]
  }, [filteredData, columns])

  // Early return after all hooks
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">표시할 데이터가 없습니다.</p>
      </div>
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1)
  }

  // 검색어나 검색 컬럼이 변경될 때 페이지를 1로 리셋
  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleSearchColumnChange = (column: string) => {
    setSearchColumn(column)
    setCurrentPage(1)
  }

  // 단어 클릭 시 상세 정보 가져오기
  const handleWordClick = (word: string, column: string) => {
    const details: Array<{ text: string; author: string; rowIndex: number }> = []
    
    filteredData.forEach((row, index) => {
      const text = String(row[column] || '')
      const processedWords = preprocessText(text)
      
      if (processedWords.includes(word)) {
        // 작성자 정보는 첫 번째 컬럼에서 가져오기 (보통 이름이나 ID)
        const author = String(row[columns[6]]) + ' : ' + String(row[columns[8]])
        details.push({
          text: text.trim(),
          author,
          rowIndex: index + 1
        })
      }
    })
    
    setSelectedWord({ word, column, details })
  }

  // 모달 닫기
  const closeModal = () => {
    setSelectedWord(null)
  }

  const closeLevelModal = () => {
    setSelectedLevelData(null)
  }

  // 레벨별 데이터 클릭 핸들러
  const handleLevelClick = (column: string, level: string, levelValue: number) => {
    console.log(`Clicked: column=${column}, level=${level}, levelValue=${levelValue}`)
    console.log('Available columns:', columns)
    console.log('Satisfaction columns:', satisfactionColumns)
    
    const levelData: Array<{ row: any; rowIndex: number }> = []
    
    filteredData.forEach((row, index) => {
      const cellValue = row[column]
      let numericValue = 0
      
      // 만족도 컬럼인지 확인 (L~V열)
      if (satisfactionColumns.includes(column)) {
        // 만족도 데이터의 경우 텍스트를 숫자로 변환
        numericValue = convertSatisfactionToNumber(String(cellValue || '').trim())
        if (index < 3) console.log(`Satisfaction row ${index}: "${cellValue}" -> ${numericValue}`)
      } else {
        // 일반 숫자 데이터의 경우 직접 변환
        const parsed = Number(cellValue)
        numericValue = isNaN(parsed) ? 0 : Math.round(parsed)
        if (index < 3) console.log(`Numeric row ${index}: "${cellValue}" -> ${numericValue}`)
      }
      
      if (numericValue === levelValue) {
        levelData.push({
          row: row,
          rowIndex: index + 1
        })
      }
    })
    
    console.log(`Found ${levelData.length} items for level ${levelValue}`)
    
    setSelectedLevelData({
      column,
      level,
      levelValue,
      data: levelData
    })
  }

  // 통계 필터 핸들러
  const handleStatisticFilter = (column: string, type: string, condition: (value: number) => boolean, description: string) => {
    console.log(`Applied filter: column=${column}, type=${type}, description=${description}`)
    
    setStatisticFilter({
      column,
      type,
      condition,
      description
    })
    
    // 페이지를 첫 페이지로 리셋
    setCurrentPage(1)
  }

  // 통계 필터 해제 핸들러
  const clearStatisticFilter = () => {
    setStatisticFilter(null)
    setCurrentPage(1)
  }

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">엑셀 데이터 뷰어</h2>
            <p className="text-gray-600 mt-1">파일: {fileName}</p>
            <p className="text-sm text-gray-500">
              {searchTerm || statisticFilter ? (
                <>
                  필터링 결과: {filteredData.length}개 행 / 전체 {data.length}개 행, {columns.length}개 컬럼
                  {searchColumn !== '전체' && searchTerm && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {searchColumn} 컬럼 검색
                    </span>
                  )}
                  {statisticFilter && (
                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      {statisticFilter.column} - {statisticFilter.description}
                      <button
                        onClick={clearStatisticFilter}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                        title="통계 필터 해제"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </>
              ) : (
                <>총 {filteredData.length}개 행, {columns.length}개 컬럼</>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setViewMode('raw')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'raw' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              원본 보기
            </button>
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'summary' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-200 text-gray-700 hover:bg-green-300'
              }`}
            >
              요약지표
            </button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 flex gap-2">
            <div className="w-40">
              <select
                value={searchColumn}
                onChange={(e) => handleSearchColumnChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="전체">전체 검색</option>
                {columns.map((column, index) => (
                  <option key={index} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={searchColumn === '전체' ? '전체 컬럼에서 검색...' : `${searchColumn} 컬럼에서 검색...`}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="검색어 지우기"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {viewMode === 'raw' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">페이지당 행 수:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}
        </div>

      </div>

      {/* 원본 데이터 표시 */}
      {viewMode === 'raw' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) =>
                    index == 0 || index >= 6 ? (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ) : null
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {columns.map((column, colIndex) => 
                    colIndex == 0 || colIndex >= 6 ? (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {row[column] || '-'}
                      </td>
                    ) : null)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{startIndex + 1}</span>
                    {' - '}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredData.length)}
                    </span>
                    {' / '}
                    <span className="font-medium">{filteredData.length}</span>
                    {' 개 행'}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      )
                      .map((page, index, array) => (
                        <div key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 요약지표 표시 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 bg-green-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 요약지표</h3>
          <p className="text-sm text-gray-600">각 컬럼별 통계 정보를 확인할 수 있습니다.</p>
        </div>
        <div className="p-6">
          {[3, 4, 5, 8].map((rowIdx) => {
            const stat = summaryStats[rowIdx];
            if (!stat) return null;
            
            // 최댓값을 기준으로 레벨 범위 계산
            const maxLevel = Math.ceil(stat.max);
            const minLevel = 1;
            const levelRange = maxLevel - minLevel + 1;
            
            // 평균값을 6개 하트로 표시 (최댓값 기준으로 정규화)
            const normalizedAverage = (stat.average - minLevel) / (maxLevel - minLevel);
            const heartCount = Math.round(normalizedAverage * 5) + 1; // 1-6 범위
            
            // 레벨별 분포 계산
            const levelDistribution: { level: number; count: number }[] = [];
            for (let level = maxLevel; level >= minLevel; level--) {
              const count = stat.values.filter((val: number) => Math.round(val) === level).length;
              levelDistribution.push({ level, count });
            }
            
            return (
              <div key={rowIdx} className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">{stat.column}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* 평균 등급 표시 */}
                  <div className="text-center flex flex-col justify-center">
                    <div className="text-4xl font-bold text-gray-800 mb-2">
                      {stat.average.toFixed(2)}
                    </div>
                    <div className="flex justify-center space-x-1 mb-4">
                      {Array.from({ length: 6 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 ${
                            i < heartCount 
                              ? 'text-purple-400 fill-current' 
                              : 'text-purple-200'
                          }`}
                        >
                          <svg viewBox="0 0 24 24" className="w-full h-full">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </div>
                      ))}
                    </div>
                    
                    {/* 상세 통계 정보 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
                      <div className="space-y-2 text-xs">
                        {(() => {
                          // 통계 계산
                          const sortedValues = [...stat.values].sort((a, b) => a - b)
                          const n = sortedValues.length
                          const mean = stat.average
                          const std = Math.sqrt(stat.values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1))
                          
                          // 중앙값
                          const median = n % 2 === 0 
                            ? (sortedValues[n/2 - 1] + sortedValues[n/2]) / 2 
                            : sortedValues[Math.floor(n/2)]
                          
                          // 사분위수
                          const q1Index = Math.floor((n - 1) * 0.25)
                          const q3Index = Math.floor((n - 1) * 0.75)
                          const q1 = sortedValues[q1Index]
                          const q3 = sortedValues[q3Index]
                          
                          // Top-2-Box (>=4점)와 Bottom-2-Box (<=2점) 계산
                          // max값의 10%, min값의 10%로 Top/Bottom Box 계산
                          const max = Math.max(...stat.values);
                          const min = Math.min(...stat.values);
                          const range = max - min;
                          // 10점 만점이면 9, 7점 만점이면 6, 하위는 1
                          const topThreshold = max - Math.floor(range * 0.2);
                          const bottomThreshold = min + Math.ceil(range * 0.2) - 1;
                          const top1Box = (stat.values.filter(v => v >= topThreshold).length / n) * 100;
                          const bottom1Box = (stat.values.filter(v => v <= bottomThreshold).length / n) * 100;
                          
                          // 95% 신뢰구간
                          const marginOfError = 1.96 * (std / Math.sqrt(n))
                          const confidenceInterval = {
                            lower: mean - marginOfError,
                            upper: mean + marginOfError
                          }
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">중앙값:</span>
                                <span className="font-medium">{median.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">표준편차:</span>
                                <span className="font-medium">{std.toFixed(2)}</span>
                              </div>
                              <div 
                                className="flex justify-between cursor-pointer hover:bg-gray-100 rounded p-1 transition-colors"
                                onClick={() => handleStatisticFilter(stat.column, 'Top-1', (value) => value >= topThreshold, `Top-1 (${topThreshold}점 이상)`)}
                                title={`Top-1 데이터로 필터링 (${topThreshold}점 이상)`}
                              >
                                <span className="text-gray-600">Top-2(♥ {topThreshold} 이상):</span>
                                <span className="font-medium text-green-600">{top1Box.toFixed(1)}%</span>
                              </div>
                              <div 
                                className="flex justify-between cursor-pointer hover:bg-gray-100 rounded p-1 transition-colors"
                                onClick={() => handleStatisticFilter(stat.column, 'Bottom-1', (value) => value <= bottomThreshold, `Bottom-2 (${bottomThreshold}점 이하)`)}
                                title={`Bottom-2 데이터로 필터링 (${bottomThreshold}점 이하)`}
                              >
                                <span className="text-gray-600">Bottom-2(♥ {bottomThreshold} 이하):</span>
                                <span className="font-medium text-red-600">{bottom1Box.toFixed(1)}%</span>
                              </div>
                              <div 
                                className="flex justify-between cursor-pointer hover:bg-gray-100 rounded p-1 transition-colors"
                                onClick={() => handleStatisticFilter(stat.column, '95% 신뢰구간', (value) => value >= confidenceInterval.lower && value <= confidenceInterval.upper, `95% 신뢰구간 (${confidenceInterval.lower.toFixed(2)}~${confidenceInterval.upper.toFixed(2)})`)}
                                title={`95% 신뢰구간 데이터로 필터링 (${confidenceInterval.lower.toFixed(2)}~${confidenceInterval.upper.toFixed(2)})`}
                              >
                                <span className="text-gray-600">95% 신뢰구간:</span>
                                <span className="font-medium text-blue-600">{confidenceInterval.lower.toFixed(2)} ~ {confidenceInterval.upper.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">표본 크기:</span>
                                <span className="font-medium">{n}개</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* 레벨별 분포 막대그래프 */}
                  <div>
                    <div className="text-sm text-gray-600 mb-3">레벨별 분포</div>
                    <div className="space-y-1">
                      {levelDistribution.map(({ level, count }) => {
                        const maxCount = Math.max(...levelDistribution.map(d => d.count));
                        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        
                        return (
                          <div 
                            key={level} 
                            className="flex items-center cursor-pointer hover:bg-gray-100 rounded-lg p-1 transition-colors"
                            onClick={() => handleLevelClick(stat.column, `${level}레벨`, level)}
                            title={`${level}레벨 데이터 ${count}개 보기`}
                          >
                            <div className="w-12 text-xs text-gray-600">{level}레벨</div>
                            <div className="flex-1 mx-2">
                              <div className="bg-gray-200 rounded-full h-2 relative">
                                <div 
                                  className="bg-purple-400 h-2 rounded-full transition-all duration-300 hover:bg-purple-500"
                                  style={{ width: `${barWidth}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="w-8 text-xs text-gray-600 text-right">{count}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {summaryStats.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">숫자 데이터가 있는 컬럼이 없습니다.</p>
          </div>
        )}
      </div>

       {/* 상관관계 분석 표시 */}
       <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 bg-orange-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">🔗 상관관계 분석 (4개 주요 컬럼)</h3>
          <p className="text-sm text-gray-600">
            선택된 4개 컬럼 간의 피어슨 상관계수를 계산하여 관계의 강도를 분석합니다. (-1: 완전 음의 상관, 0: 무상관, 1: 완전 양의 상관)
          </p>
          <p className="text-xs text-orange-700 mt-1 font-medium">
            📌 분석 기준: 전체 원본 데이터 ({data.length}개 행)
          </p>
          {correlationMatrix.columns.length > 0 && (
            <p className="text-xs text-green-700 mt-1">
              ✅ 분석된 컬럼: {correlationMatrix.columns.join(', ')}
            </p>
          )}
        </div>
        <div className="p-6">
          {correlationMatrix.columns.length > 0 ? (
            <div className="space-y-8">
              {/* 정규분포 차트 */}
              {distributionData.length > 0 && (
                 <div>
                   <h5 className="text-md font-semibold text-gray-700 mb-4">📈 각 컬럼별 정규분포 분석</h5>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {distributionData.map((distData, index) => (
                       <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                         <NormalDistributionChart
                           data={distData}
                           height={300}
                         />
                       </div>
                     ))}
                   </div>
                   <div className="mt-4 text-sm text-gray-600">
                     <p className="font-medium mb-2">📊 정규성 평가 가이드:</p>
                     <ul className="list-disc list-inside space-y-1 text-xs">
                       <li><strong>히스토그램과 정규분포 곡선이 유사:</strong> 데이터가 정규분포에 가까움</li>
                       <li><strong>좌우 대칭:</strong> 평균 주변으로 데이터가 고르게 분포</li>
                       <li><strong>종 모양:</strong> 중앙이 높고 양쪽 끝이 낮은 분포</li>
                       <li><strong>이상치 확인:</strong> 분포에서 크게 벗어난 값들</li>
                     </ul>
                   </div>
                 </div>
               )}

              {/* 상관관계 히트맵 */}
              <div>
                <h5 className="text-md font-semibold text-gray-700 mb-4">🔥 상관관계 히트맵</h5>
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <div className="grid gap-1" style={{ gridTemplateColumns: `1fr repeat(${correlationMatrix.columns.length}, 1fr)` }}>
                    {/* 헤더 */}
                    <div></div>
                    {correlationMatrix.columns.map((col, index) => (
                      <div
                        key={index}
                        className="text-center text-xs font-medium text-gray-700 py-2 truncate"
                        title={col}
                      >
                        {col}
                      </div>
                    ))}
                    
                    {/* 데이터 */}
                    {correlationMatrix.columns.map((rowCol, i) => (
                      <React.Fragment key={i}>
                        <div className="text-xs font-medium text-gray-700 py-2 pr-2 text-right truncate" title={rowCol}>
                          {rowCol}
                        </div>
                        {correlationMatrix.matrix[i].map((value, j) => {
                          const absValue = Math.abs(value)
                          let bgColor = 'bg-gray-100'
                          let textColor = 'text-gray-800'
                          let opacity = '50'
                          
                          if (i === j) {
                            bgColor = 'bg-blue-500'
                            textColor = 'text-white'
                            opacity = '100'
                          } else if (value > 0) {
                            // 양의 상관관계 - 빨간색 계열
                            if (absValue >= 0.7) {
                              bgColor = 'bg-red-600'
                              textColor = 'text-white'
                              opacity = '100'
                            } else if (absValue >= 0.5) {
                              bgColor = 'bg-red-500'
                              textColor = 'text-white'
                              opacity = '80'
                            } else if (absValue >= 0.3) {
                              bgColor = 'bg-red-400'
                              textColor = 'text-white'
                              opacity = '60'
                            } else {
                              bgColor = 'bg-red-200'
                              textColor = 'text-red-800'
                              opacity = '40'
                            }
                          } else {
                            // 음의 상관관계 - 파란색 계열
                            if (absValue >= 0.7) {
                              bgColor = 'bg-blue-600'
                              textColor = 'text-white'
                              opacity = '100'
                            } else if (absValue >= 0.5) {
                              bgColor = 'bg-blue-500'
                              textColor = 'text-white'
                              opacity = '80'
                            } else if (absValue >= 0.3) {
                              bgColor = 'bg-blue-400'
                              textColor = 'text-white'
                              opacity = '60'
                            } else {
                              bgColor = 'bg-blue-200'
                              textColor = 'text-blue-800'
                              opacity = '40'
                            }
                          }
                          
                          return (
                            <div
                              key={j}
                              className={`${bgColor} ${textColor} text-xs font-semibold text-center py-3 px-2 rounded transition-all duration-200 hover:scale-105 cursor-pointer`}
                              style={{ opacity: opacity === '100' ? 1 : parseInt(opacity) / 100 }}
                              title={`${rowCol} vs ${correlationMatrix.columns[j]}: ${value.toFixed(3)}`}
                            >
                              {value.toFixed(2)}
                            </div>
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  {/* 색상 범례 */}
                  <div className="mt-6 flex justify-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">-1</span>
                        <div className="flex">
                          <div className="w-6 h-4 bg-blue-600"></div>
                          <div className="w-6 h-4 bg-blue-500 opacity-80"></div>
                          <div className="w-6 h-4 bg-blue-400 opacity-60"></div>
                          <div className="w-6 h-4 bg-blue-200 opacity-40"></div>
                        </div>
                        <span className="text-xs text-gray-600">음의 상관</span>
                      </div>
                      <div className="w-4 h-4 bg-gray-100 border border-gray-300"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">양의 상관</span>
                        <div className="flex">
                          <div className="w-6 h-4 bg-red-200 opacity-40"></div>
                          <div className="w-6 h-4 bg-red-400 opacity-60"></div>
                          <div className="w-6 h-4 bg-red-500 opacity-80"></div>
                          <div className="w-6 h-4 bg-red-600"></div>
                        </div>
                        <span className="text-xs text-gray-600">1</span>
                      </div>
                    </div>
                   </div>
                 </div>
               </div>

               
             </div>
           ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 space-y-2">
                <p className="text-lg">⚠️ 상관관계를 계산할 수 없습니다</p>
                <div className="text-sm space-y-1">
                  <p>가능한 원인:</p>
                  <ul className="list-disc list-inside text-left max-w-md mx-auto">
                    <li>선택된 컬럼 인덱스 [7, 9, 11, 24] 중 일부가 존재하지 않음</li>
                    <li>해당 컬럼들에 숫자 데이터가 부족함</li>
                    <li>모든 컬럼에 동시에 유효한 데이터가 있는 행이 3개 미만</li>
                  </ul>
                  <p className="mt-3 text-xs text-blue-600">
                    💡 브라우저 개발자 도구 콘솔에서 상세한 디버깅 정보를 확인하세요.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 만족도 분석 표시 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 bg-purple-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">😊 만족도 분석 (L열~V열)</h3>
          <p className="text-sm text-gray-600">
            매우만족(5점), 다소만족(4점), 보통(3점), 약간불만족(2점), 매우불만족(1점)으로 변환하여 분석합니다.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">컬럼명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균점수</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">매우만족(5)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">다소만족(4)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">보통(3)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">약간불만족(2)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">매우불만족(1)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {satisfactionStats.map((stat, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.column}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-purple-600">
                    {stat.average.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-green-600 font-medium">
                    {stat.verySatisfied}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-blue-600 font-medium">
                    {stat.somewhatSatisfied}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-yellow-600 font-medium">
                    {stat.neutral}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-orange-600 font-medium">
                    {stat.somewhatDissatisfied}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-red-600 font-medium">
                    {stat.veryDissatisfied}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {satisfactionStats.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">L열~V열에 만족도 데이터가 없습니다.</p>
          </div>
        )}
      </div>

      

      {/* 텍스트 분석 표시 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 bg-blue-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">📝 텍스트 분석 (W열, X열, Z열)</h3>
          <p className="text-sm text-gray-600">
            워드클라우드와 긍정/부정 단어 분석을 통해 텍스트 데이터를 시각화합니다.
          </p>
        </div>
        <div className="p-6">
          {textAnalysisStats.map((stat, index) => (
            <div key={index} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">{stat.column}</h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 워드클라우드 */}
                <div>
                  <h5 className="text-md font-semibold text-gray-700 mb-3">워드클라우드</h5>
                  <div className="bg-white rounded-lg border">
                    <WordCloudChart
                      data={stat.wordCloud.map(word => ({
                        name: word.text,
                        value: word.value,
                        frequency: word.frequency
                      }))}
                      height={350}
                      onWordClick={(word) => handleWordClick(word, stat.column)}
                      title=""
                    />
                  </div>
                </div>
                
                {/* 개선된 감정 분석 */}
                <div>
                  <h5 className="text-md font-semibold text-gray-700 mb-4">🎭 감정 분석</h5>
                  
                  {/* 감정 점수 표시 */}
                  <div className="mb-6 p-4 bg-white rounded-lg border">
                    
                    {/* 감정 점수 바 */}
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="h-4 rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.abs(stat.sentimentScore) * 50}%`,
                            marginLeft: stat.sentimentScore >= 0 ? '50%' : `${50 + (stat.sentimentScore * 50)}%`,
                            backgroundColor: stat.sentimentScore > 0 ? '#10b981' : '#ef4444'
                          }}
                        ></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-0.5 h-6 bg-gray-400"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>부정</span>
                      <span>중립</span>
                      <span>긍정</span>
                    </div>
                  </div>
                  
                  {/* 통계 요약 */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">{stat.positiveWords}</div>
                      <div className="text-sm text-green-700 font-medium">긍정 단어</div>
                      <div className="text-xs text-green-600 mt-1">{stat.positiveRatio.toFixed(1)}%</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border">
                      <div className="text-2xl font-bold text-red-600">{stat.negativeWords}</div>
                      <div className="text-sm text-red-700 font-medium">부정 단어</div>
                      <div className="text-xs text-red-600 mt-1">{stat.negativeRatio.toFixed(1)}%</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">{stat.suggestWords}</div>
                      <div className="text-sm text-orange-700 font-medium">제안 단어</div>
                      <div className="text-xs text-orange-600 mt-1">{stat.suggestRatio.toFixed(1)}%</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{stat.uniqueWords}</div>
                      <div className="text-sm text-blue-700 font-medium">고유 단어</div>
                      <div className="text-xs text-blue-600 mt-1">총 {stat.totalWords}개</div>
                    </div>
                  </div>
                  
                  
                  {/* 전체 통계 */}
                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <div className="text-sm text-gray-600">
                      총 단어 수: <span className="font-semibold">{stat.totalWords.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {textAnalysisStats.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">W열, X열, Z열에 텍스트 데이터가 없습니다.</p>
          </div>
        )}
      </div>

     

      {/* 단어 상세 정보 모달 */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  단어 상세 정보: <span className="text-blue-600">"{selectedWord.word}"</span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  컬럼: {selectedWord.column} | 총 {selectedWord.details.length}개 항목
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {selectedWord.details.map((detail, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {detail.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          행 번호: {detail.rowIndex}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-800 leading-relaxed">
                      {detail.text.split(new RegExp(`(${selectedWord.word})`, 'gi')).map((part, partIndex) => (
                        <span
                          key={partIndex}
                          className={
                            part.toLowerCase() === selectedWord.word.toLowerCase()
                              ? 'bg-yellow-200 font-semibold px-1 rounded'
                              : ''
                          }
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedWord.details.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">해당 단어를 포함한 데이터가 없습니다.</p>
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  const csvData = selectedWord.details.map(detail => 
                    `"${detail.author}","${detail.rowIndex}","${detail.text.replace(/"/g, '""')}"`
                  ).join('\n')
                  const blob = new Blob([`작성자,행번호,내용\n${csvData}`], { type: 'text/csv;charset=utf-8;' })
                  const link = document.createElement('a')
                  const url = URL.createObjectURL(blob)
                  link.setAttribute('href', url)
                  link.setAttribute('download', `${selectedWord.word}_상세내용.csv`)
                  link.style.visibility = 'hidden'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                CSV 다운로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 레벨별 데이터 모달 */}
      {selectedLevelData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  📊 {selectedLevelData.column} - {selectedLevelData.level} 원본 데이터
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  총 {selectedLevelData.data.length}개의 행이 있습니다.
                </p>
              </div>
              <button
                onClick={closeLevelModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {selectedLevelData.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          행 번호
                        </th>
                        {columns.map((column, index) => (
                          <th 
                            key={index} 
                            className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider ${
                              column === selectedLevelData.column 
                                ? 'text-purple-700 bg-purple-50 font-bold' 
                                : 'text-gray-500'
                            }`}
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedLevelData.data.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                            {item.rowIndex}
                          </td>
                          {columns.map((column, colIndex) => (
                            <td 
                              key={colIndex} 
                              className={`px-3 py-2 text-sm ${
                                column === selectedLevelData.column 
                                  ? 'text-purple-800 font-semibold bg-purple-50' 
                                  : 'text-gray-900'
                              }`}
                            >
                              <div className="max-w-xs truncate" title={String(item.row[column] || '')}>
                                {String(item.row[column] || '')}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">해당 레벨에 대한 데이터가 없습니다.</p>
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={closeLevelModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  const headers = ['행번호', ...columns]
                  const csvData = selectedLevelData.data.map(item => {
                    const row = [item.rowIndex, ...columns.map(col => `"${String(item.row[col] || '').replace(/"/g, '""')}"`)]
                    return row.join(',')
                  }).join('\n')
                  const blob = new Blob([`${headers.join(',')}\n${csvData}`], { type: 'text/csv;charset=utf-8;' })
                  const link = document.createElement('a')
                  const url = URL.createObjectURL(blob)
                  link.setAttribute('href', url)
                  link.setAttribute('download', `${selectedLevelData.column}_${selectedLevelData.level}_데이터.csv`)
                  link.style.visibility = 'hidden'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                CSV 다운로드
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
