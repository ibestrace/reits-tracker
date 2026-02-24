'use client';

import ReactECharts from 'echarts-for-react';
import { KLineData, TimeRange } from '@/lib/types';

interface CompareChartProps {
  data: { code: string; name: string; klineData: KLineData[] }[];
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

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
];

export default function CompareChart({ data, timeRange, onTimeRangeChange, loading }: CompareChartProps) {
  // 获取所有日期的并集
  const allDates = new Set<string>();
  data.forEach(item => {
    item.klineData.forEach(k => allDates.add(k.date));
  });
  const dates = Array.from(allDates).sort();

  // 为每个REIT创建数据系列
  const series = data.map((item, index) => {
    const color = COLORS[index % COLORS.length];
    const priceMap = new Map(item.klineData.map(k => [k.date, k.close]));
    
    return {
      name: item.name,
      type: 'line' as const,
      data: dates.map(date => priceMap.get(date) || null),
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
        color
      },
      itemStyle: {
        color
      }
    };
  });

  const option = {
    title: {
      text: '价格走势对比',
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
        if (!params || params.length === 0) return '';
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((p: any) => {
          result += `${p.marker} ${p.seriesName}: ${p.value ? p.value.toFixed(4) : 'N/A'}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: data.map(d => d.name),
      top: '8%',
      type: 'scroll'
    },
    grid: {
      left: '8%',
      right: '5%',
      top: '20%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: dates,
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
    series,
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        bottom: '5%'
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
