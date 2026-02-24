'use client';

import { MarketStats } from '@/lib/types';

interface StatCardProps {
  stats: MarketStats;
}

export default function StatCard({ stats }: StatCardProps) {
  const formatValue = (num: number) => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿';
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '万';
    }
    return num.toFixed(2);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">产品总数</div>
        <div className="text-2xl font-bold">{stats.totalCount}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50">
        <div className="text-sm text-gray-500">上涨</div>
        <div className="text-2xl font-bold text-red-500">{stats.upCount}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50">
        <div className="text-sm text-gray-500">下跌</div>
        <div className="text-2xl font-bold text-green-500">{stats.downCount}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">平盘</div>
        <div className="text-2xl font-bold text-gray-500">{stats.flatCount}</div>
      </div>
    </div>
  );
}
