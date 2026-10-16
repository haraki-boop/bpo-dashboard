import { NextResponse } from 'next/server';

// 現場ごとの GAS URL 管理
const SITE_GAS_URLS: Record<string, string> = {
  yamanaka: 'https://script.google.com/macros/s/AKfycbwDAojHLnFMEJ7G3V_Gy3L_56i_Osdm8xg-3KI7CUzqPHz7FcjbKIt_AsOr7OU38poosQ/exec',
  // 今後現場が増えたらここに追加
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get('site') || 'yamanaka';
  const gasUrl = SITE_GAS_URLS[site];

  if (!gasUrl) {
    return NextResponse.json({ error: '指定された現場が見つかりません' }, { status: 400 });
  }

  try {
    // 常に最新データをスプレッドシートから取得 (no-store)
    const res = await fetch(`${gasUrl}?t=${Date.now()}`, {
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