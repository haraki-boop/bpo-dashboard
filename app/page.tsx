'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

const sites = [
  {
    id: 'yamanaka',
    name: 'ヤマナカ センター',
    desc: 'ヤマナカ BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/yamanaka.png',
  },
  {
    id: 'bisai',
    name: 'AFS尾西 センター',
    desc: 'AFS尾西 BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/bisai.png',
  },
  {
    id: 'tokyu',
    name: '東急ストア センター',
    desc: '東急ストア BPO現場パフォーマンス・KPI分析ダッシュボード',
    image: '/tokyu.png',
  },
];

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full">
        
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-4">
            <LayoutDashboard className="w-4 h-4" />
            <span>BPO OPERATIONS COMMAND CENTER</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">BPO現場通知表 拠点選択</h1>
          <p className="text-slate-500 text-sm font-semibold mt-2">閲覧するセンターを選択してください</p>
        </div>

        {/* 現場カード一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sites.map((site) => (
            <Link
              key={site.id}
              href={`/${site.id}`}
              className="group bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* 拠点ロゴ（枠・背景なしで直接配置） ＋ 拠点タイトル */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="shrink-0 flex items-center justify-center h-16 w-16">
                    <img src={site.image} alt={site.name} className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                      {site.name}
                    </h2>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-medium pl-1">{site.desc}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>ダッシュボードを開く</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}