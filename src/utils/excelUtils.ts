export interface ExcelData {
  [key: string]: any
}

export interface ExcelStats {
  totalRows: number
  totalColumns: number
  columnNames: string[]
  dataTypes: { [key: string]: string }
  nullCounts: { [key: string]: number }
  uniqueCounts: { [key: string]: number }
}

/**
 * 엑셀 데이터의 통계 정보를 계산합니다
 */
export function calculateExcelStats(data: ExcelData[]): ExcelStats {
  if (!data || data.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      columnNames: [],
      dataTypes: {},
      nullCounts: {},
      uniqueCounts: {}
    }
  }

  const columnNames = Object.keys(data[0])
  const dataTypes: { [key: string]: string } = {}
  const nullCounts: { [key: string]: number } = {}
  const uniqueCounts: { [key: string]: number } = {}

  // 각 컬럼에 대한 통계 계산
  columnNames.forEach(column => {
    const values = data.map(row => row[column])
    
    // 데이터 타입 확인
    const nonNullValues = values.filter(val => val !== null && val !== undefined && val !== '')
    if (nonNullValues.length === 0) {
      dataTypes[column] = 'empty'
    } else {
      const firstValue = nonNullValues[0]
      if (typeof firstValue === 'number') {
        dataTypes[column] = 'number'
      } else if (typeof firstValue === 'boolean') {
        dataTypes[column] = 'boolean'
      } else if (firstValue instanceof Date) {
        dataTypes[column] = 'date'
      } else {
        dataTypes[column] = 'string'
      }
    }

    // null 값 개수
    nullCounts[column] = values.filter(val => 
      val === null || val === undefined || val === ''
    ).length

    // 고유 값 개수
    const uniqueValues = new Set(values.filter(val => 
      val !== null && val !== undefined && val !== ''
    ))
    uniqueCounts[column] = uniqueValues.size
  })

  return {
    totalRows: data.length,
    totalColumns: columnNames.length,
    columnNames,
    dataTypes,
    nullCounts,
    uniqueCounts
  }
}

/**
 * 숫자 컬럼들의 기본 통계를 계산합니다
 */
export function calculateNumericStats(data: ExcelData[], columnName: string) {
  const values = data
    .map(row => row[columnName])
    .filter(val => val !== null && val !== undefined && val !== '' && !isNaN(Number(val)))
    .map(val => Number(val))

  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      sum: 0,
      count: 0
    }
  }

  const sortedValues = [...values].sort((a, b) => a - b)
  const sum = values.reduce((acc, val) => acc + val, 0)
  const mean = sum / values.length
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
    : sortedValues[Math.floor(sortedValues.length / 2)]

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    sum: Number(sum.toFixed(2)),
    count: values.length
  }
}

/**
 * 데이터를 CSV 형식으로 변환합니다
 */
export function convertToCSV(data: ExcelData[]): string {
  if (!data || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // CSV에서 쉼표나 따옴표가 포함된 값은 따옴표로 감싸기
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      }).join(',')
    )
  ].join('\n')

  return csvContent
}

/**
 * 데이터를 필터링합니다
 */
export function filterData(
  data: ExcelData[], 
  filters: { [key: string]: string }
): ExcelData[] {
  return data.filter(row => {
    return Object.entries(filters).every(([column, searchTerm]) => {
      if (!searchTerm) return true
      const value = String(row[column] || '').toLowerCase()
      return value.includes(searchTerm.toLowerCase())
    })
  })
}

/**
 * 데이터를 정렬합니다
 */
export function sortData(
  data: ExcelData[], 
  column: string, 
  direction: 'asc' | 'desc' = 'asc'
): ExcelData[] {
  return [...data].sort((a, b) => {
    const aVal = a[column]
    const bVal = b[column]
    
    // 숫자 비교
    if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
      return direction === 'asc' 
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal)
    }
    
    // 문자열 비교
    const aStr = String(aVal || '').toLowerCase()
    const bStr = String(bVal || '').toLowerCase()
    
    if (direction === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })
}

/**
 * 데이터를 그룹화합니다
 */
export function groupData(
  data: ExcelData[], 
  groupBy: string
): { [key: string]: ExcelData[] } {
  return data.reduce((groups, row) => {
    const key = String(row[groupBy] || 'Unknown')
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(row)
    return groups
  }, {} as { [key: string]: ExcelData[] })
}
