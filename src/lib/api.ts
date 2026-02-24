import axios from 'axios';
import dayjs from 'dayjs';
import { ReitsItem, KLineData, MarketStats, TimeRange } from './types';
import { REITS_CODES, getSecId } from './reitsCodes';

export async function getReitsList(): Promise<ReitsItem[]> {
  try {
    const response = await axios.get('/api/reits/list');
    const data = response.data;
    
    if (!data.data || !data.data.diff) {
      return [];
    }

    const reitsMap = new Map(REITS_CODES.map(r => [r.code, r]));

    return data.data.diff.map((item: any) => {
      const code = item.f12?.toString() || '';
      const reitsInfo = reitsMap.get(code);
      
      return {
        code: code,
        name: item.f14 || reitsInfo?.name || '',
        price: item.f2 / 1000 || 0,
        change: item.f4 / 1000 || 0,
        changePercent: item.f3 / 100 || 0,
        volume: item.f5 || 0,
        amount: item.f6 || 0,
        turnover: item.f8 / 100 || 0,
        open: item.f17 / 1000 || 0,
        high: item.f15 / 1000 || 0,
        low: item.f16 / 1000 || 0,
        prevClose: item.f18 / 1000 || 0,
        assetType: reitsInfo?.assetType || '其他',
        manager: '',
        listDate: '',
        netAsset: 0
      };
    }).filter((item: ReitsItem) => item.price > 0);
  } catch (error) {
    console.error('Failed to fetch REITs list:', error);
    return [];
  }
}

export async function getKLineData(code: string, exchange: 'sz' | 'sh', range: TimeRange = '6M'): Promise<KLineData[]> {
  const secid = getSecId(code, exchange);
  
  let beg = '';
  const now = dayjs();
  
  switch (range) {
    case '1M':
      beg = now.subtract(1, 'month').format('YYYYMMDD');
      break;
    case '3M':
      beg = now.subtract(3, 'month').format('YYYYMMDD');
      break;
    case '6M':
      beg = now.subtract(6, 'month').format('YYYYMMDD');
      break;
    case '1Y':
      beg = now.subtract(1, 'year').format('YYYYMMDD');
      break;
    case 'ALL':
      beg = '20210101';
      break;
  }

  try {
    const response = await axios.get('/api/reits/kline', {
      params: { secid, beg }
    });
    const data = response.data;
    
    if (!data.data || !data.data.klines) {
      return [];
    }

    return data.data.klines.map((line: string) => {
      const parts = line.split(',');
      return {
        date: parts[0],
        open: parseFloat(parts[1]),
        high: parseFloat(parts[2]),
        low: parseFloat(parts[3]),
        close: parseFloat(parts[4]),
        volume: parseInt(parts[5]),
        amount: parseFloat(parts[6])
      };
    });
  } catch (error) {
    console.error('Failed to fetch K-line data:', error);
    return [];
  }
}

export function calculateMarketStats(reitsList: ReitsItem[]): MarketStats {
  const totalCount = reitsList.length;
  const upCount = reitsList.filter(r => r.changePercent > 0).length;
  const downCount = reitsList.filter(r => r.changePercent < 0).length;
  const flatCount = reitsList.filter(r => r.changePercent === 0).length;
  
  return {
    totalCount,
    totalMarketValue: reitsList.reduce((sum, r) => sum + r.amount * 10000, 0),
    circulatingValue: reitsList.reduce((sum, r) => sum + r.amount * 10000, 0),
    upCount,
    downCount,
    flatCount
  };
}
