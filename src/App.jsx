// npm install lucide-react recharts firebase

import React, { useState, useEffect } from 'react';
import { Check, X, Home, ChevronRight, BookOpen, Clock, AlertCircle, BarChart2, LogOut, Play, RotateCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// ==========================================
// Firebase Configuration (ダミー値。本番環境の値に書き換えてください)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCyo4bAZwqaN2V0g91DehS6mHmjZD5XJTc",
  authDomain: "sabu-hide-web-app.firebaseapp.com",
  projectId: "sabu-hide-web-app",
  storageBucket: "sabu-hide-web-app.firebasestorage.app",
  messagingSenderId: "145944786114",
  appId: "1:145944786114:web:0da0c2d87a9e24ca6cf75b",
  measurementId: "G-XSS72H1ZKV"
};

// Firebase初期化 (try-catchでエラー回避)
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// アプリ固有のID（他のアプリとデータが混ざらないようにするため）
const APP_ID = "past-exam-4-6";

// ==========================================
// 問題集データ
// ==========================================
const quizData = [
  {
    id: 1,
    year: "令和2年 第16問",
    title: "情報システムの移行",
    question: "既存の情報システムから新しい情報システムに移行することは、しばしば困難を伴う。システム移行に関する記述として、最も適切なものはどれか。",
    options: [
      "移行規模が大きいほど、移行の時間を少なくするために一斉移行方式をとった方が良い。",
      "オンプレミスの情報システムからクラウドサービスを利用した情報システムに移行する際には、全面的に移行するために、IaaS が提供するアプリケーションの機能だけを検討すれば良い。",
      "既存のシステムが当面、問題なく稼働している場合には、コストの面から見て、機能追加や手直しをしたりせず、システム移行はできるだけ遅らせた方が良い。",
      "スクラッチ開発した情報システムを刷新するためにパッケージソフトウェアの導入を図る際には、カスタマイズのコストを検討して、現状の業務プロセスの見直しを考慮する必要がある。"
    ],
    answerIndex: 3,
    explanation: `解答：エ\n経営情報システムから、情報システムの移行に関する出題です。\nシステム移行に関する具体的な状況が問われており、設問文を丁寧に検討することで正答を選択できる問題です。\n\nア：運用中システムの一斉移行方式に関する記述。一斉移行方式には、移行にかかる時間が小さいというメリットがあります。しかし、一斉移行時の作業負荷やトラブルが発生した際の影響が大きくなるなどのデメリットがあります。そのため、移行規模が大きい場合よりも、規模が小さい場合に向いた方式といえ不適切です。\nイ：IaaS(Infrastructure as a Service)はインフラのみ提供されますので、開発環境・ミドルウェア・アプリケーションなどはユーザ側が自前で用意する必要があります。よって不適切です。\nウ：一時的にコストが発生することがあっても、遅滞なくシステム移行を実施したりした方が、将来を見据えた場合のトータルコストが低くなることも考えられます。一時的なコストだけで判断するべきものではありません。よって不適切です。\nエ：スクラッチ開発した情報システムを刷新するためにパッケージソフトウェアを導入する際、必ず、現状の業務プロセスに合わない部分が出て来ます。パッケージソフトウェアのカスタマイズが必要になりますが、このカスタマイズのコストを抑えるため、現状の業務プロセスの見直しは有効です。よって適切です。`
  },
  {
    id: 2,
    year: "平成22年 第14問改題",
    title: "開発方法論",
    question: "システム開発の基本フェーズは、要件定義、外部設計、内部設計、プログラム開発、各種テスト、稼働である。これら各フェーズを後戻りすることなく順に行っていく方法論を、ウォータフォール型システム開発方法論と呼ぶ。しかし、この方法論には種々の課題があるとされ、多様な方法論が開発されている。そのような方法論に関する記述として最も適切なものはどれか。",
    options: [
      "RADは、ウォータフォール型システム開発方法論よりも迅速に開発することを目的としたもので、システムエンジニアだけで構成される大人数の開発チームで一気に開発する方法論である。",
      "スパイラル開発は、１つのフェーズが終わったら、もう一度、そのフェーズを繰り返すペアプログラミングと呼ばれる手法を用いて確実にシステムを開発していく方法論である。",
      "システム開発を迅速かつ確実に進める方法論としてXPがあるが、それは仕様書をほとんど作成せず、ストーリーカードと受け入れテストを中心に開発を進める方法論である。",
      "プロトタイピングは、フェーズ５の各種テストを簡略に行う方法論である。",
      "スクラムは、動いているシステムを壊さずに、ソフトウェアを高速に、着実に、自動的に機能を増幅させ、本番環境にリリース可能な状態にする方法論である。"
    ],
    answerIndex: 2,
    explanation: `解答：ウ\n\nア：RAD（Rapid Application Development）は、少人数のチームで担当し、開発期間を短縮する手法です。大人数のチームで開発するわけではありません。\nイ：スパイラル開発は、設計、開発、テストを何度もくり返すことで徐々にシステムを成長させていく手法です。ペアプログラミングはXPで使われる手法です。\nウ：XP（Extreme Programming）は「アジャイル開発プロセス」の手法の1つです。短い期間で反復的に設計・開発・テストを実施します。仕様書をほとんど作成せず、ストーリーカードと受け入れテストを中心に開発を進めます。適切です。\nエ：プロトタイピングは早い段階で試作品を作成しユーザが確認する方法です。テストフェーズを簡略化できるものではありません。\nオ：スクラムではモデリング段階とコーディング段階を往復しながらソフトウェア開発を行います。不適切です。`
  },
  {
    id: 3,
    year: "令和4年 第13問",
    title: "システム開発の方法論",
    question: "システム開発の方法論は多様である。システム開発に関する記述として、最も適切なものはどれか。",
    options: [
      "DevOps は、開発側と運用側とが密接に連携して、システムの導入や更新を柔軟かつ迅速に行う開発の方法論である。",
      "XP は、開発の基幹手法としてペアプログラミングを用いる方法論であり、ウォーターフォール型開発を改善したものである。",
      "ウォーターフォール型開発は、全体的なモデルを作成した上で、ユーザにとって価値ある機能のまとまりを単位として、計画、設計、構築を繰り返す方法論である。",
      "スクラムは、動いているシステムを壊さずに、ソフトウェアを高速に、着実に、自動的に機能を増幅させ、本番環境にリリース可能な状態にする方法論である。",
      "フィーチャ駆動開発は、開発工程を上流工程から下流工程へと順次移行し、後戻りはシステムの完成後にのみ許される方法論である。"
    ],
    answerIndex: 0,
    explanation: `解答：ア\n\nア：DevOpsは、開発(Development)と運用(Operations)を組み合わせた用語です。開発側と運用側とが密接に連携して、システムの導入や更新を柔軟かつ迅速に行う開発の方法論を意味します。適切です。\nイ：XPはアジャイル開発プロセスの具体的な手法の1つであり、ウォーターフォール型開発を改善したものではありません。\nウ：記述はスパイラル型開発のものです。ウォーターフォール型は上流から順番に実施していく方法です。\nエ：スクラムはモデリング段階とコーディング段階を往復しながらソフトウェア開発を行います。\nオ：記述はウォーターフォール型開発に関する内容です。`
  },
  {
    id: 4,
    year: "令和2年 第18問",
    title: "プロジェクト管理の手法やチャート",
    question: "プロジェクトを管理するために利用される手法やチャートに関する以下のａ～ｄの記述と、その名称の組み合わせとして、最も適切なものを下記の解答群から選べ。\na プロジェクトの計画を立てる際に用いられる手法の一つで、作業を管理可能な大きさに細分化するために、階層的に要素分解する手法。\nｂ 作業を金銭価値に換算して、定量的にコスト効率とスケジュール効率を評価する手法。\nｃ 作業開始と終了の予定と実績を表示した横棒グラフで、スケジュール管理に利用するチャート。\nｄ 横軸に開発期間、縦軸に予算消化率をとって表した折れ線グラフで、費用管理と進捗管理を同時に行うチャート。",
    options: [
      "ａ：PERT　ｂ：BAC　ｃ：ガントチャート　ｄ：管理図",
      "ａ：PERT　ｂ：BAC　ｃ：流れ図　ｄ：トレンドチャート",
      "ａ：WBS　ｂ：EVM　ｃ：ガントチャート　ｄ：トレンドチャート",
      "ａ：WBS　ｂ：EVM　ｃ：流れ図　ｄ：管理図"
    ],
    answerIndex: 2,
    explanation: `解答：ウ\n\na: WBS (Work Breakdown Structure) の説明です。作業を階層的に要素分解する手法です。\nb: EVM (Earned Value Management) の説明です。作業の進捗度を金額で表現することで管理します。\nc: ガントチャートの説明です。縦軸に作業項目、横軸に時間軸を置いて進捗を棒グラフで表します。\nd: トレンドチャートの説明です。予定（予算）と実績の折れ線グラフを描き、予実の差異や傾向を分析します。`
  },
  {
    id: 5,
    year: "平成30年 第18問",
    title: "見積手法",
    question: "ソフトウェア開発では、仕様の曖昧さなどが原因で工数オーバーとなるケースが散見される。開発規模の見積もりに関する記述として、最も適切なものはどれか。",
    options: [
      "CoBRA法では、開発工数は開発規模に比例することを仮定するとともに、さまざまな変動要因によって工数増加が発生することを加味している。",
      "LOC法では、画面や帳票の数をもとに開発規模を計算するため、仕様書が完成する前の要件定義段階での見積もりは難しい。",
      "標準タスク法は、ソフトウェアの構造をWBS（Work Breakdown Structure）に分解し、WBSごとに工数を積み上げて開発規模を見積もる方法である。",
      "ファンクション・ポイント法は、システムのファンクションごとにプログラマーのスキルを数値化した重みを付けて、プログラム・ステップ数を算出する。"
    ],
    answerIndex: 0,
    explanation: `解答：ア\n\nア：CoBRA（Cost estimation, Benchmarking and Risk Assessment）法は、経験豊富なプロジェクト・マネージャー等の知識を元に、様々な変動要因を抽出・定量化し見積を作成する方法です。適切です。\nイ：LOC(Lines Of Code)法は、プログラムの行数により開発規模を見積もる方法です。\nウ：標準タスク法は、「ソフトウェアの作業工程」をWBSに分解し見積もる方法です。「ソフトウェアの構造」ではありません。\nエ：ファンクションポイント法は、機能（ファンクション）ごとの複雑さによって点数を付け工数を見積もる方法です。プログラマーのスキルで重み付けするわけではありません。`
  },
  {
    id: 6,
    year: "令和4年 第19問",
    title: "EVMS",
    question: "中小企業Ａ社では、基幹業務系システムの刷新プロジェクトを進めている。先月のプロジェクト会議で、PV（出来高計画値）が1,200 万円、AC（コスト実績値）が800 万円、EV（出来高実績値）が600 万円であることが報告された。このとき、コスト効率指数（CPI）とスケジュール効率指数（SPI）に関する記述として、最も適切なものはどれか。",
    options: [
      "CPI は0.50 であり、SPI は0.67 である。",
      "CPI は0.50 であり、SPI は0.75 である。",
      "CPI は0.67 であり、SPI は0.50 である。",
      "CPI は0.67 であり、SPI は0.75 である。",
      "CPI は0.75 であり、SPI は0.50 である。"
    ],
    answerIndex: 4,
    explanation: `解答：オ\nEVMS（Earned Value Management System）に関する問題です。\n\n・PV = 1,200万円\n・AC = 800万円\n・EV = 600万円\n\nコスト指標(CPI) = EV / AC\nスケジュール指標(SPI) = EV / PV\n\nCPI = 600 / 800 = 0.75\nSPI = 600 / 1200 = 0.50\n\nよって、オが正解となります。`
  },
  {
    id: 7,
    year: "令和4年 第18問",
    title: "ITサービスマネジメント",
    question: "IT サービスマネジメントとは、IT サービス提供者が、提供するIT サービスを効率的かつ効果的に運営管理するための枠組みである。IT サービスマネジメントに関する記述として、最も適切なものはどれか。",
    options: [
      "COSO は、IT サービスマネジメントのベストプラクティス集である。",
      "IT サービスマネジメントシステムの構築に経営者が深く関与することは、避けた方が良い。",
      "IT サービスマネジメントシステムの認証を受けるとP マークを取得できる。",
      "IT サービスマネジメントにおけるインシデントとは、顧客情報の流出によってセキュリティ上の脅威となる事象のことをいう。",
      "SLA は、サービス内容およびサービス目標値に関するサービス提供者と顧客間の合意である。"
    ],
    answerIndex: 4,
    explanation: `解答：オ\n\nア：ITサービスマネジメントのベストプラクティス集は「ITIL」です。\nイ：ITサービスマネジメントシステムの構築には、経営者が深く関与する（コミットメント）ことがポイントとされています。\nウ：ITサービスマネジメントシステムの認証はITSMS認定マークです。Pマークは個人情報保護体制の認証です。\nエ：インシデントは顧客情報の流出に限りません。計画外の中断や品質低下などを含みます。\nオ：SLA（Service Level Agreement）は、提供するサービス内容や品質に対する水準を定めた合意文書です。適切です。`
  },
  {
    id: 8,
    year: "令和5年 第19問",
    title: "ITサービスマネジメント2",
    question: "IT サービスマネジメントにおいて取り交わす文書に関する以下の①～③の記述とその用語の組み合わせとして、最も適切なものを選べ。\n① サービス提供者が組織外部の供給者と取り交わす文書\n② サービス提供者が組織内部の供給者と取り交わす文書\n③ サービス提供者が顧客と取り交わす文書",
    options: [
      "①：NDA ②：SLA ③：OLA",
      "①：OLA ②：NDA ③：UC",
      "①：OLA ②：UC ③：SLA",
      "①：SLA ②：UC ③：OLA",
      "①：UC ②：OLA ③：SLA"
    ],
    answerIndex: 4,
    explanation: `解答：オ\n\n① 組織外部の供給者と取り交わす文書：UC（Underpinning Contract）\n② 組織内部の供給者と取り交わす文書：OLA（Operational Level Agreement）\n③ 顧客と取り交わす文書：SLA（Service Level Agreement）\n\n※NDAは秘密保持契約であり、ITサービスマネジメント特有の用語ではありません。`
  },
  {
    id: 9,
    year: "平成30年 第17問",
    title: "システム開発の外注",
    question: "A社は自社の業務システムを全面的に改訂しようとしている。候補に挙がっているいくつかのITベンダーの中からシステム開発先を決定したい。A社がITベンダーに出す文書に関する記述として、最も適切なものはどれか。",
    options: [
      "RFIとは、自社が利用可能な技術などをベンダーに伝え、システム開発を依頼する文書をいう。",
      "RFIとは、システムが提供するサービスの品質保証やペナルティに関する契約内容を明らかにし、システム開発を依頼する文書をいう。",
      "RFPとは、システムの概要や主要な機能などに関する提案を依頼する文書をいう。",
      "RFPとは、システムライフサイクル全体にわたる、システム開発および運用にかかるコスト見積もりを依頼する文書をいう。"
    ],
    answerIndex: 2,
    explanation: `解答：ウ\n\nア・イ：RFI（情報提供依頼書）は、発注先候補のシステム開発会社に情報提供を依頼する文書です。アの「要件を伝達する」のはRFP、イの「品質保証等を合意する」のはSLAの説明です。\nウ：RFP（提案依頼書）は、発注先の業者に提案を要求し、要件を伝えるための文書です。適切です。\nエ：システムライフサイクル全体にわたるコストはTCO（Total Cost of Ownership）といいます。RFPの説明としては不適切です。`
  },
  {
    id: 10,
    year: "平成24年 第17問",
    title: "設計手法と設計図",
    question: "ある中小販売企業では、インターネットで受注を開始することにした。それに先立ち、図を描いて受注システムの検討を行っている。（※プロセス、データストア、データフローで構成された図）。この図に関する説明として最も適切なものを選べ。",
    options: [
      "業務のデータの流れと処理の関係を記述したDFDである。",
      "データベースをどのように構築したら良いかを示すERDである。",
      "利用者がシステムとどのようにやり取りするかを示すユースケース図である。",
      "利用者相互のコミュニケーションの関係を描いたコミュニケーション図である。"
    ],
    answerIndex: 0,
    explanation: `解答：ア\n問題文で示されている図（プロセスが円、データストアが平行線等で描かれる図）はDFD（Data Flow Diagram：データフローダイアグラム）です。\nDFDはデータと処理の流れを表す図表です。\n\nイ：ERDはエンティティとリレーションで表す図。\nウ：ユースケース図はアクターとユースケースの関連を表す図。\nエ：コミュニケーション図はオブジェクト同士のメッセージのやり取りを表す図。`
  },
  {
    id: 11,
    year: "平成26年 第17問",
    title: "システム分析・設計に使われる図",
    question: "システム分析もしくはシステム設計に使われる図（図A：アクターと楕円、図B：開始・終了・条件分岐ノード、図C：プロセスとデータストア、図D：オブジェクトと矢印メッセージ）の名称の組み合わせとして最も適切なものを選べ。",
    options: [
      "図Ａ：アクティビティ図　 図Ｂ：ステートチャート図　図Ｃ：DFD　 図Ｄ：ユースケース図",
      "図Ａ：コミュニケーション図 　図Ｂ：アクティビティ図　図Ｃ：オブジェクト図　 図Ｄ：配置図",
      "図Ａ：ユースケース図　 図Ｂ：DFD　図Ｃ：アクティビティ図　 図Ｄ：コミュニケーション図",
      "図Ａ：ユースケース図　図Ｂ：アクティビティ図　図Ｃ：DFD 　図Ｄ：コミュニケーション図"
    ],
    answerIndex: 3,
    explanation: `解答：エ\n\n図A：アクター（人型）とユースケース（楕円）による「ユースケース図」\n図B：フローチャートのようにノードや分岐で処理を記述する「アクティビティ図」\n図C：プロセス（円）とデータストア（平行線）のデータの流れを示す「DFD」\n図D：オブジェクト間でやり取りされるメッセージを記述した「コミュニケーション図」`
  },
  {
    id: 12,
    year: "平成27年 第16問",
    title: "システム設計に使われる図",
    question: "システム設計の際に使われる図に関する以下の①〜④の記述と、図の名称の組み合わせとして、最も適切なものを選べ。\n①情報システムの内外の関係するデータの流れを表す図。\n②データを、実体、関連およびそれらの属性を要素としてモデル化する図。\n③システムにはどのような利用者がいるのか、利用者はどのような操作をするのかを示すために使われる図。\n④システムの物理的構成要素の依存関係に注目してシステムの構造を記述する図。",
    options: [
      "①：DFD　②：ERD 　③：アクティビティ図　④：配置図",
      "①：DFD　②：ERD 　③：ユースケース図　④：コンポーネント図",
      "①：ERD　②：DFD 　③：ステートチャート図　④：コンポーネント図",
      "①：ERD　②：DFD 　③：ユースケース図　④：配置図"
    ],
    answerIndex: 1,
    explanation: `解答：イ\n\n① データの流れを表す図：DFD\n② 実体(Entity)・関連(Relationship)を表す図：ERD(ER図)\n③ 利用者(アクター)と操作(ユースケース)を示す図：ユースケース図\n④ 物理的構成要素(コンポーネント)の依存関係を記述する図：コンポーネント図`
  },
  {
    id: 13,
    year: "平成26年 第15問",
    title: "近年のシステム開発手法",
    question: "近年注目されているシステム開発手法に関する記述として、最も適切なものはどれか。",
    options: [
      "エクストリームプログラミングは、システムテストを省くなどしてウォーターフォール型システム開発を改善した手法である。",
      "エンベデッドシステムは、あらかじめインストールしておいたアプリケーションを有効に利用してシステム開発を行う手法である。",
      "オープンデータは、開発前にシステム構想およびデータをユーザに示し、ユーザからのアイデアを取り入れながらシステム開発を行う手法である。",
      "スクラムは、開発途中でユーザの要求が変化することに対処しやすいアジャイルソフトウェア開発のひとつの手法である。"
    ],
    answerIndex: 3,
    explanation: `解答：エ\n\nア：エクストリームプログラミング(XP)はアジャイル開発プロセスの１つで、システムテストを省くわけではありません。\nイ：エンベデッドシステムは、家電や自動車などに組み込まれるコンピュータシステム（組込みシステム）のことです。\nウ：オープンデータは、制限なく広く利用が許可されているデータや、行政機関が保有するデータを公開することを指します。\nエ：スクラムは、アジャイルソフトウェア開発のひとつの手法であり、ユーザのニーズを柔軟に反映させながら短期間で稼働させることを目指します。適切です。`
  },
  {
    id: 14,
    year: "平成27年 第18問",
    title: "アジャイルシステム開発",
    question: "アジャイルシステム開発の方法論であるフィーチャ駆動開発、スクラム、かんばん、XPに関する記述として、最も適切なものはどれか。",
    options: [
      "フィーチャ駆動開発は、要求定義、設計、コーディング、テスト、実装というシステム開発プロセスを逐次的に確実に行う方法論である。",
      "スクラムは、ラウンドトリップ・エンジニアリングを取り入れたシステム開発の方法論である。",
      "かんばんは、ジャストインタイムの手法を応用して、システム開発の際に、ユーザと開発者との間でかんばんと呼ばれる情報伝達ツールを用いることに特徴がある。",
      "XPは、開発の基幹手法としてペアプログラミングを用いるが、それは複数のオブジェクトを複数の人々で分担して作成することで、システム開発の迅速化を図ろうとするものである。"
    ],
    answerIndex: 1,
    explanation: `解答：イ\n\nア：逐次的に確実に行うのはウォーターフォール型です。\nイ：スクラムは、モデリング段階とコーディング段階を往復しながらソフトウェア開発を行う「ラウンドトリップ・エンジニアリング」を取り入れたシステム開発です。適切です。\nウ：かんばんは、開発者同士が情報伝達ツールを用いるものであり、ユーザと開発者との間ではありません。\nエ：XPのペアプログラミングは、2人1組で1台のPCに向かい、1人がコードを書きもう1人がチェックしながら進める手法です。複数人で分担してオブジェクトを作成するものではありません。`
  },
  {
    id: 15,
    year: "令和元年 第18問",
    title: "情報システムのテスト",
    question: "ある中小企業では、出退勤システムの実装を進めている。テストに関する記述として、最も適切なものはどれか。",
    options: [
      "結合テストは、出退勤システム全体の処理能力が十分であるか、高い負荷でも問題がないか、などの検証を行うために、実際に使う環境で行うテストである。",
      "ブラックボックステストは、出退勤システムに修正を加えた場合に、想定外の影響が出ていないかを確認するためのテストである。",
      "ホワイトボックステストは、社員証の読み取りの際のチェックディジットの条件を網羅的にチェックするなど、内部構造を理解した上で行うテストである。",
      "リグレッションテストは、社員証の読み取りやサーバ送信などの複数モジュール間のインタフェースが正常に機能しているかを確認するテストである。"
    ],
    answerIndex: 2,
    explanation: `解答：ウ\n\nア：記述は「負荷テスト」に関するものです。結合テストは複数モジュールの組み合わせをテストします。\nイ：記述は「回帰テスト（リグレッションテスト）」に関するものです。ブラックボックステストは入力と出力に注目したテストです。\nウ：ホワイトボックステストは、プログラムの内部構造に注目して、命令文や条件分岐などを網羅的にチェックするテストです。適切です。\nエ：記述は「結合テスト」に関するものです。リグレッションテストは修正による想定外の影響を確認するテストです。`
  },
  {
    id: 16,
    year: "平成23年 第20問",
    title: "品質レビュー",
    question: "ソフトウェア品質レビュー技法のうち、インスペクションの説明として最も適切なものはどれか。",
    options: [
      "プログラム作成者、進行まとめ役、記録係、説明役、レビュー役を明確に決めて、厳格なレビューを公式に行う。",
      "プログラム作成者が他のメンバに問題点を説明して、コメントをもらう。",
      "プログラム作成者とレビュー担当者の２名だけで、作成したプログラムを調べる。",
      "プログラムを検査担当者に回覧して、個別にプログラムを調べてレビュー結果を戻してもらう。"
    ],
    answerIndex: 0,
    explanation: `解答：ア\n\nインスペクションとは、ソフトウェア開発の各工程で作成された成果物について検証する作業です。公式なもので、役割（進行まとめ役、記録係など）を明確に決めて厳密に行います。よって、アが正解です。`
  },
  {
    id: 17,
    year: "平成25年 第19問",
    title: "ホワイトボックステスト、ブラックボックステスト",
    question: "ソフトウェアのテスト方法には、ホワイトボックステスト、ブラックボックステストなどがある。これらのうち、前2者に関する記述として最も適切なものはどれか。",
    options: [
      "ブラックボックステストでは、すべての場合を網羅した組み合わせテストによっても、すべての組み合わせバグを検出できるとは限らない。",
      "ブラックボックステストは、システム仕様の視点からのテストである。",
      "ブラックボックステストは、テスト対象が小さい場合にはホワイトボックステストよりも効果が高い。",
      "ホワイトボックステストは、主にテスト段階の後期に行う。"
    ],
    answerIndex: 1,
    explanation: `解答：イ\n\nア：ブラックボックステストで「すべての場合を網羅した組み合わせテスト」を行うことは実質的に不可能です（パターンが膨大になるため）。\nイ：ブラックボックステストは、入出力の観点からプログラムが仕様通りに動作するかを確認するテストです。システム仕様の視点からのテストと言えます。適切です。\nウ：ホワイトボックステストはテスト対象が小さい場合に効果が高いとされています。\nエ：ホワイトボックステストは主に「単体テスト」で行われるため、テスト段階の初期にあたります。`
  },
  {
    id: 18,
    year: "平成30年 第21問",
    title: "回帰テスト、A/Bテスト",
    question: "情報システムのテストに関する記述として最も適切なものはどれか。",
    options: [
      "システム開発の最終段階で、発注者として、そのシステムが実際に運用できるか否かを、人間系も含めて行うテストをベータテストという。",
      "ソースコードの開発・追加・修正を終えたソフトウェアが正常に機能する状態にあるかを確認する予備的なテストをアルファテストという。",
      "対象箇所や操作手順などを事前に定めず、実施者がテスト項目をランダムに選んで実行するテストを A/B テストという。",
      "プログラムを変更した際に、その変更によって予想外の影響が現れていないかどうか確認するテストを回帰テストという。"
    ],
    answerIndex: 3,
    explanation: `解答：エ\n\nア：ベータテストは正式リリース直前に一部のユーザに利用してもらうテストです。発注者が行うものではありません。\nイ：アルファテストは開発初期段階で一部のユーザに利用してもらうテストです。予備的なテストではありません。\nウ：A/Bテストは異なるデザイン等をユーザに提示し、どちらが支持されるかを確認するマーケティングテストです。\nエ：回帰テスト（リグレッションテスト）は、修正が既存システムに悪影響を及ぼさないか検証するテストです。適切です。`
  }
];

