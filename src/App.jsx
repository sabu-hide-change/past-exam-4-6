// npm install lucide-react recharts firebase
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Check,
  X,
  Home,
  ChevronRight,
  RefreshCw,
  BarChart2,
  BookOpen,
  User,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// ===================================================================
// Firebase設定（APIキー等は環境変数から読み込み。直書きは絶対に厳禁）
// ===================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// データ分離用のアプリ識別子（他問題集と混ざらないよう。後から一括書き換え可）
const APP_ID = "QuizApp_3_6_Production_Operation_001";

const SOURCE_LABEL = "過去問セレクト演習 3-6 生産のオペレーション";
const APP_TITLE = "3-6 生産のオペレーション";
const SECTION_BADGE = "過去問 3-6";

// Firebase初期化（多重初期化・設定欠如でもクラッシュしないよう防衛的に）
let app = null;
let auth = null;
let db = null;
try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn("[Firebase] 設定が未定義のため、LocalStorageフォールバックで動作します。");
  }
} catch (e) {
  console.warn("[Firebase] 初期化に失敗しました。LocalStorageフォールバックで動作します。", e);
}

const CHOICE_LABELS = ["ア", "イ", "ウ", "エ", "オ"];

const CAT_LABEL = {
  quality: "品質管理（QC）",
  equipment: "設備管理・保全",
  info: "生産情報システム",
};

// ===================================================================
// インラインSVG / テーブル図表コンポーネント群（外部画像URLは一切使用しない）
// すべて<svg>プリミティブ等で100%内製化し、与条件のラベル・数値を
// 1つも省略せずにマッピングする。
// ===================================================================

// 共通：白背景カードに図/SVGを描画（ダークテーマ上で見やすく）
const FigCard = ({ children, caption }) => (
  <div className="my-4">
    <div className="rounded-xl bg-white p-3 shadow-lg overflow-x-auto">{children}</div>
    {caption && <p className="mt-1 text-center text-xs text-slate-400">{caption}</p>}
  </div>
);

// SVG用：複数行テキストを描画するヘルパー
const MultiText = ({ x, y, lines, lineH = 15, fontSize = 12, fill = "#1e293b", fontWeight = "normal", anchor = "middle" }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize={fontSize} fill={fill} fontWeight={fontWeight}>
    {lines.map((ln, i) => (
      <tspan key={i} x={x} dy={i === 0 ? 0 : lineH}>
        {ln}
      </tspan>
    ))}
  </text>
);

// 共通の矢印マーカー定義
const ArrowDefs = ({ id = "arw", color = "#334155" }) => (
  <defs>
    <marker id={id} markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L8,3 L0,6 Z" fill={color} />
    </marker>
  </defs>
);

// --- ◆管理図（QC7つ道具） ---
const ControlChart = () => {
  const pts = [
    [200, 120], [225, 200], [250, 150], [275, 180], [300, 140], [325, 195],
    [350, 150], [375, 130], [400, 150], [425, 110], [450, 70], [475, 110],
    [500, 95], [525, 200], [545, 170],
  ];
  const path = pts.map((p) => p.join(",")).join(" ");
  return (
    <FigCard caption="図：管理図（観測した個々のデータを時系列で表す）">
      <svg viewBox="0 0 600 300" className="w-full" style={{ maxHeight: 300 }}>
        <text x="300" y="24" textAnchor="middle" fontSize="17" fill="#0f172a" fontWeight="bold">◆管理図</text>
        {/* 軸 */}
        <line x1="180" y1="40" x2="180" y2="265" stroke="#0f172a" strokeWidth="2" markerEnd="url(#ccArw)" />
        <line x1="180" y1="265" x2="575" y2="265" stroke="#0f172a" strokeWidth="2" markerEnd="url(#ccArw)" />
        <ArrowDefs id="ccArw" color="#0f172a" />
        {/* 管理限界線・中心線 */}
        <line x1="180" y1="80" x2="565" y2="80" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="180" y1="160" x2="565" y2="160" stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="180" y1="240" x2="565" y2="240" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="172" y="84" textAnchor="end" fontSize="11" fill="#dc2626" fontWeight="bold">上方管理限界線</text>
        <text x="172" y="164" textAnchor="end" fontSize="11" fill="#1d4ed8" fontWeight="bold">中心線</text>
        <text x="172" y="244" textAnchor="end" fontSize="11" fill="#dc2626" fontWeight="bold">下方管理限界線</text>
        {/* データ折れ線 */}
        <polyline points={path} fill="none" stroke="#334155" strokeWidth="2" />
        {/* 異常値 */}
        <rect x="470" y="40" width="80" height="26" rx="4" fill="#dc2626" />
        <text x="510" y="58" textAnchor="middle" fontSize="13" fill="#ffffff" fontWeight="bold">異常値</text>
        <line x1="470" y1="55" x2="450" y2="70" stroke="#0f172a" strokeWidth="1.5" markerEnd="url(#ccArw)" />
        <text x="560" y="288" textAnchor="end" fontSize="13" fill="#0f172a" fontWeight="bold">時間</text>
      </svg>
    </FigCard>
  );
};

// --- ◆特性要因図（フィッシュボーン） ---
const FishboneChart = () => {
  const Big = ({ x, y }) => {
    const nx = Number(x);
    const ny = Number(y);
    return (
      <g>
        <rect x={nx} y={ny} width="86" height="34" rx="3" fill="#dbeafe" stroke="#1e3a8a" strokeWidth="1.2" />
        <text x={nx + 43} y={ny + 22} textAnchor="middle" fontSize="13" fill="#1e293b" fontWeight="bold">要因(大)</text>
      </g>
    );
  };
  return (
    <FigCard caption="図：特性要因図（原因と結果を魚の骨のように整理する）">
      <svg viewBox="0 0 620 320" className="w-full" style={{ maxHeight: 320 }}>
        <text x="310" y="24" textAnchor="middle" fontSize="17" fill="#0f172a" fontWeight="bold">◆特性要因図</text>
        <ArrowDefs id="fbArw" color="#0f172a" />
        {/* 背骨 */}
        <line x1="30" y1="170" x2="500" y2="170" stroke="#0f172a" strokeWidth="2.5" markerEnd="url(#fbArw)" />
        {/* 特性 */}
        <rect x="508" y="148" width="92" height="44" rx="3" fill="#fde6d3" stroke="#9a3412" strokeWidth="1.5" />
        <text x="554" y="176" textAnchor="middle" fontSize="15" fill="#1e293b" fontWeight="bold">特性</text>
        {/* 大骨（左右×上下） */}
        <line x1="230" y1="170" x2="160" y2="78" stroke="#0f172a" strokeWidth="2" />
        <line x1="230" y1="170" x2="160" y2="262" stroke="#0f172a" strokeWidth="2" />
        <line x1="410" y1="170" x2="340" y2="78" stroke="#0f172a" strokeWidth="2" />
        <line x1="410" y1="170" x2="340" y2="262" stroke="#0f172a" strokeWidth="2" />
        <Big x="117" y="44" />
        <Big x="117" y="262" />
        <Big x="297" y="44" />
        <Big x="297" y="262" />
        {/* 小骨ラベル */}
        <text x="205" y="120" textAnchor="middle" fontSize="11" fill="#334155">要因(小)</text>
        <text x="205" y="228" textAnchor="middle" fontSize="11" fill="#334155">要因(小)</text>
        <text x="385" y="120" textAnchor="middle" fontSize="11" fill="#334155">要因(小)</text>
        <text x="385" y="228" textAnchor="middle" fontSize="11" fill="#334155">要因(小)</text>
      </svg>
    </FigCard>
  );
};

