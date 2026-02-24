'use client';

import { ReitsItem } from '@/lib/types';
import Link from 'next/link';

interface ReitsTableProps {
  data: ReitsItem[];
  selectedCode: string;
  onSelect: (code: string) => void;
}

export default function ReitsTable({ data, selectedCode, onSelect }: ReitsTableProps) {
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

  return (
    <div className="overflow-auto h-full custom-scrollbar">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-2 py-2 text-left font-medium">代码</th>
            <th className="px-2 py-2 text-left font-medium">名称</th>
            <th className="px-2 py-2 text-right font-medium">最新价</th>
            <th className="px-2 py-2 text-right font-medium">涨跌幅</th>
            <th className="px-2 py-2 text-right font-medium hidden md:table-cell">成交量</th>
            <th className="px-2 py-2 text-right font-medium hidden xl:table-cell">成交额</th>
            <th className="px-2 py-2 text-right font-medium hidden xl:table-cell">换手率</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.code}
              className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                selectedCode === item.code ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
              onClick={() => onSelect(item.code)}
            >
              <td className="px-2 py-2">
                <Link href={`/detail/${item.code}`} className="text-blue-500 hover:underline">
                  {item.code}
                </Link>
              </td>
              <td className="px-2 py-2 font-medium">{item.name}</td>
              <td className="px-2 py-2 text-right">{item.price.toFixed(4)}</td>
              <td className={`px-2 py-2 text-right ${item.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
              </td>
              <td className="px-2 py-2 text-right hidden md:table-cell">{formatNumber(item.volume)}</td>
              <td className="px-2 py-2 text-right hidden xl:table-cell">{formatAmount(item.amount)}</td>
              <td className="px-2 py-2 text-right hidden xl:table-cell">{item.turnover.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
