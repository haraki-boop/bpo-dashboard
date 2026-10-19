'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  TrendingUp, TrendingDown, AlertTriangle, RefreshCw, MessageSquareText, CheckCircle2, XCircle, LayoutGrid, Table, Clock, Trophy, Target, ShieldCheck, Tag, EyeOff, Eye, ArrowLeft, Package
} from 'lucide-react';

interface BpoData {
  period: string;
  eventNote?: string;
  sales26: number; sales27: number;
  volume26: number; volume27: number;
  prodSales26: number; prodSales27: number;
  prodAll26: number; prodAll27: number;
  prodChikusan26: number; prodChikusan27: number;
  prodSuisan26: number; prodSuisan27: number;
  prodDelica26?: number; prodDelica27?: number;
  packAll26: number; packAll27: number;
  packChikusan26: number; packChikusan27: number;
  packSuisan26: number; packSuisan27: number;
  packDelica26?: number; packDelica27?: number;
  error26: number; error27: number; isWarning: boolean;
  dx26: number; dx27: number;
  grossProfit26: number; grossProfit27: number;
  operatingProfit26: number; operatingProfit27: number;
}

const SITE_CONFIGS: Record<string, {
  name: string;
  hasChikusan: boolean;
  hasSuisan: boolean;
  hasDelica: boolean;
}> = {
  yamanaka: {
    name: 'ヤマナカ センター',
    hasChikusan: true,
    hasSuisan: true,
    hasDelica: false,
  },
  bisai: {
    name: 'AFS尾西 センター',
    hasChikusan: true,
    hasSuisan: true,
    hasDelica: true,
  },
  tokyu: {
    name: '東急ストア センター',
    hasChikusan: true,
    hasSuisan: false,
    hasDelica: false,
  },
};

