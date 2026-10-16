'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, RefreshCw, MessageSquareText, CheckCircle2, XCircle, LayoutGrid, Table, Clock, Trophy, Target, ShieldCheck
} from 'lucide-react';

interface BpoData {
  period: string;
  eventNote?: string;
  sales26: number; sales27: number;
  prodSales26: number; prodSales27: number;
  prodAll26: number; prodAll27: number;
  prodChikusan26: number; prodChikusan27: number;
  prodSuisan26: number; prodSuisan27: number;
  packAll26: number; packAll27: number;
  packChikusan26: number; packChikusan27: number;
  packSuisan26: number; packSuisan27: number;
  error26: number; error27: number; isWarning: boolean;
  dx26: number; dx27: number;
  grossProfit26: number; grossProfit27: number;
  operatingProfit26: number; operatingProfit27: number;
}

export default function Dashboard() {
  const [data, setData] = useState<BpoData[]>([]);
  const [currentSite] = useState('yamanaka');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'heatmap' | 'table'>('timeline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = async (siteName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard?site=${siteName}`);
      const result = await response.json();
      if (Array.isArray(result.data)) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentSite);
  }, [currentSite]);

  const calcSum = (key: keyof BpoData) => data.reduce((s, d) => s + (Number(d[key]) || 0), 0);
  const calcAvg = (key: keyof BpoData) => data.length > 0 ? calcSum(key) / data.length : 0;

  const totalSales26 = calcSum('sales26');
  const totalSales27 = calcSum('sales27');
  const salesGrowth = totalSales26 > 0 ? (((totalSales27 - totalSales26) / totalSales26) * 100).toFixed(2) : '0.00';

  const avgProdSales26 = calcAvg('prodSales26');
  const avgProdSales27 = calcAvg('prodSales27');
  const prodSalesGrowth = avgProdSales26 > 0 ? (((avgProdSales27 - avgProdSales26) / avgProdSales26) * 100).toFixed(2) : '0.00';

  const avgProdAll26 = calcAvg('prodAll26');
  const avgProdAll27 = calcAvg('prodAll27');
  const prodGrowth = avgProdAll26 > 0 ? (((avgProdAll27 - avgProdAll26) / avgProdAll26) * 100).toFixed(2) : '0.00';

  const avgOpProfit26 = calcAvg('operatingProfit26');
  const avgOpProfit27 = calcAvg('operatingProfit27');
  const profitGrowth = (avgOpProfit27 - avgOpProfit26).toFixed(2);

  const months = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
  const fullYearData = useMemo(() => {
    return months.map(m => {
      const found = data.find(d => d.period === m || d.period === m.replace('月', ''));
      if (found) return { ...found, period: m };
      return {
        period: m,
        sales26: 0, sales27: 0,
        prodAll26: 0, prodAll27: 0,
        isWarning: false,
        eventNote: ''
      } as BpoData;
    });
  }, [data]);

  const metricAnalysis = useMemo(() => {
    const items = [
      { id: 1, key: 'prodSales', name: '1. 売上生産性', v26: avgProdSales26, v27: avgProdSales27, unit: '円/h', isReverse: false, goodText: '26期より向上。労務費工数に対する売上創出額が拡大しています。', badText: '26期より低下。労務費工数に対する売上創出効率の改善が必要。' },
      { id: 2, key: 'sales', name: '2. 売上', v26: totalSales26 / 6, v27: totalSales27 / 6, unit: '万円/月', isReverse: false, goodText: '26期より増加。各月の実績が順調に前年を超えて推移。', badText: '26期より減少。売上金額の底上げと改定効果の検証が必要。' },
      { id: 3, key: 'prodAll', name: '3. 作業生産性(全体)', v26: avgProdAll26, v27: avgProdAll27, unit: '', isReverse: false, goodText: '26期より改善。全社処理スピードが向上し工数削減に貢献。', badText: '26期より低下。作業フローの見直しによる生産性再引き上げを推奨。' },
      { id: 4, key: 'prodChikusan', name: '4. 作業生産性(畜産)', v26: calcAvg('prodChikusan26'), v27: calcAvg('prodChikusan27'), unit: '', isReverse: false, goodText: '26期より改善。畜産加工ラインの配置最適化による処理向上。', badText: '26期より低下。畜産ラインの人員構成・習熟度の改善が必要。' },
      { id: 5, key: 'prodSuisan', name: '5. 作業生産性(水産)', v26: calcAvg('prodSuisan26'), v27: calcAvg('prodSuisan27'), unit: '', isReverse: false, goodText: '26期より大幅向上。水産加工ラインの習熟度アップが寄与。', badText: '26期より低下。水産加工ラインのボトルネック工程の解消が必要。' },
      { id: 6, key: 'packAll', name: '6. パック単価(全体)', v26: calcAvg('packAll26'), v27: calcAvg('packAll27'), unit: '円', isReverse: false, goodText: '26期より上昇。高単価パック商品の構成比率が好影響。', badText: '26期より下落。パック単価の推移と商品ミックスを要確認。' },
      { id: 7, key: 'packChikusan', name: '7. パック単価(畜産)', v26: calcAvg('packChikusan26'), v27: calcAvg('packChikusan27'), unit: '円', isReverse: false, goodText: '26期より上昇。畜産商品の平均パック単価が順調に推移。', badText: '26期より微減。小分けパック割合増加などの影響を要検証。' },
      { id: 8, key: 'packSuisan', name: '8. パック単価(水産)', v26: calcAvg('packSuisan26'), v27: calcAvg('packSuisan27'), unit: '円', isReverse: false, goodText: '26期より上昇。水産商品の単価が好調に推移。', badText: '26期より微減。水産商品のパック単価変動要素を確認。' },
      { id: 9, key: 'error', name: '9. 事故評価(エラー率)', v26: calcAvg('error26'), v27: calcAvg('error27'), unit: '%', isReverse: true, goodText: '26期より改善（低下）。品質管理フローの徹底によりエラー減少。', badText: '26期より悪化（増加）。出荷ミスが増加傾向のため検品再徹底が必要。' },
      { id: 10, key: 'dx', name: '10. DX評価', v26: calcAvg('dx26'), v27: calcAvg('dx27'), unit: '', isReverse: false, goodText: '26期と同等水準で稼働。', badText: '26期と同等水準（データ未入力）。' },
      { id: 11, key: 'grossProfit', name: '11. 売上総利益率', v26: calcAvg('grossProfit26'), v27: calcAvg('grossProfit27'), unit: '%', isReverse: false, goodText: '26期より大幅改善。原価コントロールが奏功し粗利率好転。', badText: '26期より低下。原価率・仕入コストの再検証が必要。' },
      { id: 12, key: 'operatingProfit', name: '12. 営業利益率', v26: avgOpProfit26, v27: avgOpProfit27, unit: '%', isReverse: false, goodText: '26期より大幅向上。高収益な拠点運営体制が確立。', badText: '26期より低下。固定費・稼働コストの効率化を図る必要あり。' },
    ];

    return items.map(item => {
      const diff = item.v27 - item.v26;
      const pctNum = item.v26 > 0 ? (diff / item.v26) * 100 : 0;
      const isGood = item.isReverse ? diff <= 0 : diff >= 0;
      const pctStr = pctNum.toFixed(2);

      return {
        id: item.id,
        name: item.name,
        v26: item.v26.toFixed(2),
        v27: item.v27.toFixed(2),
        unit: item.unit,
        pct: pctStr,
        isGood,
        reason: isGood ? item.goodText : item.badText
      };
    });
  }, [avgProdSales26, avgProdSales27, totalSales26, totalSales27, avgProdAll26, avgProdAll27, avgOpProfit26, avgOpProfit27]);

  const gradeInfo = useMemo(() => {
    const goodCount = metricAnalysis.filter(m => m.isGood).length;
    const totalCount = 12;

    let grade = 'S';
    let badgeClass = 'from-purple-600 to-indigo-600 text-white shadow-purple-200';
    let borderStyle = 'border-purple-200 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30';
    let label = '最高水準の拠点運営';

    if (goodCount >= 10) {
      grade = 'S';
      badgeClass = 'from-purple-600 via-indigo-600 to-blue-600 text-white shadow-purple-100';
      borderStyle = 'border-purple-200 bg-gradient-to-br from-purple-50/60 via-white to-indigo-50/30';
      label = '最高水準の拠点運営';
    } else if (goodCount >= 8) {
      grade = 'A';
      badgeClass = 'from-emerald-600 to-teal-600 text-white shadow-emerald-100';
      borderStyle = 'border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30';
      label = '極めて優秀な拠点運営';
    } else if (goodCount >= 6) {
      grade = 'B';
      badgeClass = 'from-blue-600 to-cyan-600 text-white shadow-blue-100';
      borderStyle = 'border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-cyan-50/30';
      label = '良好・順調な運営';
    } else if (goodCount >= 4) {
      grade = 'C';
      badgeClass = 'from-amber-500 to-orange-600 text-white shadow-amber-100';
      borderStyle = 'border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30';
      label = '一部改善推奨';
    } else {
      grade = 'D';
      badgeClass = 'from-rose-600 to-red-600 text-white shadow-rose-100';
      borderStyle = 'border-rose-200 bg-gradient-to-br from-rose-50/60 via-white to-red-50/30';
      label = '要緊急対策拠点';
    }

    const goodPct = Math.round((goodCount / totalCount) * 100);

    return { grade, goodCount, warnCount: totalCount - goodCount, goodPct, label, badgeClass, borderStyle };
  }, [metricAnalysis]);

  const metricsList = useMemo(() => [
    { id: 1, key: 'prodSales', name: '1. 売上生産性', unit: '円/h', isReverse: false, desc: '労務費工数に対する売上創出効率' },
    { id: 2, key: 'sales', name: '2. 売上', unit: '万円', isReverse: false, desc: '月次売上金額の推移' },
    { id: 3, key: 'prodAll', name: '3. 作業生産性(全体)', unit: '', isReverse: false, desc: '全社作業の処理効率' },
    { id: 4, key: 'prodChikusan', name: '4. 作業生産性(畜産)', unit: '', isReverse: false, desc: '畜産加工ラインの作業効率' },
    { id: 5, key: 'prodSuisan', name: '5. 作業生産性(水産)', unit: '', isReverse: false, desc: '水産加工部門の作業効率' },
    { id: 6, key: 'packAll', name: '6. パック単価(全体)', unit: '円', isReverse: false, desc: '商品1パックあたりの平均単価' },
    { id: 7, key: 'packChikusan', name: '7. パック単価(畜産)', unit: '円', isReverse: false, desc: '畜産商品のパック単価' },
    { id: 8, key: 'packSuisan', name: '8. パック単価(水産)', unit: '円', isReverse: false, desc: '水産商品のパック単価' },
    { id: 9, key: 'error', name: '9. 事故評価(エラー率)', unit: '%', isReverse: true, desc: 'エラー発生率 (低いほど高評価)' },
    { id: 10, key: 'dx', name: '10. DX評価', unit: '', isReverse: false, desc: 'DX化・減価償却費関連指標' },
    { id: 11, key: 'grossProfit', name: '11. 売上総利益率', unit: '%', isReverse: false, desc: '粗利益率のポイント推移' },
    { id: 12, key: 'operatingProfit', name: '12. 営業利益率', unit: '%', isReverse: false, desc: '営業利益率のポイント推移' },
  ], []);

  const getHeatmapBg = (pctNum: number, isReverse: boolean) => {
    if (isNaN(pctNum) || pctNum === 0) return 'bg-slate-100 text-slate-400';
    const effectivePct = isReverse ? -pctNum : pctNum;
    if (effectivePct >= 15) return 'bg-emerald-600 text-white font-bold';
    if (effectivePct > 0) return 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold';
    if (effectivePct > -10) return 'bg-amber-50 text-amber-800 border border-amber-200 font-bold';
    return 'bg-rose-600 text-white font-bold';
  };

  const processedMetrics = useMemo(() => {
    return metricsList.map(m => {
      const k26 = `${m.key}26` as keyof BpoData;
      const k27 = `${m.key}27` as keyof BpoData;
      const v26 = m.key === 'sales' ? totalSales26 / 6 : calcAvg(k26);
      const v27 = m.key === 'sales' ? totalSales27 / 6 : calcAvg(k27);
      const diff = v27 - v26;
      const pct = v26 > 0 ? (diff / v26) * 100 : 0;
      return { ...m, v26, v27, diff, pct };
    }).sort((a, b) => {
      return sortOrder === 'desc' ? b.pct - a.pct : a.pct - b.pct;
    });
  }, [data, sortOrder, metricsList, totalSales26, totalSales27]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8 font-sans">
      
      {/* ★【PALロゴ差し込み済み Header】 */}
      <header className="mb-6 bg-white px-8 py-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          {/* PAL 企業ロゴ */}
          <div className="flex items-center justify-center p-2 rounded-2xl border border-slate-100 bg-white shadow-2xs">
            <img
              src="/pal-logo.png"
              alt="PAL Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>

          <div>
            <span className="text-xs font-extrabold text-indigo-600 tracking-wider uppercase">BPO OPERATIONS COMMAND CENTER</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">ヤマナカ センター</h1>
            <p className="text-slate-500 text-xs font-semibold mt-0.5">BPO現場通知表</p>
          </div>
        </div>

        <button
          onClick={() => fetchData(currentSite)}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>最新データ同期</span>
        </button>
      </header>

      {loading && data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs font-bold text-slate-600">スプレッドシートデータを同期中...</p>
        </div>
      ) : (
        <>
          {/* 上段 KPIエリア */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
            <div className={`lg:col-span-6 p-6 rounded-3xl border shadow-md relative overflow-hidden flex flex-col justify-between ${gradeInfo.borderStyle}`}>
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex justify-between items-center mb-3 z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-900 text-amber-400 rounded-xl shadow-xs">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">26期対比 総合実績ランク</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm bg-gradient-to-r ${gradeInfo.badgeClass}`}>
                  {gradeInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-3 items-center my-2 z-10">
                <div className="col-span-4 flex flex-col items-center justify-center p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">GRADE</span>
                  <div className="text-5xl font-black tracking-tighter bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 bg-clip-text text-transparent">
                    {gradeInfo.grade}
                  </div>
                  <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1">
                    全12指標評価
                  </span>
                </div>

                <div className="col-span-4 flex justify-center items-center">
                  <div className="luxury-chart-box p-0 bg-transparent flex justify-center items-center">
                    <div
                      className="luxury-chart relative flex items-center justify-center rounded-full transition-transform duration-300 hover:scale-105"
                      style={{
                        width: '115px',
                        height: '115px',
                        borderRadius: '50%',
                        background: `conic-gradient(#10b981 0% ${gradeInfo.goodPct}%, #f43f5e ${gradeInfo.goodPct}% 100%)`,
                        boxShadow: '6px 6px 14px rgba(163, 177, 198, 0.4), -6px -6px 14px rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      <div
                        className="luxury-chart-inner bg-slate-50 rounded-full flex flex-col items-center justify-center"
                        style={{
                          width: '76%',
                          height: '76%',
                          boxShadow: 'inset 4px 4px 8px rgba(163, 177, 198, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',
                        }}
                      >
                        <div className="luxury-text text-center">
                          <div className="text-2xl font-black text-slate-900 leading-none tracking-tight flex items-baseline justify-center">
                            <span>{gradeInfo.goodCount}</span>
                            <span className="text-xs font-extrabold text-slate-400 ml-0.5">/12</span>
                          </div>
                          <span className="label block text-[9px] font-black tracking-wider text-emerald-600 uppercase mt-1">
                            昨対改善数
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-4 space-y-2 text-xs">
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between shadow-2xs">
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>改善</span>
                    </span>
                    <strong className="text-base font-black text-emerald-900">{gradeInfo.goodCount} <span className="text-[10px] font-normal text-slate-500">指標</span></strong>
                  </div>

                  <div className="p-2.5 bg-rose-50/80 border border-rose-200/80 rounded-xl flex items-center justify-between shadow-2xs">
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>悪化</span>
                    </span>
                    <strong className="text-base font-black text-rose-900">{gradeInfo.warnCount} <span className="text-[10px] font-normal text-slate-500">指標</span></strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-bold z-10">
                <span className="flex items-center gap-1 text-slate-400">
                  <Target className="w-3 h-3" />
                  <span>昨対改善数 判定基準:</span>
                </span>
                <div className="flex gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">S: 10~12</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">A: 8~9</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">B: 6~7</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">C: 4~5</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">D: 1~3</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all flex-1">
                <p className="text-xs text-slate-500 font-extrabold">27期 累計売上</p>
                <div className="my-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                    <span>{totalSales27.toFixed(2)}</span>
                    <span className="text-xs font-normal text-slate-500">万円</span>
                  </h3>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg w-fit ${Number(salesGrowth) >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'}`}>
                  {Number(salesGrowth) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{Number(salesGrowth) >= 0 ? '+' : ''}{salesGrowth}%</span>
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all flex-1">
                <p className="text-xs text-slate-500 font-extrabold">平均 営業利益率</p>
                <div className="my-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {avgOpProfit27.toFixed(2)}<span className="text-lg font-bold text-slate-700">%</span>
                  </h3>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg w-fit ${Number(profitGrowth) >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'}`}>
                  {Number(profitGrowth) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{Number(profitGrowth) >= 0 ? '+' : ''}{profitGrowth}%p</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all flex-1">
                <p className="text-xs text-slate-500 font-extrabold">作業生産性 (全体)</p>
                <div className="my-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {avgProdAll27.toFixed(2)}
                  </h3>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg w-fit ${Number(prodGrowth) >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'}`}>
                  {Number(prodGrowth) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{Number(prodGrowth) >= 0 ? '+' : ''}{prodGrowth}%</span>
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all flex-1">
                <p className="text-xs text-slate-500 font-extrabold">売上生産性 (平均)</p>
                <div className="my-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-0.5">
                    <span>{avgProdSales27.toFixed(2)}</span>
                    <span className="text-xs font-bold text-slate-400">円/h</span>
                  </h3>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg w-fit ${Number(prodSalesGrowth) >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'}`}>
                  {Number(prodSalesGrowth) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{Number(prodSalesGrowth) >= 0 ? '+' : ''}{prodSalesGrowth}%</span>
                </span>
              </div>
            </div>
          </div>

          {/* ビュー切替タブ */}
          <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'timeline' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>① 月別トピックス(左) & 定性コメント分析(右)</span>
              </button>

              <button
                onClick={() => setActiveTab('heatmap')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'heatmap' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>② 昨対比ヒートマップ</span>
              </button>

              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'table' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>③ KPI実績比較テーブル</span>
              </button>
            </div>
          </div>

          {/* 下段 メインコンテンツエリア */}
          {activeTab === 'timeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* 左側 (6カラム分 / 50%): 月別トピックス */}
              <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-base font-black text-slate-900">月別トピックス (4月〜翌3月 通年ログ)</h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400">12ヶ月カード表示</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fullYearData.map((m, idx) => {
                      const s26 = m.sales26 || 0;
                      const s27 = m.sales27 || 0;
                      const sPct = s26 > 0 ? (((s27 - s26) / s26) * 100).toFixed(2) : '0.00';
                      const hasData = Boolean(s27 || m.prodAll27);

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between min-h-[130px] ${
                            hasData
                              ? 'bg-slate-50/70 border-slate-200 hover:border-indigo-300 hover:shadow-md'
                              : 'bg-slate-50/30 border-slate-100 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-black text-slate-900">{m.period}</span>
                            {hasData ? (
                              m.isWarning ? (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">悪化項目注意</span>
                              ) : (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">品質正常</span>
                              )
                            ) : (
                              <span className="text-[10px] text-slate-300">未確定</span>
                            )}
                          </div>

                          {hasData ? (
                            <div className="text-xs text-slate-700 space-y-1 my-1">
                              <div>売上: <strong className="text-slate-900">{s27.toFixed(2)}万</strong> <span className={`text-[11px] font-bold ${Number(sPct) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>({Number(sPct) >= 0 ? '+' : ''}{sPct}%)</span></div>
                              <div>生産性: <strong className="text-slate-900">{m.prodAll27.toFixed(2)}</strong></div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-300 italic my-2 text-center">データ未入力</div>
                          )}

                          <div className="mt-1.5 pt-1.5 border-t border-slate-200/60">
                            {m.eventNote ? (
                              <div className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                                <MessageSquareText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="truncate text-[11px]">{m.eventNote}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">※ 特記事項なし</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 右側 (6カラム分 / 50%): 全12項目 26期対比 定性コメント分析 */}
              <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                    <MessageSquareText className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900">全12項目 26期対比 定性コメント分析</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {metricAnalysis.map((item) => (
                      <div key={item.id} className={`p-4 rounded-2xl border flex flex-col justify-between ${item.isGood ? 'bg-emerald-50/20 border-emerald-200/80' : 'bg-rose-50/40 border-rose-200/80'}`}>
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-bold text-slate-800 text-xs">{item.name}</span>
                            {item.isGood ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> 改善 ({item.pct}%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <XCircle className="w-3 h-3" /> 悪化 ({item.pct}%)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mb-1.5">
                            26期: {item.v26}{item.unit} ➔ 27期: <strong className="text-slate-900 font-bold">{item.v27}{item.unit}</strong>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-normal">{item.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: 昨対比ヒートマップ */}
          {activeTab === 'heatmap' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">月別×全12項目 昨対比ヒートマップ</h2>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">色の違いにより、各指標の月別前年比の増減傾向を可視化します。</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> +15%以上</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-100 border border-emerald-300"></span> プラス</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-300"></span> マイナス</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> 要確認</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="py-3 px-4 min-w-[180px]">KPI 項目名</th>
                      {data.map(d => (
                        <th key={d.period} className="py-3 px-3 text-center">{d.period}</th>
                      ))}
                      <th className="py-3 px-4 text-right">半期平均前年比</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metricsList.map(m => {
                      const k26 = `${m.key}26` as keyof BpoData;
                      const k27 = `${m.key}27` as keyof BpoData;
                      const avg26 = m.key === 'sales' ? totalSales26 / 6 : calcAvg(k26);
                      const avg27 = m.key === 'sales' ? totalSales27 / 6 : calcAvg(k27);
                      const totalDiffPct = avg26 > 0 ? ((avg27 - avg26) / avg26) * 100 : 0;

                      return (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {m.name}
                            <span className="block text-[10px] font-normal text-slate-400">{m.desc}</span>
                          </td>
                          {data.map(monthData => {
                            const v26 = Number(monthData[k26]) || 0;
                            const v27 = Number(monthData[k27]) || 0;
                            const diffPct = v26 > 0 ? ((v27 - v26) / v26) * 100 : 0;
                            const cellBg = getHeatmapBg(diffPct, m.isReverse);

                            return (
                              <td key={monthData.period} className="py-3 px-2 text-center">
                                <div className={`py-1.5 px-1 rounded-md text-xs ${cellBg}`}>
                                  {v26 > 0 ? `${diffPct >= 0 ? '+' : ''}${diffPct.toFixed(2)}%` : 'ー'}
                                </div>
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            <span className={`inline-block px-2.5 py-0.5 rounded ${totalDiffPct >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                              {totalDiffPct >= 0 ? '+' : ''}{totalDiffPct.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: KPI比較テーブル */}
          {activeTab === 'table' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">KPI 実績比較表</h2>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">全12指標の平均値と前年比の伸び率を一覧表示します。</p>
                </div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer w-fit"
                >
                  <span>伸び率順 ({sortOrder === 'desc' ? '高い順 ➔ 低い順' : '低い順 ➔ 高い順'})</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="py-3 px-4">KPI 項目</th>
                      <th className="py-3 px-4 text-right">26期 平均</th>
                      <th className="py-3 px-4 text-right">27期 平均</th>
                      <th className="py-3 px-4 text-right">前年差分</th>
                      <th className="py-3 px-4 text-right">前年比 (%)</th>
                      <th className="py-3 px-4 text-center">状態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processedMetrics.map(m => {
                      const isGood = m.isReverse ? m.pct <= 0 : m.pct >= 0;

                      return (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {m.name}
                            <span className="block text-[10px] font-normal text-slate-400">{m.desc}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-600">{m.v26.toFixed(2)}{m.unit}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">{m.v27.toFixed(2)}{m.unit}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                            {m.diff >= 0 ? '+' : ''}{m.diff.toFixed(2)}{m.unit}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold">
                            <span className={isGood ? 'text-emerald-700' : 'text-rose-700'}>
                              {m.pct >= 0 ? '+' : ''}{m.pct.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isGood ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                                <TrendingUp className="w-3 h-3" /> 良好
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-bold px-2.5 py-0.5 rounded border border-rose-200 text-[11px]">
                                <TrendingDown className="w-3 h-3" /> 要確認
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}