'use client';

import ReactECharts from 'echarts-for-react';
import { KLineData, TimeRange } from '@/lib/types';

interface PriceChartProps {
  data: KLineData[];
  name: string;
  code: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  loading: boolean;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1M', label: '近1月' },
  { value: '3M', label: '近3月' },
  { value: '6M', label: '近6月' },
  { value: '1Y', label: '近1年' },
  { value: 'ALL', label: '全部' },
];

export default function PriceChart({ data, name, code, timeRange, onTimeRangeChange, loading }: PriceChartProps) {
  const option = {
    title: {
      text: `${name} (${code})`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      },
      formatter: (params: any) => {
        const data = params[0];
        return `${data.axisValue}<br/>
                开盘: ${data.data[1].toFixed(4)}<br/>
                收盘: ${data.data[2].toFixed(4)}<br/>
                最高: ${data.data[3].toFixed(4)}<br/>
                最低: ${data.data[4].toFixed(4)}<br/>
                成交量: ${(data.data[5] / 10000).toFixed(2)}万`;
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: (value: number) => value.toFixed(2)
      }
    },
    series: [
      {
        type: 'line',
        data: data.map(d => [d.open, d.close, d.low, d.high, d.volume]),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#3b82f6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ]
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-center gap-2 mb-2">
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => onTimeRangeChange(range.value)}
            className={`px-3 py-1 text-sm rounded ${
              timeRange === range.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">暂无数据</div>
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        )}
      </div>
    </div>
  );
}
