'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Footer from '@/components/Footer'
import ExcelUploader from '@/components/ExcelUploader'
import ExcelDataViewer from '@/components/ExcelDataViewer'
import { ExcelData } from '@/utils/excelUtils'

export default function Home() {
  const [excelData, setExcelData] = useState<ExcelData[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [showDataViewer, setShowDataViewer] = useState(false)

  const handleDataExtracted = (data: ExcelData[], file: string) => {
    setExcelData(data)
    setFileName(file)
    setShowDataViewer(true)
  }

  const handleReset = () => {
    setExcelData([])
    setFileName('')
    setShowDataViewer(false)
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {!showDataViewer ? (
        <>
          <Hero />
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  엑셀 파일 업로드
                </h2>
                <p className="text-xl text-gray-600">
                  엑셀 파일을 업로드하여 데이터를 분석해보세요
                </p>
              </div>
              <ExcelUploader onDataExtracted={handleDataExtracted} />
            </div>
          </section>
          <Features />
        </>
      ) : (
        <section className="py-8 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← 새 파일 업로드
              </button>
            </div>
            <ExcelDataViewer data={excelData} fileName={fileName} />
          </div>
        </section>
      )}
      
      <Footer />
    </main>
  )
}

