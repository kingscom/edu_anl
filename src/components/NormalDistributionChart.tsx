'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface DistributionData {
  columnName: string
  data: number[]
  mean: number
  std: number
  min: number
  max: number
}

interface NormalDistributionChartProps {
  data: DistributionData
  width?: string | number
  height?: string | number
}

export default function NormalDistributionChart({ 
  data, 
  width = '100%', 
  height = 300
}: NormalDistributionChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || !data || data.data.length === 0) {
      return
    }

    // 데이터 유효성 검사
    const validData = data.data.filter(value => isFinite(value))
    if (validData.length < 2) {
      console.warn('정규분포 차트: 유효한 데이터가 부족합니다.', { 
        totalData: data.data.length, 
        validData: validData.length 
      })
      return
    }

    // 기존 차트 인스턴스 정리
    if (chartRef.current) {
      echarts.dispose(chartRef.current)
    }

    // 새 차트 인스턴스 생성
    const chart = echarts.init(chartRef.current)

    // 히스토그램 데이터 계산 (안전한 값 검증 추가)
    const dataLength = data.data.length
    const range = data.max - data.min
    
    // 안전한 binCount 계산
    let binCount = Math.min(20, Math.max(5, Math.sqrt(dataLength)))
    
    // 유효성 검사
    if (!isFinite(binCount) || binCount <= 0 || range <= 0) {
      console.warn('Invalid binCount or range:', { binCount, range, dataLength })
      binCount = 10 // 기본값 설정
    }
    
    // 정수로 변환
    binCount = Math.floor(binCount)
    
    const binWidth = range > 0 ? range / binCount : 1
    
    const bins: number[] = new Array(binCount).fill(0)
    const binCenters: number[] = []
    
    for (let i = 0; i < binCount; i++) {
      binCenters.push(data.min + (i + 0.5) * binWidth)
    }
    
    // 데이터를 bin에 분배 (안전한 인덱스 계산)
    data.data.forEach(value => {
      if (isFinite(value) && binWidth > 0) {
        const binIndex = Math.min(Math.max(0, Math.floor((value - data.min) / binWidth)), binCount - 1)
        if (binIndex >= 0 && binIndex < binCount) {
          bins[binIndex]++
        }
      }
    })
    
    // 정규분포 곡선 계산 (안전한 계산)
    const normalCurve: number[] = []
    const normalX: number[] = []
    
    // 표준편차가 0이거나 유효하지 않은 경우 처리
    const validStd = data.std > 0 && isFinite(data.std) ? data.std : 1
    const validMean = isFinite(data.mean) ? data.mean : (data.min + data.max) / 2
    
    for (let i = 0; i <= 100; i++) {
      const x = data.min + (i / 100) * range
      normalX.push(x)
      
      // 정규분포 확률밀도함수 (안전한 계산)
      const exponent = -Math.pow(x - validMean, 2) / (2 * Math.pow(validStd, 2))
      
      // 지수가 너무 작아지는 것을 방지
      const safeExponent = Math.max(exponent, -50)
      const y = (1 / (validStd * Math.sqrt(2 * Math.PI))) * Math.exp(safeExponent)
      
      // 히스토그램과 스케일을 맞추기 위해 조정
      const scaledY = isFinite(y) ? y * dataLength * binWidth : 0
      normalCurve.push(scaledY)
    }

    const option = {
      title: {
        text: `${data.columnName} 분포`,
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: function(params: any) {
          if (params.length === 1) {
            const param = params[0]
            if (param.seriesName === '히스토그램') {
              const binCenter = Array.isArray(param.value) ? param.value[0] : param.value
              const count = Array.isArray(param.value) ? param.value[1] : param.value
              const binStart = (binCenter - binWidth / 2).toFixed(2)
              const binEnd = (binCenter + binWidth / 2).toFixed(2)
              return `구간: [${binStart}, ${binEnd})<br/>빈도: ${count}개`
            } else {
              const x = Array.isArray(param.value) ? param.value[0] : param.axisValue
              const density = Array.isArray(param.value) ? param.value[1] : param.value
              return `값: ${parseFloat(x).toFixed(2)}<br/>정규분포 밀도: ${density.toFixed(4)}`
            }
          }
          let result = `값: ${params[0].axisValue.toFixed(2)}<br/>`
          params.forEach((param: any) => {
            const value = Array.isArray(param.value) ? param.value[1] : param.value
            if (param.seriesName === '히스토그램') {
              result += `빈도: ${value}개<br/>`
            } else {
              result += `정규분포 밀도: ${value.toFixed(4)}<br/>`
            }
          })
          return result
        }
      },
      legend: {
        data: ['히스토그램', '정규분포'],
        bottom: 0
      },
      xAxis: {
        type: 'value',
        name: '값',
        min: data.min,
        max: data.max,
        axisLabel: {
          formatter: '{value}'
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '빈도',
          position: 'left',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: '밀도',
          position: 'right',
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: '히스토그램',
          type: 'bar',
          data: bins.map((count, index) => [binCenters[index], count]),
          itemStyle: {
            color: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          barWidth: binWidth * 0.8, // 실제 bin 너비에 맞춤
          barCategoryGap: '0%'
        },
        {
          name: '정규분포',
          type: 'line',
          yAxisIndex: 1,
          data: normalCurve.map((density, index) => [normalX[index], density]),
          smooth: true,
          itemStyle: {
            color: 'rgba(255, 99, 132, 1)'
          },
          lineStyle: {
            color: 'rgba(255, 99, 132, 1)',
            width: 2
          },
          symbol: 'none'
        }
      ],
      grid: {
        bottom: 60,
        top: 60,
        left: 60,
        right: 60
      }
    }

    chart.setOption(option)

    // 리사이즈 이벤트
    const handleResize = () => {
      chart.resize()
    }

    window.addEventListener('resize', handleResize)

    // 강제 리사이즈
    setTimeout(() => {
      chart.resize()
    }, 100)

    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [data, width, height])

  if (!data || data.data.length === 0) {
    return (
      <div 
        style={{ width, height }}
        className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
      >
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">📊</p>
          <p className="text-gray-600">분포 데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <div 
        ref={chartRef}
        style={{ 
          width: '100%', 
          height: typeof height === 'number' ? `${height}px` : height,
          minHeight: '250px'
        }}
        className="distribution-chart"
      />
      <div className="mt-2 text-xs text-gray-600 text-center space-y-1">
        <div>평균: {data.mean.toFixed(2)}, 표준편차: {data.std.toFixed(2)}</div>
        <div>최솟값: {data.min.toFixed(2)}, 최댓값: {data.max.toFixed(2)}, 샘플수: {data.data.length}</div>
      </div>
    </div>
  )
}
