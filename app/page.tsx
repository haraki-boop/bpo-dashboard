'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutDashboard, Trophy, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';

interface SiteItem {
  id: string;
  name: string;
  desc: string;
  image: string;
  hasChikusan?: boolean;
  hasSuisan?: boolean;
  hasDelica?: boolean;
  hasShowaDepts?: boolean;
  hasOieDepts?: boolean;
}

const sites: SiteItem[] = [
  {
    id: 'yamanaka',
    name: 'ヤマナカ',
    desc: 'ヤマナカ BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/yamanaka.png',
    hasChikusan: true,
    hasSuisan: true,
    hasDelica: false,
  },
  {
    id: 'bisai',
    name: 'AFS尾西',
    desc: 'AFS尾西 BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/bisai.png',
    hasChikusan: true,
    hasSuisan: true,
    hasDelica: true,
  },
  {
    id: 'tokyu',
    name: '東急ストア',
    desc: '東急ストア BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/tokyu.png',
    hasChikusan: true,
    hasSuisan: false,
    hasDelica: false,
  },
  {
    id: 'showa',
    name: '昭和冷蔵',
    desc: '昭和冷蔵 BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/syowa.jpg',
    hasShowaDepts: true,
  },
  {
    id: 'oie',
    name: '尾家産業',
    desc: '尾家産業 BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/oie.png',
    hasOieDepts: true,
  },
];

const calculateSiteGrade = (data: any[], site: SiteItem): string => {
  if (!Array.isArray(data) || data.length === 0) return 'ー';

  const metrics: { key: string; isReverse: boolean }[] = [
    { key: 'sales', isReverse: false },
    { key: 'prodSales', isReverse: false },
    { key: 'prodAll', isReverse: false },
  ];

  if (site.hasChikusan) metrics.push({ key: 'prodChikusan', isReverse: false });
  if (site.hasSuisan) metrics.push({ key: 'prodSuisan', isReverse: false });
  if (site.hasDelica) metrics.push({ key: 'prodDelica', isReverse: false });

  if (site.hasShowaDepts) {
    metrics.push(
      { key: 'prodRicos', isReverse: false },
      { key: 'prodIkkatsu', isReverse: false },
      { key: 'prodBronco', isReverse: false },
      { key: 'prodHanyou', isReverse: false }
    );
  }

  if (site.hasOieDepts) {
    metrics.push(
      { key: 'prodHannan', isReverse: false },
      { key: 'prodNsc', isReverse: false }
    );
  }

  metrics.push(
    { key: 'error', isReverse: true },
    { key: 'grossProfit', isReverse: false },
    { key: 'operatingProfit', isReverse: false }
  );

  let goodCount = 0;

  metrics.forEach(m => {
    const k26 = `${m.key}26`;
    const k27 = `${m.key}27`;
    const valid = data.filter(d => (Number(d[k26]) || 0) > 0 && (Number(d[k27]) || 0) > 0);
    if (valid.length === 0) return;

    const sum26 = valid.reduce((s, d) => s + (Number(d[k26]) || 0), 0);
    const sum27 = valid.reduce((s, d) => s + (Number(d[k27]) || 0), 0);
    const diff = sum27 - sum26;

    const isGood = m.isReverse ? diff <= 0 : diff >= 0;
    if (isGood) goodCount++;
  });

  if (goodCount >= 8) return 'S';
  if (goodCount >= 6) return 'A';
  if (goodCount >= 4) return 'B';
  if (goodCount >= 2) return 'C';
  return 'D';
};

