'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getReitsList } from '@/lib/api';
import { ReitsItem } from '@/lib/types';

export default function RankingPage() {
  const [reitsList, setReitsList] = useState<ReitsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'changePercent' | 'volume' | 'amount'>('changePercent');

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

  const sortedData = [...reitsList].sort((a, b) => b[sortBy] - a[sortBy]);
  const topGainers = sortedData.filter(r => r.changePercent > 0).slice(0, 10);
  const topLosers = sortedData.filter(r => r.changePercent < 0).slice(0, 10);

  const formatNumber = (num: number) => {
    if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(2) + '万';
    return num.toFixed(2);
  };

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
            涨跌幅排行榜
          </h1>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-xl font-bold text-red-500 mb-4">涨幅榜 Top10</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-2 text-left">排名</th>
                    <th className="px-2 py-2 text-left">代码</th>
                    <th className="px-2 py-2 text-left">名称</th>
                    <th className="px-2 py-2 text-right">涨跌幅</th>
                  </tr>
                </thead>
                <tbody>
                  {topGainers.map((item, index) => (
                    <tr key={item.code} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2">{item.code}</td>
                      <td className="px-2 py-2 font-medium">{item.name}</td>
                      <td className="px-2 py-2 text-right text-red-500">
                        +{item.changePercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-xl font-bold text-green-500 mb-4">跌幅榜 Top10</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-2 text-left">排名</th>
                    <th className="px-2 py-2 text-left">代码</th>
                    <th className="px-2 py-2 text-left">名称</th>
                    <th className="px-2 py-2 text-right">涨跌幅</th>
                  </tr>
                </thead>
                <tbody>
                  {topLosers.map((item, index) => (
                    <tr key={item.code} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2">{item.code}</td>
                      <td className="px-2 py-2 font-medium">{item.name}</td>
                      <td className="px-2 py-2 text-right text-green-500">
                        {item.changePercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
