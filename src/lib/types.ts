export interface ReitsItem {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  amount: number;
  turnover: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  assetType: string;
  manager: string;
  listDate: string;
  netAsset: number;
}

export interface KLineData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number;
}

export interface MarketStats {
  totalCount: number;
  totalMarketValue: number;
  circulatingValue: number;
  upCount: number;
  downCount: number;
  flatCount: number;
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export interface ReitsCode {
  code: string;
  name: string;
  exchange: 'sz' | 'sh';
  assetType: string;
}
