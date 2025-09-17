import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            교육 분석 플랫폼
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            데이터 기반 교육 인사이트로 학습 효과를 극대화하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/analytics"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              분석 시작하기
            </Link>
            <Link
              href="/demo"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              데모 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

