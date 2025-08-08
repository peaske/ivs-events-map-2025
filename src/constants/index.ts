// 🏗️ REFACTORED: 統合定数エントリーポイント

// API設定をインポート
export * from './api'

// UI設定をインポート  
export * from './ui'

// 型定義をインポート
export type { DateFilterValue } from '../types/api'

// 従来の互換性のための再エクスポート（段階的移行用）
export { API_CONFIG } from './api'
export { 
  BREAKPOINTS, 
  COLORS, 
  SPACING, 
  TYPOGRAPHY,
  MAP_STYLES as MAP_CONFIG,
  Z_INDEX as UI_CONFIG
} from './ui'

// 削除予定（移行完了後）
// この部分は段階的にapi/index.tsとui/index.tsに移行されます
