# 🌤️ 天気 × 農業支援ダッシュボード（学習用）

**Next.js（App Router）× TypeScript × Tailwind CSS** を使って構築した、
農家向けの「作業判断に役立つ気象データ」を可視化する学習用アプリです。

GitHub Pages での公開にも対応するため、API取得は **クライアント側 fetch** を採用。
Open-Meteo API を利用して、現在の天気・週間予報・簡易危険度スコア・農作業アドバイスを表示します。

## 🚀 主な機能

#### 1. 現在の天気（ブラウザでリアルタイム取得）

・現在気温

・最高/最低気温

・風速・風向（方角名に自動変換）

・降水量

#### 2. 気象リスクスコア（独自ロジック）

・気温・降水量・風速から簡易スコアを自動計算
　→ 3段階表示（比較的おだやか／注意レベル／危険度高め）

#### 3. 週間予報（7日間）

・最高・最低気温・降水量

・高温・低温・雨量タグを自動表示

・「今日」バッジ付き

#### 4. 農作業メモ（アドバイス AI ロジック）

・風・気温・降水量からアドバイスを自動生成
　（蒸れ・乾燥・冷え込み・強風・高温など）

## 🛠️ 技術スタック

| 技術 | 内容 |
|------|------|
| **Next.js 16 (App Router)** | クライアントコンポーネント中心 |
| **React 18** | useEffect / useState で API 取得 |
| **TypeScript** | 型定義を厳格化 |
| **Tailwind CSS v3** | UI スタイリング |
| **Open-Meteo API** | 気象データ取得（APIキー不要） |
| **GitHub Pages** | 静的ホスティング |

## 🎯 このプロジェクトで学んだこと

・**Node の fetch がタイムアウトする WSL 特有の問題の調査**

・SSR → SSG → クライアント fetch への切り替え判断

・コンポーネント分割と UI 設計

・Tailwind のユーティリティ設計（レスポンシブ・色・余白）

・気象データを使った独自の業務ロジック実装

## 📦 セットアップ方法

```bash
git clone https://github.com/tomo1583gh/weather-farm-app.git
cd weather-farm-app
npm install
npm run dev
```

## 🔧 環境変数

このアプリでは **環境変数は不要** です。
Open-Meteo API は API キー不要 + CORS OK のため、クライアントから直接叩けます。

## 📂 ディレクトリ構成

```csharp
weather-farm-app/
├── app/
│   ├── page.tsx          # メイン画面
│   └── _components/
│       └── WeatherDashboard.tsx
├── public/
├── styles/
│   └── globals.css
├── package.json
└── README.md
```

## 🌐 デモ（GitHub Pages）

📍 URL： https://tomo1583gh.github.io/weather-farm-app

## 📝 今後の改善点

・気象データを ISR/SSR でキャッシュするサーバーAPIの実装

・作物ごとの農作業アドバイス（苺・キュウリ・葉物など）

・気象グラフ（気温推移・降水量チャート）

・位置情報を使った地点切り替え

・晴雨予報アイコンの追加

## 👤 作者

***Tomo***


フリーランス Web エンジニア（Next.js / Laravel）
農業バックグラウンドを活かした IT × 農業サービスを制作中。

## 📄 ライセンス

MIT License