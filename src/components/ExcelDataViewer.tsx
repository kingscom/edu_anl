'use client'

import { useMemo, useState } from 'react'

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
  '그리고', '그런데', '하지만', '또한', '및', '또', '또는', '혹은', '그러나', '때문에', '때문', '그래서', '그렇지만', '다만',
  '정말', '매우', '너무', '좀', '더', '등', '등등', '약간', '대체로', '전반적으로', '전체적으로', '일부', '사실', '솔직히',
  '이다', '입니다', '였다', '있습니다', '했습니다', '합니다', '했다', '하는', '하여', '해서', '하면', '하려고', '하려면',
  '수', '것', '거', '분', '명', '부분', '사항', '내용', '점', '측면', '경우', '때', '동안', '후', '전', '이후', '이전', '현재', '관련',
  '에서', '으로', '에게', '와', '과', '를', '을', '은', '는', '이', '가', '에', '도', '만', '보다', '처럼', '같이', '까지', '부터',
  '및', '등의', '등을', '등도', '또', '또는', '혹은', '각', '별', '등등', '여러', '많은', '많이', '적당히', '서로', '각각',
  '아주', '굉장히', '정도', '수준', '대해', '대한', '때문에', '바로', '또다시', '다시', '다소', '이번', '지난', '다음', '해당',
  '예를', '들어', '예시', '예로', '즉', '또한', '또', '혹은', '혹시', '때때로', '보통', '항상', '자주', '가끔', '거의',
  '저희', '우리', '본인', '본', '귀사', '회사', '팀', '부서', '사내', '현업', '현장', '업무', '사람', '동료', '고객',
  '아', '어', '음', '음…', '음...', '요', '죠', '네', '예', '응', '허허', 'ㅎㅎ', 'ㅋㅋ', 'ㅠㅠ', '^^', '--', '—', '없습니다', '특별히', '수고하셨습니다', '같습니다'
]

// 텍스트 전처리 함수 (불용어 제거 및 특징적인 단어만 추출)
const preprocessText = (text: string): string[] => {
  return String(text)
    .toLowerCase()
    .replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\s]/g, '') // 한글과 공백만 남김
    .split(/\s+/)
    .filter(word => 
      word.length >= 2 && // 2글자 이상
      word.length <= 10 && // 10글자 이하
      !stopWords.includes(word) && // 불용어 제거
      !/^\d+$/.test(word) && // 숫자만 있는 단어 제거
      !/^[가-힣]{1}$/.test(word) // 1글자 한글 제거
    )
}

// 단어 빈도 계산 함수
const calculateWordFrequency = (words: string[]): { [key: string]: number } => {
  const frequency: { [key: string]: number } = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })
  return frequency
}

// 긍정/부정/제안 단어 분류 함수
const classifyWords = (words: string[]): { positive: number; negative: number; suggest: number; neutral: number } => {
  let positive = 0
  let negative = 0
  let suggest = 0
  let neutral = 0

  words.forEach(word => {
    if (positiveWords.includes(word)) {
      positive++
    } else if (negativeWords.includes(word)) {
      negative++
    } else if (suggestWords.includes(word)) {
      suggest++
    } else {
      neutral++
    }
  })

  return { positive, negative, suggest, neutral }
}

