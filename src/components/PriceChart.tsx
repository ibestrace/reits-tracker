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
        if (!params || !params[0]) return '';
        const data = params[0];
        const klineData = data.data;
        if (!klineData) return '';
        return `${data.axisValue}<br/>
                开盘: ${klineData[1]?.toFixed(4) || 'N/A'}<br/>
                收盘: ${klineData[2]?.toFixed(4) || 'N/A'}<br/>
                最低: ${klineData[3]?.toFixed(4) || 'N/A'}<br/>
                最高: ${klineData[4]?.toFixed(4) || 'N/A'}`;
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
        type: 'candlestick',
        data: data.map(d => [d.open, d.close, d.low, d.high]),
        itemStyle: {
          color: '#ef4444',
          color0: '#22c55e',
          borderColor: '#ef4444',
          borderColor0: '#22c55e'
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
