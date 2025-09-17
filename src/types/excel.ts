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

export interface NumericStats {
  min: number
  max: number
  mean: number
  median: number
  sum: number
  count: number
}

export interface ExcelUploaderProps {
  onDataExtracted: (data: ExcelData[], fileName: string) => void
}

export interface ExcelDataViewerProps {
  data: ExcelData[]
  fileName: string
}

export interface ExcelVisualizationProps {
  data: ExcelData[]
  fileName: string
}
