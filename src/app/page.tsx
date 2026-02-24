'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getReitsList, getKLineData, calculateMarketStats } from '@/lib/api';
import { REITS_CODES } from '@/lib/reitsCodes';
import { ReitsItem, KLineData, TimeRange, MarketStats } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FilterOptions } from '@/lib/utils';
import { exportToCSV, exportToExcel } from '@/lib/export';
import { useToast } from '@/components/Toast';
import ReitsTable from '@/components/ReitsTable';
import SearchBar from '@/components/SearchBar';
import StatCard from '@/components/StatCard';
import FilterPanel from '@/components/FilterPanel';
import SkeletonTable from '@/components/SkeletonTable';

const PriceChart = dynamic(() => import('@/components/PriceChart'), { ssr: false });

export default function Home() {
  const [reitsList, setReitsList] = useState<ReitsItem[]>([]);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [kLineData, setKLineData] = useState<KLineData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('6M');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [stats, setStats] = useState<MarketStats>({
    totalCount: 0,
    totalMarketValue: 0,
    circulatingValue: 0,
    upCount: 0,
    downCount: 0,
    flatCount: 0
  });
  const [favorites, setFavorites] = useLocalStorage<string[]>('reits-favorites', []);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    assetTypes: [],
    exchanges: [],
    sortField: 'code',
    sortOrder: 'asc'
  });
  const { showToast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchReitsList = useCallback(async () => {
    try {
      const data = await getReitsList();
      setReitsList(data);
      setStats(calculateMarketStats(data));

      if (data.length > 0 && !selectedCode) {
        setSelectedCode(data[0].code);
      }
    } catch (error) {
      console.error('Failed to fetch REITs list:', error);
      showToast('error', '获取行情数据失败');
    } finally {
      setLoading(false);
    }
  }, [selectedCode, showToast]);

  const fetchKLine = useCallback(async (code: string, range: TimeRange) => {
    const reits = REITS_CODES.find(r => r.code === code);
    if (!reits) return;

    setChartLoading(true);
    try {
      const data = await getKLineData(code, reits.exchange, range);
      setKLineData(data);
    } catch (error) {
      console.error('Failed to fetch K-line data:', error);
      showToast('error', '获取K线数据失败');
    } finally {
      setChartLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchReitsList();
  }, []);

  useEffect(() => {
    if (selectedCode) {
      fetchKLine(selectedCode, timeRange);
    }
  }, [selectedCode, timeRange, fetchKLine]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchReitsList();
      }, refreshInterval * 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchReitsList]);

  const handleManualRefresh = useCallback(() => {
    fetchReitsList();
    showToast('success', '数据已刷新');
  }, [fetchReitsList, showToast]);

  const handleSelectCode = (code: string) => {
    setSelectedCode(code);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  const toggleFavorite = (code: string) => {
    if (favorites.includes(code)) {
      setFavorites(favorites.filter(f => f !== code));
      showToast('info', '已从自选中移除');
    } else {
      setFavorites([...favorites, code]);
      showToast('success', '已添加到自选');
    }
  };

  const filteredData = useMemo(() => {
    return filterReits(reitsList, filterOptions, REITS_CODES);
  }, [reitsList, filterOptions]);

  const selectedReits = useMemo(() => {
    return REITS_CODES.find(r => r.code === selectedCode);
  }, [selectedCode]);

  const isFavorite = favorites.includes(selectedCode);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              中国公募REITs行情跟踪
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              实时跟踪深圳(180xxx) & 上海(508xxx) 交易所上市的公募REITs产品
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleManualRefresh}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <span>⟳</span>
              )}
              刷新
            </button>
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">自动刷新</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                disabled={!autoRefresh}
                className="ml-2 px-2 py-1 rounded bg-white dark:bg-gray-600"
              >
                <option value={10}>10秒</option>
                <option value={30}>30秒</option>
                <option value={60}>1分钟</option>
              </select>
            </label>
            <button
              onClick={() => exportToCSV(filteredData, `reits-${new Date().toISOString().split('T')[0]}.csv`)}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              导出CSV
            </button>
            <Link
              href="/ranking"
              className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              排行榜
            </Link>
            <Link
              href="/favorites"
              className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              自选 {favorites.length > 0 && `(${favorites.length})`}
            </Link>
          </div>
        </header>

        <StatCard stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: 'calc(100vh - 360px)' }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
            <SearchBar value={filterOptions.search} onChange={(value) => setFilterOptions({ ...filterOptions, search: value })} />
            <FilterPanel options={filterOptions} onChange={setFilterOptions} />
            <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
              {loading ? (
                <SkeletonTable />
              ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <span className="text-4xl mb-2">📊</span>
                  <span>暂无数据</span>
                </div>
              ) : (
                <ReitsTable
                  data={filteredData}
                  selectedCode={selectedCode}
                  onSelect={handleSelectCode}
                />
              )}
            </div>
            {filteredData.length > 0 && (
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                显示 {filteredData.length} / {reitsList.length} 条数据
              </div>
            )}
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
              <div className="flex justify-center mt-2 gap-2">
                <button
                  onClick={() => toggleFavorite(selectedCode)}
                  className={`px-4 py-2 rounded transition ${
                    isFavorite
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isFavorite ? '★ 取消自选' : '☆ 添加自选'}
                </button>
                <Link
                  href={`/detail/${selectedCode}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  查看详情
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
