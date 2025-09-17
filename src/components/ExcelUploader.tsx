'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
// XLSX will be imported dynamically

interface ExcelData {
  [key: string]: any
}

interface ExcelUploaderProps {
  onDataExtracted: (data: ExcelData[], fileName: string) => void
}

export default function ExcelUploader({ onDataExtracted }: ExcelUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    setUploadedFile(file)

    try {
      // 동적으로 XLSX 라이브러리 import
      const XLSX = await import('xlsx')
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          if (!data) return

          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          
          // 엑셀 데이터를 JSON으로 변환
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          // 첫 번째 행을 헤더로 사용하여 객체 배열로 변환
          const headers = jsonData[0] as string[]
          const rows = jsonData.slice(1) as any[][]
          
          const formattedData = rows.map(row => {
            const obj: ExcelData = {}
            headers.forEach((header, index) => {
              obj[header] = row[index] || ''
            })
            return obj
          })

          onDataExtracted(formattedData, file.name)
        } catch (error) {
          console.error('엑셀 파일 처리 중 오류:', error)
          alert('엑셀 파일을 처리하는 중 오류가 발생했습니다.')
        } finally {
          setIsUploading(false)
        }
      }

      reader.readAsBinaryString(file)
    } catch (error) {
      console.error('XLSX 라이브러리 로드 중 오류:', error)
      alert('엑셀 파일 처리를 위한 라이브러리를 로드하는 중 오류가 발생했습니다.')
      setIsUploading(false)
    }
  }, [onDataExtracted])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  })

  const removeFile = () => {
    setUploadedFile(null)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        <div className="space-y-4">
          <div className="text-4xl">📊</div>
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600">파일을 처리하는 중...</p>
            </div>
          ) : uploadedFile ? (
            <div className="space-y-2">
              <div className="text-green-600 text-lg">✅ 파일 업로드 완료</div>
              <p className="text-gray-700 font-medium">{uploadedFile.name}</p>
              <button
                onClick={removeFile}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                파일 제거
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? '파일을 여기에 놓으세요' : '엑셀 파일을 업로드하세요'}
              </p>
              <p className="text-sm text-gray-500">
                .xlsx, .xls, .csv 파일을 지원합니다
              </p>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                파일 선택
              </button>
            </div>
          )}
        </div>
      </div>

      {uploadedFile && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium">업로드된 파일: {uploadedFile.name}</p>
              <p className="text-green-600 text-sm">
                크기: {(uploadedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="text-red-600 hover:text-red-800 p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
