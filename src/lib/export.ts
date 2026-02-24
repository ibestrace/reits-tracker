import { ReitsItem } from './types';

export function exportToCSV(data: ReitsItem[], filename: string = 'reits-data.csv') {
  const headers = ['代码', '名称', '最新价', '涨跌额', '涨跌幅(%)', '成交量', '成交额', '换手率(%)', '开盘价', '最高价', '最低价', '昨收价', '资产类型'];
  
  const rows = data.map(item => [
    item.code,
    item.name,
    item.price.toFixed(4),
    item.change.toFixed(4),
    item.changePercent.toFixed(2),
    item.volume.toLocaleString(),
    item.amount.toLocaleString(),
    item.turnover.toFixed(2),
    item.open.toFixed(4),
    item.high.toFixed(4),
    item.low.toFixed(4),
    item.prevClose.toFixed(4),
    item.assetType
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportToExcel(data: ReitsItem[], filename: string = 'reits-data.xlsx') {
  // 简单实现：导出为CSV，Excel可以直接打开
  exportToCSV(data, filename.replace('.xlsx', '.csv'));
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
