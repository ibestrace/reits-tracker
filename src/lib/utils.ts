'use client';

import { ReitsItem } from './types';

export type SortField = 'code' | 'name' | 'price' | 'changePercent' | 'volume' | 'amount' | 'turnover';
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  search: string;
  assetTypes: string[];
  exchanges: ('sz' | 'sh')[];
  sortField: SortField;
  sortOrder: SortOrder;
}

export function sortReits(data: ReitsItem[], field: SortField, order: SortOrder): ReitsItem[] {
  const sorted = [...data];
  sorted.sort((a, b) => {
    let comparison = 0;
    switch (field) {
      case 'code':
        comparison = a.code.localeCompare(b.code);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'changePercent':
        comparison = a.changePercent - b.changePercent;
        break;
      case 'volume':
        comparison = a.volume - b.volume;
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'turnover':
        comparison = a.turnover - b.turnover;
        break;
      default:
        return 0;
    }
    return order === 'asc' ? comparison : -comparison;
  });
  return sorted;
}

export function filterReits(data: ReitsItem[], options: FilterOptions, reitsCodes: any[]): ReitsItem[] {
  let result = [...data];

  // 搜索过滤
  if (options.search) {
    const lower = options.search.toLowerCase();
    result = result.filter(r =>
      r.code.toLowerCase().includes(lower) ||
      r.name.toLowerCase().includes(lower)
    );
  }

  // 资产类型过滤
  if (options.assetTypes.length > 0) {
    result = result.filter(r => {
      const info = reitsCodes.find(c => c.code === r.code);
      return info && options.assetTypes.includes(info.assetType);
    });
  }

  // 交易所过滤
  if (options.exchanges.length > 0) {
    result = result.filter(r => {
      const info = reitsCodes.find(c => c.code === r.code);
      return info && options.exchanges.includes(info.exchange);
    });
  }

  return sortReits(result, options.sortField, options.sortOrder);
}

export function getAssetTypes(reitsCodes: any[]): string[] {
  const types = new Set(reitsCodes.map(r => r.assetType));
  return Array.from(types).sort();
}