// --- ◆パレート図 ---
const ParetoChart = () => {
  const bars = [60, 40, 28, 20, 14, 10, 7, 5, 3, 2];
  const total = bars.reduce((a, b) => a + b, 0);
  const labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const baseY = 300;
  const topY = 60;
  const x0 = 80;
  const bw = 34;
  const maxBar = bars[0];
  let cum = 0;
  const cumPts = bars.map((v, i) => {
    cum += v;
    const cx = x0 + i * bw + bw / 2;
    const cy = baseY - (cum / total) * (baseY - topY);
    return [cx, cy];
  });
  return (
    <FigCard caption="図：パレート図（出現頻度の高い順／降順に並べ累積和を表す）">
      <svg viewBox="0 0 520 350" className="w-full" style={{ maxHeight: 350 }}>
        <text x="260" y="24" textAnchor="middle" fontSize="17" fill="#0f172a" fontWeight="bold">◆パレート図</text>
        <ArrowDefs id="ptArw" color="#0f172a" />
        {/* 軸 */}
        <line x1="80" y1="50" x2="80" y2={baseY} stroke="#0f172a" strokeWidth="2" markerEnd="url(#ptArw)" />
        <line x1="80" y1={baseY} x2="500" y2={baseY} stroke="#0f172a" strokeWidth="2" markerEnd="url(#ptArw)" />
        {/* 100%補助線 */}
        <line x1="80" y1={topY} x2="470" y2={topY} stroke="#1d4ed8" strokeWidth="1.2" strokeDasharray="3 3" />
        <text x="72" y={topY + 4} textAnchor="end" fontSize="12" fill="#1d4ed8" fontWeight="bold">100%</text>
        <text x="72" y={baseY + 4} textAnchor="end" fontSize="12" fill="#1d4ed8" fontWeight="bold">0%</text>
        {/* 棒 */}
        {bars.map((v, i) => {
          const h = (v / maxBar) * (baseY - 90);
          const bx = x0 + i * bw;
          return (
            <g key={i}>
              <rect x={bx} y={baseY - h} width={bw - 4} height={h} fill="#fef3c7" stroke="#92400e" strokeWidth="1" />
              <text x={bx + (bw - 4) / 2} y={baseY + 16} textAnchor="middle" fontSize="11" fill="#1d4ed8">{labels[i]}</text>
            </g>
          );
        })}
        {/* 累積曲線 */}
        <polyline points={cumPts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#dc2626" strokeWidth="2.5" />
        {/* 右端から100%へ点線 */}
        <line x1={cumPts[cumPts.length - 1][0]} y1={topY} x2={cumPts[cumPts.length - 1][0]} y2={baseY} stroke="#1d4ed8" strokeWidth="1" strokeDasharray="3 3" />
        <text x="498" y={baseY + 24} textAnchor="end" fontSize="13" fill="#0f172a" fontWeight="bold">項目</text>
      </svg>
    </FigCard>
  );
};

// --- ◆ヒストグラム（時系列データを棒グラフで表す例） ---
const Histogram = () => {
  const heights = [2, 5, 8, 11, 14, 17, 13, 9, 5, 3, 1];
  const labels = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];
  const baseY = 280;
  const x0 = 70;
  const bw = 38;
  const maxH = 17;
  return (
    <FigCard caption="図：ヒストグラム（棒グラフ／度数分布）">
      <svg viewBox="0 0 520 320" className="w-full" style={{ maxHeight: 320 }}>
        <text x="260" y="24" textAnchor="middle" fontSize="17" fill="#0f172a" fontWeight="bold">◆ヒストグラム</text>
        <ArrowDefs id="hgArw" color="#0f172a" />
        <line x1="70" y1="50" x2="70" y2={baseY} stroke="#0f172a" strokeWidth="2" markerEnd="url(#hgArw)" />
        <line x1="70" y1={baseY} x2="500" y2={baseY} stroke="#0f172a" strokeWidth="2" markerEnd="url(#hgArw)" />
        <text x="58" y="46" textAnchor="end" fontSize="12" fill="#0f172a" fontWeight="bold">度数</text>
        {heights.map((v, i) => {
          const h = (v / maxH) * (baseY - 70);
          const bx = x0 + i * bw;
          return (
            <g key={i}>
              <rect x={bx} y={baseY - h} width={bw} height={h} fill="#fef3c7" stroke="#92400e" strokeWidth="1" />
              <text x={bx + bw / 2} y={baseY + 16} textAnchor="middle" fontSize="11" fill="#1e293b">{labels[i]}</text>
            </g>
          );
        })}
        <text x="498" y={baseY + 16} textAnchor="end" fontSize="13" fill="#0f172a" fontWeight="bold">重量</text>
      </svg>
    </FigCard>
  );
};

// --- ◆散布図 ---
const ScatterChart = () => {
  const dots = [
    [120, 180], [150, 160], [170, 200], [185, 150], [200, 175],
    [210, 130], [225, 165], [240, 145], [255, 120], [265, 150],
    [280, 110], [295, 135], [310, 100], [320, 125], [180, 195], [250, 185],
  ];
  return (
    <FigCard caption="図：散布図（2つの特性の相関を点でプロット／正の相関）">
      <svg viewBox="0 0 380 260" className="w-full" style={{ maxHeight: 260 }}>
        <text x="190" y="22" textAnchor="middle" fontSize="16" fill="#0f172a" fontWeight="bold">◆散布図</text>
        <ArrowDefs id="scArw" color="#0f172a" />
        <line x1="50" y1="40" x2="50" y2="225" stroke="#0f172a" strokeWidth="2" markerEnd="url(#scArw)" />
        <line x1="50" y1="225" x2="360" y2="225" stroke="#0f172a" strokeWidth="2" markerEnd="url(#scArw)" />
        <text x="40" y="42" textAnchor="end" fontSize="13" fill="#0f172a" fontWeight="bold">Y</text>
        <text x="358" y="245" textAnchor="end" fontSize="13" fill="#0f172a" fontWeight="bold">X</text>
        <ellipse cx="220" cy="150" rx="130" ry="42" fill="none" stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="3 4" transform="rotate(-28 220 150)" />
        {dots.map((d, i) => (
          <circle key={i} cx={d[0]} cy={d[1]} r="5" fill="#dc2626" />
        ))}
        <text x="300" y="205" textAnchor="middle" fontSize="12" fill="#1d4ed8" fontWeight="bold">正の相関</text>
      </svg>
    </FigCard>
  );
};

// --- 保全活動の体系図（維持活動／改善活動） ---
const MaintenanceTree = () => {
  const Box = ({ x, y, w, label, color = "#1e293b", bg = "#ffffff", stroke = "#334155" }) => {
    const nx = Number(x);
    const ny = Number(y);
    const nw = Number(w);
    return (
      <g>
        <rect x={nx} y={ny} width={nw} height="40" rx="3" fill={bg} stroke={stroke} strokeWidth="1.5" />
        <text x={nx + nw / 2} y={ny + 26} textAnchor="middle" fontSize="15" fill={color} fontWeight="bold">{label}</text>
      </g>
    );
  };
  return (
    <FigCard caption="図：保全活動の体系（維持する活動／改善する活動）">
      <svg viewBox="0 0 620 340" className="w-full" style={{ maxHeight: 340 }}>
        <text x="310" y="24" textAnchor="middle" fontSize="16" fill="#0f172a" fontWeight="bold">◆保全活動</text>
        {/* レベル1 */}
        <Box x="20" y="150" w="120" label="保全活動" />
        {/* レベル2 */}
        <Box x="250" y="90" w="120" label="維持活動" />
        <Box x="250" y="210" w="120" label="改善活動" />
        {/* レベル3（赤文字） */}
        <Box x="460" y="50" w="140" label="予防保全" color="#dc2626" />
        <Box x="460" y="130" w="140" label="事後保全" color="#dc2626" />
        <Box x="460" y="210" w="140" label="改良保全" color="#dc2626" />
        <Box x="460" y="290" w="140" label="保全予防" color="#dc2626" />
        {/* コネクタ：保全活動→維持/改善 */}
        <path d="M140 170 H195 V110 H250" fill="none" stroke="#334155" strokeWidth="1.8" />
        <path d="M195 170 V230 H250" fill="none" stroke="#334155" strokeWidth="1.8" />
        {/* 維持活動→予防/事後 */}
        <path d="M370 110 H420 V70 H460" fill="none" stroke="#334155" strokeWidth="1.8" />
        <path d="M420 110 V150 H460" fill="none" stroke="#334155" strokeWidth="1.8" />
        {/* 改善活動→改良/保全予防 */}
        <path d="M370 230 H420 V230 H460" fill="none" stroke="#334155" strokeWidth="1.8" />
        <path d="M420 230 V310 H460" fill="none" stroke="#334155" strokeWidth="1.8" />
      </svg>
    </FigCard>
  );
};

