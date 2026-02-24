'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getReitsList } from '@/lib/api';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ReitsItem } from '@/lib/types';
import { REITS_CODES } from '@/lib/reitsCodes';

export default function FavoritesPage() {
  const [reitsList, setReitsList] = useState<ReitsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useLocalStorage<string[]>('reits-favorites', []);

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

  const favoriteReits = reitsList.filter(r => favorites.includes(r.code));

  const removeFavorite = (code: string) => {
    setFavorites(favorites.filter(f => f !== code));
  };

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
            我的自选
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            共 {favoriteReits.length} 只自选REITs
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : favoriteReits.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">暂无自选REITs</p>
            <Link href="/" className="text-blue-500 hover:underline">
              去添加自选
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">代码</th>
                  <th className="px-4 py-3 text-left">名称</th>
                  <th className="px-4 py-3 text-right">最新价</th>
                  <th className="px-4 py-3 text-right">涨跌幅</th>
                  <th className="px-4 py-3 text-right">成交量</th>
                  <th className="px-4 py-3 text-right">成交额</th>
                  <th className="px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {favoriteReits.map((item) => (
                  <tr key={item.code} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{item.code}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-right">{item.price.toFixed(4)}</td>
                    <td className={`px-4 py-3 text-right ${item.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right">{formatNumber(item.volume)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(item.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeFavorite(item.code)}
                        className="text-red-500 hover:text-red-700"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
