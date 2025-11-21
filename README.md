# 🌤️ 天気 × 農業支援ダッシュボード（学習用）

静岡県南伊豆エリアを想定した、**農家の「今日、どんな作業をしやすいか」をざっくり判断するための気象ダッシュボード**です。

- Next.js（App Router）× TypeScript × Tailwind CSS で構築
- Open-Meteo API から現在の天気・週間予報を取得
- 気温・降水量・風の条件から、**独自のリスクスコアと農作業アドバイス**を自動生成
- GitHub Pages で公開するため、**クライアント側 fetch** を採用し、WSL 上の Node fetch 問題を回避

---

## 🌐 デモ

- GitHub Pages: https://tomo1583gh.github.io/weather-farm-app

### 📸 スクリーンショット

| トップ画面 | 週間予報 |
|-----------|-----------|
| ![スクリーンショット１](./docs/images/weather-farm-app(1).png) | ![スクリーンショット２](./docs/images/weather-farm-app(2).png) |

---

## 🚀 主な機能

### 1. 現在の天気（ブラウザでリアルタイム取得）

- 現在気温
- 今日の最高 / 最低気温
- 風速・風向（数値 → 「南風 / 北風 / 西風」などの方角名に変換）
- 今日の合計降水量

### 2. 気象リスクスコア（独自ロジック）

- 最高気温・降水量・風速から 0〜100 のスコアを自動計算
- ラベルは 3 段階
  - **比較的おだやか**
  - **注意レベル**
  - **危険度高め**

### 3. 週間予報（7日間）

- 7 日分の **最高 / 最低気温・降水量** を一覧表示
- 「高温気味」「低温注意」「雨量多め」「にわか雨」などのタグを自動付与
- 当日には「今日」バッジを表示

### 4. 農作業メモ（簡易アドバイス）

- 風・気温・降水量・風向から、農作業向けのメモを複数生成
  - 例）蒸れ・乾燥・冷え込み・強風・高温・北風による冷え など
- 重要度に応じてレベル（高 / 中 / 低）のバッジを表示

---

## 🛠️ 技術スタック

| 技術                       | 内容                                       |
|----------------------------|--------------------------------------------|
| **Next.js 16 (App Router)** | `app/` ディレクトリ構成。クライアントコンポーネント中心 |
| **React 18**               | `useEffect` / `useState` で API 取得・状態管理 |
| **TypeScript**             | API レスポンスや画面状態の型定義を厳格化       |
| **Tailwind CSS v4**        | UI スタイリング（カードレイアウト・バッジなど） |
| **Open-Meteo API**         | 気象データ取得（API キー不要 / CORS 許可）      |
| **GitHub Pages**           | `docs/` ディレクトリから静的ホスティング       |

---

## 🎯 このプロジェクトで学んだこと

- **WSL 上の Node.js で `fetch` がタイムアウトする問題の切り分け**
  - `curl` では成功するが、Node のみ `ETIMEDOUT` になる挙動を検証
  - SSR / SSG ではなく、クライアント側 `fetch` に切り替える判断を経験
- **Next.js 16 × GitHub Pages の構成**
  - `output: "export"` + `assetPrefix: "./"` による静的出力と相対パスの扱い
  - `.nojekyll` を置かないと `_next` 配下が配信されないというハマりどころ
- **コンポーネント分割と UI 設計**
  - 天気カード・リスクカード・週間予報・アドバイスをそれぞれコンポーネント化
  - Tailwind でのレスポンシブ対応・余白・色設計
- **気象データを使った簡易業務ロジック**
  - 気温・降水量・風速・風向から、スコアリングとアドバイス文言を組み立て

---

## 📦 セットアップ

```bash
git clone https://github.com/tomo1583gh/weather-farm-app.git
cd weather-farm-app
npm install
npm run dev
```
##### http://localhost:3000 で確認

## 🏗 ビルド & デプロイ（GitHub Pages）

このリポジトリでは、main ブランチの docs/ フォルダを GitHub Pages の公開対象にしています。

#### 1. ビルド

```bash
npm run build
# Next.js の静的出力が ./out に生成される（next.config.ts の output: "export" を使用）
```

#### 2. out → docs へコピー

```text
rm -rf docs && cp -r out docs
touch docs/.nojekyll   # _next 配下を配信するための設定
```

#### 3. GitHub にプッシュ

```text
git add docs
git commit -m "Deploy static build"
git push origin main
```

#### 4. GitHub Pages 設定

・Settings → Pages

　　・Source: Deploy from a branch

　　・Branch: main

　　・Folder: /docs

## 📂 ディレクトリ構成（抜粋）

実際の構成に合わせて例を記載：

```text
weather-farm-app/
├── app/
│   ├── page.tsx                # ルートページ（ヘッダー + WeatherDashboard）
│   ├── layout.tsx              # アプリ全体のレイアウト
│   ├── globals.css             # 全体スタイル（Tailwind）
│   └── _components/
│       └── WeatherDashboard.tsx # 天気ダッシュボード本体
├── public/
├── docs/                       # GitHub Pages 公開用ビルド（out をコピー）
├── next.config.ts
├── package.json
└── README.md

```

## 📝 今後の改善アイデア

・気象データを ISR / SSR でキャッシュするサーバー API 版の実装

・作物ごとの農作業アドバイス（苺・きゅうり・葉物・水稲など）への拡張

・気温推移・降水量チャートなどのグラフ表示

・位置情報（または手入力）で地点切り替え対応

・晴れ / 曇り / 雨 などの天気アイコン表示

## 👤 作者

***Tomo***

フリーランス Web エンジニア（Next.js / Laravel）。
農業の実務経験を活かし、「農業 × IT」 をテーマにしたサービス・ツールを制作中。

## 📄 ライセンス

MIT License