// --- 問題6：設備A・Bの稼働／故障修復の調査結果（与条件・ニュートラル） ---
const EquipmentGantt = () => {
  const x = (t) => 70 + t * (660 / 240);
  const ticks = [];
  for (let t = 0; t <= 240; t += 10) ticks.push(t);
  const A = [
    ["稼働", 0, 40], ["修復", 40, 70], ["稼働", 70, 120], ["修復", 120, 130],
    ["稼働", 130, 180], ["修復", 180, 200], ["稼働", 200, 240],
  ];
  const B = [
    ["稼働", 0, 20], ["修復", 20, 30], ["稼働", 30, 80], ["修復", 80, 90],
    ["稼働", 90, 180], ["修復", 180, 200], ["稼働", 200, 240],
  ];
  const Row = ({ data, y }) =>
    data.map(([type, s, e], i) => {
      const w = x(e) - x(s);
      const fill = type === "修復" ? "#9ca3af" : "#ffffff";
      return (
        <g key={i}>
          <rect x={x(s)} y={y} width={w} height="30" fill={fill} stroke="#334155" strokeWidth="1" />
          {w > 26 && (
            <text x={(x(s) + x(e)) / 2} y={y + 20} textAnchor="middle" fontSize="11" fill="#0f172a">{type}</text>
          )}
        </g>
      );
    });
  return (
    <FigCard caption="図：設備A・Bを240時間利用したときの稼働および故障修復の調査結果">
      <svg viewBox="0 0 760 200" className="w-full" style={{ maxHeight: 200 }}>
        {/* 目盛 */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={x(t)} y1="44" x2={x(t)} y2="48" stroke="#64748b" strokeWidth="1" />
            <text x={x(t)} y="38" textAnchor="middle" fontSize="9" fill="#334155">{t}</text>
          </g>
        ))}
        {/* 設備A */}
        <text x="10" y="74" fontSize="13" fill="#0f172a" fontWeight="bold">設備A</text>
        <Row data={A} y="55" />
        {/* 設備B */}
        <text x="10" y="124" fontSize="13" fill="#0f172a" fontWeight="bold">設備B</text>
        <Row data={B} y="105" />
      </svg>
    </FigCard>
  );
};

// --- 問題6：評価指標の計算結果（解答情報。解説画面でのみ表示） ---
const EvalTable = () => (
  <FigCard caption="表：設備A・Bの評価指標の計算結果">
    <table className="w-full border-collapse text-center text-xs text-slate-800">
      <thead>
        <tr className="bg-slate-100">
          <th className="border border-slate-300 px-2 py-2"></th>
          <th className="border border-slate-300 px-2 py-2">①稼働時間</th>
          <th className="border border-slate-300 px-2 py-2">②修復時間</th>
          <th className="border border-slate-300 px-2 py-2">③故障回数</th>
          <th className="border border-slate-300 px-2 py-2">MTBF<br />（平均故障間隔）<br />①÷③</th>
          <th className="border border-slate-300 px-2 py-2">MTTR<br />（平均修復時間）<br />②÷③</th>
          <th className="border border-slate-300 px-2 py-2">アベイラビリティ<br />（可用率）<br />①÷（①＋②）</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-slate-300 px-2 py-2 font-bold">設備A</td>
          <td className="border border-slate-300 px-2 py-2">180</td>
          <td className="border border-slate-300 px-2 py-2">60</td>
          <td className="border border-slate-300 px-2 py-2">3</td>
          <td className="border border-slate-300 px-2 py-2">60</td>
          <td className="border border-slate-300 px-2 py-2">20</td>
          <td className="border border-slate-300 px-2 py-2">75.0%</td>
        </tr>
        <tr className="bg-slate-50">
          <td className="border border-slate-300 px-2 py-2 font-bold">設備B</td>
          <td className="border border-slate-300 px-2 py-2">200</td>
          <td className="border border-slate-300 px-2 py-2">40</td>
          <td className="border border-slate-300 px-2 py-2">3</td>
          <td className="border border-slate-300 px-2 py-2">66.66…</td>
          <td className="border border-slate-300 px-2 py-2">13.33…</td>
          <td className="border border-slate-300 px-2 py-2">83.3%</td>
        </tr>
      </tbody>
    </table>
  </FigCard>
);

