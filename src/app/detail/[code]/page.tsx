'use client';

import { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import { getReitsList, getKLineData } from '@/lib/api';
import { REITS_CODES } from '@/lib/reitsCodes';
import { ReitsItem, KLineData, TimeRange } from '@/lib/types';
import Link from 'next/link';

const PriceChart = dynamic(() => import('@/components/PriceChart'), { ssr: false });

export default function DetailPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const [reitsList, setReitsList] = useState<ReitsItem[]>([]);
  const [kLineData, setKLineData] = useState<KLineData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  const reitsInfo = REITS_CODES.find(r => r.code === resolvedParams.code);
  const reitsData = reitsList.find(r => r.code === resolvedParams.code);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getReitsList();
        setReitsList(data);
      } catch (error) {
        console.error('Failed to fetch REITs list:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!reitsInfo) return;
    
    const fetchKLine = async () => {
      setChartLoading(true);
      try {
        const data = await getKLineData(resolvedParams.code, reitsInfo.exchange, timeRange);
        setKLineData(data);
      } catch (error) {
        console.error('Failed to fetch K-line data:', error);
      } finally {
        setChartLoading(false);
      }
    };
    fetchKLine();
  }, [resolvedParams.code, reitsInfo, timeRange]);

  const formatNumber = (num: number) => {
    if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(2) + '万';
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-500 hover:underline">
            ← 返回首页
          </Link>
        </div>

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {reitsInfo?.name || resolvedParams.code}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            代码: {resolvedParams.code} | 交易所: {reitsInfo?.exchange === 'sz' ? '深圳' : '上海'} | 类型: {reitsInfo?.assetType}
          </p>
        </header>

        {reitsData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">最新价</div>
              <div className="text-2xl font-bold">{reitsData.price.toFixed(4)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">涨跌幅</div>
              <div className={`text-2xl font-bold ${reitsData.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {reitsData.changePercent >= 0 ? '+' : ''}{reitsData.changePercent.toFixed(2)}%
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">成交量</div>
              <div className="text-2xl font-bold">{formatNumber(reitsData.volume)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">成交额</div>
              <div className="text-2xl font-bold">{formatNumber(reitsData.amount)}</div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4" style={{ height: '500px' }}>
          <PriceChart
            data={kLineData}
            name={reitsInfo?.name || ''}
            code={resolvedParams.code}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            loading={chartLoading}
          />
        </div>
      </div>
    </div>
  );
}