// ==========================================
// メインコンポーネント
// ==========================================
export default function App() {
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // ユーザーデータ状態
  const [userData, setUserData] = useState({
    history: {}, // { questionId: { correct: boolean, count: number } }
    review: {}   // { questionId: boolean }
  });

  // 再開用データ
  const [resumeData, setResumeData] = useState({
    progressIndex: 0,
    progressMode: 'all'
  });

  // アプリの状態管理
  const [currentScreen, setCurrentScreen] = useState('menu'); // 'menu', 'quiz', 'history'
  const [playMode, setPlayMode] = useState('all'); // 'all', 'wrong', 'review'
  
  // クイズプレイ中の状態
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // ------------------------------------------
  // Firebase データ取得
  // ------------------------------------------
  const fetchUserData = async (id) => {
    if (!db) return;
    setIsLoading(true);
    try {
      const docRef = doc(db, 'users', `${APP_ID}_${id}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData({
          history: data?.history || {},
          review: data?.review || {}
        });
        setResumeData({
          progressIndex: data?.progressIndex || 0,
          progressMode: data?.progressMode || 'all'
        });
      } else {
        setUserData({ history: {}, review: {} });
        setResumeData({ progressIndex: 0, progressMode: 'all' });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
      setIsLoggedIn(true);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (userId.trim()) {
      fetchUserData(userId.trim());
    }
  };

  // ------------------------------------------
  // Firebase データ保存
  // ------------------------------------------
  const saveUserDataToFirebase = async (newHistory, newReview, pIndex = 0, pMode = 'all') => {
    if (!db || !isLoggedIn) return;
    try {
      const docRef = doc(db, 'users', `${APP_ID}_${userId}`);
      await setDoc(docRef, {
        history: newHistory,
        review: newReview,
        progressIndex: pIndex,
        progressMode: pMode
      }, { merge: true });
      console.log("Saved to Firebase", { pIndex, pMode });
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  // ------------------------------------------
  // クイズ進行ロジック
  // ------------------------------------------
  const startQuiz = (mode, useResume = false) => {
    let list = [];
    if (mode === 'all') {
      list = [...quizData];
    } else if (mode === 'wrong') {
      list = quizData.filter(q => userData.history[q.id]?.correct === false);
    } else if (mode === 'review') {
      list = quizData.filter(q => userData.review[q.id] === true);
    }

    if (list.length === 0) {
      alert("該当する問題がありません！");
      return;
    }

    setPlayMode(mode);
    setFilteredQuestions(list);
    
    const startIndex = useResume ? resumeData.progressIndex : 0;
    setCurrentIndex(startIndex >= list.length ? 0 : startIndex);
    
    setSelectedOption(null);
    setShowExplanation(false);
    setCurrentScreen('quiz');
    
    if (!useResume) {
      saveUserDataToFirebase(userData.history, userData.review, 0, mode);
    }
  };

  const handleAnswerClick = (index) => {
    if (showExplanation) return; // 二度押し防止
    setSelectedOption(index);
    setShowExplanation(true);

    const currentQ = filteredQuestions[currentIndex];
    const isCorrect = index === currentQ.answerIndex;

    const newHistory = { ...userData.history };
    const prevCount = newHistory[currentQ.id]?.count || 0;
    newHistory[currentQ.id] = {
      correct: isCorrect,
      count: prevCount + 1
    };

    setUserData(prev => ({ ...prev, history: newHistory }));
    
    // 現在の進捗状況を保存
    saveUserDataToFirebase(newHistory, userData.review, currentIndex, playMode);
  };

  const handleNextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < filteredQuestions.length) {
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setShowExplanation(false);
      saveUserDataToFirebase(userData.history, userData.review, nextIndex, playMode);
    } else {
      // 完走したら進捗リセット
      saveUserDataToFirebase(userData.history, userData.review, 0, playMode);
      setResumeData({ progressIndex: 0, progressMode: 'all' });
      setCurrentScreen('menu');
      alert("お疲れ様でした！すべての問題を完了しました。");
    }
  };

  const toggleReviewFlag = (questionId) => {
    const newReview = { ...userData.review };
    newReview[questionId] = !newReview[questionId];
    setUserData(prev => ({ ...prev, review: newReview }));
    
    // 即時保存
    saveUserDataToFirebase(userData.history, newReview, currentIndex, playMode);
  };

  const returnToMenu = () => {
    // 戻る際に現在のインデックスを保存
    saveUserDataToFirebase(userData.history, userData.review, currentIndex, playMode);
    setCurrentScreen('menu');
  };

  // ------------------------------------------
  // UI コンポーネント
  // ------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-bold text-gray-600 animate-pulse">Loading Data...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-6 text-blue-600">
            <BookOpen size={48} />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">システム開発 過去問演習</h1>
          <p className="text-sm text-gray-500 text-center mb-6">合言葉を入力して学習データを同期しましょう</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="合言葉 (例: my-secret-key)"
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
            >
              学習をスタート
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800 flex items-center">
            <BookOpen className="mr-2 text-blue-600" size={20} />
            システム開発過去問
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">ID: {userId}</span>
            <button 
              onClick={() => { setIsLoggedIn(false); setUserId(''); }}
              className="text-gray-500 hover:text-red-500 flex items-center text-sm"
            >
              <LogOut size={16} className="mr-1" />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* ========================================== */}
        {/* メニュー画面 */}
        {/* ========================================== */}
        {currentScreen === 'menu' && (
          <div className="space-y-6">
            
            {/* 途中再開UI */}
            {resumeData.progressIndex > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start">
                  <Clock className="text-blue-500 mt-1 mr-3 flex-shrink-0" size={24} />
                  <div>
                    <h2 className="text-lg font-bold text-blue-800 mb-1">学習の続きから再開できます</h2>
                    <p className="text-sm text-blue-600 mb-4">
                      前回は「{resumeData.progressMode === 'all' ? 'すべての問題' : resumeData.progressMode === 'wrong' ? '前回不正解のみ' : '要復習のみ'}」の 
                      <span className="font-bold text-lg"> 第{resumeData.progressIndex + 1}問目 </span>
                      まで進んでいます。
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={() => startQuiz(resumeData.progressMode, true)}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center"
                      >
                        <Play size={16} className="mr-2" />
                        続きから再開する
                      </button>
                      <button 
                        onClick={() => saveUserDataToFirebase(userData.history, userData.review, 0, 'all').then(() => setResumeData({progressIndex: 0, progressMode: 'all'}))}
                        className="bg-white text-blue-600 border border-blue-300 px-5 py-2 rounded-lg font-medium hover:bg-blue-50 flex items-center"
                      >
                        <RotateCcw size={16} className="mr-2" />
                        進捗をリセット
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => startQuiz('all')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center border border-gray-100 group"
              >
                <div className="bg-green-100 p-4 rounded-full mb-3 group-hover:bg-green-200 transition">
                  <BookOpen size={32} className="text-green-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">すべての問題</h3>
                <p className="text-sm text-gray-500 mt-1">全18問を順番に出題します</p>
              </button>

              <button 
                onClick={() => startQuiz('wrong')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center border border-gray-100 group"
              >
                <div className="bg-red-100 p-4 rounded-full mb-3 group-hover:bg-red-200 transition">
                  <X size={32} className="text-red-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">前回不正解のみ</h3>
                <p className="text-sm text-gray-500 mt-1">苦手な問題を重点的に学習</p>
                <span className="mt-2 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                  該当: {quizData.filter(q => userData.history[q.id]?.correct === false).length}問
                </span>
              </button>

              <button 
                onClick={() => startQuiz('review')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center border border-gray-100 group"
              >
                <div className="bg-yellow-100 p-4 rounded-full mb-3 group-hover:bg-yellow-200 transition">
                  <AlertCircle size={32} className="text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">要復習のみ</h3>
                <p className="text-sm text-gray-500 mt-1">自分でチェックした問題を復習</p>
                <span className="mt-2 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                  該当: {quizData.filter(q => userData.review[q.id] === true).length}問
                </span>
              </button>

              <button 
                onClick={() => setCurrentScreen('history')}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center border border-gray-100 group"
              >
                <div className="bg-purple-100 p-4 rounded-full mb-3 group-hover:bg-purple-200 transition">
                  <BarChart2 size={32} className="text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">学習履歴</h3>
                <p className="text-sm text-gray-500 mt-1">正答状況の一覧を確認</p>
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* クイズ画面 */}
        {/* ========================================== */}
        {currentScreen === 'quiz' && filteredQuestions.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* プログレスバー & ヘッダー */}
            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <button 
                onClick={returnToMenu}
                className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg flex items-center transition"
              >
                <Home size={18} className="mr-1" />
                <span className="text-sm font-medium">中断して戻る</span>
              </button>
              <div className="text-sm font-bold text-gray-600">
                {currentIndex + 1} / {filteredQuestions.length}
              </div>
            </div>

            {/* 問題カード */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-start">
                <div>
                  <span className="inline-block bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                    {filteredQuestions[currentIndex].year}
                  </span>
                  <h2 className="text-lg font-bold text-gray-800">
                    {filteredQuestions[currentIndex].title}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
                  {filteredQuestions[currentIndex].question}
                </p>

                <div className="space-y-3">
                  {filteredQuestions[currentIndex].options.map((opt, idx) => {
                    // クラスの判定ロジック
                    let btnClass = "w-full text-left p-4 rounded-lg border-2 transition-all flex items-start group ";
                    if (!showExplanation) {
                      btnClass += "border-gray-200 hover:border-blue-400 hover:bg-blue-50";
                    } else {
                      if (idx === filteredQuestions[currentIndex].answerIndex) {
                        btnClass += "border-green-500 bg-green-50"; // 正解の選択肢
                      } else if (idx === selectedOption) {
                        btnClass += "border-red-500 bg-red-50"; // 選んだ不正解の選択肢
                      } else {
                        btnClass += "border-gray-100 opacity-50"; // その他
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showExplanation}
                        onClick={() => handleAnswerClick(idx)}
                        className={btnClass}
                      >
                        <span className="font-bold text-gray-500 mr-3 mt-0.5">
                          {["ア", "イ", "ウ", "エ", "オ"][idx]}
                        </span>
                        <span className="text-gray-700 text-sm leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 解説エリア */}
            {showExplanation && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 animate-fade-in overflow-hidden">
                <div className={`px-6 py-4 border-b flex items-center ${selectedOption === filteredQuestions[currentIndex].answerIndex ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
                  {selectedOption === filteredQuestions[currentIndex].answerIndex ? (
                    <><Check className="mr-2" /> <span className="font-bold text-lg">正解！</span></>
                  ) : (
                    <><X className="mr-2" /> <span className="font-bold text-lg">不正解</span></>
                  )}
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-6">
                    {filteredQuestions[currentIndex].explanation}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                    <label className="flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        checked={userData.review[filteredQuestions[currentIndex].id] || false}
                        onChange={() => toggleReviewFlag(filteredQuestions[currentIndex].id)}
                      />
                      <span className="ml-2 font-medium text-gray-700 group-hover:text-gray-900 transition">
                        要復習リストに追加する
                      </span>
                    </label>

                    <button
                      onClick={handleNextQuestion}
                      className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                    >
                      {currentIndex === filteredQuestions.length - 1 ? '完了する' : '次の問題へ'}
                      <ChevronRight className="ml-1" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* 履歴画面 */}
        {/* ========================================== */}
        {currentScreen === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setCurrentScreen('menu')}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center transition"
              >
                <Home size={18} className="mr-2" /> メニューへ戻る
              </button>
              <h2 className="text-xl font-bold text-gray-800">学習履歴</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 border-b">
                    <tr>
                      <th className="px-6 py-4 font-bold">問題番号</th>
                      <th className="px-6 py-4 font-bold">出題年度</th>
                      <th className="px-6 py-4 font-bold">前回の正誤</th>
                      <th className="px-6 py-4 font-bold">要復習</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quizData.map((q, i) => {
                      const hist = userData.history[q.id];
                      const isReview = userData.review[q.id];
                      return (
                        <tr key={q.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-medium text-gray-900">第{i + 1}問</td>
                          <td className="px-6 py-4">{q.year}</td>
                          <td className="px-6 py-4">
                            {!hist ? (
                              <span className="text-gray-400">-</span>
                            ) : hist.correct ? (
                              <span className="inline-flex items-center text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                                <Check size={14} className="mr-1" /> 正解
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600 font-bold bg-red-50 px-2 py-1 rounded">
                                <X size={14} className="mr-1" /> 不正解
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                                checked={isReview || false}
                                onChange={() => toggleReviewFlag(q.id)}
                              />
                            </label>
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

      </main>
      
      {/* 簡単なCSSアニメーション */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
}