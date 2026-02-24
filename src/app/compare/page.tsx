'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getReitsList, getKLineData } from '@/lib/api';
import { REITS_CODES } from '@/lib/reitsCodes';
import { ReitsItem, KLineData, TimeRange } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/components/Toast';
import dynamic from 'next/dynamic';

const CompareChart = dynamic(() => import('@/components/CompareChart'), { ssr: false });

const MAX_COMPARE = 5;

export default function ComparePage() {
  const [reitsList, setReitsList] = useState<ReitsItem[]>([]);
  const [selectedCodes, setSelectedCodes] = useLocalStorage<string[]>('compare-codes', []);
  const [compareData, setCompareData] = useState<{ code: string; name: string; klineData: KLineData[] }[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getReitsList();
        setReitsList(data);
      } catch (error) {
        console.error('Failed to fetch REITs list:', error);
        showToast('error', '获取数据失败');
      }
    };
    fetchData();
  }, [showToast]);

  const toggleSelect = useCallback((code: string) => {
    if (selectedCodes.includes(code)) {
      setSelectedCodes(selectedCodes.filter(c => c !== code));
      showToast('info', '已从对比列表移除');
    } else if (selectedCodes.length < MAX_COMPARE) {
      setSelectedCodes([...selectedCodes, code]);
      showToast('success', '已添加到对比列表');
    } else {
      showToast('warning', `最多只能对比${MAX_COMPARE}个REITs`);
    }
  }, [selectedCodes, setSelectedCodes, showToast]);

  const clearSelection = useCallback(() => {
    setSelectedCodes([]);
    setCompareData([]);
    showToast('info', '已清空对比列表');
  }, [setSelectedCodes, showToast]);

  const fetchCompareData = useCallback(async () => {
    if (selectedCodes.length === 0) {
      setCompareData([]);
      return;
    }

    setLoading(true);
    setChartLoading(true);
    try {
      const promises = selectedCodes.map(async (code) => {
        const reits = REITS_CODES.find(r => r.code === code);
        if (!reits) return null;

        const klineData = await getKLineData(code, reits.exchange, timeRange);
        return {
          code,
          name: reits.name,
          klineData
        };
      });

      const results = await Promise.all(promises);
      const validResults = results.filter(r => r !== null) as { code: string; name: string; klineData: KLineData[] }[];
      setCompareData(validResults);
    } catch (error) {
      console.error('Failed to fetch compare data:', error);
      showToast('error', '获取对比数据失败');
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }, [selectedCodes, timeRange, showToast]);

  useEffect(() => {
    fetchCompareData();
  }, [selectedCodes, timeRange, fetchCompareData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-start">
          <div>
            <Link href="/" className="text-blue-500 hover:underline mb-2 block">
              ← 返回首页
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              价格走势对比
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              已选择 {selectedCodes.length} / {MAX_COMPARE} 个REITs进行对比
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              disabled={selectedCodes.length === 0}
            >
              清空选择
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* REITs选择区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">选择REITs</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
              {reitsList.map((item) => (
                <div
                  key={item.code}
                  onClick={() => toggleSelect(item.code)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                    selectedCodes.includes(item.code)
                      ? 'bg-blue-50 dark:bg-blue-900 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700 border border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{item.price.toFixed(4)}</div>
                    <div className={`text-sm ${item.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 对比图表区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">对比图表</h2>
            <div style={{ height: '500px' }}>
              <CompareChart
                data={compareData}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                loading={chartLoading}
              />
            </div>
            {selectedCodes.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {compareData.map((item) => (
                  <div key={item.code} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-gray-500">{item.code}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
