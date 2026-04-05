// npm install lucide-react firebase

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Check, X, Home, ChevronRight, RotateCcw, BookOpen, AlertCircle, List, Flag, Clock } from "lucide-react";

// ============================================================
// Firebase設定 — 以下の値を本番の設定値に書き換えてください
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCyo4bAZwqaN2V0g91DehS6mHmjZD5XJTc",
  authDomain: "sabu-hide-web-app.firebaseapp.com",
  projectId: "sabu-hide-web-app",
  storageBucket: "sabu-hide-web-app.firebasestorage.app",
  messagingSenderId: "145944786114",
  appId: "1:145944786114:web:0da0c2d87a9e24ca6cf75b",
  measurementId: "G-XSS72H1ZKV"
};

// アプリごとに固有のID — 他の問題集と混ざらないようにするため
const APP_ID = "past-exam-4-6";

// Firebase初期化
let db = null;
try {
  const app = initializeApp(firebaseConfig, APP_ID);
  db = getFirestore(app);
  console.log("[Firebase] 初期化完了:", APP_ID);
} catch (e) {
  console.error("[Firebase] 初期化エラー:", e);
}

// ============================================================
// 問題データ
// ============================================================
const QUESTIONS = [
  {
    id: 1,
    year: "令和2年 第16問",
    title: "情報システムの移行",
    question: "既存の情報システムから新しい情報システムに移行することは、しばしば困難を伴う。システム移行に関する記述として、最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "移行規模が大きいほど、移行の時間を少なくするために一斉移行方式をとった方が良い。" },
      { label: "イ", text: "オンプレミスの情報システムからクラウドサービスを利用した情報システムに移行する際には、全面的に移行するために、IaaSが提供するアプリケーションの機能だけを検討すれば良い。" },
      { label: "ウ", text: "既存のシステムが当面、問題なく稼働している場合には、コストの面から見て、機能追加や手直しをしたりせず、システム移行はできるだけ遅らせた方が良い。" },
      { label: "エ", text: "スクラッチ開発した情報システムを刷新するためにパッケージソフトウェアの導入を図る際には、カスタマイズのコストを検討して、現状の業務プロセスの見直しを考慮する必要がある。" },
    ],
    answer: "エ",
    explanation: `経営情報システムから、情報システムの移行に関する出題です。

【選択肢ア】情報システムの一斉移行方式とは、旧システムを停止し、新システムへ完全に切り替える移行方式です。移行にかかる時間が小さいメリットがありますが、一斉移行時の作業負荷やトラブル発生時の影響が大きくなるデメリットがあります。そのため、移行規模が大きい場合よりも、規模が小さい場合に向いています。よって不適切です。

【選択肢イ】IaaS（Infrastructure as a Service）はコンピュータやネットワーク等のインフラのみを提供するサービスであり、アプリケーションは提供しません。アプリケーションはユーザ側が用意する必要があります。よって不適切です。

【選択肢ウ】システム移行のタイミングは、一時的なコストだけで判断するべきものではありません。長期的なトータルコストや経営戦略上の観点も考慮する必要があります。よって不適切です。

【選択肢エ】スクラッチ開発した情報システムをパッケージソフトウェアで刷新する際、現状の業務プロセスに合わない部分が生じます。カスタマイズのコストを抑えるため、現状の業務プロセスの見直しは有効です。パッケージソフトウェアに内包された業務プロセスはベストプラクティスと呼ばれるものであり、できるだけ合わせることが望ましいといえます。よって適切です。`,
  },
  {
    id: 2,
    year: "平成22年 第14問改題",
    title: "開発方法論",
    question: "システム開発の基本フェーズは、フェーズ１：要件定義、フェーズ２：外部設計、フェーズ３：内部設計、フェーズ４：プログラム開発、フェーズ５：各種テスト、フェーズ６：稼働である。これら各フェーズを後戻りすることなく順に行っていく方法論を、ウォータフォール型システム開発方法論と呼ぶ。しかし、この方法論には種々の課題があるとされ、その課題の解消を目的に多様な方法論が開発されている。そのような方法論に関する記述として最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "RADは、ウォータフォール型システム開発方法論よりも迅速に開発することを目的としたもので、システムエンジニアだけで構成される大人数の開発チームで一気に開発する方法論である。" },
      { label: "イ", text: "スパイラル開発は、１つのフェーズが終わったら、もう一度、そのフェーズを繰り返すペアプログラミングと呼ばれる手法を用いて確実にシステムを開発していく方法論である。" },
      { label: "ウ", text: "システム開発を迅速かつ確実に進める方法論としてXPがあるが、それは仕様書をほとんど作成せず、ストーリーカードと受け入れテストを中心に開発を進める方法論である。" },
      { label: "エ", text: "プロトタイピングは、フェーズ５の各種テストを簡略に行う方法論である。" },
      { label: "オ", text: "スクラムは、動いているシステムを壊さずに、ソフトウェアを高速に、着実に、自動的に機能を増幅させ、本番環境にリリース可能な状態にする方法論である。" },
    ],
    answer: "ウ",
    explanation: `経営情報システムから、開発方法論に関する出題です。

【選択肢ア】RAD（Rapid Application Development）とは、小規模・短期間のプロジェクトに適用される手法です。プロトタイピングやCASEツールなどを用いて、エンドユーザを含む少人数のチームで担当し、開発期間を短縮する手法です。「システムエンジニアだけで構成される大人数のチーム」という記述は不適切です。

【選択肢イ】スパイラル開発は、設計、開発、テストという手順を何度もくり返すことで、徐々にシステムを成長させていく開発手法です。ペアプログラミングはXPで使われる手法であり、スパイラル開発の説明ではありません。よって不適切です。

【選択肢ウ】XP（Extreme Programming）とは、アジャイル開発プロセスの手法の1つです。プロジェクトを短い期間に区切り、反復的に設計・開発・テストを実施します。仕様書をほとんど作成せず、ストーリーカードと受け入れテストを中心に開発を進めます。よって適切であり、これが正解です。

【選択肢エ】プロトタイピングは、プロジェクトの早い段階でプロトタイプ（試作品）を作成し、ユーザが確認してから本格的に開発する方法です。テストフェーズを簡略化できるものではありません。よって不適切です。

【選択肢オ】スクラムはモデリング段階とコーディング段階を往復しながらソフトウェア開発を行う手法です。記述の説明は不適切です。`,
  },
  {
    id: 3,
    year: "令和4年 第13問",
    title: "システム開発の方法論",
    question: "システム開発の方法論は多様である。システム開発に関する記述として、最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "DevOpsは、開発側と運用側とが密接に連携して、システムの導入や更新を柔軟かつ迅速に行う開発の方法論である。" },
      { label: "イ", text: "XPは、開発の基幹手法としてペアプログラミングを用いる方法論であり、ウォーターフォール型開発を改善したものである。" },
      { label: "ウ", text: "ウォーターフォール型開発は、全体的なモデルを作成した上で、ユーザにとって価値ある機能のまとまりを単位として、計画、設計、構築を繰り返す方法論である。" },
      { label: "エ", text: "スクラムは、動いているシステムを壊さずに、ソフトウェアを高速に、着実に、自動的に機能を増幅させ、本番環境にリリース可能な状態にする方法論である。" },
      { label: "オ", text: "フィーチャ駆動開発は、開発工程を上流工程から下流工程へと順次移行し、後戻りはシステムの完成後にのみ許される方法論である。" },
    ],
    answer: "ア",
    explanation: `本問は、システム開発の方法論に関する問題です。

【アジャイル開発プロセスについて】
近年、経営のスピードが向上したため、プログラム開発を短期間で行う必要性が高まっています。迅速に開発する手法は「アジャイル開発プロセス」と呼ばれます。
・XP（Extreme Programming）：比較的小規模の開発に向いた手法。反復的に設計・開発・テストを繰り返します。
・フィーチャ機能駆動開発：フィーチャとよばれる機能を短期間で繰り返し開発していく手法。
・スクラム：モデリング段階とコーディング段階を往復しながらソフトウェア開発を行う「ラウンドトリップ・エンジニアリング」を取り入れたシステム開発。

【選択肢ア】DevOpsは、Development（開発）とOperations（運用）を組み合わせた用語です。開発側と運用側が密接に連携して、システムの導入や更新を柔軟かつ迅速に行う開発の方法論を意味します。よって適切であり、これが正解です。

【選択肢イ】XPはウォーターフォール型開発を改善したものではなく、アジャイル開発プロセスの具体的な手法の1つです。よって不適切です。

【選択肢ウ】全体的なモデルを作成した上で価値ある機能のまとまりを単位として計画・設計・構築を繰り返す方法論は、スパイラル型開発のことです。よって不適切です。

【選択肢エ】スクラムはモデリング段階とコーディング段階を往復しながらソフトウェア開発を行います。記述は不適切です。

【選択肢オ】記述はウォーターフォール型開発に関する内容です。よって不適切です。`,
  },
  {
    id: 4,
    year: "令和2年 第18問",
    title: "プロジェクト管理の手法やチャート",
    question: `システム開発は一つのプロジェクトとして進められることが多い。プロジェクトの進捗を管理することは非常に重要である。

プロジェクトを管理するために利用される手法やチャートに関する以下のａ～ｄの記述と、その名称の組み合わせとして、最も適切なものを下記の解答群から選べ。

a　プロジェクトの計画を立てる際に用いられる手法の一つで、プロジェクトで行う作業を、管理可能な大きさに細分化するために、階層的に要素分解する手法。

ｂ　プロジェクトにおける作業を金銭価値に換算して、定量的にコスト効率とスケジュール効率を評価する手法。

ｃ　作業開始と作業終了の予定と実績を表示した横棒グラフで、プロジェクトのスケジュールを管理するために利用するチャート。

ｄ　横軸に開発期間、縦軸に予算消化率をとって表した折れ線グラフで、費用管理と進捗管理を同時に行うために利用するチャート。`,
    choices: [
      { label: "ア", text: "ａ：PERT　ｂ：BAC　ｃ：ガントチャート　ｄ：管理図" },
      { label: "イ", text: "ａ：PERT　ｂ：BAC　ｃ：流れ図　ｄ：トレンドチャート" },
      { label: "ウ", text: "ａ：WBS　ｂ：EVM　ｃ：ガントチャート　ｄ：トレンドチャート" },
      { label: "エ", text: "ａ：WBS　ｂ：EVM　ｃ：流れ図　ｄ：管理図" },
    ],
    answer: "ウ",
    explanation: `本問では、プロジェクトを管理するために利用される手法やチャートについて問われています。

【記述a → WBS】WBSはWork Breakdown Structureの略で、「作業分解構成図」などと訳されます。プロジェクトを計画するときに、プロジェクトのタスクや成果物を明確にするために使用します。工数の見積もりや、スケジュール作成などのベースとなります。

【記述b → EVM】EVMはEarned Value Managementの略で、「出来高管理」などと訳されます。プロジェクトマネジメントにおける進捗状況の把握・管理を行う手法の一つであり、作業の進捗度を金額で表現することで管理します。

【記述c → ガントチャート】縦軸に複数の作業項目を並べ、横軸に時間軸を置いて進捗を棒グラフで表します。一目見ただけで直観的に全体像が掴める点がメリットです。

【記述d → トレンドチャート】予定（予算）と実績の2本の折れ線グラフを描くことで、費用やスケジュールの予実の差異把握、および傾向（トレンド）の分析などが可能です。

以上より、選択肢ウ（a：WBS、b：EVM、c：ガントチャート、d：トレンドチャート）が正解となります。`,
  },
  {
    id: 5,
    year: "平成30年 第18問",
    title: "見積手法",
    question: "ソフトウェア開発では、仕様の曖昧さなどが原因で工数オーバーとなるケースが散見される。開発規模の見積もりに関する記述として、最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "CoBRA法では、開発工数は開発規模に比例することを仮定するとともに、さまざまな変動要因によって工数増加が発生することを加味している。" },
      { label: "イ", text: "LOC法では、画面や帳票の数をもとに開発規模を計算するため、仕様書が完成する前の要件定義段階での見積もりは難しい。" },
      { label: "ウ", text: "標準タスク法は、ソフトウェアの構造をWBS（Work Breakdown Structure）に分解し、WBSごとに工数を積み上げて開発規模を見積もる方法である。" },
      { label: "エ", text: "ファンクション・ポイント法は、システムのファンクションごとにプログラマーのスキルを数値化した重みを付けて、プログラム・ステップ数を算出する。" },
    ],
    answer: "ア",
    explanation: `経営情報システムから、各種見積手法に関する出題です。代表的な見積手法を押さえておけば、消去法で正解できる問題です。

【選択肢ア（正解）】CoBRA（Cost estimation, Benchmarking and Risk Assessment）法とは、経験豊富なプロジェクト・マネージャー等の経験・知識などを元に、様々な要因をコストの変動要因として抽出・定量化することで、透明性が高く説得力のある見積を作成する方法です。開発工数は開発規模に比例することを仮定するとともに、変動要因による工数増加を加味しています。よって適切であり、これが正解です。

【選択肢イ】LOC（Lines Of Code）法とは、プログラムのソースコードの行数により、開発規模を見積もる方法のことです。「画面や帳票の数をもとに開発規模を計算する」ものではありません。よって不適切です。

【選択肢ウ】標準タスク法とは、開発するソフトウェア全体の工程を細かい作業工程に分解し、それをもとに作業工数やコストを積み上げ、全体の工数を見積もる方法のことです。「ソフトウェアの構造をWBSに分解」ではなく、正しくは「ソフトウェアの作業工程をWBSに分解」となります。よって不適切です。

【選択肢エ】ファンクションポイント法は、機能（ファンクション）ごとの複雑さによって点数を付け、その点数を合計することによって工数を見積る方法です。プログラマーのスキルを数値化した重みをつけるものではありません。よって不適切です。`,
  },
  {
    id: 6,
    year: "令和4年 第19問",
    title: "EVMS",
    question: `中小企業Ａ社では、基幹業務系システムの刷新プロジェクトを進めている。先月のプロジェクト会議で、PV（出来高計画値）が1,200万円、AC（コスト実績値）が800万円、EV（出来高実績値）が600万円であることが報告された。

このとき、コスト効率指数（CPI）とスケジュール効率指数（SPI）に関する記述として、最も適切なものはどれか。`,
    choices: [
      { label: "ア", text: "CPIは0.50であり、SPIは0.67である。" },
      { label: "イ", text: "CPIは0.50であり、SPIは0.75である。" },
      { label: "ウ", text: "CPIは0.67であり、SPIは0.50である。" },
      { label: "エ", text: "CPIは0.67であり、SPIは0.75である。" },
      { label: "オ", text: "CPIは0.75であり、SPIは0.50である。" },
    ],
    answer: "オ",
    explanation: `本問は、EVMS（Earned Value Management System：出来高管理システム）に関する問題です。

EVMSでは、PV、EV、ACの3つの指標を用いてプロジェクトの進捗を管理します。

・PV（Planned Value）：現時点までに計画されていた作業に関する予算
・EV（Earned Value）：現時点まで完了した作業に割り当てられていた予算
・AC（Actual Cost）：現時点まで完了した作業の実コスト

計算式：
・CPI（コスト効率指数）= EV / AC　→　CPI＜1 であればコスト超過
・SPI（スケジュール効率指数）= EV / PV　→　SPI＜1 であればスケジュール遅延

設問の条件：
・PV（出来高計画値）= 1,200万円
・AC（コスト実績値）= 800万円
・EV（出来高実績値）= 600万円

計算：
・CPI = EV / AC = 600 / 800 = 0.75
・SPI = EV / PV = 600 / 1,200 = 0.50

以上より、CPIは0.75、SPIは0.50となります。よってオが正解となります。`,
  },
  {
    id: 7,
    year: "令和4年 第18問",
    title: "ITサービスマネジメント",
    question: "ITサービスマネジメントとは、ITサービス提供者が、提供するITサービスを効率的かつ効果的に運営管理するための枠組みである。ITサービスマネジメントに関する記述として、最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "COSOは、ITサービスマネジメントのベストプラクティス集である。" },
      { label: "イ", text: "ITサービスマネジメントシステムの構築に経営者が深く関与することは、避けた方が良い。" },
      { label: "ウ", text: "ITサービスマネジメントシステムの認証を受けるとPマークを取得できる。" },
      { label: "エ", text: "ITサービスマネジメントにおけるインシデントとは、顧客情報の流出によってセキュリティ上の脅威となる事象のことをいう。" },
      { label: "オ", text: "SLAは、サービス内容およびサービス目標値に関するサービス提供者と顧客間の合意である。" },
    ],
    answer: "オ",
    explanation: `本問は、ITサービスマネジメントに関する問題です。

ITILは、ITサービスマネジメントを進める上で役立つベストプラクティスを集めたガイドラインです。世界中で利用されるデファクトスタンダードになっています。

【選択肢ア】COSOではなく、ITILがITサービスマネジメントのベストプラクティス集です。よって不適切です。

【選択肢イ】ITサービスマネジメントを構築する上では、経営者が深く関与すること（経営者のコミットメント）が重要なポイントの1つです。よって不適切です。

【選択肢ウ】ITサービスマネジメントシステムの認証を受けると、ITSMS認定マークを取得できます。Pマーク制度は、個人情報の保護体制に対する第三者認証制度であり、別のものです。よって不適切です。

【選択肢エ】ITサービスマネジメントにおけるインシデントとは、サービスに対する計画外の中断、サービスの品質の低下、または顧客へのサービスにまだ影響していない事象のことをいいます。顧客情報の流出に限定されるものではありません。よって不適切です。

【選択肢オ】SLA（Service Level Agreement）は、サービス提供者とサービス委託者との間で、提供するサービス内容と範囲、品質に対する水準を定め、達成できなかった場合のルールをあらかじめ合意しておく文書・契約です。よって適切であり、これが正解です。`,
  },
  {
    id: 8,
    year: "令和5年 第19問",
    title: "ITサービスマネジメント2",
    question: `ITサービスマネジメントにおいて、サービス内容およびサービス目標値に関して、サービス提供者は組織内外の関係者とさまざまな合意書や契約書を取り交わす。

それらの文書に関する以下の①～③の記述とその用語の組み合わせとして、最も適切なものを下記の解答群から選べ。

①　サービス提供者が組織外部の供給者と取り交わす文書

②　サービス提供者が組織内部の供給者と取り交わす文書

③　サービス提供者が顧客と取り交わす文書`,
    choices: [
      { label: "ア", text: "①：NDA　②：SLA　③：OLA" },
      { label: "イ", text: "①：OLA　②：NDA　③：UC" },
      { label: "ウ", text: "①：OLA　②：UC　③：SLA" },
      { label: "エ", text: "①：SLA　②：UC　③：OLA" },
      { label: "オ", text: "①：UC　②：OLA　③：SLA" },
    ],
    answer: "オ",
    explanation: `本問は、ITサービスマネジメントに関する問題です。各文書の定義を押さえましょう。

【SLA（Service Level Agreement）】サービス提供者とサービス委託者（顧客）との間で、提供するサービス内容と範囲、品質に対する水準を定め、達成できなかった場合のルールをあらかじめ合意しておく文書・契約のことです。

【UC（Underpinning Contract）】ITILのサービスレベル管理（SLM）において、外部のサービス提供者やパートナーと結ばれる契約のことです。例えば、IT部門が外部のサービスプロバイダ（通信事業者やデータセンターなど）と締結する場合の契約がUCに当たります。

【OLA（Operational Level Agreement）】ITILのサービスレベル管理（SLM）において、ITサービス提供者の内部で結ばれる合意、あるいはそれを記した内部文書のことです。SLAの下位にあって、UCとともにSLAの裏付けになるものです。

【NDA】秘密保持契約のことです。ITサービスマネジメントとは直接関係しない契約となります。

設問の①～③の確認：
① サービス提供者が組織外部の供給者と取り交わす文書 → UC
② サービス提供者が組織内部の供給者と取り交わす文書 → OLA
③ サービス提供者が顧客と取り交わす文書 → SLA

以上より、オが正解となります。`,
  },
  {
    id: 9,
    year: "平成30年 第17問",
    title: "システム開発の外注",
    question: "A社は自社の業務システムを全面的に改訂しようとしている。候補に挙がっているいくつかのITベンダーの中からシステム開発先を決定したい。A社がITベンダーに出す文書に関する記述として、最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "RFIとは、自社が利用可能な技術などをベンダーに伝え、システム開発を依頼する文書をいう。" },
      { label: "イ", text: "RFIとは、システムが提供するサービスの品質保証やペナルティに関する契約内容を明らかにし、システム開発を依頼する文書をいう。" },
      { label: "ウ", text: "RFPとは、システムの概要や主要な機能などに関する提案を依頼する文書をいう。" },
      { label: "エ", text: "RFPとは、システムライフサイクル全体にわたる、システム開発および運用にかかるコスト見積もりを依頼する文書をいう。" },
    ],
    answer: "ウ",
    explanation: `RFI（Request For Information：情報提供依頼書）とRFP（Request For Proposal：提案依頼書）に関する出題です。

【RFIとRFPの違い】
・RFIは、情報システムの導入や業務委託を行う際に、発注先候補のシステム開発会社に情報提供を依頼する文書です。
・RFPは、発注先の業者に提案を要求し、そのための要件を伝えるための文書です。
・企業はまずRFIを発行して情報を収集し、その情報を元にRFPを作成します。

【選択肢ア】「自社が利用可能な技術などをベンダーに伝える」ことは、「システム開発要件をベンダーに伝達すること」であり、RFPに関する記述です。よって不適切です。

【選択肢イ】システムが提供するサービスの品質保証やペナルティに関する契約内容をあらかじめ合意しておく文書をSLA（Service Level Agreement）といいます。RFIの説明ではありません。よって不適切です。

【選択肢ウ】前述のRFPの説明に記述が合致します。よって適切であり、これが正解です。

【選択肢エ】システムライフサイクル全体にわたるシステム開発および運用にかかるコストをTCO（Total Cost of Ownership）といいます。RFPの説明ではありません。よって不適切です。`,
  },
  {
    id: 10,
    year: "平成24年 第17問",
    title: "設計手法と設計図",
    question: `ある中小販売企業では、インターネットで受注を開始することにした。それに先立ち、下記の図を描いてインターネットによる受注システムの検討を行っている。この図に関する説明として最も適切なものを下記の解答群から選べ。ただし、この図は未完成である。

【図の説明】下図はインターネット受注システムのデータフロー図（DFD）のサンプルを示しています。「受注処理」「在庫確認処理」「商品発送処理」などのプロセス（円で表現）と、「顧客データベース」「商品データベース」などのデータストア（2本の平行線で表現）、および「顧客」「仕入先」などの外部実体（四角形で表現）が、矢印（データフロー）で結ばれています。`,
    choices: [
      { label: "ア", text: "業務のデータの流れと処理の関係を記述したDFDである。" },
      { label: "イ", text: "データベースをどのように構築したら良いかを示すERDである。" },
      { label: "ウ", text: "利用者がシステムとどのようにやり取りするかを示すユースケース図である。" },
      { label: "エ", text: "利用者相互のコミュニケーションの関係を描いたコミュニケーション図である。" },
    ],
    answer: "ア",
    explanation: `経営情報システムから、設計手法に関する出題です。

問題文で示されている図はDFD（Data Flow Diagram：データフローダイアグラム）です。

【DFD（Data Flow Diagram）について】
DFDは、データと処理の流れを表す図表です。
・「商品発送処理」などの「プロセス」（円または角を丸めた多角形で描かれる）
・「顧客データベース」などの「データストア」（2本の平行線で描かれる）
・これらの間のデータの流れである「データフロー」（矢印で表現）
を用いて、データと処理の流れを表現します。

よって、選択肢アが正解です。

【参考：他の選択肢】
・選択肢イ（ERD）：ERD（Entity Relationship Diagram）はER図とも呼ばれ、リレーショナルデータベースの設計に用いられる手法です。エンティティ（実体）とリレーション（関連）でデータ構造を表します。
・選択肢ウ（ユースケース図）：UMLのひとつで、機能であるユースケースの間の関連を簡単に表した図です。要件定義などの上流工程で使われます。
・選択肢エ（コミュニケーション図）：UMLのひとつで、オブジェクト同士でやり取りされるメッセージを記述したものです。`,
  },
  {
    id: 11,
    year: "平成26年 第17問",
    title: "システム分析・設計に使われる図",
    question: `下図のＡ～Ｄは、システム分析もしくはシステム設計に使われる図である。図とその名称の組み合わせとして最も適切なものを下記の解答群から選べ。

【図A】アクター（人型アイコン）と楕円形のユースケースが線で結ばれており、システムの境界（大きな四角形）の内側にユースケースが配置されています。例：アクター「顧客」が「注文する」「注文確認」などのユースケースに関連付けられています。

【図B】フローチャート風の図で、開始ノード（黒丸）から分岐・合流を経て終了ノード（二重丸）に至る流れが記述されています。アクティビティ（処理）と遷移矢印で構成されています。

【図C】プロセス（円）、データストア（2本の平行線）、外部実体（四角形）、データフロー（矢印）で構成された図です。データの流れと処理の関係を表しています。

【図D】長方形で表現された複数のオブジェクトが線で結ばれ、矢印にメッセージ名称が記述されています。オブジェクト間のメッセージのやり取りを表しています。`,
    choices: [
      { label: "ア", text: "図Ａ：アクティビティ図　図Ｂ：ステートチャート図　図Ｃ：DFD　図Ｄ：ユースケース図" },
      { label: "イ", text: "図Ａ：コミュニケーション図　図Ｂ：アクティビティ図　図Ｃ：オブジェクト図　図Ｄ：配置図" },
      { label: "ウ", text: "図Ａ：ユースケース図　図Ｂ：DFD　図Ｃ：アクティビティ図　図Ｄ：コミュニケーション図" },
      { label: "エ", text: "図Ａ：ユースケース図　図Ｂ：アクティビティ図　図Ｃ：DFD　図Ｄ：コミュニケーション図" },
    ],
    answer: "エ",
    explanation: `経営情報システムから、システム分析や設計に使われる図に関する出題です。解答群の各図はUMLまたはDFDに関連しています。

【ユースケース図（図A）】
要件定義などの上流工程で、業務の機能を表現するために使われます。「アクター」（システムを利用するユーザや外部システム）を人型で、「ユースケース」（アクターによるシステムの利用の仕方）を横型の楕円で描き、関連を実線で結びます。

【アクティビティ図（図B）】
フローチャートの一種で、システムなどのフローを記述します。「開始」「条件分岐」「終了」などを示す「ノード」や遷移を表す矢印を用いてフローを表現します。

【DFD（図C）】
データと処理の流れを表す図表です。プロセス（円）、データストア（2本の平行線）、外部実体（四角形）、データフロー（矢印）で構成されます。

【コミュニケーション図（図D）】
オブジェクト間のメッセージのやり取りを表します。オブジェクトは長方形で表現され、メッセージは矢印のラベルに名称が記述されます。

以上より、エ（図A：ユースケース図、図B：アクティビティ図、図C：DFD、図D：コミュニケーション図）が正解です。

【参考：その他の図】
・ステートチャート図：特定のオブジェクトの状態変化を表現した図
・オブジェクト図：オブジェクト同士の関係を図で表現したもの
・配置図：システムのハードウェアや通信経路などを表現する図`,
  },
  {
    id: 12,
    year: "平成27年 第16問",
    title: "システム設計に使われる図",
    question: `システム設計の際に使われる図に関する以下の①〜④の記述と、図の名称の組み合わせとして、最も適切なものを下記の解答群から選べ。

①情報システムの内外の関係するデータの流れを表す図である。

②データを、実体、関連およびそれらの属性を要素としてモデル化する図である。

③システムにはどのような利用者がいるのか、利用者はどのような操作をするのかを示すために使われる図である。

④システムの物理的構成要素の依存関係に注目してシステムの構造を記述する図である。`,
    choices: [
      { label: "ア", text: "①：DFD　②：ERD　③：アクティビティ図　④：配置図" },
      { label: "イ", text: "①：DFD　②：ERD　③：ユースケース図　④：コンポーネント図" },
      { label: "ウ", text: "①：ERD　②：DFD　③：ステートチャート図　④：コンポーネント図" },
      { label: "エ", text: "①：ERD　②：DFD　③：ユースケース図　④：配置図" },
    ],
    answer: "イ",
    explanation: `経営情報システムから、システム設計に使われる図の問題です。

【記述① → DFD（Data Flow Diagram）】
情報システムの内外の関係するデータの流れを表します。データの発生源や出力先、データ間の流れ、データを処理するプロセス、データの保管・出力先を図示することができます。

【記述② → ERD（Entity Relationship Diagram）】
データを、実体（Entity）、関連（Relationship）およびそれらの属性を要素としてモデル化する図です。ER図や実体関連図ともいいます。「実体」は管理対象として存在するもの、「関連」は実体と実体の関係、「属性」は実体の情報や特性を表します。

【記述③ → ユースケース図】
システムにはどのような利用者がいるのか、利用者はどのような操作をするのかを示します。システムの内外を分ける境界線を設けた上で、外部に「アクター」、内部は「ユースケース」を記述し、「関連」で結んで表現します。

【記述④ → コンポーネント図】
システムの物理的構成要素の依存関係に注目してシステムの構造を記述します。コンポーネントとは、ソフトウェアパッケージや実行ファイルなど、コンピュータ上で物理的なまとまりとして取り扱われる実体のことです。

以上より、①DFD、②ERD、③ユースケース図、④コンポーネント図となります。よって選択肢イが正解です。`,
  },
  {
    id: 13,
    year: "平成26年 第15問",
    title: "近年のシステム開発手法",
    question: "近年注目されているシステム開発手法に関する記述として、最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "エクストリームプログラミングは、システムテストを省くなどしてウォーターフォール型システム開発を改善した手法である。" },
      { label: "イ", text: "エンベデッドシステムは、あらかじめインストールしておいたアプリケーションを有効に利用してシステム開発を行う手法である。" },
      { label: "ウ", text: "オープンデータは、開発前にシステム構想およびデータをユーザに示し、ユーザからのアイデアを取り入れながらシステム開発を行う手法である。" },
      { label: "エ", text: "スクラムは、開発途中でユーザの要求が変化することに対処しやすいアジャイルソフトウェア開発のひとつの手法である。" },
    ],
    answer: "エ",
    explanation: `経営情報システムから、システム開発手法に関する出題です。

【選択肢ア】エクストリームプログラミング（XP）は、迅速にプログラムを開発するアジャイル開発プロセスの１つです。プロジェクトを短い期間に区切り、反復的に設計・開発・テストを繰り返します。システムテストを省いているわけではなく、ウォーターフォール型開発を改善したものでもありません。よって不適切です。

【選択肢イ】エンベデッドシステム（組込みシステム）とは、家電製品や自動車、機械などに組み込まれるコンピュータシステムのことを指します。開発手法の説明ではありません。よって不適切です。

【選択肢ウ】オープンデータとは、広義では制限なく広く利用が許可されているデータのことです。行政機関が保有している統計情報や地理空間情報などのデータを利用しやすい形で公開することも指します。開発手法の説明ではありません。よって不適切です。

【選択肢エ】スクラムは、エクストリームプログラミングと同じく、アジャイル開発プロセスの１つです。各メンバーが協力しながらチーム全体が同じ目的を共有することを重要視します。ユーザのニーズを柔軟に反映させながら短期間で稼働させることを目指します。よって適切であり、これが正解です。`,
  },
  {
    id: 14,
    year: "平成27年 第18問",
    title: "アジャイルシステム開発",
    question: "近年の多様なIT機器の発達、激しいビジネス環境の変動の中で、アジャイルシステム開発が注目されている。アジャイルシステム開発の方法論であるフィーチャ駆動開発、スクラム、かんばん、XPに関する記述として、最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "フィーチャ駆動開発は、要求定義、設計、コーディング、テスト、実装というシステム開発プロセスを逐次的に確実に行う方法論である。" },
      { label: "イ", text: "スクラムは、ラウンドトリップ・エンジニアリングを取り入れたシステム開発の方法論である。" },
      { label: "ウ", text: "かんばんは、ジャストインタイムの手法を応用して、システム開発の際に、ユーザと開発者との間でかんばんと呼ばれる情報伝達ツールを用いることに特徴がある。" },
      { label: "エ", text: "XPは、開発の基幹手法としてペアプログラミングを用いるが、それは複数のオブジェクトを複数の人々で分担して作成することで、システム開発の迅速化を図ろうとするものである。" },
    ],
    answer: "イ",
    explanation: `アジャイルシステム開発に関する出題です。

【選択肢ア】フィーチャ機能駆動開発は、フィーチャとよばれる機能を短期間で繰り返し開発していくものです。ソフトウェア工学に基づいたベストプラクティスを中心として構築されています。要求定義、設計、コーディング、テスト、実装というプロセスを逐次的に確実に行うというわけではありません。よって不適切です。

【選択肢イ（正解）】スクラムは、チームで仕事を進めるためのフレームワークです。モデリング段階とコーディング段階を往復しながらソフトウェア開発を行う「ラウンドトリップ・エンジニアリング」を取り入れたシステム開発です。よって適切であり、これが正解です。

【選択肢ウ】かんばんは、ジャストインタイムの手法を応用して、システム開発の際に、開発者同士がかんばんと呼ばれる情報伝達ツールを用いるものです。「ユーザと開発者との間」ではなく、「開発者同士」が用います。よって不適切です。

【選択肢エ】XP（Extreme Programming）は、2人が1組で作業をするペアプログラミングを行います。ペアプログラミングでは、1人がコードを書き、隣にいるもう1人が同時にそれをチェックしながら作業を進めます。複数のオブジェクトを複数の人々で分担して作成するものではありません。よって不適切です。`,
  },
  {
    id: 15,
    year: "令和元年 第18問",
    title: "情報システムのテスト",
    question: "ある中小企業では、出退勤システムの実装を進めている。バーコードリーダーを用いて社員証の社員番号を読み取り、出退勤をサーバ上で管理するためのプログラムが作成され、テストの段階に入った。\n\nテストに関する記述として、最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "結合テストは、出退勤システム全体の処理能力が十分であるか、高い負荷でも問題がないか、などの検証を行うために、実際に使う環境で行うテストである。" },
      { label: "イ", text: "ブラックボックステストは、出退勤システムに修正を加えた場合に、想定外の影響が出ていないかを確認するためのテストである。" },
      { label: "ウ", text: "ホワイトボックステストは、社員証の読み取りの際のチェックディジットの条件を網羅的にチェックするなど、内部構造を理解した上で行うテストである。" },
      { label: "エ", text: "リグレッションテストは、社員証の読み取りやサーバ送信などの複数モジュール間のインタフェースが正常に機能しているかを確認するテストである。" },
    ],
    answer: "ウ",
    explanation: `本問では、情報システムのテストについて問われています。

【選択肢ア】記述の内容は負荷テストに関するものです。結合テストとは複数のモジュールの組み合わせをテストするものです。情報システムは複数のモジュールが組み合わされて構築されており、結合テストではモジュールを結合した状態でテストを行います。よって不適切です。

【選択肢イ】記述の内容は回帰テスト（リグレッションテスト）に関するものです。ブラックボックステストとは、プログラムの入力と出力に注目して、さまざまな入力に対して、プログラムの仕様どおりの出力が得られるかを確認するテストです。プログラム内部の動作は問題にしないという特徴があります。よって不適切です。

【選択肢ウ（正解）】ホワイトボックステストは、プログラムの内部構造に注目して、プログラムが意図したとおりに動作しているかを確認するテストです。プログラムには命令文や条件分岐などが含まれますが、それらについて漏れなく網羅的にテストを行います。チェックディジットの条件を網羅的にチェックするというのはホワイトボックステストの記述として適切です。よって適切であり、これが正解です。

【選択肢エ】記述の内容は結合テストに関するものです。リグレッションテスト（回帰テスト）とは、プログラムに修正を加える際に、その修正が既存のプログラムに悪影響を及ぼさないかどうか検証するためのテストのことです。よって不適切です。`,
  },
  {
    id: 16,
    year: "平成23年 第20問",
    title: "品質レビュー",
    question: "ソフトウェア品質レビュー技法のうち、インスペクションの説明として最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "プログラム作成者、進行まとめ役、記録係、説明役、レビュー役を明確に決めて、厳格なレビューを公式に行う。" },
      { label: "イ", text: "プログラム作成者が他のメンバに問題点を説明して、コメントをもらう。" },
      { label: "ウ", text: "プログラム作成者とレビュー担当者の２名だけで、作成したプログラムを調べる。" },
      { label: "エ", text: "プログラムを検査担当者に回覧して、個別にプログラムを調べてレビュー結果を戻してもらう。" },
    ],
    answer: "ア",
    explanation: `経営情報システムから、インスペクションに関する出題です。

【インスペクションとは】
インスペクションとは、ソフトウェア開発の各工程で作成された成果物について、検証する作業です。各工程の終わりに、関係者が集まって集団で成果物をレビューします。インスペクションは公式なもので、プロジェクト責任者の下で厳密に行います。

【選択肢ア（正解）】インスペクションは、プログラム作成者、進行まとめ役、記録係、説明役、レビュー役といった役割を明確にした上で、厳格なレビューを公式に行うことが特徴です。よって適切であり、これが正解です。

【選択肢イ】プログラム作成者が他のメンバに問題点を説明してコメントをもらうのは「ウォークスルー」と呼ばれる手法です。インスペクションでは、進行まとめ役によって進められます。よって不適切です。

【選択肢ウ】インスペクションでは、プログラム作成者、進行まとめ役、記録係、説明役、レビュー役が参加して行われます。2名だけではありません。よって不適切です。

【選択肢エ】インスペクションは役割を明確にした上で集団でレビューを行うものであり、検査担当者に回覧するものではありません。よって不適切です。`,
  },
  {
    id: 17,
    year: "平成25年 第19問",
    title: "ホワイトボックステスト、ブラックボックステスト",
    question: "ソフトウェアのテスト方法には、ホワイトボックステスト、ブラックボックステスト、およびこれらの混合であるグレーボックステストがある。これらのうち、前2者に関する記述として最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "ブラックボックステストでは、すべての場合を網羅した組み合わせテストによっても、すべての組み合わせバグを検出できるとは限らない。" },
      { label: "イ", text: "ブラックボックステストは、システム仕様の視点からのテストである。" },
      { label: "ウ", text: "ブラックボックステストは、テスト対象が小さい場合にはホワイトボックステストよりも効果が高い。" },
      { label: "エ", text: "ホワイトボックステストは、主にテスト段階の後期に行う。" },
    ],
    answer: "イ",
    explanation: `経営情報システムから、テストに関する出題です。

【基本的な定義】
・ホワイトボックステスト：プログラムの内部構造に注目して、プログラムが意図したとおりに動作しているかを確認するテストです。
・ブラックボックステスト：プログラムの入力と出力に注目して、さまざまな入力に対して、プログラムの仕様どおりの出力が得られるかを確認するテストです。

【選択肢ア】ブラックボックステストでは、プログラムに対してさまざまな入力を与えて仕様通りの出力が得られるかをテストします。すべての場合を網羅した組み合わせは膨大になるため、実質的には不可能です。よって不適切です（ホワイトボックステストでは網羅的なテストが可能です）。

【選択肢イ（正解）】ブラックボックステストは、入出力の観点からプログラムが仕様通りに動作するかを確認するテストということができます。よって適切であり、これが正解です。

【選択肢ウ】ホワイトボックステストは、テスト対象が小さい場合には効果が高い一方、テスト対象が大きい場合は情報が大きすぎて扱い切れないという問題があります。「ブラックボックステストがテスト対象が小さい場合に効果が高い」という記述は不適切です。

【選択肢エ】ホワイトボックステストは通常、単体テストで行われます。単体テストはテスト段階の初期にあたりますので、「テスト段階の後期に行う」という記述は不適切です。`,
  },
  {
    id: 18,
    year: "平成30年 第21問",
    title: "回帰テスト、A/Bテスト",
    question: "中小企業が外注によって情報システムを開発する場合、外注先に任せきりにするのではなく、情報システムのテストに留意するなど、当事者意識を持つ必要がある。テストに関する記述として最も適切なものはどれか。",
    choices: [
      { label: "ア", text: "システム開発の最終段階で、発注者として、そのシステムが実際に運用できるか否かを、人間系も含めて行うテストをベータテストという。" },
      { label: "イ", text: "ソースコードの開発・追加・修正を終えたソフトウェアが正常に機能する状態にあるかを確認する予備的なテストをアルファテストという。" },
      { label: "ウ", text: "対象箇所や操作手順などを事前に定めず、実施者がテスト項目をランダムに選んで実行するテストをA/Bテストという。" },
      { label: "エ", text: "プログラムを変更した際に、その変更によって予想外の影響が現れていないかどうか確認するテストを回帰テストという。" },
    ],
    answer: "エ",
    explanation: `経営情報システムから、テストについての問題です。

【選択肢ア】ベータテストとは、ソフトウェアサービスやプログラムなどの正式版リリース直前の状態のものを、一部のユーザに利用してもらい、機能や使い勝手などを評価してもらうテストのことです。発注者が行うテストではありません。よって不適切です。

【選択肢イ】アルファテストとは、ソフトウェアサービスやプログラムなどの開発初期段階の状態のものを、一部のユーザに利用してもらい、機能や使い勝手などを評価してもらうテストのことです。ベータテストの前段階で実施するものであり、大きな不具合や重大な問題が発見されることが多くあります。よって不適切です。

【選択肢ウ】A/Bテストとは、異なるデザインやレイアウトを実際にユーザに提示して、どちらがユーザに支持されるかを確認するテストのことです。主にWebサイトのデザインやレイアウトを最適化する目的で使われており、Webマーケティングの手法の1つでもあります。「実施者がテスト項目をランダムに選んで実行するテスト」ではありません。よって不適切です。

【選択肢エ（正解）】回帰テスト（リグレッションテスト）とは、プログラムに修正を加えた際に、その修正が既存のプログラムに悪影響を及ぼさないかどうか検証するためのテストのことです。よって適切であり、これが正解です。`,
  },
];