export default function ExcelDataViewer({ data, fileName }: ExcelDataViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'raw' | 'summary'>('raw')
  const [selectedWord, setSelectedWord] = useState<{
    word: string
    column: string
    details: Array<{ text: string; author: string; rowIndex: number }>
  } | null>(null)

  // 검색 필터링
  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

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
        // 모든 텍스트를 합쳐서 단어 추출
        const allWords = texts.flatMap(text => preprocessText(text))
        const wordFrequency = calculateWordFrequency(allWords)
        const classification = classifyWords(allWords)
        
        // 워드클라우드용 데이터 (의미있는 단어만 선별)
        const meaningfulWords = Object.entries(wordFrequency)
          .filter(([word, count]) => 
            count >= 2 && // 2회 이상 출현
            word.length >= 3 && // 3글자 이상
            !word.includes('하다') && // 동사 어미 제거
            !word.includes('되다') &&
            !word.includes('이다') &&
            !word.includes('있다') &&
            !word.includes('없다')
          )
          .sort(([,a], [,b]) => b - a)
          .slice(0, 15) // 상위 15개만
          .map(([text, value]) => ({ text, value }))
        
        const totalWords = allWords.length
        const uniqueWords = Object.keys(wordFrequency).length
        
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
          wordCloud: meaningfulWords
        })
      }
    })
    
    return stats
  }, [filteredData, textAnalysisColumns])

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

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">엑셀 데이터 뷰어</h2>
            <p className="text-gray-600 mt-1">파일: {fileName}</p>
            <p className="text-sm text-gray-500">
              총 {filteredData.length}개 행, {columns.length}개 컬럼
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
          <div className="flex-1">
            <input
              type="text"
              placeholder="데이터 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 평균 등급 표시 */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800 mb-2">
                      {stat.average.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">평균 등급</div>
                    <div className="flex justify-center space-x-1">
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
                  </div>
                  
                  {/* 레벨별 분포 막대그래프 */}
                  <div>
                    <div className="text-sm text-gray-600 mb-3">레벨별 분포</div>
                    <div className="space-y-2">
                      {levelDistribution.map(({ level, count }) => {
                        const maxCount = Math.max(...levelDistribution.map(d => d.count));
                        const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        
                        return (
                          <div key={level} className="flex items-center">
                            <div className="w-12 text-sm text-gray-600">{level}레벨</div>
                            <div className="flex-1 mx-2">
                              <div className="bg-gray-200 rounded-full h-4 relative">
                                <div 
                                  className="bg-purple-400 h-4 rounded-full transition-all duration-300"
                                  style={{ width: `${barWidth}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="w-8 text-sm text-gray-600 text-right">{count}</div>
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
                  <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg border">
                    {stat.wordCloud.length > 0 ? (
                      stat.wordCloud.map((word, wordIndex) => {
                        const size = Math.max(14, Math.min(28, word.value * 1.5 + 12)) // 14px ~ 28px
                        const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 'text-red-600', 'text-indigo-600', 'text-pink-600']
                        const colorClass = colors[wordIndex % colors.length]
                        
                        return (
                          <span
                            key={wordIndex}
                            className={`${colorClass} font-semibold hover:scale-110 transition-all duration-200 cursor-pointer px-2 py-1 rounded-md hover:bg-gray-100 hover:shadow-md`}
                            style={{ fontSize: `${size}px` }}
                            title={`${word.text}: ${word.value}회 출현 (클릭하여 상세보기)`}
                            onClick={() => handleWordClick(word.text, stat.column)}
                          >
                            {word.text}
                          </span>
                        )
                      })
                    ) : (
                      <div className="text-gray-500 text-sm">의미있는 단어가 충분하지 않습니다.</div>
                    )}
                  </div>
                </div>
                
                {/* 긍정/부정 분석 */}
                <div>
                  <h5 className="text-md font-semibold text-gray-700 mb-3">감정 분석</h5>
                  
                  {/* 통계 요약 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stat.positiveWords}</div>
                      <div className="text-sm text-gray-600">긍정 단어</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{stat.negativeWords}</div>
                      <div className="text-sm text-gray-600">부정 단어</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stat.suggestWords}</div>
                      <div className="text-sm text-gray-600">제안 단어</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stat.uniqueWords}</div>
                      <div className="text-sm text-gray-600">고유 단어</div>
                    </div>
                  </div>
                  
                  {/* 비율 막대그래프 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">긍정</span>
                      <span className="text-sm font-medium text-green-600">{stat.positiveRatio.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stat.positiveRatio}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">부정</span>
                      <span className="text-sm font-medium text-red-600">{stat.negativeRatio.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-red-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stat.negativeRatio}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">제안</span>
                      <span className="text-sm font-medium text-orange-600">{stat.suggestRatio.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stat.suggestRatio}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">중립</span>
                      <span className="text-sm font-medium text-gray-600">{stat.neutralRatio.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gray-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stat.neutralRatio}%` }}
                      ></div>
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
    </div>
  )
}
