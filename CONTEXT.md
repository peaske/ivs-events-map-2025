🤖 CONTEXT.md - Claude連携用プロジェクト概要
📋 プロジェクト基本情報
プロジェクト名: IVS Events Map 2025
リポジトリ: peaske/ivs-events-map-2025
ライブURL: peaske.github.io/ivs-events-map-2025
作成日: 2025年6月27日
開発者: peaske
目的: IVSイベント情報を地図上に表示するインタラクティブWebアプリ
🛠️ 技術スタック詳細
フロントエンド
React + TypeScript (.tsx)
Vite (ビルドツール)
CSS (スタイリング)
API統合
4S API: https://api.4s.link/events?filter%3Atime=upcoming&limit=20&page=1
認証不要
イベントデータ取得
Google Maps API: 地図表示（環境変数設定済み）
デプロイメント
GitHub Pages (無料ホスティング)
gh-pages パッケージ使用
自動デプロイ: npm run deploy
📁 プロジェクト構造
ivs-events-map-2025/
├── src/
│   ├── components/
│   │   ├── EventMap.tsx       # メインマップコンポーネント
│   │   └── ...
│   ├── hooks/
│   │   ├── useEvents.tsx      # 4S APIデータフック
│   │   └── ...
│   ├── types/
│   │   ├── events.ts          # TypeScript型定義
│   │   └── ...
│   ├── App.tsx                # メインアプリコンポーネント
│   ├── App.css                # アプリスタイル
│   ├── index.tsx              # エントリーポイント
│   └── index.css              # グローバルスタイル
├── public/                    # 静的ファイル
├── dist/                      # ビルド出力（自動生成）
├── .env                       # 環境変数（Git除外）
├── .env.example               # 環境変数テンプレート
├── .gitignore                 # Git除外設定
├── package.json               # 依存関係・スクリプト
├── tsconfig.json              # TypeScript設定
├── vite.config.ts             # Vite設定
├── README.md                  # プロジェクトドキュメント
└── CONTEXT.md                 # このファイル
🔧 開発ワークフロー
ローカル開発
bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run preview      # ビルド確認
デプロイメント
bash
npm run deploy       # GitHub Pagesにデプロイ
Git操作
bash
git add .
git commit -m "変更内容"
git push
📊 現在の実装状況
✅ 完了済み
 プロジェクト初期化
 TypeScript + React設定
 4S API統合
 GitHub リポジトリ作成
 GitHub Pages デプロイ
 環境変数設定
 README作成
 ライブサイト公開
🔄 進行中
 Google Maps API統合完了
 イベントマーカー表示
 イベント詳細ポップアップ
📋 今後の開発予定
 イベントフィルタリング
 モバイル最適化
 ユーザーお気に入り機能
 イベント検索機能
 カレンダービュー
🤖 Claude連携ガイド
プロジェクト理解のためのキーファイル
README.md - 全体概要
package.json - 技術仕様
src/App.tsx - メインロジック
src/hooks/useEvents.tsx - API統合部分
よくある質問・課題
Google Maps API設定: .envファイルでAPIキー管理
4S APIデータ構造: types/events.tsで型定義
デプロイエラー: npm run buildでエラーチェック
スタイリング: CSS ModulesまたはStyled Components検討
デバッグ情報
開発サーバー: localhost:5173
ビルド出力: dist/フォルダ
ログ確認: ブラウザDevTools Console
🔗 重要なリンク
GitHub: https://github.com/peaske/ivs-events-map-2025
ライブサイト: https://peaske.github.io/ivs-events-map-2025/
4S API: https://api.4s.link/events
Google Maps API: https://console.cloud.google.com/
📝 開発メモ
2025/06/27 - プロジェクト立ち上げ
GitHub移行完了
基本デプロイ設定完了
Claude連携準備完了
文字数制限対策
このプロジェクトは、Claudeの文字数制限を回避するために以下を実装：

GitHubでの履歴管理
コンテキストファイルでの状況共有
段階的な開発アプローチ
最終更新: 2025年6月27日
Claude連携: このファイルを参照して開発を継続してください

