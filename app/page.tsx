'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutDashboard, RefreshCw } from 'lucide-react';

interface SiteItem {
  id: string;
  name: string;
  desc: string;
  image: string;
  scaleClass?: string;
}

const sites: SiteItem[] = [
  {
    id: 'yamanaka',
    name: 'ヤマナカ',
    desc: 'ヤマナカ BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/yamanaka.png',
  },
  {
    id: 'bisai',
    name: 'AFS尾西',
    desc: 'AFS尾西 BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/bisai.png',
    scaleClass: 'scale-150',
  },
  {
    id: 'tokyu',
    name: '東急ストア',
    desc: '東急ストア BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/tokyu.png',
    scaleClass: 'scale-150',
  },
  {
    id: 'showa',
    name: '昭和冷蔵',
    desc: '昭和冷蔵 BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/syowa.jpg',
  },
  {
    id: 'oie',
    name: '尾家産業',
    desc: '尾家産業 BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/oie.png',
  },
];

// ★ ランク判定対象：生産性は「作業生産性(全体)」のみを使用（共通6指標）
const calculateSiteGrade = (data: any[]): string => {
  if (!Array.isArray(data) || data.length === 0) return '';

  const metrics: { key: string; isReverse: boolean }[] = [
    { key: 'sales', isReverse: false },
    { key: 'prodSales', isReverse: false },
    { key: 'prodAll', isReverse: false }, // ★ 全体のみ
    { key: 'error', isReverse: true },
    { key: 'grossProfit', isReverse: false },
    { key: 'operatingProfit', isReverse: false },
    { key: 'budgetGrossProfit', isReverse: false },
    { key: 'budgetOperatingProfit', isReverse: false },
  ];

  let goodCount = 0;
  let activeMetricCount = 0;

  metrics.forEach((m) => {
    const k26 = `${m.key}26`;
    const k27 = `${m.key}27`;
    const valid = data.filter((d) => (Number(d[k26]) || 0) > 0 && (Number(d[k27]) || 0) > 0);
    if (valid.length === 0) return;

    activeMetricCount++;
    const sum26 = valid.reduce((s, d) => s + (Number(d[k26]) || 0), 0);
    const sum27 = valid.reduce((s, d) => s + (Number(d[k27]) || 0), 0);
    const diff = sum27 - sum26;

    const isGood = m.isReverse ? diff <= 0 : diff >= 0;
    if (isGood) goodCount++;
  });

  if (activeMetricCount === 0) return '';

  // 基準（全8指標中）：S: 7~8, A: 5~6, B: 3~4, C: 2, D: ~1
  if (goodCount >= 7) return 'S';
  if (goodCount >= 5) return 'A';
  if (goodCount >= 3) return 'B';
  if (goodCount >= 2) return 'C';
  return 'D';
};

const GRADE_CONFIG: Record<string, { text: string; bg: string; dot: string }> = {
  S: { text: 'text-purple-700', bg: 'bg-purple-50 border-purple-200/80', dot: 'bg-purple-500' },
  A: { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200/80', dot: 'bg-emerald-500' },
  B: { text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200/80', dot: 'bg-blue-500' },
  C: { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200/80', dot: 'bg-amber-500' },
  D: { text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200/80', dot: 'bg-rose-500' },
};

const WATERMARK_STYLES: Record<string, { bgGlow: string; textWatermark: string }> = {
  S: {
    bgGlow: 'hover:border-purple-300',
    textWatermark: 'text-purple-900/[0.05] group-hover:text-purple-900/[0.09]',
  },
  A: {
    bgGlow: 'hover:border-emerald-300',
    textWatermark: 'text-emerald-900/[0.05] group-hover:text-emerald-900/[0.09]',
  },
  B: {
    bgGlow: 'hover:border-blue-300',
    textWatermark: 'text-blue-900/[0.05] group-hover:text-blue-900/[0.09]',
  },
  C: {
    bgGlow: 'hover:border-amber-300',
    textWatermark: 'text-amber-900/[0.05] group-hover:text-amber-900/[0.09]',
  },
  D: {
    bgGlow: 'hover:border-rose-300',
    textWatermark: 'text-rose-900/[0.05] group-hover:text-rose-900/[0.09]',
  },
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
            results[site.id] = calculateSiteGrade(json.data);
          } else {
            results[site.id] = '';
          }
        } catch {
          results[site.id] = '';
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
    const counts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    Object.values(siteGrades).forEach((g) => {
      if (g in counts) counts[g]++;
    });
    return counts;
  }, [siteGrades]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full">
        
        {/* ヘッダー */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="mb-4 h-12 flex items-center justify-center">
            <img
              src="/pal-logo.png"
              alt="PAL Logo"
              className="h-full w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3">
            <LayoutDashboard className="w-4 h-4" />
            <span>BPO OPERATIONS COMMAND CENTER</span>
          </div>

          <h1 className="text-4xl font-black text-slate-900 tracking-tight">BPO現場通知表 拠点選択</h1>
          <p className="text-slate-500 text-sm font-semibold mt-2">閲覧する拠点を選択してください</p>

          {/* シンプルな横並びステータス（S〜Dの個数表示） */}
          <div className="mt-6 inline-flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 border-r border-slate-100 flex items-center gap-1.5">
              <span>全{sites.length}拠点</span>
              <button
                onClick={fetchAllGrades}
                disabled={loading}
                title="再集計"
                className="text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>

            {(['S', 'A', 'B', 'C', 'D'] as const).map((grade) => {
              const count = gradeCounts[grade] || 0;
              const cfg = GRADE_CONFIG[grade];
              const isActive = count > 0;

              return (
                <div
                  key={grade}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                    isActive
                      ? `${cfg.bg}${cfg.text} border`
                      : 'text-slate-300 bg-transparent'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? cfg.dot : 'bg-slate-200'}`} />
                  <span>{grade}</span>
                  <span className="text-[11px] font-black">{loading ? '…' : count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 現場カード一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sites.map((site) => {
            const currentGrade = siteGrades[site.id] || '';
            const wmStyle = WATERMARK_STYLES[currentGrade] || { bgGlow: '', textWatermark: 'text-transparent' };

            return (
              <Link
                key={site.id}
                href={`/${site.id}`}
                className={`group relative bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden min-h-[175px] ${wmStyle.bgGlow}`}
              >
                {/* 背景透かし文字パターン（約256px: text-[16rem]） */}
                {currentGrade && (
                  <span
                    aria-hidden="true"
                    className={`absolute -right-6 -bottom-16 text-[16rem] font-black select-none pointer-events-none transition-all duration-500 leading-none tracking-tighter ${wmStyle.textWatermark}`}
                  >
                    {currentGrade}
                  </span>
                )}

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="shrink-0 flex items-center justify-center h-16 w-16 overflow-visible">
                      <img
                        src={site.image}
                        alt={site.name}
                        className={`h-full w-full object-contain ${site.scaleClass || ''}`}
                      />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                      {site.name}
                    </h2>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium pl-1">{site.desc}</p>
                </div>

                <div className="relative z-10 mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>ダッシュボードを開く</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}