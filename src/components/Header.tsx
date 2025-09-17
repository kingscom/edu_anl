'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Edu Analytics
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              홈
            </Link>
            <Link href="/analytics" className="text-gray-700 hover:text-primary-600 transition-colors">
              분석
            </Link>
            <Link href="/reports" className="text-gray-700 hover:text-primary-600 transition-colors">
              리포트
            </Link>
            <Link href="/settings" className="text-gray-700 hover:text-primary-600 transition-colors">
              설정
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-primary-600 transition-colors">
              로그인
            </button>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              시작하기
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                홈
              </Link>
              <Link href="/analytics" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                분석
              </Link>
              <Link href="/reports" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                리포트
              </Link>
              <Link href="/settings" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                설정
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

