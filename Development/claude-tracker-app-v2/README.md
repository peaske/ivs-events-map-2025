# Claude Tracker v5.0.13

**Claude Desktop chat history tracker with ENV file integration**

Save Claude conversations as lightweight pointers in your project's .env file, with full conversation data stored in efficient JSONL format.

## 🆕 **Stable Release - CLI Command Interface**

**✅ Working Features:**
- ✅ **Complete CLI Interface** - `claude-tracker init` for reliable setup
- ✅ **CommonJS Stability** - Installation errors resolved
- ✅ **Detailed Error Handling** - Complete troubleshooting guide
- ✅ **Accurate Documentation** - No more "npm install only" false promises
- ✅ **Community Support** - [@peaske_en](https://x.com/peaske_en) for real-time help

**📋 CLI Commands:**
- `claude-tracker init` - Complete setup (recommended)
- `claude-tracker status` - Installation status check
- `claude-tracker build-dxt` - DXT file regeneration
- `claude-tracker help` - Command help and documentation

**🔄 Follow Development:**
Real-time updates and support: **[@peaske_en on 𝕏](https://x.com/peaske_en)**

---

## English | [日本語](#日本語) | [中文](#中文)

### 🆙 **What's New in v5.0.13:**
- ✅ **完全CLIインターフェース** - `claude-tracker init` で確実セットアップ
- ✅ **CommonJS安定化** - インストールエラー解消
- ✅ **詳細エラー処理** - トラブルシューティング完備
- ✅ **README整理** - 重複コンテンツ削除で読みやすさ向上
- 🔄 **コミュニティ連携** - [@peaske_en](https://x.com/peaske_en) でリアルタイムサポート

## Features

### JSONL + ENV Pointer System
- **JSONL Storage**: Full conversations saved to `.claude/logs/YYYY-WW/chat.jsonl`
- **ENV Pointers**: Lightweight references with 200-character previews in .env files
- **Auto-Cleanup**: 50KB ENV size limit maintains performance
- **Weekly Organization**: Logs organized by year and week for easy navigation

### Claude Desktop Integration
- **Easy Installation**: `npm install -g @peaske/claude-tracker`
- **DXT Extension**: Drag & drop installation for Claude Desktop
- **Real-time Tracking**: Conversations saved during chat sessions

---

## 🚀 **クイックスタート**

### **📦 Step 1: パッケージインストール**
```bash
npm install -g @peaske/claude-tracker
```
⏱️ **所要時間:** 30秒～1分  
✅ **確認方法:** `claude-tracker help` でヘルプが表示されればOK

### **🔧 Step 2: 完全セットアップ実行**
```bash
claude-tracker init
```
⏱️ **所要時間:** 1～3分（DXTファイル生成含む）  
✅ **成功メッセージ:** 「🎉 Claude Tracker v5.0.13 Setup Complete!」

### **📁 Step 3: DXTファイル存在確認**
1. **Finder**を開く
2. **Documents** フォルダを開く  
3. **claude-tracker** フォルダを開く
4. **claude-tracker-app.dxt** ファイルがあることを確認

```bash
# ターミナルでも確認可能
ls -la ~/Documents/claude-tracker/claude-tracker-app.dxt
```

**⚠️ ファイルが見つからない場合:**
```bash
claude-tracker status  # 状況確認
claude-tracker build-dxt  # DXT再生成
```

### **🎛️ Step 4: Claude Desktop拡張機能設定**

**4-1. Claude Desktop設定画面を開く**
1. **Claude Desktop**を起動
2. 画面左下の **⚙️ 設定** をクリック
3. **「拡張機能 (Extensions)」** をクリック

**4-2. DXTファイルをドラッグ&ドロップ**
1. **Finder**で `~/Documents/claude-tracker/claude-tracker-app.dxt` を探す
2. そのファイルを **Claude Desktop の拡張機能画面** にドラッグ
3. ファイルをドロップ

**4-3. 拡張機能をインストール**
1. 「**プレビュー**」画面が表示される
2. **「インストール」** ボタンをクリック
3. インストール完了を待つ

**4-4. 拡張機能を有効化**
1. インストール後、拡張機能一覧に **「@peaske/claude-tracker」** が表示
2. **「有効化」** ボタンをクリック
3. ✅ **緑色のチェック** が表示されれば成功

### **🎯 Step 5: 動作確認**

**5-1. チャット画面で確認**
1. Claude Desktopで**新しいチャット**を開始
2. チャット入力欄の右下に **📎 拡張機能アイコン** が表示されているか確認

**5-2. トラッキング開始テスト**
```
start_env_tracking Development/test-project
```
**期待結果:** 「✅ 環境トラッキングを開始しました」のようなメッセージ

---

## ❓ **トラブルシューティング**

### **🔧 DXTファイルがない場合**
```bash
claude-tracker status    # 現在の状況確認
claude-tracker init      # 再セットアップ
```

### **🚫 Claude Desktopで認識されない場合**
1. Claude Desktopを完全終了 (Command+Q)
2. Claude Desktopを再起動
3. 設定 → 拡張機能 で再確認

### **⚠️ 拡張機能エラーが出る場合**
```bash
claude-tracker build-dxt  # DXTファイル再生成
```

### **📋 CLI Commands 詳細**
- `claude-tracker init` - 完全セットアップ（推奨）
- `claude-tracker status` - インストール状況確認  
- `claude-tracker build-dxt` - DXTファイル再生成
- `claude-tracker help` - ヘルプとコマンド一覧

---
## 🎯 **使用結果例**

### **プロジェクトの.envファイルに会話が保存されます:**

```bash
# Development/your-project/.env (軽量ポインター)
CLAUDE_PTR_20250810_1425_USER_1="新機能をどう実装すべきですか？ 以下の側面を考慮する必要があります: 1) UIデザイン 2) API構造..."
# Log: .claude/logs/2025-W32/chat.jsonl#a7f3e9d2c1b8f5a6

CLAUDE_PTR_20250810_1425_ASSISTANT_1="まず要件を分析しましょう。UIについては、ワイヤーフレームから始めてユーザーインタラクションを定義することをお勧めします..."
# Log: .claude/logs/2025-W32/chat.jsonl#b8e4f0e3d2c9g6b7

CLAUDE_PTR_20250810_1425_SESSION_SUMMARY="機能実装の計画とアーキテクチャについて討論"
```

### **JSONLフォーマットで完全会話データ保存:**

```json
# .claude/logs/2025-W32/chat.jsonl
{"timestamp":"2025-08-10T14:25:00.000Z","type":"user_message","content":"新機能をどう実装すべきですか？...","message_id":1,"session_id":"a7f3e9d2c1b8f5a6"}
{"timestamp":"2025-08-10T14:25:30.000Z","type":"assistant_message","content":"まず要件を分析しましょう...","message_id":1,"session_id":"b8e4f0e3d2c9g6b7"}
```

---

## 🧪 **テスト & 検証**

### **CLIコマンドテスト**
```bash
# ヘルプ表示テスト
claude-tracker help

# セットアップ状況確認
claude-tracker status

# DXTファイル生成テスト
claude-tracker build-dxt
```

### **パッケージ品質検証**
```bash
cd /path/to/your/project

# 基本機能テスト
node index.js --test

# CLI機能テスト
node cli.js help

# DXTビルドテスト
./build-dxt.sh
```

### **テストカバレッジ**
- ✅ ファイル構造検証
- ✅ JSON構文チェック
- ✅ MCPサーバーコンポーネント検証
- ✅ CLIコマンド機能テスト
- ✅ DXTビルドスクリプト機能

## Available Tools

| Tool | Purpose |
|------|---------|
| `start_env_tracking` | Begin tracking to specified project path |
| `add_to_env` | Capture conversation content |
| `finalize_env_session` | End session with summary |
| `rotate_env_backup` | Create backup and clean main file |
| `get_env_tracking_status` | View current tracking status |

## Management Commands

```bash
# Installation status
claude-tracker status

# List tracked projects
claude-tracker projects

# View backups
claude-tracker backups

# Debug information
claude-tracker debug
```

## ENV File Format

```bash
# Session structure
CLAUDE_CHAT_20250104_1425_SESSION_START="Feature Planning Session"
CLAUDE_CHAT_20250104_1425_USER_1="User message content"
CLAUDE_CHAT_20250104_1425_ASSISTANT_1="Assistant response"
CLAUDE_CHAT_20250104_1425_SUMMARY="Session summary"
CLAUDE_CHAT_20250104_1425_SESSION_END="Duration: 15min, Messages: 8"
```

## Privacy & Security

- **Local Storage**: All data remains on your machine
- **No External APIs**: Direct file system integration only
- **Project Permissions**: Respects existing access controls

---

# 日本語

## 機能

### JSONL + ENV ポインタシステム
- **JSONL保存**: 完全な会話を `.claude/logs/YYYY-WW/chat.jsonl` に保存
- **ENVポインタ**: .envファイルには軽量な参照と200文字プレビューのみ
- **自動クリーンアップ**: 50KB ENVサイズ制限でパフォーマンス維持
- **週次整理**: 年・週別でログを整理し、ナビゲーション簡単

### Claude Desktop統合
- **簡単インストール**: `npm install -g @peaske/claude-tracker`
- **DXT拡張機能**: Claude Desktopへのドラッグ&ドロップ・インストール
- **リアルタイム追跡**: チャットセッション中の会話保存

## テスト方法

### テスト実行
```bash
cd ~/Development/claude-tracker-app-v2

# 基本機能テスト
node test.js

# NPMテストスクリプト
npm test

# ビルドテスト
chmod +x build-dxt.sh
./build-dxt.sh
```

### テストカバレッジ
- ファイル構造検証
- JSON構文チェック
- MCPサーバーコンポーネント確認
- ビルドスクリプト機能

---

# 中文

## 功能

### JSONL + ENV 指针系统
- **JSONL存储**: 完整对话保存到 `.claude/logs/YYYY-WW/chat.jsonl`
- **ENV指针**: .env文件仅包含轻量引用和200字符预览
- **自动清理**: 50KB ENV大小限制维持性能
- **周组织**: 按年周组织日志，便于导航

### Claude Desktop集成
- **简单安装**: `npm install -g @peaske/claude-tracker`
- **DXT扩展**: 拖放安装到Claude Desktop
- **实时跟踪**: 聊天会话期间保存对话

## 快速开始

### 1. 安装
```bash
npm install -g @peaske/claude-tracker
```

### 2. 添加到Claude Desktop
1. 打开**Claude Desktop** → **设置** → **扩展**
2. **拖放**: `~/Documents/claude-tracker/claude-tracker-app.dxt`
3. 点击**"安装"** → **"启用"**

### 3. 开始跟踪
在Claude Desktop聊天中：
```
start_env_tracking Development/你的项目名称
```

### 4. 结果
对话保存到项目的.env文件中：

```bash
# Development/你的项目名称/.env
CLAUDE_CHAT_20250104_1425_USER_1="我们应该如何实现新功能？"
CLAUDE_CHAT_20250104_1425_ASSISTANT_1="让我们先分析需求..."
CLAUDE_CHAT_20250104_1425_SUMMARY="功能实现讨论"
```

## 测试方法

### 运行测试
```bash
cd ~/Development/claude-tracker-app-v2

# 基本功能测试
node test.js

# NPM测试脚本
npm test

# 构建测试
chmod +x build-dxt.sh
./build-dxt.sh
```

### 测试覆盖
- 文件结构验证
- JSON语法检查
- MCP服务器组件验证
- 构建脚本功能

---

## Support & Repository

- **Repository**: https://github.com/peaske/claude-tracker
- **Support**: https://x.com/peaske_en
- **License**: MIT

---

**Claude Tracker v5.0.13**  
*Claude Desktop chat history tracker with ENV file integration*

---

## 📢 **サポート & コミュニティ**

- **📚 GitHub:** https://github.com/peaske/claude-tracker
- **🐦 リアルタイム更新:** [@peaske_en on 𝕏](https://x.com/peaske_en)
- **📞 コマンドヘルプ:** `claude-tracker help`
- **📝 ライセンス:** MIT

### **🎆 特別機能**
✨ **ENVベースRAGシステム** - データベース不要のプロジェクトメモリシステム！  
📦 **ワンコマンドセットアップ** - `claude-tracker init` で完全自動化！