// ============================================================
// データ永続化関数（Firestore）
// ============================================================
async function loadUserData(userId) {
  if (!db || !userId) return {};
  try {
    console.log("[Firestore] データ読み込み開始:", userId);
    const ref = doc(db, APP_ID, userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      console.log("[Firestore] データ読み込み成功");
      return snap.data() || {};
    }
    console.log("[Firestore] データなし（新規ユーザー）");
    return {};
  } catch (e) {
    console.error("[Firestore] 読み込みエラー:", e);
    return {};
  }
}

async function saveUserData(userId, data) {
  if (!db || !userId) return;
  try {
    console.log("[Firestore] データ保存:", userId);
    const ref = doc(db, APP_ID, userId);
    await setDoc(ref, data, { merge: true });
    console.log("[Firestore] 保存完了");
  } catch (e) {
    console.error("[Firestore] 保存エラー:", e);
  }
}

// ============================================================
// メインアプリコンポーネント
// ============================================================
export default function App() {
  const [screen, setScreen] = useState("login"); // login | start | quiz | answer | results | history
  const [userId, setUserId] = useState("");
  const [inputUserId, setInputUserId] = useState("");
  const [loading, setLoading] = useState(false);

  // クイズ状態
  const [mode, setMode] = useState("all"); // all | incorrect | flagged
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [sessionResults, setSessionResults] = useState([]); // {id, correct}

  // 永続データ
  const [history, setHistory] = useState({}); // {id: {correct: bool, count: int, lastDate: str}}
  const [flags, setFlags] = useState({}); // {id: bool}

  // ログイン処理
  const handleLogin = async () => {
    const uid = inputUserId.trim();
    if (!uid) return;
    setLoading(true);
    console.log("[Login] ユーザーID入力:", uid);
    const data = await loadUserData(uid);
    setHistory(data.history || {});
    setFlags(data.flags || {});
    setUserId(uid);
    setLoading(false);
    setScreen("start");
    console.log("[Login] ログイン完了");
  };

  // データ保存
  const persist = async (newHistory, newFlags) => {
    await saveUserData(userId, { history: newHistory, flags: newFlags });
  };

  // モード選択して開始
  const startQuiz = (selectedMode) => {
    setMode(selectedMode);
    let pool = [];
    if (selectedMode === "all") {
      pool = [...QUESTIONS];
    } else if (selectedMode === "incorrect") {
      pool = QUESTIONS.filter(q => history[q.id] && !history[q.id].correct);
    } else if (selectedMode === "flagged") {
      pool = QUESTIONS.filter(q => flags[q.id]);
    }
    if (pool.length === 0) {
      alert("該当する問題がありません。");
      return;
    }
    setQuestions(pool);
    setCurrentIndex(0);
    setSelectedChoice(null);
    setSessionResults([]);
    setScreen("quiz");
    console.log("[Quiz] 開始 mode:", selectedMode, "問題数:", pool.length);
  };

  // 選択肢クリック
  const handleChoiceSelect = (label) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(label);
    const q = questions[currentIndex];
    const isCorrect = label === q.answer;
    console.log("[Quiz] 回答:", label, "正解:", q.answer, "結果:", isCorrect);

    const newHistory = {
      ...history,
      [q.id]: { correct: isCorrect, count: ((history[q.id]?.count) || 0) + 1, lastDate: new Date().toLocaleDateString("ja-JP") },
    };
    setHistory(newHistory);
    setSessionResults(prev => [...prev, { id: q.id, correct: isCorrect }]);
    persist(newHistory, flags);
    setScreen("answer");
  };

  // 次の問題へ
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedChoice(null);
      setScreen("quiz");
    } else {
      setScreen("results");
    }
  };

  // 要復習フラグ切り替え
  const toggleFlag = async (qId) => {
    const newFlags = { ...flags, [qId]: !flags[qId] };
    setFlags(newFlags);
    await persist(history, newFlags);
    console.log("[Flag] 切替:", qId, newFlags[qId]);
  };

  // 統計計算
  const stats = {
    total: QUESTIONS.length,
    attempted: Object.keys(history).length,
    correct: Object.values(history).filter(h => h.correct).length,
    flagged: Object.values(flags).filter(Boolean).length,
    incorrect: Object.values(history).filter(h => !h.correct).length,
  };

  const q = questions[currentIndex];
  const correctCount = sessionResults.filter(r => r.correct).length;

  // ============================================================
  // ログイン画面
  // ============================================================
  if (screen === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">📋</div>
            <h1 className="text-2xl font-bold text-gray-800">4-6 情報システムの開発</h1>
            <p className="text-gray-500 text-sm mt-1">中小企業診断士 過去問セレクト演習</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザーID（合言葉）を入力
            </label>
            <input
              type="text"
              value={inputUserId}
              onChange={e => setInputUserId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="例: taro2024"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-400 mt-2">※ 同じIDを使えばPC・スマホ間で学習履歴を同期できます</p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !inputUserId.trim()}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {loading ? "読み込み中..." : "スタート"}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // ローディング画面
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // スタート画面
  // ============================================================
  if (screen === "start") {
    const rate = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-xl font-bold text-gray-800">4-6 情報システムの開発</h1>
              <span className="text-xs text-gray-400">ID: {userId}</span>
            </div>
            <p className="text-gray-500 text-sm mb-5">中小企業診断士 過去問セレクト演習</p>

            {/* 統計 */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.attempted}/{stats.total}</div>
                <div className="text-xs text-gray-500 mt-1">回答済み</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{rate}%</div>
                <div className="text-xs text-gray-500 mt-1">正答率</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-red-500">{stats.incorrect}</div>
                <div className="text-xs text-gray-500 mt-1">不正解</div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.flagged}</div>
                <div className="text-xs text-gray-500 mt-1">要復習</div>
              </div>
            </div>

            {/* モード選択 */}
            <h2 className="text-sm font-semibold text-gray-700 mb-3">出題モードを選択</h2>
            <div className="space-y-2">
              <button
                onClick={() => startQuiz("all")}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-between"
              >
                <span>📚 すべての問題</span>
                <span className="text-sm opacity-80">{stats.total}問</span>
              </button>
              <button
                onClick={() => startQuiz("incorrect")}
                disabled={stats.incorrect === 0}
                className="w-full bg-red-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-40 flex items-center justify-between"
              >
                <span>❌ 前回不正解のみ</span>
                <span className="text-sm opacity-80">{stats.incorrect}問</span>
              </button>
              <button
                onClick={() => startQuiz("flagged")}
                disabled={stats.flagged === 0}
                className="w-full bg-yellow-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-40 flex items-center justify-between"
              >
                <span>🚩 要復習のみ</span>
                <span className="text-sm opacity-80">{stats.flagged}問</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setScreen("history")}
            className="w-full bg-white text-gray-700 font-semibold py-3 rounded-xl shadow hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <List size={18} />
            学習履歴を見る
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // クイズ画面
  // ============================================================
  if (screen === "quiz" && q) {
    const progress = ((currentIndex) / questions.length) * 100;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-lg mx-auto">
          {/* ヘッダー */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setScreen("start")} className="text-blue-600 hover:text-blue-800">
                <Home size={20} />
              </button>
              <span className="text-sm text-gray-500">{currentIndex + 1} / {questions.length}</span>
              <button
                onClick={() => toggleFlag(q.id)}
                className={`text-sm px-2 py-1 rounded-lg font-medium ${flags[q.id] ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}
              >
                {flags[q.id] ? "🚩 要復習" : "☆ 復習登録"}
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 問題 */}
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">問題 {q.id}</span>
              <span className="text-xs text-gray-500">{q.year}</span>
            </div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">{q.title}</h2>
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{q.question}</p>
          </div>

          {/* 選択肢 */}
          <div className="space-y-2">
            {q.choices?.map(choice => (
              <button
                key={choice.label}
                onClick={() => handleChoiceSelect(choice.label)}
                className="w-full bg-white text-left px-4 py-3 rounded-xl shadow hover:bg-blue-50 border-2 border-transparent hover:border-blue-300 transition-all"
              >
                <span className="font-bold text-blue-600 mr-2">{choice.label}.</span>
                <span className="text-sm text-gray-800">{choice.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // 解答・解説画面
  // ============================================================
  if (screen === "answer" && q) {
    const isCorrect = selectedChoice === q.answer;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-lg mx-auto">
          {/* 正誤表示 */}
          <div className={`rounded-2xl shadow-lg p-5 mb-4 ${isCorrect ? "bg-green-50 border-2 border-green-300" : "bg-red-50 border-2 border-red-300"}`}>
            <div className="flex items-center gap-3 mb-2">
              {isCorrect ? <Check className="text-green-600" size={28} /> : <X className="text-red-500" size={28} />}
              <div>
                <div className={`text-lg font-bold ${isCorrect ? "text-green-700" : "text-red-600"}`}>
                  {isCorrect ? "正解！" : "不正解"}
                </div>
                <div className="text-sm text-gray-600">
                  あなたの回答: <span className="font-semibold">{selectedChoice}</span>　／　正解: <span className="font-semibold">{q.answer}</span>
                </div>
              </div>
            </div>

            {/* 選択肢の色分け */}
            <div className="space-y-2 mt-4">
              {q.choices?.map(choice => {
                let cls = "bg-white";
                if (choice.label === q.answer) cls = "bg-green-100 border-2 border-green-400";
                else if (choice.label === selectedChoice && !isCorrect) cls = "bg-red-100 border-2 border-red-400";
                return (
                  <div key={choice.label} className={`px-4 py-2 rounded-xl text-sm ${cls}`}>
                    <span className="font-bold mr-2">{choice.label}.</span>
                    {choice.text}
                    {choice.label === q.answer && <span className="ml-2 text-green-700 font-semibold">← 正解</span>}
                    {choice.label === selectedChoice && !isCorrect && <span className="ml-2 text-red-600 font-semibold">← あなたの回答</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 解説 */}
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-500" />
                解説
              </h3>
              <button
                onClick={() => toggleFlag(q.id)}
                className={`text-sm px-3 py-1 rounded-lg font-medium ${flags[q.id] ? "bg-yellow-100 text-yellow-700 border border-yellow-300" : "bg-gray-100 text-gray-600 border border-gray-200"}`}
              >
                {flags[q.id] ? "🚩 要復習済" : "🚩 要復習に追加"}
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
          </div>

          {/* 次へボタン */}
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            {currentIndex + 1 < questions.length ? (
              <>次の問題へ <ChevronRight size={20} /></>
            ) : (
              <>結果を見る <ChevronRight size={20} /></>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // 結果画面
  // ============================================================
  if (screen === "results") {
    const rate = sessionResults.length > 0 ? Math.round((correctCount / sessionResults.length) * 100) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 text-center">
            <div className="text-5xl mb-3">{rate >= 70 ? "🎉" : rate >= 50 ? "😊" : "📖"}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">結果発表</h2>
            <p className="text-gray-500 text-sm mb-5">{sessionResults.length}問中 {correctCount}問正解</p>
            <div className="text-6xl font-bold text-blue-600 mb-2">{rate}%</div>
            <p className="text-gray-500 text-sm">正答率</p>
          </div>

          {/* 問題別結果 */}
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
            <h3 className="font-bold text-gray-700 mb-3">問題別結果</h3>
            <div className="space-y-2">
              {sessionResults.map(r => {
                const qData = QUESTIONS.find(q => q.id === r.id);
                return (
                  <div key={r.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${r.correct ? "bg-green-50" : "bg-red-50"}`}>
                    <div className="flex items-center gap-2">
                      {r.correct ? <Check size={16} className="text-green-600" /> : <X size={16} className="text-red-500" />}
                      <span className="text-gray-700">問{r.id} {qData?.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{qData?.year}</span>
                      <button
                        onClick={() => toggleFlag(r.id)}
                        className={`text-xs px-2 py-0.5 rounded ${flags[r.id] ? "bg-yellow-200 text-yellow-700" : "bg-gray-100 text-gray-400"}`}
                      >
                        {flags[r.id] ? "🚩" : "☆"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => startQuiz(mode)}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              もう一度
            </button>
            <button
              onClick={() => setScreen("start")}
              className="w-full bg-white text-gray-700 font-semibold py-3 rounded-xl shadow hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Home size={18} />
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // 履歴画面
  // ============================================================
  if (screen === "history") {
    const resetHistory = async () => {
      if (!window.confirm("すべての学習履歴をリセットしますか？")) return;
      setHistory({});
      setFlags({});
      await saveUserData(userId, { history: {}, flags: {} });
      console.log("[History] リセット完了");
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock size={20} className="text-blue-500" />
                学習履歴
              </h2>
              <button
                onClick={() => setScreen("start")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← 戻る
              </button>
            </div>

            {QUESTIONS.map(q => {
              const h = history[q.id];
              const isFlagged = flags[q.id];
              return (
                <div key={q.id} className="border-b border-gray-100 py-3 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500">問{q.id}</span>
                        <span className="text-xs text-gray-400">{q.year}</span>
                        {isFlagged && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">🚩要復習</span>}
                      </div>
                      <p className="text-sm text-gray-700 font-medium">{q.title}</p>
                      {h ? (
                        <div className="flex items-center gap-3 mt-1">
                          {h.correct
                            ? <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><Check size={12} />正解</span>
                            : <span className="text-xs text-red-500 font-semibold flex items-center gap-1"><X size={12} />不正解</span>
                          }
                          <span className="text-xs text-gray-400">{h.count}回 | {h.lastDate}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">未回答</span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleFlag(q.id)}
                      className={`ml-2 text-sm px-2 py-1 rounded-lg ${isFlagged ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-400"}`}
                    >
                      {isFlagged ? "🚩" : "☆"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={resetHistory}
            className="w-full bg-white text-red-500 border border-red-200 font-semibold py-3 rounded-xl hover:bg-red-50 transition-colors"
          >
            🗑️ 履歴をリセット
          </button>
        </div>
      </div>
    );
  }

  return null;
}