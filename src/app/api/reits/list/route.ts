import { NextResponse } from 'next/server';
import { REITS_CODES, getSecId } from '@/lib/reitsCodes';

export async function GET() {
  const secids = REITS_CODES.map(r => getSecId(r.code, r.exchange)).join(',');

  const url = `http://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f24,f25,f22,f23,f29,f30,f31,f32,f33,f34,f35,f36,f37,f38,f39,f40,f41,f42,f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f104,f105,f106&secids=${secids}&_=${Date.now()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
