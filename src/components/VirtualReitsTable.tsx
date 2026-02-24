'use client';

import { useMemo, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { ReitsItem } from '@/lib/types';
import Link from 'next/link';

interface VirtualReitsTableProps {
  data: ReitsItem[];
  selectedCode: string;
  onSelect: (code: string) => void;
}

export default function VirtualReitsTable({ data, selectedCode, onSelect }: VirtualReitsTableProps) {
  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿';
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '万';
    }
    return num.toFixed(decimals);
  };

  const formatAmount = (num: number) => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿';
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '万';
    }
    return num.toFixed(0);
  };

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    
    return (
      <div
        style={style}
        className={`flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b border-gray-200 dark:border-gray-700 ${
          selectedCode === item.code ? 'bg-blue-50 dark:bg-blue-900' : ''
        }`}
        onClick={() => onSelect(item.code)}
      >
        <div className="flex-[0_0_100px] px-2 py-2">
          <Link href={`/detail/${item.code}`} className="text-blue-500 hover:underline text-sm">
            {item.code}
          </Link>
        </div>
        <div className="flex-1 px-2 py-2 font-medium text-sm">
          {item.name}
        </div>
        <div className="flex-[0_0_80px] px-2 py-2 text-right text-sm">
          {item.price.toFixed(4)}
        </div>
        <div className={`flex-[0_0_80px] px-2 py-2 text-right text-sm ${item.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
          {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
        </div>
        <div className="flex-[0_0_100px] px-2 py-2 text-right text-sm hidden md:block">
          {formatNumber(item.volume)}
        </div>
        <div className="flex-[0_0_100px] px-2 py-2 text-right text-sm hidden xl:block">
          {formatAmount(item.amount)}
        </div>
        <div className="flex-[0_0_80px] px-2 py-2 text-right text-sm hidden xl:block">
          {item.turnover.toFixed(2)}%
        </div>
      </div>
    );
  }, [data, selectedCode, onSelect]);

  const Header = () => (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 font-medium text-sm py-2 border-b border-gray-300 dark:border-gray-700">
      <div className="flex-[0_0_100px] px-2">代码</div>
      <div className="flex-1 px-2">名称</div>
      <div className="flex-[0_0_80px] px-2 text-right">最新价</div>
      <div className="flex-[0_0_80px] px-2 text-right">涨跌幅</div>
      <div className="flex-[0_0_100px] px-2 text-right hidden md:block">成交量</div>
      <div className="flex-[0_0_100px] px-2 text-right hidden xl:block">成交额</div>
      <div className="flex-[0_0_80px] px-2 text-right hidden xl:block">换手率</div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <Header />
      <FixedSizeList
        height={500}
        itemCount={data.length}
        itemSize={45}
        width="100%"
        className="custom-scrollbar"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
