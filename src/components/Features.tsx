export default function Features() {
  const features = [
    {
      title: '실시간 분석',
      description: '학습 데이터를 실시간으로 분석하여 즉시 인사이트를 제공합니다.',
      icon: '📊',
    },
    {
      title: '맞춤형 리포트',
      description: '교육기관의 특성에 맞는 상세한 분석 리포트를 생성합니다.',
      icon: '📈',
    },
    {
      title: '예측 분석',
      description: 'AI 기반 예측 모델로 학습 성과를 미리 예측합니다.',
      icon: '🔮',
    },
    {
      title: '시각화',
      description: '직관적인 차트와 그래프로 데이터를 쉽게 이해할 수 있습니다.',
      icon: '📊',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            강력한 기능들
          </h2>
          <p className="text-xl text-gray-600">
            교육 분석을 위한 모든 도구를 한 곳에서
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