// --- 問題9：TPM 自主保全の7つのステップ（空欄A・B・Cを含む与条件） ---
const TpmStepsFigure = () => {
  const steps = [
    { n: "１", label: "（　Ａ　）", blank: true },
    { n: "２", label: "発生源･困難個所対策", blank: false },
    { n: "３", label: "（　Ｂ　）", blank: true },
    { n: "４", label: "総点検", blank: false },
    { n: "５", label: "自主点検", blank: false },
    { n: "６", label: "（　Ｃ　）", blank: true },
    { n: "７", label: "自主管理の徹底", blank: false },
  ];
  return (
    <FigCard caption="図：TPMにおける自主保全の7つのステップ">
      <div className="mx-auto max-w-md space-y-1.5">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
              s.blank ? "border-rose-400 bg-rose-50" : "border-slate-300 bg-slate-50"
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
              {s.n}
            </span>
            <span className={`text-sm font-bold ${s.blank ? "text-rose-600" : "text-slate-800"}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </FigCard>
  );
};

// ===================================================================
// 図表のフェーズ別出し分け（解答漏洩ガードレール）
// problem  : 解答前の出題画面。与条件のみ（答えを示す情報は描画しない）
// explanation : 解答後の解説画面。解答・解説用の図表を描画
// ===================================================================
function renderFigures(qid, phase) {
  if (phase === "problem") {
    if (qid === 6) return <EquipmentGantt />;
    if (qid === 9) return <TpmStepsFigure />;
    return null;
  }
  // phase === "explanation"
  switch (qid) {
    case 1:
      return (
        <>
          <ControlChart />
          <FishboneChart />
          <ParetoChart />
          <Histogram />
        </>
      );
    case 2:
      return (
        <>
          <ControlChart />
          <ScatterChart />
          <FishboneChart />
          <ParetoChart />
        </>
      );
    case 6:
      return <EvalTable />;
    case 7:
      return <MaintenanceTree />;
    case 8:
      return <MaintenanceTree />;
    default:
      return null;
  }
}

// ===================================================================
// 問題データ（添付DOCX「3-6過去問セレクト演習 生産のオペレーション」の
// 全10問・全選択肢・正解・解説をノンカット収録。要約・省略は一切行わない。
// answer は 0 始まりのインデックス。
// category: quality=品質管理(QC) / equipment=設備管理・保全 / info=生産情報システム
// ===================================================================
const QUESTIONS = [
  {
    id: 1,
    title: "QC7つ道具",
    source: "令和元年 第11問",
    category: "quality",
    question: `QC7つ道具に関する記述として、最も適切なものはどれか。`,
    choices: [
      `管理図は、2つの対になったデータをXY軸上に表した図である。`,
      `特性要因図は、原因と結果の関係を魚の骨のように表した図である。`,
      `パレート図は、不適合の原因を発生件数の昇順に並べた図である。`,
      `ヒストグラムは、時系列データを折れ線グラフで表した図である。`,
    ],
    answer: 1,
    explanation: `本問は、QC７つ道具に関する問題です。
では、選択肢を見ていきましょう。

選択肢アですが、管理図は２つの対になったデータではなく、観測した個々のデータを表したグラフです。従って、不適切な記述です。

選択肢イですが、特性要因図は、以下のグラフのように原因（要因）と結果（特性）の関係を魚の骨のように表わすことで、複合的な要因を整理する手法です。従って、適切な記述です。

選択肢ウですが、パレート図は、不適合の原因を発生件数の昇順ではなく、降順で並べた図です。

選択肢エですが、時系列データを折れ線グラフではなく、棒グラフで表した図です。従って、不適切な記述です。`,
  },
  {
    id: 2,
    title: "QC7つ道具と新QC7つ道具",
    source: "令和4年 第11問",
    category: "quality",
    question: `QC7つ道具と新QC7つ道具に関する記述として、最も適切なものはどれか。`,
    choices: [
      `管理図は、時系列データをヒストグラムで表した図である。`,
      `散布図は、不具合を原因別に集計し、件数が多い順に並べた図である。`,
      `特性要因図は、原因と結果、目的と手段などが複雑に絡み合った問題の因果関係を表した図である。`,
      `パレート図は、項目別に層別して出現頻度の高い順に並べるとともに、累積和を表した図である。`,
      `連関図は、原因と結果の関係を魚の骨のように表した図である。`,
    ],
    answer: 3,
    explanation: `QC7つ道具と新QC7つ道具に関する出題です。各ツールの特徴について、基本的な内容が問われています。
QC7つ道具は、品質の改善活動をするための手法を7つ集めたものです。品質を向上させるための数値データを使った分析が中心で、①管理図、②パレート図、③ヒストグラム、④散布図、⑤特性要因図、⑥チェックシート、⑦層別があります。
新QC7つ道具は、言語データを使って情報を整理し、発想を導くための手法を7つにまとめたものです。新QC7つ道具には、①親和図法、②連関図法、③系統図法、④マトリックス図法、⑤マトリックスデータ解析法、⑥PDPC法、⑦アロー・ダイヤグラム法があります。

では、選択肢を見ていきましょう。
選択肢アは不適切な記述です。管理図は、測定した値を折れ線グラフにした図です。測定値が異常かどうかを判別するために、上下に管理限界線が引かれており、製品や工程が基準（管理限界線）から外れていないかを継続的に管理する目的で使用されます。ヒストグラムで表した図ではありません。

選択肢イは不適切な記述です。本肢はパレート図の説明です。散布図とは、2つの特性をX軸とY軸に取り、データを点でプロットしたものです。散布図は、2つの特性の間の相関関係を把握するために使うことができます。

選択肢ウは不適切な記述です。本肢は連関図法の説明です。特性要因図とは、ある特性とそれをもたらす様々な要因の関係を図で表したものです。例えば、品質が悪いという問題に対して、その原因となっている要因を魚の骨のような形で記入していきます。

選択肢エは適切な記述です。パレート図は、項目別に不良数などの件数を数えて、多い順に並べたグラフです。出現頻度の高い順に並べるとともに累積和を表します。

選択肢オは不適切な記述です。本肢は特性要因図の説明です。連関図とは、原因と結果、目的と手段が絡みあった問題について、関係を明確にする手法です。原因と結果、目的と手段などをカード等に記入し、それらの関係を線で結ぶことで因果関係などを明確にします。
QC7つ道具については過去の本試験で度々出題されています。それぞれ7つ道具の特徴について理解を深めておきましょう。`,
  },
  {
    id: 3,
    title: "設計・製造段階における品質",
    source: "平成25年 第5問",
    category: "quality",
    question: `設計・製造段階における品質に関する記述として、最も適切なものはどれか。`,
    choices: [
      `製造品質は、製造段階で責任を持つべき品質であり、｢ねらいの品質｣と呼ばれている。`,
      `設計品質は、品質特性に対する品質目標であり、｢できばえの品質｣と呼ばれている。`,
      `代用特性は、品質特性を直接測定することが困難な場合に、その代わりとして用いられる特性である。`,
      `品質特性は、顧客の要求をそのまま表現した特性であり、製品価格もその1つである。`,
    ],
    answer: 2,
    explanation: `品質管理の種類と品質特性に関する問題です。
品質管理の種類と品質特性の概要を押さえていれば、正解できる問題です。

まず、品質管理の種類と、品質特性について復習しましょう。
それでは選択肢を見ていきましょう。

選択肢アについて、「製造品質」は、製品の製造時に結果として生じる品質であるため「結果の品質」あるいは「できばえの品質」と呼ばれます。「ねらいの品質」とは、「設計品質」のことです。よって選択肢アは不適切です。

選択肢イについて、「設計品質」は、顧客の要求を満たすために目標として設定した品質のことであり「ねらいの品質」と呼ばれます。「できばえの品質」とは、「製造品質」のことです。よって選択肢イは不適切です。

選択肢ウについて、「代用特性」とは、「顧客が求める品質特性を直接測定することが困難な場合に、その代用として用いる他の品質特性」のことです。よって選択肢ウは適切で、正解です。

選択肢エについて、「品質特性」とは、製品が本来備えている特性で、その値が許容値から外れた場合は不適合品と判断される特性のことです。例えば、ボールペンの品質特性は、線の太さ、色、耐久性などとなります。製品価格は、複数の要素から決定される対価であり、製品に本来備わっている性質とはいえません。よって選択肢エは不適切です。`,
  },
  {
    id: 4,
    title: "TQMの3つの原則",
    source: "平成25年 第13問",
    category: "quality",
    question: `TQM（総合的品質管理）の原則は、以下の3つに大別される。
① 目的に関する原則
② 手段に関する原則
③ 目的の達成と手段の実践を支える組織の運営に関する原則
このうちの｢②手段に関する原則｣に当てはまるものの組み合わせとして、最も適切なものはどれか。`,
    choices: [
      `源流管理、再発防止、事実に基づく管理。`,
      `潜在トラブルの顕在化、QCD結果に基づく管理、教育・訓練の重視。`,
      `品質第一、重点志向、標準化。`,
      `マーケットイン、プロセス重視、未然防止。`,
    ],
    answer: 0,
    explanation: `TQM（総合的品質管理）に関する問題です。
TQMの3つの原則について、それぞれの特徴を覚えていれば、正解できる問題です。

まずは、TQMの3つの原則について簡単に復習しましょう。
それでは選択肢を見ていきましょう。

選択肢アについて、記述してある考え方は全て、活動を進める手法や注意点、管理方法に関する考え方で、「手段に関する原則」に含まれる内容です。よって選択肢アは適切で、正解です。

選択肢イについて、「潜在トラブルの顕在化」と「QCD結果に基づく管理」の考え方は、「手段に関する原則」に含まれる内容です。但し、「教育・訓練の重視」は人に関する考え方で、「目的の達成と手段の実践を支える組織の運営に関する原則」に含まれる内容です。よって選択肢イは不適切です。

選択肢ウについて、「品質第一」は顧客視点に立つことを重視する考え方で、「目的に関する原則」に含まれる内容です。よって選択肢ウは不適切です。なお、「重点志向」と｢標準化」の考え方は「手段に関する原則」に含まれる内容です。

選択肢エについて、「マーケットイン」は、顧客視点に立つことを重視する考え方で「目的に関する原則」に含まれる内容です。よって選択肢エは不適切です。なお、「プロセス重視」と「未然防止」の考え方は「手段に関する原則」に含まれる内容です。

3つの原則のそれぞれの特徴を押さえておきましょう。`,
  },
  {
    id: 5,
    title: "設備総合効率",
    source: "令和2年 第20問",
    category: "equipment",
    question: `設備総合効率に関する記述として、最も適切なものはどれか。`,
    choices: [
      `作業方法を変更して段取時間を短縮すると、性能稼働率が向上する。`,
      `設備の立ち上げ時間を短縮すると、時間稼働率が低下する。`,
      `チョコ停の総時間を削減すると、性能稼働率が向上する。`,
      `不適合率を改善すると、性能稼働率が低下する。`,
    ],
    answer: 2,
    explanation: `設備総合効率に関する問題です。
まず、以下の式を確認しておきましょう。
設備総合効率＝時間稼働率×性能稼働率×良品率
時間稼働率＝（負荷時間－停止時間）/負荷時間×100（％）
性能稼働率＝（基準サイクルタイム×加工数量）/稼働時間×100（％）
良品率＝（加工数量－不良数量）/加工数量×100（％）
選択肢アですが、段取時間を短縮すると停止時間が減るため、性能稼働率ではなく、時間稼働率が向上します。したがって、不適切な記述です。
選択肢イですが、設備の立ち上げ時間を短縮すると、停止時間が減るため時間稼働率が向上します。したがって、不適切な記述です。
選択肢ウですが、チョコ停とは、設備がトラブルにより一時的に停止する現象です。チョコ停の総時間を削減すると、性能稼働率が向上します。したがって、適切な記述です。
選択肢エですが、不適合率を改善すると良品率が向上します。したがって、不適切な記述です。`,
  },
  {
    id: 6,
    title: "設備の故障（信頼性・保全性）",
    source: "令和3年 第19問",
    category: "equipment",
    question: `初期導入された設備AとBを240時間利用したときの稼働および故障修復について、下図のような調査結果が得られた。この2台の設備に関する記述a～cの正誤の組み合わせとして、最も適切なものを下記の解答群から選べ。

ａ　MTBF（平均故障間隔）は設備Ｂのほうが長い。
ｂ　MTTR（平均修復時間）は設備Ｂのほうが長い。
ｃ　アベイラビリティ（可用率）は設備Ｂのほうが高い。`,
    choices: [
      `ａ：正　　ｂ：正　　ｃ：誤`,
      `ａ：正　　ｂ：誤　　ｃ：正`,
      `ａ：正　　ｂ：誤　　ｃ：誤`,
      `ａ：誤　　ｂ：正　　ｃ：正`,
      `ａ：誤　　ｂ：正　　ｃ：誤`,
    ],
    answer: 1,
    explanation: `設備の故障に関する出題です。設備の稼働と故障の状況を図表から読み取ります。
MTBFやMTTRについては、経営情報システムの科目でも学習します。ただ、運営管理でも出題されることがある論点です。科目を横断して出題されても対処できるように、問題演習を通じて身につけていきましょう。
本問の設備Aと設備Bの評価指標を計算すると次の通りです。

では、選択肢を見ていきましょう。

ａは正しい記述です。MTBF（平均故障間隔）とは、故障が修復されてから次の故障までの動作時間の平均値です。上記の表の通り、設備Bの方が長いです。

ｂの記述は誤りです。MTTR（平均修復時間）とは、修復に費やした時間の平均値です。上記の表の通り、設備Aの方が長いです。

ｃは正しい記述です。アベイラビリティ（可用率）とは、必要とされるときに設備が使用中または運転可能である確率です。上記の表の通り、設備Bの方が高いです。

よって、ａ：正　 ｂ：誤　 ｃ：正　となり、選択肢イが正解です。
評価指標の種類と計算方法をしっかり覚えておきましょう。`,
  },
  {
    id: 7,
    title: "保全活動1",
    source: "平成27年 第18問",
    category: "equipment",
    question: `保全活動に関する記述として、最も適切なものはどれか。`,
    choices: [
      `改良保全は、設備故障の発生から修復までの時間を短縮する活動である。`,
      `保全活動は、予防保全、改良保全、保全予防の3つに分けられる。`,
      `保全予防は、設備の計画・設計段階から、過去の保全実績等の情報を用いて不良や故障に関する事項を予測し、これらを排除するための対策を織り込む活動である。`,
      `予防保全は、定期保全と集中保全の2つに分けられる。`,
    ],
    answer: 2,
    explanation: `保全活動に関する問題です。
保全活動の種類は、次のように体系立てて整理できます。

それでは選択肢を見ていきましょう。
選択肢アについて、改良保全は、設備そのものが故障しにくくなるように改良することです。設備故障の発生から修復までの時間を短縮する活動ではありません。よって選択肢アは不適切です。
選択肢イについて、保全活動は大きく分けると、設備を維持する活動と、改善する活動になります。さらに、設備を維持する活動には、予防保全と事後保全があります。設備を改善する活動には、改良保全と保全予防があります。このような分類になりますので、選択肢イは不適切です。
選択肢ウについて、保全予防は、設備の計画、設計段階から故障や性能の劣化を防ぐための活動です。保全予防では、過去の保全実績を記録しておき、それを基に新しい設備を計画・設計します。よって選択肢ウは適切で、正解です。
選択肢エについて、予防保全は、故障を未然に防ぐための活動です。予防保全はさらに定期保全と予知保全に分けられます。定期保全は、その名の通り定期的に実施する保全活動です。予知保全は、設備の劣化傾向を設備診断技術などによって管理し、故障に至る前の最適な時期に最善の対策を行う保全の方法です。よって選択肢エは不適切です。`,
  },
  {
    id: 8,
    title: "保全活動2",
    source: "令和4年 第17問",
    category: "equipment",
    question: `生産保全の観点から見た保全活動に関する記述として、最も適切なものはどれか。`,
    choices: [
      `あらかじめ代替機を用意し、故障してから修理した方がコストがかからない場合は、予防保全を選択する。`,
      `過去に発生した故障が再発しないように改善を加える活動は、事後保全である。`,
      `設備の劣化傾向について設備診断技術などを用いて管理することによって、保全の時期や修理方法などを決める予防保全の方法を状態監視保全という。`,
      `掃除、給油、増し締めなどの活動は、設備の劣化を防ぐために実施される改良保全である。`,
    ],
    answer: 2,
    explanation: `保全活動に関する出題です。保全活動の種類と特徴について知識を問う問題です。
保全活動は大きく分けて、設備を「維持する活動」と設備を「改善する活動」があります。設備を維持する活動には予防保全と事後保全があり、設備を改善する活動には改良保全と保全予防があります。本問では、それぞれの保全活動の目的を理解していることがポイントです。

では、選択肢を見ていきましょう。
選択肢アは不適切な記述です。予防保全は、故障を未然に防ぐための活動です。設備の定期点検や古くなった部品を交換する活動が含まれます。あらかじめ代替機を用意し、故障してから修理した方がコストがかからない場合は、事後保全を選択します。

選択肢イは不適切な記述です。事後保全は、故障が発見された後の活動です。故障した設備を修理するような活動が含まれます。過去に発生した故障が再発しないように改善を加える活動は、改良保全です。

選択肢ウは適切な記述です。状態監視保全は、設備の劣化傾向を設備診断技術などによって管理し、故障に至る前の最適な時期に最善の対策を行う方法です。

選択肢エは不適切な記述です。改良保全は、設備そのものが故障しにくくなるように改良を施すことです。単に故障を直すだけでなく、故障しやすい設備の構造自体を改良することで、故障の防止や性能の向上を目指します。設備の劣化を防ぐために実施される掃除、給油、増し締めなどの活動は予防保全です。

保全活動は目的に応じて様々な活動があります。似たような名称で混同しやすいので、体系図で整理しながらそれぞれの活動の特徴を理解しておきましょう。`,
  },
  {
    id: 9,
    title: "自主保全のステップ",
    source: "平成25年 第19問",
    category: "equipment",
    question: `TPM（Total Productive Maintenance）における自主保全の7つのステップを示す以下の図の空欄Ａ〜Ｃに入る語句として、最も適切なものの組み合わせを下記の解答群から選べ。`,
    choices: [
      `Ａ：故障原因の究明　Ｂ：故障の再発防止策の策定　Ｃ：標準化`,
      `Ａ：故障原因の究明　Ｂ：自主保全仮基準の作成　Ｃ：保全組織の決定`,
      `Ａ：初期清掃(清掃・点検)　Ｂ：故障の再発防止策の策定　Ｃ：保全組織の決定`,
      `Ａ：初期清掃(清掃・点検)　Ｂ：自主保全仮基準の作成　Ｃ：標準化`,
    ],
    answer: 3,
    explanation: `TPM（Total Productive Maintenance）に関する問題です。
本問では、TPMにおける自主保全の実施ステップの順番が問われています。7つの順番を完全に覚えていなくても、要所を押さえていれば、正解できる問題です。

まずは、TPMの実施ステップを簡単に復習しましょう。
TPMとは、生産部門をはじめ、開発・営業・管理などのあらゆる部門にわたってトップから第一線従業員にいたるまで全員が参加し、ロス・ゼロを達成する保全活動です。その活動の基本構成は3つの段階に分けられ、さらに7つのステップで実施されます。

・段階1：劣化を防ぐ活動
設備の清掃・点検を中心に、設備の基本条件を徹底的に整備し、維持体制をつくる段階です。第1～第3までの「初期清掃（清掃・点検）」、「発生源・困難箇所対策」、「自主保全の仮基準の作成」の3つのステップが含まれます。

・段階2：劣化を測る活動
設備総点検の教育と実施により、劣化を防ぐ活動から劣化を測る活動へと発展させます。五感から理屈に裏付けられた日常点検ができる「設備に強いオペレーター」を目指す段階です。第4～第5までの「総点検」、「自主点検」の2つのステップが含まれます。

・段階3：標準化と自主管理の活動
標準化と自主管理の仕上げの段階です。オペレーター自身が必要な保全技能の完成を図ることで、オペレーターと現場が大きく変わり、自主管理の職場となります。第6～第7ステップの「標準化」、「自主管理の徹底」の2つのステップが含まれます。

それでは、選択肢を見ていきましょう。
Ａについて、段階1の最初の活動で「初期清掃(清掃・点検)」となります。これは全てのベースとなる非常に重要な活動です。

Ｂについて、段階1の最後の活動で、短時間で清掃・給油・増締め・点検を確実に維持できるような行動基準となる、「自主保全仮基準の作成」をすることで、劣化を防ぎます。

Ｃについて、段階3の仕上げの活動の一つで「標準化」となります。

ここまで踏まえた上で選択肢を見ると、正解はエであることが分かります。
TPM活動の基本を構成する3つの段階については、その名称と内容をしっかり押さえておきましょう。また、7つのステップについても、全て覚えるのは難しいかもしれませんが、「初期清掃」ではじまり、「標準化」と「自主管理」をもって仕上げる点を、合わせて押さえておきましょう。`,
  },
  {
    id: 10,
    title: "生産情報システム",
    source: "平成24年 第5問",
    category: "info",
    question: `生産活動におけるコンピュータ支援技術に関する記述として、最も適切なものはどれか。`,
    choices: [
      `コンピュータの内部に表現されたモデルに基づいて、生産に必要な各種情報を作成すること、およびそれに基づいて進める生産の形式は、CADと呼ばれる。`,
      `生産活動に関連する設備、システムの運用、管理などについて、コンピュータの支援のもとで教育または学習を行う方法は、CAIと呼ばれる。`,
      `製品の形状その他の属性データからなるモデルをコンピュータ内部に作成し、解析・処理することによって進める設計は、CAEと呼ばれる。`,
      `製品を製造するために必要な情報をコンピュータを用いて統合的に処理し、製品、品質、製造工程などを解析評価することは、CAMと呼ばれる`,
    ],
    answer: 1,
    explanation: `生産情報システムに関する出題です。
それでは選択肢を見ていきましょう。
選択肢アについて、CADは、製品の設計をコンピュータを利用して行うシステムです。選択肢アの記述は、CAMのことを説明した内容になっています。よって選択肢アは不適切です。

選択肢イについて、CAIは、Computer-Aided Instructionの略で、コンピュータを活用して教育プログラムを提供するシステムです。生産活動やシステムの運用、管理に限らず、子どもの教育や学生の勉強、大人の資格や趣味の学習など、活用範囲は多岐にわたります。選択肢イは、CAIのことを説明した記述ですので、選択肢イは適切です。よってこれが正解です。

選択肢ウについて、CAEは、製品のシミュレーションを行うシステムです。CAEを用いることで、製品を実際に作る前に、強度や安定性、性能などをシミュレーションで評価することができます。選択肢ウは、CADすなわちコンピュータ支援設計のことを説明した記述です。よって選択肢ウは不適切です。

選択肢エについて、CAMは、コンピュータ内部で表現されたモデルに基づいて生産に必要な情報を生成するシステムです。CAMでは、CADなどで設計したモデルを基に、NC工作機械などで生産できるようなプログラムを生成します。選択肢エは、CAEのことを説明した記述です。よって選択肢エは不適切です。`,
  },
];

const TOTAL = QUESTIONS.length;

// ===================================================================
// 永続化ヘルパー（Firestore優先・LocalStorageフォールバック）
// ===================================================================
const lsKey = (userId) => `${APP_ID}__${userId}`;

function loadLocal(userId) {
  try {
    const raw = localStorage.getItem(lsKey(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[LocalStorage] 読み込み失敗", e);
    return null;
  }
}

function saveLocal(userId, data) {
  try {
    localStorage.setItem(lsKey(userId), JSON.stringify(data));
  } catch (e) {
    console.warn("[LocalStorage] 保存失敗", e);
  }
}

// ===================================================================
// メインコンポーネント
// ===================================================================
export default function App() {
  // 認証・初期化
  const [authReady, setAuthReady] = useState(false);

  // 画面：login / dashboard / quiz / result
  const [screen, setScreen] = useState("login");
  const screenRef = useRef(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  // ユーザー識別（合言葉）
  const [inputId, setInputId] = useState("");
  const [userId, setUserId] = useState("");

  // 学習データ
  const [history, setHistory] = useState({}); // { [id]: { correct, answeredAt } }
  const [reviews, setReviews] = useState({}); // { [id]: true }
  const [progressIndex, setProgressIndex] = useState(0);
  const [progressMode, setProgressMode] = useState("all");

  // 途中再開モーダル
  const isFirstLoad = useRef(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingProgress, setPendingProgress] = useState(null);

  // クイズ進行
  const [mode, setMode] = useState("all"); // all / wrong / review
  const [quizList, setQuizList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // --- 匿名認証（Firestoreアクセス前に必ず実行） ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (auth) {
        try {
          await signInAnonymously(auth);
          console.log("[Auth] 匿名サインイン成功");
        } catch (e) {
          console.warn("[Auth] 匿名サインイン失敗。LocalStorageで動作します。", e);
        }
      } else {
        console.log("[Init] Firebase未設定。LocalStorageモードで動作します。");
      }
      if (mounted) {
        setAuthReady(true);
        console.log("[Init] 初期化完了（authReady=true / 画面はloginのまま）");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // --- userId 変更時に再開判定フラグをリセット ---
  useEffect(() => {
    isFirstLoad.current = true;
  }, [userId]);

  // --- データ購読（Firestore onSnapshot / LocalStorageフォールバック） ---
  useEffect(() => {
    if (!userId) return;

    const applyData = (data) => {
      const parsed = {
        progressIndex: Number(data?.progressIndex || 0),
        progressMode: data?.progressMode || "all",
        history: data?.history || {},
        reviews: data?.reviews || {},
      };
      setHistory(parsed.history);
      setReviews(parsed.reviews);
      setProgressIndex(parsed.progressIndex);
      setProgressMode(parsed.progressMode);
      console.log("[Sync] データ受信", { progressIndex: parsed.progressIndex, progressMode: parsed.progressMode });

      // 【ガードレール】初回ロード判定 かつ 画面がダッシュボードのときのみ途中再開モーダルをトリガー。
      // これによりクイズ解答中のonSnapshot受信で再開ダイアログが誤って割り込むのを完全に防ぐ。
      if (isFirstLoad.current && screenRef.current === "dashboard") {
        isFirstLoad.current = false;
        if (parsed.progressIndex > 0) {
          setPendingProgress(parsed);
          setShowResumeModal(true);
          console.log("[Resume] 途中再開モーダルを表示", parsed.progressIndex, parsed.progressMode);
        }
      }
    };

    if (db && auth?.currentUser) {
      const docRef = doc(db, "artifacts", APP_ID, "users", userId);
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          try {
            const data = snapshot.exists() ? snapshot.data() : {};
            applyData(data);
          } catch (e) {
            console.warn("[Sync] スナップショット処理エラー。フォールバックします。", e);
            applyData(loadLocal(userId) || {});
          }
        },
        (err) => {
          console.warn("[Sync] onSnapshotエラー。LocalStorageで継続します。", err);
          applyData(loadLocal(userId) || {});
        }
      );
      return () => unsubscribe();
    } else {
      // Firestore未使用：LocalStorageから一度だけ読み込み
      applyData(loadLocal(userId) || {});
    }
  }, [userId]);

  // --- 永続化（Firestore + LocalStorage 両方へ） ---
  const persist = useCallback(
    async (next) => {
      if (!userId) return;
      const merged = {
        history: next.history ?? history,
        reviews: next.reviews ?? reviews,
        progressIndex: next.progressIndex ?? progressIndex,
        progressMode: next.progressMode ?? progressMode,
        updatedAt: new Date().toISOString(),
      };
      saveLocal(userId, merged);
      if (db && auth?.currentUser) {
        try {
          const docRef = doc(db, "artifacts", APP_ID, "users", userId);
          await setDoc(docRef, merged, { merge: true });
          console.log("[Save] Firestoreへ保存", { progressIndex: merged.progressIndex, progressMode: merged.progressMode });
        } catch (e) {
          console.warn("[Save] Firestore保存失敗。LocalStorageのみ保持します。", e);
        }
      }
    },
    [userId, history, reviews, progressIndex, progressMode]
  );

  // --- 合言葉ログイン ---
  const handleLogin = (e) => {
    e?.preventDefault();
    const id = inputId.trim();
    if (!id) return;
    setUserId(id);
    setScreen("dashboard");
    console.log("[Login] 合言葉でログイン:", id);
  };

  // --- モードに応じた問題リストを構築 ---
  const buildList = useCallback(
    (m) => {
      if (m === "wrong") {
        return QUESTIONS.filter((q) => history?.[q.id] && history[q.id].correct === false);
      }
      if (m === "review") {
        return QUESTIONS.filter((q) => reviews?.[q.id] === true);
      }
      return QUESTIONS;
    },
    [history, reviews]
  );

  // --- クイズ開始 ---
  const startQuiz = (m, startIndex = 0) => {
    const list = buildList(m);
    if (list.length === 0) {
      alert(
        m === "wrong"
          ? "前回不正解の問題はありません。"
          : m === "review"
          ? "要復習に登録された問題はありません。"
          : "問題がありません。"
      );
      return;
    }
    const safeIndex = Math.min(startIndex, list.length - 1);
    setMode(m);
    setQuizList(list);
    setCurrentIndex(safeIndex);
    setSelected(null);
    setIsAnswered(false);
    setScreen("quiz");
    console.log("[Quiz] 出題開始", { mode: m, startIndex: safeIndex, count: list.length });
  };

  // --- 途中再開 ---
  const handleResume = () => {
    const p = pendingProgress;
    setShowResumeModal(false);
    if (!p) return;
    console.log("[Resume] 続きから再開", { mode: p.progressMode, index: p.progressIndex });
    startQuiz(p.progressMode || "all", p.progressIndex || 0);
  };

  const handleRestart = () => {
    setShowResumeModal(false);
    setProgressIndex(0);
    persist({ progressIndex: 0 });
    console.log("[Resume] 進捗をリセットして最初から");
  };

  // --- 解答 ---
  const handleAnswer = (choiceIdx) => {
    if (isAnswered) return;
    const q = quizList[currentIndex];
    if (!q) return;
    const correct = choiceIdx === q.answer;
    setSelected(choiceIdx);
    setIsAnswered(true);

    const newHistory = {
      ...history,
      [q.id]: { correct, answeredAt: new Date().toISOString() },
    };
    setHistory(newHistory);
    // 現在の進捗位置とモードを保存（正解・不正解を問わず）
    persist({ history: newHistory, progressIndex: currentIndex, progressMode: mode });
    console.log("[Answer] 解答保存", { id: q.id, correct, progressIndex: currentIndex });
  };

  // --- 要復習トグル ---
  const toggleReview = () => {
    const q = quizList[currentIndex];
    if (!q) return;
    const cur = reviews?.[q.id] === true;
    const newReviews = { ...reviews, [q.id]: !cur };
    if (!newReviews[q.id]) delete newReviews[q.id];
    setReviews(newReviews);
    persist({ reviews: newReviews });
    console.log("[Review] 要復習トグル", { id: q.id, value: !cur });
  };

  // --- 次の問題へ ---
  const handleNext = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= quizList.length) {
      // 全問完走 → progressIndex を 0 にリセット
      setProgressIndex(0);
      persist({ progressIndex: 0 });
      setScreen("result");
      console.log("[Quiz] 全問完走。progressIndexを0にリセット");
      return;
    }
    setCurrentIndex(nextIdx);
    setSelected(null);
    setIsAnswered(false);
    persist({ progressIndex: nextIdx, progressMode: mode });
    console.log("[Quiz] 次の問題へ", nextIdx);
  };

  // --- ホームに戻る（その時点の進捗を即書き込み） ---
  const goHome = () => {
    if (screen === "quiz") {
      persist({ progressIndex: currentIndex, progressMode: mode });
      console.log("[Nav] ホームへ。進捗を保存", currentIndex);
    }
    setSelected(null);
    setIsAnswered(false);
    setScreen("dashboard");
  };

  // ===== レンダリング =====

  // 初期ローディング（Auth完了まで真っ白を防ぐ）
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <RefreshCw className="animate-spin text-indigo-400 mb-4" size={40} />
        <p className="text-sm tracking-wide">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {screen === "login" && (
          <LoginScreen inputId={inputId} setInputId={setInputId} onSubmit={handleLogin} />
        )}

        {screen === "dashboard" && (
          <Dashboard
            userId={userId}
            history={history}
            reviews={reviews}
            onStart={startQuiz}
            onLogout={() => {
              setUserId("");
              setHistory({});
              setReviews({});
              setProgressIndex(0);
              setScreen("login");
            }}
          />
        )}

        {screen === "quiz" && quizList[currentIndex] && (
          <QuizScreen
            q={quizList[currentIndex]}
            index={currentIndex}
            total={quizList.length}
            selected={selected}
            isAnswered={isAnswered}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onHome={goHome}
            isReview={reviews?.[quizList[currentIndex].id] === true}
            onToggleReview={toggleReview}
          />
        )}

        {screen === "result" && (
          <ResultScreen
            quizList={quizList}
            history={history}
            onHome={goHome}
            onRetry={() => startQuiz(mode, 0)}
          />
        )}
      </div>

      {/* 途中再開モーダル */}
      {showResumeModal && pendingProgress && (
        <ResumeModal
          progress={pendingProgress}
          onResume={handleResume}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

// ===================================================================
// 画面：ログイン（合言葉）
// ===================================================================
function LoginScreen({ inputId, setInputId, onSubmit }) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 shadow-lg shadow-indigo-900/40">
            <BookOpen className="text-white" size={28} />
          </div>
          <h1 className="text-xl font-bold text-white">{APP_TITLE}</h1>
          <p className="mt-1 text-sm text-indigo-300">{SOURCE_LABEL}</p>
        </div>

        <form onSubmit={onSubmit}>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
            <User size={16} /> 合言葉（ユーザーID）
          </label>
          <input
            type="text"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="例: my-study-key-2026"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
          <p className="mt-2 text-xs text-slate-500">
            同じ合言葉を入力すれば、PCとスマホで学習履歴・進捗が同期されます。
          </p>
          <button
            type="submit"
            disabled={!inputId.trim()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:scale-[1.01] hover:shadow-indigo-700/50 disabled:opacity-40 disabled:hover:scale-100"
          >
            学習を始める <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ===================================================================
// 画面：ダッシュボード
// ===================================================================
function Dashboard({ userId, history, reviews, onStart, onLogout }) {
  const answered = QUESTIONS.filter((q) => history?.[q.id]).length;
  const correct = QUESTIONS.filter((q) => history?.[q.id]?.correct === true).length;
  const wrong = QUESTIONS.filter((q) => history?.[q.id]?.correct === false).length;
  const notYet = TOTAL - answered;
  const reviewCount = QUESTIONS.filter((q) => reviews?.[q.id] === true).length;

  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  const chartData = [
    { name: "正解", value: correct, fill: "#34d399" },
    { name: "不正解", value: wrong, fill: "#fb7185" },
    { name: "未着手", value: notYet, fill: "#64748b" },
  ];

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">{APP_TITLE}</h1>
          <p className="text-xs text-indigo-300">{SOURCE_LABEL}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-600"
        >
          <User size={14} /> {userId}
        </button>
      </div>

      {/* 統計カード */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="進捗" value={`${answered}/${TOTAL}`} accent="indigo" />
        <StatCard label="正答率" value={`${accuracy}%`} accent="sky" />
        <StatCard label="不正解" value={wrong} accent="rose" />
        <StatCard label="要復習" value={reviewCount} accent="amber" />
      </div>

      {/* 解答状況グラフ */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
          <BarChart2 size={16} className="text-sky-400" /> 解答状況（正解・不正解・未着手）
        </h2>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.1)" }}
                contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, color: "#e2e8f0", fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* モード選択 */}
      <div className="mb-6 space-y-3">
        <ModeButton
          icon={<BookOpen size={18} />}
          title="すべての問題"
          desc={`全${TOTAL}問を順番に演習`}
          onClick={() => onStart("all", 0)}
        />
        <ModeButton
          icon={<RefreshCw size={18} />}
          title="前回不正解の問題のみ"
          desc={`${wrong}問が対象`}
          onClick={() => onStart("wrong", 0)}
          disabled={wrong === 0}
        />
        <ModeButton
          icon={<HelpCircle size={18} />}
          title="要復習の問題のみ"
          desc={`${reviewCount}問が対象`}
          onClick={() => onStart("review", 0)}
          disabled={reviewCount === 0}
        />
      </div>

      {/* 履歴一覧（グリッド俯瞰） */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
          <BarChart2 size={16} className="text-indigo-400" /> 解答状況一覧
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {QUESTIONS.map((q) => {
            const h = history?.[q.id];
            const st = !h ? "未着手" : h.correct ? "正解" : "不正解";
            const stColor = !h
              ? "text-slate-500 border-slate-700"
              : h.correct
              ? "text-emerald-300 border-emerald-700/50 bg-emerald-500/10"
              : "text-rose-300 border-rose-700/50 bg-rose-500/10";
            const dt = h?.answeredAt
              ? new Date(h.answeredAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
              : "-";
            return (
              <div
                key={q.id}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
              >
                <span className="w-6 shrink-0 text-center text-xs font-bold text-slate-400">{q.id}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">{q.title}</p>
                  <p className="truncate text-[10px] text-slate-500">{CAT_LABEL[q.category]}・{q.source}</p>
                </div>
                {reviews?.[q.id] && (
                  <span className="shrink-0 rounded border border-amber-600/50 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300">復習</span>
                )}
                <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold ${stColor}`}>{st}</span>
                <span className="hidden shrink-0 text-[10px] text-slate-500 sm:block">{dt}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const colors = {
    indigo: "from-indigo-600/20 to-indigo-500/5 border-indigo-700/40 text-indigo-200",
    sky: "from-sky-600/20 to-sky-500/5 border-sky-700/40 text-sky-200",
    rose: "from-rose-600/20 to-rose-500/5 border-rose-700/40 text-rose-200",
    amber: "from-amber-600/20 to-amber-500/5 border-amber-700/40 text-amber-200",
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-3 ${colors[accent]}`}>
      <p className="text-[11px] opacity-80">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function ModeButton({ icon, title, desc, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 text-left transition hover:scale-[1.01] hover:border-indigo-600/60 hover:shadow-lg hover:shadow-indigo-900/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:border-slate-800"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-md">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-white">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <ChevronRight className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-indigo-400" size={20} />
    </button>
  );
}

// ===================================================================
// 画面：出題・解答・解説
// ===================================================================
function QuizScreen({ q, index, total, selected, isAnswered, onAnswer, onNext, onHome, isReview, onToggleReview }) {
  const correct = isAnswered && selected === q.answer;

  return (
    <div>
      {/* 上部バー */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onHome}
          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-600"
        >
          <Home size={14} /> ホーム
        </button>
        <span className="text-xs text-slate-400">
          {index + 1} / {total} 問
        </span>
      </div>

      {/* 進捗バー */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* 問題カード */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-2.5 py-1 text-[11px] font-bold text-white">
            {SECTION_BADGE}
          </span>
          <span className="rounded-lg border border-sky-600/50 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold text-sky-200">
            {q.source}
          </span>
          <span className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300">
            問題 {q.id}：{q.title}
          </span>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{q.question}</p>

        {/* 問題画面の図表（解答漏洩しない与条件のみ） */}
        {renderFigures(q.id, "problem")}

        {/* 選択肢 */}
        <div className="mt-4 space-y-2.5">
          {q.choices.map((c, i) => {
            let cls =
              "border-slate-700 bg-slate-950/60 hover:border-indigo-600/60 hover:bg-slate-900";
            if (isAnswered) {
              if (i === q.answer) {
                cls = "border-emerald-500/70 bg-emerald-500/10";
              } else if (i === selected) {
                cls = "border-rose-500/70 bg-rose-500/10";
              } else {
                cls = "border-slate-800 bg-slate-950/40 opacity-60";
              }
            }
            return (
              <button
                key={i}
                onClick={() => onAnswer(i)}
                disabled={isAnswered}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${cls} ${
                  !isAnswered ? "hover:scale-[1.005]" : "cursor-default"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isAnswered && i === q.answer
                      ? "bg-emerald-500 text-white"
                      : isAnswered && i === selected
                      ? "bg-rose-500 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {CHOICE_LABELS[i]}
                </span>
                <span className="flex-1 text-slate-100">{c}</span>
                {isAnswered && i === q.answer && <Check size={18} className="mt-0.5 shrink-0 text-emerald-400" />}
                {isAnswered && i === selected && i !== q.answer && <X size={18} className="mt-0.5 shrink-0 text-rose-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 解説エリア */}
      {isAnswered && (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div
            className={`mb-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
              correct
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-rose-500/15 text-rose-300"
            }`}
          >
            {correct ? <Check size={18} /> : <X size={18} />}
            {correct ? "正解！" : "不正解"}
            <span className="ml-auto text-slate-300">
              正解：{CHOICE_LABELS[q.answer]}
            </span>
          </div>

          {/* 要復習チェック */}
          <label className="mb-4 flex cursor-pointer select-none items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 transition hover:border-amber-600/50">
            <input
              type="checkbox"
              checked={isReview}
              onChange={onToggleReview}
              className="h-4 w-4 accent-amber-500"
            />
            <HelpCircle size={16} className="text-amber-400" />
            要復習リストに登録する
          </label>

          {/* 解説用の図表（解答後にのみ表示） */}
          {renderFigures(q.id, "explanation")}

          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-sky-300">
            <BookOpen size={16} /> 解説
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{q.explanation}</p>

          <button
            onClick={onNext}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:scale-[1.01]"
          >
            {index + 1 >= total ? "結果を見る" : "次の問題へ"} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ===================================================================
// 画面：結果
// ===================================================================
function ResultScreen({ quizList, history, onHome, onRetry }) {
  const total = quizList.length;
  const correct = quizList.filter((q) => history?.[q.id]?.correct === true).length;
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 shadow-lg">
          <Check className="text-white" size={32} />
        </div>
        <h1 className="text-xl font-bold text-white">演習完了！</h1>
        <p className="mt-1 text-sm text-slate-400">お疲れさまでした。</p>

        <div className="my-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
          <p className="text-sm text-slate-400">正答数</p>
          <p className="mt-1 text-4xl font-bold text-white">
            {correct}
            <span className="text-lg text-slate-500"> / {total}</span>
          </p>
          <p className="mt-2 text-2xl font-bold text-sky-300">{rate}%</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01]"
          >
            <RefreshCw size={16} /> もう一度挑戦する
          </button>
          <button
            onClick={onHome}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600"
          >
            <Home size={16} /> ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// 途中再開モーダル
// ===================================================================
function ResumeModal({ progress, onResume, onRestart }) {
  const modeLabel =
    progress.progressMode === "wrong"
      ? "前回不正解"
      : progress.progressMode === "review"
      ? "要復習"
      : "すべての問題";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500">
          <RefreshCw className="text-white" size={24} />
        </div>
        <h2 className="text-center text-lg font-bold text-white">中断した続きがあります</h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
          前回は【問題{(progress.progressIndex || 0) + 1}】まで進んでいます。
          <br />
          中断したモード（<span className="font-bold text-sky-300">{modeLabel}</span>モード）の続きから再開しますか？
        </p>
        <div className="mt-6 space-y-3">
          <button
            onClick={onResume}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01]"
          >
            続きから再開する <ArrowRight size={16} />
          </button>
          <button
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600"
          >
            最初から始める
          </button>
        </div>
      </div>
    </div>
  );
}