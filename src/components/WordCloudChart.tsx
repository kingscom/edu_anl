'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

interface WordCloudData {
  name: string
  value: number
  frequency?: number // 실제 빈도 (선택적)
}

interface WordCloudChartProps {
  data: WordCloudData[]
  width?: string | number
  height?: string | number
  onWordClick?: (word: string) => void
  title?: string
}

export default function WordCloudChart({ 
  data, 
  width = '100%', 
  height = 400, 
  onWordClick,
  title 
}: WordCloudChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) {
      console.log('WordCloud: No container ref')
      return
    }

    if (!data || data.length === 0) {
      console.log('WordCloud: No data', data)
      return
    }

    console.log('WordCloud: Initializing with data:', data)

    // 기존 차트 인스턴스 정리
    if (chartRef.current) {
      echarts.dispose(chartRef.current)
    }

    // 새 차트 인스턴스 생성
    const chart = echarts.init(chartRef.current, null, {
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined
    })

    // 워드클라우드 옵션
    const option = {
      backgroundColor: '#fff',
      tooltip: {
        show: true,
        formatter: function(params: any) {
          const dataItem = data.find(item => item.name === params.name)
          const frequency = dataItem?.frequency || params.value
          return `<strong>${params.name}</strong><br/>빈도: ${frequency}회`
        }
      },
      series: [{
        type: 'wordCloud',
        gridSize: 10,
        sizeRange: [20, 80],
        rotationRange: [0, 0], // 회전 없음으로 단순화
        shape: 'circle',
        maskImage: undefined,
        drawOutOfBound: false,
        layoutAnimation: true,
        textStyle: {
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          color: function() {
            const colors = [
              '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
              '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#ff9f7f'
            ]
            return colors[Math.floor(Math.random() * colors.length)]
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            textShadowBlur: 10,
            textShadowColor: '#333'
          }
        },
        data: data.map(item => ({
          name: item.name,
          value: item.value,
          frequency: item.frequency // 실제 빈도 정보도 전달
        }))
      }]
    }

    // 옵션 설정
    chart.setOption(option)

    // 클릭 이벤트
    if (onWordClick) {
      chart.on('click', function(params: any) {
        if (params.componentType === 'series') {
          onWordClick(params.name)
        }
      })
    }

    // 리사이즈 이벤트
    const handleResize = () => {
      chart.resize()
    }

    window.addEventListener('resize', handleResize)

    // 강제 리사이즈 (렌더링 문제 해결)
    setTimeout(() => {
      chart.resize()
    }, 100)

    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [data, width, height, onWordClick])

  if (!data || data.length === 0) {
    return (
      <div 
        style={{ width, height }}
        className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
      >
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">📊</p>
          <p className="text-gray-600">워드클라우드 데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {title && (
        <div className="text-center py-2">
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
        </div>
      )}
      <div 
        ref={chartRef}
        style={{ 
          width: '100%', 
          height: typeof height === 'number' ? `${height}px` : height,
          minHeight: '300px'
        }}
        className="wordcloud-chart"
      />
    </div>
  )
}