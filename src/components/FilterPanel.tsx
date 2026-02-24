'use client';

import React from 'react';
import { FilterOptions, SortField, SortOrder } from '@/lib/utils';
import { getAssetTypes } from '@/lib/utils';
import { REITS_CODES } from '@/lib/reitsCodes';

interface FilterPanelProps {
  options: FilterOptions;
  onChange: (options: FilterOptions) => void;
}

export default function FilterPanel({ options, onChange }: FilterPanelProps) {
  const assetTypes = getAssetTypes(REITS_CODES);

  const toggleAssetType = (type: string) => {
    const newTypes = options.assetTypes.includes(type)
      ? options.assetTypes.filter(t => t !== type)
      : [...options.assetTypes, type];
    onChange({ ...options, assetTypes: newTypes });
  };

  const toggleExchange = (exchange: 'sz' | 'sh') => {
    const newExchanges = options.exchanges.includes(exchange)
      ? options.exchanges.filter(e => e !== exchange)
      : [...options.exchanges, exchange];
    onChange({ ...options, exchanges: newExchanges });
  };

  return (
    <div className="mb-4 space-y-3">
      {/* 排序 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">排序:</span>
        {(['code', 'name', 'price', 'changePercent', 'volume', 'amount', 'turnover'] as SortField[]).map(field => (
          <button
            key={field}
            onClick={() => onChange({
              ...options,
              sortField: field,
              sortOrder: options.sortField === field && options.sortOrder === 'desc' ? 'asc' : 'desc'
            })}
            className={`px-2 py-1 text-sm rounded ${
              options.sortField === field
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
            }`}
          >
            {getSortLabel(field)} {options.sortField === field && (options.sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        ))}
      </div>

      {/* 资产类型筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">资产类型:</span>
        {assetTypes.map(type => (
          <button
            key={type}
            onClick={() => toggleAssetType(type)}
            className={`px-2 py-1 text-sm rounded ${
              options.assetTypes.includes(type)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* 交易所筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">交易所:</span>
        {[
          { value: 'sz' as const, label: '深圳(180xxx)' },
          { value: 'sh' as const, label: '上海(508xxx)' }
        ].map(ex => (
          <button
            key={ex.value}
            onClick={() => toggleExchange(ex.value)}
            className={`px-2 py-1 text-sm rounded ${
              options.exchanges.includes(ex.value)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
            }`}
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function getSortLabel(field: SortField): string {
  const labels: Record<SortField, string> = {
    code: '代码',
    name: '名称',
    price: '价格',
    changePercent: '涨跌幅',
    volume: '成交量',
    amount: '成交额',
    turnover: '换手率'
  };
  return labels[field];
}
