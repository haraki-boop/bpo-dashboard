import { NextResponse } from 'next/server';

// 共通して利用する GAS の Webアプリ URL
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwDAojHLnFMEJ7G3V_Gy3L_56i_Osdm8xg-3KI7CUzqPHz7FcjbKIt_AsOr7OU38poosQ/exec';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get('site') || 'yamanaka';

  try {
    // GASに対して ?site=bisai や ?site=yamanaka を動的に付与してリクエストを送信
    const res = await fetch(`${GAS_URL}?site=${site}&t=${Date.now()}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('GASからのデータ取得に失敗しました');
    }

    const data = await res.json();

    return NextResponse.json({
      site,
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'データフェッチエラー' }, { status: 500 });
  }
}