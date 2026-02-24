'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getReitsList, getKLineData, calculateMarketStats } from '@/lib/api';
import { REITS_CODES } from '@/lib/reitsCodes';
import { ReitsItem, KLineData, TimeRange, MarketStats } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ReitsTable from '@/components/ReitsTable';
import SearchBar from '@/components/SearchBar';
import StatCard from '@/components/StatCard';

const PriceChart = dynamic(() => import('@/components/PriceChart'), { ssr: false });

export default function Home() {
  const [reitsList, setReitsList] = useState<ReitsItem[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [kLineData, setKLineData] = useState<KLineData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [stats, setStats] = useState<MarketStats>({
    totalCount: 0,
    totalMarketValue: 0,
    circulatingValue: 0,
    upCount: 0,
    downCount: 0,
    flatCount: 0
  });
  const [favorites, setFavorites] = useLocalStorage<string[]>('reits-favorites', []);

  const fetchReitsList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReitsList();
      setReitsList(data);
      setStats(calculateMarketStats(data));
      
      if (data.length > 0 && !selectedCode) {
        setSelectedCode(data[0].code);
      }
    } catch (error) {
      console.error('Failed to fetch REITs list:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCode]);

  const fetchKLine = useCallback(async (code: string, range: TimeRange) => {
    const reits = REITS_CODES.find(r => r.code === code);
    if (!reits) return;
    
    setChartLoading(true);
    try {
      const data = await getKLineData(code, reits.exchange, range);
      setKLineData(data);
    } catch (error) {
      console.error('Failed to fetch K-line data:', error);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReitsList();
  }, []);

  useEffect(() => {
    if (selectedCode) {
      fetchKLine(selectedCode, timeRange);
    }
  }, [selectedCode, timeRange, fetchKLine]);

  const handleSelectCode = (code: string) => {
    setSelectedCode(code);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  const toggleFavorite = (code: string) => {
    if (favorites.includes(code)) {
      setFavorites(favorites.filter(f => f !== code));
    } else {
      setFavorites([...favorites, code]);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchText) return reitsList;
    const lower = searchText.toLowerCase();
    return reitsList.filter(
      r => r.code.toLowerCase().includes(lower) || r.name.toLowerCase().includes(lower)
    );
  }, [reitsList, searchText]);

  const selectedReits = useMemo(() => {
    return REITS_CODES.find(r => r.code === selectedCode);
  }, [selectedCode]);

  const isFavorite = favorites.includes(selectedCode);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              中国公募REITs行情跟踪
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              实时跟踪深圳(180xxx) & 上海(508xxx) 交易所上市的公募REITs产品
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/ranking" 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              排行榜
            </Link>
            <Link 
              href="/favorites" 
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              自选 {favorites.length > 0 && `(${favorites.length})`}
            </Link>
          </div>
        </header>

        <StatCard stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: 'calc(100vh - 320px)' }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <SearchBar value={searchText} onChange={setSearchText} />
            <div className="flex-1 min-h-0 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">加载中...</div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">暂无数据</div>
                </div>
              ) : (
                <ReitsTable
                  data={filteredData}
                  selectedCode={selectedCode}
                  onSelect={handleSelectCode}
                />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <PriceChart
                data={kLineData}
                name={selectedReits?.name || ''}
                code={selectedCode}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
                loading={chartLoading}
              />
            </div>
            {selectedCode && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => toggleFavorite(selectedCode)}
                  className={`px-4 py-2 rounded ${
                    isFavorite 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isFavorite ? '★ 取消自选' : '☆ 添加自选'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