const getGradeBadgeStyle = (grade: string) => {
  switch (grade) {
    case 'S':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'A':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'B':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'C':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'D':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};

export default function PortalPage() {
  const [siteGrades, setSiteGrades] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchAllGrades = async () => {
    setLoading(true);
    const results: Record<string, string> = {};

    await Promise.all(
      sites.map(async (site) => {
        try {
          const res = await fetch(`/api/dashboard?site=${site.id}`);
          const json = await res.json();
          if (Array.isArray(json.data)) {
            results[site.id] = calculateSiteGrade(json.data, site);
          } else {
            results[site.id] = 'ー';
          }
        } catch {
          results[site.id] = 'ー';
        }
      })
    );

    setSiteGrades(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllGrades();
  }, []);

  const gradeCounts = useMemo(() => {
    const counts = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    Object.values(siteGrades).forEach((g) => {
      if (g in counts) {
        counts[g as keyof typeof counts]++;
      }
    });
    return counts;
  }, [siteGrades]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* ヘッダー */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="mb-4 h-12 flex items-center justify-center">
            <img
              src="/pal-logo.png"
              alt="PAL Logo"
              className="h-full w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-4">
            <LayoutDashboard className="w-4 h-4" />
            <span>BPO OPERATIONS COMMAND CENTER</span>
          </div>

          <h1 className="text-4xl font-black text-slate-900 tracking-tight">BPO現場通知表 拠点選択</h1>
          <p className="text-slate-500 text-sm font-semibold mt-2">閲覧する拠点を選択してください</p>
        </div>

        {/* 2カラム構成：サイドバー ＋ 拠点一覧 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 左サイドバー：ランク集計 */}
          <aside className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col gap-5 sticky top-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-900 text-amber-400 rounded-xl shadow-xs">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">拠点ランク状況</h2>
                  <p className="text-[10px] font-bold text-slate-400">26期対比 総合実績</p>
                </div>
              </div>
              <button
                onClick={fetchAllGrades}
                disabled={loading}
                title="ランクを再集計"
                className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>

            {/* トータル状況 */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-700 tracking-wider uppercase">MONITORED SITES</span>
                <div className="text-2xl font-black text-slate-900">{sites.length} <span className="text-xs font-bold text-slate-500">拠点</span></div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-xl shadow-2xs">
                稼働中
              </span>
            </div>

            {/* ランク別件数一覧 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl border border-purple-100 bg-purple-50/40">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">S</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">Sランク</span>
                    <span className="text-[10px] text-slate-400 font-medium">8指標以上改善</span>
                  </div>
                </div>
                <strong className="text-base font-black text-purple-900">
                  {loading ? '…' : gradeCounts.S} <span className="text-[10px] font-normal text-slate-500">拠点</span>
                </strong>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-emerald-50/40">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">A</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">Aランク</span>
                    <span className="text-[10px] text-slate-400 font-medium">6~7指標改善</span>
                  </div>
                </div>
                <strong className="text-base font-black text-emerald-900">
                  {loading ? '…' : gradeCounts.A} <span className="text-[10px] font-normal text-slate-500">拠点</span>
                </strong>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-blue-100 bg-blue-50/40">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">B</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">Bランク</span>
                    <span className="text-[10px] text-slate-400 font-medium">4~5指標改善</span>
                  </div>
                </div>
                <strong className="text-base font-black text-blue-900">
                  {loading ? '…' : gradeCounts.B} <span className="text-[10px] font-normal text-slate-500">拠点</span>
                </strong>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50/40">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">C</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">Cランク</span>
                    <span className="text-[10px] text-slate-400 font-medium">2~3指標改善</span>
                  </div>
                </div>
                <strong className="text-base font-black text-amber-900">
                  {loading ? '…' : gradeCounts.C} <span className="text-[10px] font-normal text-slate-500">拠点</span>
                </strong>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/40">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-xs">D</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">Dランク</span>
                    <span className="text-[10px] text-slate-400 font-medium">1指標以下改善</span>
                  </div>
                </div>
                <strong className="text-base font-black text-rose-900">
                  {loading ? '…' : gradeCounts.D} <span className="text-[10px] font-normal text-slate-500">拠点</span>
                </strong>
              </div>
            </div>
          </aside>

          {/* 右メイン：拠点カード一覧 */}
          <main className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {sites.map((site) => {
              const currentGrade = siteGrades[site.id] || 'ー';
              const badgeStyle = getGradeBadgeStyle(currentGrade);

              return (
                <Link
                  key={site.id}
                  href={`/${site.id}`}
                  className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* ロゴは左側に配置したまま、縦中央で自然にバランスを取る */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0 flex items-center justify-center h-14 w-14">
                          <img src={site.image} alt={site.name} className="h-full w-full object-contain" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                          {site.name}
                        </h2>
                      </div>

                      {/* ランクバッジ */}
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black border shadow-2xs ${badgeStyle}`}>
                        {loading ? '…' : `${currentGrade}ランク`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed font-medium pl-1">{site.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>ダッシュボードを開く</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </main>

        </div>

      </div>
    </div>
  );
}