const formatValue = (key: string, value: number) => {
  if (value === undefined || value === null || isNaN(value)) return 'ー';
  
  switch (key) {
    case 'sales': 
      return `¥${Number(value).toLocaleString('ja-JP')}`;
    case 'salesWan':
      return `${(Number(value) / 10000).toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'volume':
      return Number(value).toLocaleString('ja-JP', { maximumFractionDigits: 0 });
    case 'prodSales':
      return `${Number(value).toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'packAll':
    case 'packChikusan':
    case 'packSuisan':
    case 'packDelica':
      return `¥${Number(value).toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'error':
      return `${Number(value).toLocaleString('ja-JP', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
    case 'dx':
      return Number(value).toLocaleString('ja-JP', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    case 'prodAll':
    case 'prodChikusan':
    case 'prodSuisan':
    case 'prodDelica':
      return Number(value).toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'grossProfit':
    case 'operatingProfit':
      return Number(value).toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    default:
      return Number(value).toLocaleString('ja-JP', { maximumFractionDigits: 2 });
  }
};

function DashboardContent() {
  const params = useParams();
  const currentSite = (params?.site as string) || 'yamanaka';
  const siteConfig = SITE_CONFIGS[currentSite] || {
    name: `${currentSite} センター`,
    hasChikusan: true,
    hasSuisan: true,
    hasDelica: false,
  };
  const siteDisplayName = siteConfig.name;

  const [data, setData] = useState<BpoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'heatmap' | 'table'>('timeline');
  const [statusFilter, setStatusFilter] = useState<'all' | 'good' | 'bad'>('all');
  const [hideEmptyMonths, setHideEmptyMonths] = useState(true);

  const fetchData = async (siteName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dashboard?site=${siteName}`);
      const result = await response.json();
      if (Array.isArray(result.data)) {
        const processedData = result.data.map((d: any) => ({
          ...d,
          sales26: Number(String(d.sales26 || 0).replace(/[^0-9.-]+/g,"")),
          sales27: Number(String(d.sales27 || 0).replace(/[^0-9.-]+/g,"")),
          volume26: Number(String(d.volume26 || 0).replace(/[^0-9.-]+/g,"")),
          volume27: Number(String(d.volume27 || 0).replace(/[^0-9.-]+/g,""))
        }));
        setData(processedData);
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
  
  const getValidCount = (key: keyof BpoData) => {
    const count = data.filter(d => (Number(d[key]) || 0) > 0).length;
    return count > 0 ? count : 1;
  };

  const calcAvg = (key: keyof BpoData) => {
    return calcSum(key) / getValidCount(key);
  };

  const totalSales26 = calcSum('sales26');
  const totalSales27 = calcSum('sales27');
  const salesGrowth = totalSales26 > 0 ? (((totalSales27 - totalSales26) / totalSales26) * 100).toFixed(2) : '0.00';

  const avgProdSales26 = calcAvg('prodSales26');
  const avgProdSales27 = calcAvg('prodSales27');
  const prodSalesGrowth = avgProdSales26 > 0 ? (((avgProdSales27 - avgProdSales26) / avgProdSales26) * 100).toFixed(2) : '0.00';

  const avgProdAll26 = calcAvg('prodAll26');
  const avgProdAll27 = calcAvg('prodAll27');
  const prodGrowth = avgProdAll26 > 0 ? (((avgProdAll27 - avgProdAll26) / avgProdAll26) * 100).toFixed(2) : '0.00';

  const avgOpProfit26_pct = calcAvg('operatingProfit26') * 100;
  const avgOpProfit27_pct = calcAvg('operatingProfit27') * 100;
  const profitGrowth = (avgOpProfit27_pct - avgOpProfit26_pct).toFixed(2);

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

  const displayData = useMemo(() => {
    if (!hideEmptyMonths) return data;
    return data.filter(d => {
      return (Number(d.sales26) || 0) > 0 || (Number(d.sales27) || 0) > 0 || (Number(d.prodAll26) || 0) > 0 || (Number(d.prodAll27) || 0) > 0;
    });
  }, [data, hideEmptyMonths]);

  const metricsList = useMemo(() => {
    let idCounter = 1;
    const list = [
      { id: idCounter++, key: 'sales', name: `${idCounter - 1}. 売上`, unit: '', isReverse: false, desc: '月次売上金額の推移' },
      { id: idCounter++, key: 'prodSales', name: `${idCounter - 1}. 売上生産性`, unit: '', isReverse: false, desc: '労務費工数に対する売上創出効率' },
      { id: idCounter++, key: 'prodAll', name: `${idCounter - 1}. 作業生産性(全体)`, unit: '', isReverse: false, desc: '全社作業の処理効率' },
    ];

    if (siteConfig.hasChikusan) {
      list.push({ id: idCounter++, key: 'prodChikusan', name: `${idCounter - 1}. 作業生産性(畜産)`, unit: '', isReverse: false, desc: '畜産加工ラインの作業効率' });
    }
    if (siteConfig.hasSuisan) {
      list.push({ id: idCounter++, key: 'prodSuisan', name: `${idCounter - 1}. 作業生産性(水産)`, unit: '', isReverse: false, desc: '水産加工部門の作業効率' });
    }
    if (siteConfig.hasDelica) {
      list.push({ id: idCounter++, key: 'prodDelica', name: `${idCounter - 1}. 作業生産性(デリカ)`, unit: '', isReverse: false, desc: 'デリカ加工部門の作業効率' });
    }

    list.push(
      { id: idCounter++, key: 'error', name: `${idCounter - 1}. 事故評価(エラー率)`, unit: '', isReverse: true, desc: 'エラー発生率 (低いほど高評価)' },
      { id: idCounter++, key: 'dx', name: `${idCounter - 1}. DX評価`, unit: '', isReverse: false, desc: 'DX化・減価償却費関連指標' },
      { id: idCounter++, key: 'grossProfit', name: `${idCounter - 1}. 売上総利益率`, unit: '%', isReverse: false, desc: '粗利益率のポイント推移' },
      { id: idCounter++, key: 'operatingProfit', name: `${idCounter - 1}. 営業利益率`, unit: '%', isReverse: false, desc: '営業利益率のポイント推移' }
    );

    return list;
  }, [siteConfig]);

  const metricAnalysis = useMemo(() => {
    return metricsList.map(item => {
      const k26 = `${item.key}26` as keyof BpoData;
      const k27 = `${item.key}27` as keyof BpoData;
      
      let v26 = item.key === 'sales' ? totalSales26 : calcAvg(k26);
      let v27 = item.key === 'sales' ? totalSales27 : calcAvg(k27);

      if (item.key === 'grossProfit' || item.key === 'operatingProfit') {
        v26 = v26 * 100;
        v27 = v27 * 100;
      }

      const diff = v27 - v26;
      const pctNum = v26 > 0 ? (diff / v26) * 100 : 0;
      
      const isGood = item.isReverse ? diff <= 0 : diff >= 0;

      let reasonText = '';

      if (item.key === 'sales') {
        if (pctNum >= 5) reasonText = '26期より大幅増加。各月の実績が極めて順調に前年を超えて推移。';
        else if (pctNum >= 0) reasonText = '26期と同等水準で着地。安定した売上基盤を維持。';
        else reasonText = '26期より減少。売上金額の底上げと価格改定効果の再検証が必要。';
      } else if (item.key === 'prodSales') {
        if (pctNum >= 10) reasonText = '26期より大幅向上。労務費工数に対する売上創出額が飛躍的に拡大。';
        else if (pctNum >= 0) reasonText = '26期より向上。労務費に対する売上創出効率の改善傾向が定着。';
        else reasonText = '26期より低下。労務費工数に対する売上創出効率の改善対策が必要。';
      } else if (item.key.startsWith('prod')) {
        if (pctNum >= 10) reasonText = '26期より大幅向上。作業フローの最適化と習熟度向上が大きく寄与。';
        else if (pctNum >= 0) reasonText = '26期より向上。全社的な処理速度が向上し工数削減に貢献。';
        else if (pctNum >= -5) reasonText = '26期よりやや低下。ボトルネック工程の短縮と人員配置の見直しが必要。';
        else reasonText = '26期より大幅低下。作業手順の標準化とライン再構築を推奨。';
      } else if (item.key === 'error') {
        if (pctNum <= -20) reasonText = '26期より大幅改善。品質管理フローの徹底と検品体制によりエラー激減。';
        else if (pctNum <= 0) reasonText = '26期と同等水準を維持。引き続き現場での基本動作を徹底。';
        else if (pctNum <= 20) reasonText = '26期より悪化。出荷ミスの防止に向け現場手順の再徹底と原因究明が必要。';
        else reasonText = '26期より大幅悪化。再発防止対策の徹底および検品工程の機械化検討が必要。';
      } else if (item.key === 'grossProfit') {
        if (pctNum >= 10) reasonText = '26期より大幅向上。原価コントロールの徹底が奏功し粗利益率が著しく改善。';
        else if (pctNum >= 0) reasonText = '26期より向上。適切な原価管理により安定した利益率を確保。';
        else reasonText = '26期より低下。仕入コスト・歩留まりの再検証と原価率の適正化が必要。';
      } else if (item.key === 'operatingProfit') {
        if (pctNum >= 10) reasonText = '26期より大幅向上。固定費の効率化と高収益な拠点運営体制が確立。';
        else if (pctNum >= 0) reasonText = '26期より向上。収益性の向上が着実に進んでいる状態。';
        else reasonText = '26期より低下。固定費・稼働コストの構造を見直し、採算性の再構築が必要。';
      } else {
        reasonText = isGood ? '26期より改善・向上。' : '26期より悪化・低下。確認を推奨。';
      }

      return {
        id: item.id,
        key: item.key,
        name: item.name,
        desc: item.desc,
        isReverse: item.isReverse,
        v26: v26,
        v27: v27,
        unit: item.unit,
        pct: pctNum.toFixed(2),
        isGood,
        reason: reasonText
      };
    });
  }, [totalSales26, totalSales27, data, metricsList]);
  const packUnitSummary = useMemo(() => {
    const list = [
      {
        name: 'パック単価(全体)',
        v26: calcAvg('packAll26').toFixed(2),
        v27: calcAvg('packAll27').toFixed(2),
        pct: calcAvg('packAll26') > 0 ? (((calcAvg('packAll27') - calcAvg('packAll26')) / calcAvg('packAll26')) * 100).toFixed(2) : '0.00'
      }
    ];

    if (siteConfig.hasChikusan) {
      const v26 = calcAvg('packChikusan26');
      const v27 = calcAvg('packChikusan27');
      list.push({
        name: 'パック単価(畜産)',
        v26: v26.toFixed(2),
        v27: v27.toFixed(2),
        pct: v26 > 0 ? (((v27 - v26) / v26) * 100).toFixed(2) : '0.00'
      });
    }

    if (siteConfig.hasSuisan) {
      const v26 = calcAvg('packSuisan26');
      const v27 = calcAvg('packSuisan27');
      list.push({
        name: 'パック単価(水産)',
        v26: v26.toFixed(2),
        v27: v27.toFixed(2),
        pct: v26 > 0 ? (((v27 - v26) / v26) * 100).toFixed(2) : '0.00'
      });
    }

    if (siteConfig.hasDelica) {
      const v26 = calcAvg('packDelica26');
      const v27 = calcAvg('packDelica27');
      list.push({
        name: 'パック単価(デリカ)',
        v26: v26.toFixed(2),
        v27: v27.toFixed(2),
        pct: v26 > 0 ? (((v27 - v26) / v26) * 100).toFixed(2) : '0.00'
      });
    }

    return list;
  }, [data, siteConfig]);

  const gradeInfo = useMemo(() => {
    const validMetrics = metricAnalysis.filter(m => m.key !== 'dx');
    const goodCount = validMetrics.filter(m => m.isGood).length;
    const totalCount = validMetrics.length;

    let grade = 'S';
    let badgeClass = 'from-purple-600 to-indigo-600 text-white shadow-purple-200';
    let borderStyle = 'border-purple-200 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30';
    let label = '最高水準の拠点運営';

    if (goodCount >= 8) {
      grade = 'S';
      badgeClass = 'from-purple-600 via-indigo-600 to-blue-600 text-white shadow-purple-100';
      borderStyle = 'border-purple-200 bg-gradient-to-br from-purple-50/60 via-white to-indigo-50/30';
      label = '最高水準の拠点運営';
    } else if (goodCount >= 6) {
      grade = 'A';
      badgeClass = 'from-emerald-600 to-teal-600 text-white shadow-emerald-100';
      borderStyle = 'border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30';
      label = '極めて優秀な拠点運営';
    } else if (goodCount >= 4) {
      grade = 'B';
      badgeClass = 'from-blue-600 to-cyan-600 text-white shadow-blue-100';
      borderStyle = 'border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-cyan-50/30';
      label = '良好・順調な運営';
    } else if (goodCount >= 2) {
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

    const goodPct = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 0;

    return { grade, goodCount, totalCount, warnCount: totalCount - goodCount, goodPct, label, badgeClass, borderStyle };
  }, [metricAnalysis]);

  const packMetricsList = useMemo(() => {
    const list = [
      { id: 'volume', key: 'volume', name: '総物量 (全体)', unit: '', isReverse: false, desc: '月次の処理総物量' },
      { id: 'packAll', key: 'packAll', name: 'パック単価(全体)', unit: '', isReverse: false, desc: '商品1パックあたりの平均単価' }
    ];
    if (siteConfig.hasChikusan) {
      list.push({ id: 'packChikusan', key: 'packChikusan', name: 'パック単価(畜産)', unit: '', isReverse: false, desc: '畜産商品のパック単価' });
    }
    if (siteConfig.hasSuisan) {
      list.push({ id: 'packSuisan', key: 'packSuisan', name: 'パック単価(水産)', unit: '', isReverse: false, desc: '水産商品のパック単価' });
    }
    if (siteConfig.hasDelica) {
      list.push({ id: 'packDelica', key: 'packDelica', name: 'パック単価(デリカ)', unit: '', isReverse: false, desc: 'デリカ商品のパック単価' });
    }
    return list;
  }, [siteConfig]);

  // ★ ヒートマップ背景判定：濃い緑の条件を 15% 以上から 10% 以上に変更
  const getHeatmapBg = (pctNum: number, isReverse: boolean, isGrayBase: boolean = false) => {
    if (isNaN(pctNum) || !isFinite(pctNum)) return 'bg-slate-50 border-slate-200 text-slate-400';
    
    if (isGrayBase) {
      return 'bg-slate-50 border-slate-200 text-slate-800';
    }

    const effectivePct = isReverse ? -pctNum : pctNum;
    if (effectivePct >= 10) return 'bg-emerald-600 text-white font-bold border-emerald-700'; // ★ +10%以上に変更
    if (effectivePct > 0) return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
    if (effectivePct > -10) return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
    return 'bg-rose-600 text-white font-bold border-rose-700';
  };

  const processedMetrics = useMemo(() => {
    if (statusFilter === 'good') return metricAnalysis.filter(m => m.isGood);
    if (statusFilter === 'bad') return metricAnalysis.filter(m => !m.isGood);
    return metricAnalysis;
  }, [metricAnalysis, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8 font-sans">
      
      <header className="mb-6 bg-white px-8 py-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all border border-slate-200">
            <ArrowLeft className="w-4 h-4" />
            <span>拠点選択へ戻る</span>
          </Link>
          <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
          {/* ★ PALロゴ：囲み枠・グレー背景を撤去して直接表示 */}
          <div className="flex items-center justify-center h-10 w-auto">
            <img src="/pal-logo.png" alt="PAL Logo" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-indigo-600 tracking-wider uppercase">BPO OPERATIONS COMMAND CENTER</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">{siteDisplayName}</h1>
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
                    全{gradeInfo.totalCount}指標評価
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
                            <span className="text-xs font-extrabold text-slate-400 ml-0.5">/{gradeInfo.totalCount}</span>
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
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">S: 8~</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">A: 6~7</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">B: 4~5</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">C: 2~3</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">D: ~1</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all flex-1">
                <p className="text-xs text-slate-500 font-extrabold mb-2">27期 累計売上</p>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                    <span>{formatValue('salesWan', totalSales27)}</span>
                    <span className="text-sm font-bold text-slate-600">万円</span>
                  </h3>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg w-fit ${Number(salesGrowth) >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'}`}>
                    {Number(salesGrowth) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{Number(salesGrowth) >= 0 ? '+' : ''}{salesGrowth}%</span>
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all flex-1">
                <p className="text-xs text-slate-500 font-extrabold mb-2">平均 営業利益率</p>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {formatValue('operatingProfit', avgOpProfit27_pct)}<span className="text-lg font-bold text-slate-700">%</span>
                  </h3>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg w-fit ${Number(profitGrowth) >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'}`}>
                    {Number(profitGrowth) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{Number(profitGrowth) >= 0 ? '+' : ''}{profitGrowth}%p</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all flex-1">
                <p className="text-xs text-slate-500 font-extrabold mb-2">作業生産性 (全体)</p>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {formatValue('prodAll', avgProdAll27)}
                  </h3>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg w-fit ${Number(prodGrowth) >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'}`}>
                    {Number(prodGrowth) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{Number(prodGrowth) >= 0 ? '+' : ''}{prodGrowth}%</span>
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all flex-1">
                <p className="text-xs text-slate-500 font-extrabold mb-2">売上生産性 (平均)</p>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                    <span>{formatValue('prodSales', avgProdSales27)}</span>
                    <span className="text-sm font-bold text-slate-600">円/h</span>
                  </h3>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg w-fit ${Number(prodSalesGrowth) >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-rose-50 text-rose-700 border border-rose-200/80'}`}>
                    {Number(prodSalesGrowth) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{Number(prodSalesGrowth) >= 0 ? '+' : ''}{prodSalesGrowth}%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'timeline' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>① 月別トピックス & 定性コメント分析</span>
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

          {activeTab === 'timeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-base font-black text-slate-900">月別トピックス (実績推移ログ)</h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fullYearData
                      .filter(m => (m.sales26 || 0) > 0 || (m.sales27 || 0) > 0 || (m.prodAll26 || 0) > 0 || (m.prodAll27 || 0) > 0 || Boolean(m.eventNote))
                      .map((m, idx) => {
                        const s26 = m.sales26 || 0;
                        const s27 = m.sales27 || 0;
                        const sPct = s26 > 0 ? (((s27 - s26) / s26) * 100).toFixed(2) : '0.00';
                        
                        const p26 = m.prodAll26 || 0;
                        const p27 = m.prodAll27 || 0;
                        const pPct = p26 > 0 ? (((p27 - p26) / p26) * 100).toFixed(2) : '0.00';

                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border transition-all flex flex-col justify-between bg-slate-50/70 border-slate-200 hover:border-indigo-300 hover:shadow-md"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-black text-slate-900 bg-slate-200/60 px-2 py-0.5 rounded-lg">{m.period}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 mt-0.5 mb-1.5">
                              <div className="flex items-end justify-between border-b border-slate-200 pb-1">
                                <span className="text-xs font-bold text-slate-500 mb-0.5">売上</span>
                                <div className="text-right flex items-baseline">
                                  <strong className="text-base font-black text-slate-900 leading-none tracking-tight">{formatValue('sales', s27)}</strong>
                                  <span className={`ml-1.5 text-[10px] font-black ${Number(sPct) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    ({Number(sPct) >= 0 ? '+' : ''}{sPct}%)
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-end justify-between border-b border-slate-200 pb-1">
                                <span className="text-xs font-bold text-slate-500 mb-0.5">作業生産性</span>
                                <div className="text-right flex items-baseline">
                                  <strong className="text-base font-black text-slate-900 leading-none tracking-tight">{formatValue('prodAll', p27)}</strong>
                                  <span className={`ml-1.5 text-[10px] font-black ${Number(pPct) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    ({Number(pPct) >= 0 ? '+' : ''}{pPct}%)
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-0.5 pt-1">
                              {m.eventNote ? (
                                <div className="px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-900 flex items-center gap-1.5 shadow-2xs">
                                  <MessageSquareText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span className="truncate">{m.eventNote}</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic font-medium px-1">※ 特記事項なし</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquareText className="w-4 h-4 text-indigo-600" />
                      <h2 className="text-sm font-bold text-slate-900">全{metricAnalysis.length}項目 26期対比 定性コメント分析</h2>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/80">
                      評価対象: {metricAnalysis.length}項目
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
                    {metricAnalysis.map((item) => {
                      const isDxEmpty = item.key === 'dx' && Number(item.v26) === 0 && Number(item.v27) === 0;

                      return (
                        <div key={item.id} className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                          isDxEmpty ? 'bg-slate-50 border-slate-200/60' :
                          item.isGood ? 'bg-emerald-50/20 border-emerald-200/80' : 'bg-rose-50/40 border-rose-200/80'
                        }`}>
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="font-bold text-slate-800 text-xs">{item.name}</span>
                              {!isDxEmpty && (
                                item.isGood ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" /> 改善 ({item.pct}%)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                    <XCircle className="w-3 h-3" /> 悪化 ({item.pct}%)
                                  </span>
                                )
                              )}
                            </div>
                            
                            {isDxEmpty ? (
                              <div className="flex items-center justify-center py-4 text-slate-300 font-black tracking-widest">
                                ー
                              </div>
                            ) : (
                              <>
                                <div className="text-[11px] text-slate-500 mb-1.5">
                                  26期: {formatValue(item.key, Number(item.v26))}{item.unit} ➔ 27期: <strong className="text-slate-900 font-bold">{formatValue(item.key, Number(item.v27))}{item.unit}</strong>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed font-normal">{item.reason}</p>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-200/80">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-slate-600" />
                      <h3 className="text-xs font-bold text-slate-800">売上単価指標 サマリー</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {packUnitSummary.map((p, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                          <span className="text-[11px] font-bold text-slate-700">{p.name}</span>
                          <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-[10px] text-slate-400">26期: ¥{p.v26} ➔</span>
                            <span className="text-xs font-black text-slate-900">¥{p.v27}</span>
                          </div>
                          <div className="mt-1 text-right">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${Number(p.pct) >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              昨対比 {Number(p.pct) >= 0 ? '+' : ''}{p.pct}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {activeTab === 'heatmap' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">月別×全{metricsList.length}項目 昨対比ヒートマップ</h2>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">各月の26期・27期の実績値と昨対伸び率（%）を表示します。</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setHideEmptyMonths(!hideEmptyMonths)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all mr-2 ${
                      hideEmptyMonths ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {hideEmptyMonths ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>未入力月を非表示</span>
                  </button>
                  {/* ★ 凡例テキストを「+10%以上」に改修 */}
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> +10%以上</span>
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
                      {displayData.map(d => (
                        <th key={d.period} className="py-3 px-2 text-center min-w-[120px]">{d.period}</th>
                      ))}
                      <th className="py-3 px-4 text-right min-w-[120px]">半期平均前年比</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metricsList.map(m => {
                      const k26 = `${m.key}26` as keyof BpoData;
                      const k27 = `${m.key}27` as keyof BpoData;
                      
                      const activeMonths = data.filter(d => (Number(d[k27]) || 0) > 0);
                      const validCount = activeMonths.length > 0 ? activeMonths.length : 1;

                      let sum26 = activeMonths.reduce((sum, d) => sum + (Number(d[k26]) || 0), 0);
                      let sum27 = activeMonths.reduce((sum, d) => sum + (Number(d[k27]) || 0), 0);

                      let avg26 = m.key === 'sales' ? sum26 : sum26 / validCount;
                      let avg27 = m.key === 'sales' ? sum27 : sum27 / validCount;
                      
                      if (m.key === 'grossProfit' || m.key === 'operatingProfit') {
                        avg26 = avg26 * 100;
                        avg27 = avg27 * 100;
                      }

                      const totalDiffPct = avg26 > 0 ? ((avg27 - avg26) / avg26) * 100 : 0;

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {m.name}
                            <span className="block text-[10px] font-normal text-slate-400">{m.desc}</span>
                          </td>
                          {displayData.map(monthData => {
                            let v26 = Number(monthData[k26]) || 0;
                            let v27 = Number(monthData[k27]) || 0;
                            
                            if (m.key === 'grossProfit' || m.key === 'operatingProfit') {
                              v26 = v26 * 100;
                              v27 = v27 * 100;
                            }

                            const diffPct = v26 > 0 ? ((v27 - v26) / v26) * 100 : 0;
                            const isMissing = monthData[k26] === undefined && monthData[k27] === undefined;
                            
                            if (m.key === 'dx' && v26 === 0 && v27 === 0) {
                              return (
                                <td key={monthData.period} className="py-2 px-1.5 text-center">
                                  <div className="py-4 px-1 rounded-xl bg-slate-50/50 border border-slate-100 text-slate-300 text-center font-black text-sm min-w-[110px]">
                                    ー
                                  </div>
                                </td>
                              );
                            }

                            const cellBg = getHeatmapBg(diffPct, m.isReverse, false);

                            return (
                              <td key={monthData.period} className="py-2 px-1.5 text-center">
                                {!isMissing ? (
                                  <div className={`p-2.5 rounded-xl border flex flex-col justify-center gap-1 shadow-2xs ${cellBg} min-w-[110px]`}>
                                    <div className="flex justify-between items-end w-full leading-none">
                                      <span className="text-[10px] font-medium opacity-80">26期</span>
                                      <span className="text-sm font-bold">{formatValue(m.key, v26)}</span>
                                    </div>
                                    <div className="flex justify-between items-end w-full leading-none mt-1">
                                      <span className="text-[10px] font-medium opacity-80">27期</span>
                                      <span className="text-sm font-black">{formatValue(m.key, v27)}</span>
                                    </div>
                                    <div className="w-full mt-1.5 pt-1.5 border-t border-current/20 flex justify-end items-center">
                                      <span className="text-[13px] font-black tracking-tight">
                                        {diffPct >= 0 ? '+' : ''}{diffPct.toFixed(2)}%
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="py-2 px-1 rounded-xl bg-slate-100 text-slate-400 text-center font-bold text-xs min-w-[110px]">
                                    ー
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {m.key === 'dx' && avg26 === 0 && avg27 === 0 ? (
                              <span className="inline-block px-4 py-1.5 rounded-lg text-[13px] font-black bg-slate-50 text-slate-300 border border-slate-100">
                                ー
                              </span>
                            ) : (
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-[13px] font-black ${
                                (m.isReverse ? totalDiffPct <= 0 : totalDiffPct >= 0) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {totalDiffPct >= 0 ? '+' : ''}{totalDiffPct.toFixed(2)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 売上単価 ＋ 総物量指標 (月別推移) */}
              <div className="mt-8 pt-6 border-t border-slate-200/80">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">売上単価・総物量指標 (月別推移)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="py-3 px-4 min-w-[180px]">単価・物量 項目名</th>
                        {displayData.map(d => (
                          <th key={d.period} className="py-3 px-2 text-center min-w-[120px]">{d.period}</th>
                        ))}
                        <th className="py-3 px-4 text-right min-w-[120px]">半期平均前年比</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {packMetricsList.map(m => {
                        const k26 = `${m.key}26` as keyof BpoData;
                        const k27 = `${m.key}27` as keyof BpoData;
                        
                        const activeMonths = data.filter(d => (Number(d[k27]) || 0) > 0);
                        const validCount = activeMonths.length > 0 ? activeMonths.length : 1;

                        const sum26 = activeMonths.reduce((s, d) => s + (Number(d[k26]) || 0), 0);
                        const sum27 = activeMonths.reduce((s, d) => s + (Number(d[k27]) || 0), 0);

                        const avg26 = sum26 / validCount;
                        const avg27 = sum27 / validCount;
                        const totalDiffPct = avg26 > 0 ? ((avg27 - avg26) / avg26) * 100 : 0;

                        return (
                          <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-800">
                              {m.name}
                              <span className="block text-[10px] font-normal text-slate-400">{m.desc}</span>
                            </td>
                            {displayData.map(monthData => {
                              const v26 = Number(monthData[k26]) || 0;
                              const v27 = Number(monthData[k27]) || 0;
                              const diffPct = v26 > 0 ? ((v27 - v26) / v26) * 100 : 0;
                              
                              const cellBg = getHeatmapBg(diffPct, m.isReverse, true);

                              const isMissing = monthData[k26] === undefined && monthData[k27] === undefined;

                              return (
                                <td key={monthData.period} className="py-2 px-1.5 text-center">
                                  {!isMissing ? (
                                    <div className={`p-2.5 rounded-xl border flex flex-col justify-center gap-1 shadow-2xs ${cellBg} min-w-[110px]`}>
                                      <div className="flex justify-between items-end w-full leading-none">
                                        <span className="text-[10px] font-medium opacity-80 text-slate-500">26期</span>
                                        <span className="text-sm font-bold text-slate-800">{formatValue(m.key, v26)}</span>
                                      </div>
                                      <div className="flex justify-between items-end w-full leading-none mt-1">
                                        <span className="text-[10px] font-medium opacity-80 text-slate-500">27期</span>
                                        <span className="text-sm font-black text-slate-900">{formatValue(m.key, v27)}</span>
                                      </div>
                                      <div className="w-full mt-1.5 pt-1.5 border-t border-slate-200 flex justify-end items-center">
                                        <span className={`text-[13px] font-black tracking-tight ${diffPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {diffPct >= 0 ? '+' : ''}{diffPct.toFixed(2)}%
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="py-2 px-1 rounded-xl bg-slate-100 text-slate-400 text-center font-bold text-xs min-w-[110px]">
                                      ー
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td className="py-3 px-4 text-right font-bold text-slate-900">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-[13px] font-black border bg-slate-50 border-slate-200 ${totalDiffPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
            </div>
          )}

          {activeTab === 'table' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">KPI 実績比較表</h2>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">全{metricsList.length}指標の平均値と前年比の伸び率を一覧表示します。</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-fit">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    すべて表示
                  </button>
                  <button
                    onClick={() => setStatusFilter('good')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'good'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-emerald-700'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>改善・良好のみ</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('bad')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'bad'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-rose-700'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>要確認のみ</span>
                  </button>
                </div>
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
                    {processedMetrics.length > 0 ? (
                      processedMetrics.map(m => {
                        const isDxEmpty = m.key === 'dx' && Number(m.v26) === 0 && Number(m.v27) === 0;

                        return (
                          <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              {m.name}
                              <span className="block text-[10px] font-normal text-slate-400">{m.desc}</span>
                            </td>
                            {isDxEmpty ? (
                              <>
                                <td colSpan={5} className="py-3.5 px-4 text-center text-slate-300 font-black tracking-widest">
                                  ー
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3.5 px-4 text-right font-medium text-slate-600">{formatValue(m.key, Number(m.v26))}{m.unit}</td>
                                <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatValue(m.key, Number(m.v27))}{m.unit}</td>
                                <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                                  {Number(m.v27) - Number(m.v26) >= 0 ? '+' : ''}{formatValue(m.key, Number(m.v27) - Number(m.v26))}{m.unit}
                                </td>
                                <td className="py-3.5 px-4 text-right font-bold">
                                  <span className={m.isGood ? 'text-emerald-700' : 'text-rose-700'}>
                                    {Number(m.pct) >= 0 ? '+' : ''}{m.pct}%
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  {m.isGood ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                                      <TrendingUp className="w-3 h-3" /> 良好
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-bold px-2.5 py-0.5 rounded border border-rose-200 text-[11px]">
                                      <TrendingDown className="w-3 h-3" /> 要確認
                                    </span>
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-bold text-xs">
                          該当する指標はありません。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-200/80">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">売上単価・物量指標 比較表</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="py-3 px-4">単価・物量 項目</th>
                        <th className="py-3 px-4 text-right">26期 平均</th>
                        <th className="py-3 px-4 text-right">27期 平均</th>
                        <th className="py-3 px-4 text-right">前年差分</th>
                        <th className="py-3 px-4 text-right">前年比 (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {packMetricsList.map(m => {
                        const k26 = `${m.key}26` as keyof BpoData;
                        const k27 = `${m.key}27` as keyof BpoData;
                        const activeMonths = data.filter(d => (Number(d[k27]) || 0) > 0);
                        const validCount = activeMonths.length > 0 ? activeMonths.length : 1;

                        const sum26 = activeMonths.reduce((s, d) => s + (Number(d[k26]) || 0), 0);
                        const sum27 = activeMonths.reduce((s, d) => s + (Number(d[k27]) || 0), 0);

                        const avg26 = sum26 / validCount;
                        const avg27 = sum27 / validCount;
                        const diff = avg27 - avg26;
                        const pct = avg26 > 0 ? (diff / avg26) * 100 : 0;
                        const isGood = pct >= 0;

                        return (
                          <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              {m.name}
                              <span className="block text-[10px] font-normal text-slate-400">{m.desc}</span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-medium text-slate-600">{formatValue(m.key, avg26)}{m.unit}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatValue(m.key, avg27)}{m.unit}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                              {diff >= 0 ? '+' : ''}{formatValue(m.key, diff)}{m.unit}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold">
                              <span className={isGood ? 'text-emerald-700' : 'text-rose-700'}>
                                {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-bold text-slate-600">画面を準備中...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}