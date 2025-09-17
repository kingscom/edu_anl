import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Edu Analytics</h3>
            <p className="text-gray-400 mb-4">
              교육 데이터 분석을 통해 더 나은 학습 환경을 만들어가는 플랫폼입니다.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">제품</h4>
            <ul className="space-y-2">
              <li><Link href="/analytics" className="text-gray-400 hover:text-white transition-colors">분석</Link></li>
              <li><Link href="/reports" className="text-gray-400 hover:text-white transition-colors">리포트</Link></li>
              <li><Link href="/api" className="text-gray-400 hover:text-white transition-colors">API</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">지원</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">도움말</Link></li>
              <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">문서</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">문의</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Edu Analytics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

