// 🔧 REFACTORED: API設定専用定数

export const API_CONFIG = {
  // Google Maps
  GOOGLE_MAPS: {
    API_KEY: 'AIzaSyDAPia8Rfqck7my2z3Wj1NkBqLornWFutk',
    VERSION: 'weekly',
    LIBRARIES: ['maps'] as const,
  },
  
  // 4S API
  FOUR_S: {
    BASE_URL: 'https://4s.link/ja',
    API_BASE_URL: 'https://api.4s.link',
    ENDPOINTS: {
      EVENTS: '/events',
    },
    DEFAULT_PARAMS: {
      filter: 'time=upcoming',
      limit: 500,
      page: 1,
    },
  },

  // External APIs
  QR_CODE: {
    BASE_URL: 'https://api.qrserver.com/v1/create-qr-code/',
    DEFAULT_SIZE: '200x200',
  },

  // Request Config
  REQUEST: {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },
} as const

export const APP_URLS = {
  SITE_URL: 'https://peaske.github.io/ivs-events-map-2025/',
  REPOSITORY: 'https://github.com/peaske/ivs-events-map-2025',
  TWITTER_PROFILE: 'https://x.com/peaske_en',
} as const

export const SOCIAL_CONFIG = {
  TWITTER: {
    HANDLE: '@peaske_en',
    SHARE_TEXT: `IVS Events Map 2025 〜IVSを持ち歩こう！🚶‍♀️♪〜
#IVS2025 #IVS参加表明 @IVS_Official`,
    INTENT_URL: 'https://twitter.com/intent/tweet',
  },
  
  FACEBOOK: {
    SHARE_TEXT: 'IVS 2025のイベント情報をインタラクティブマップで確認できます！',
    SHARE_URL: 'https://www.facebook.com/sharer/sharer.php',
  },
} as const

export const ANALYTICS_CONFIG = {
  GA_MEASUREMENT_ID: 'G-1TKK950BW8',
  TRACK_EVENTS: {
    MAP_INTERACTION: 'map_interaction',
    EVENT_CLICK: 'event_click',
    FILTER_CHANGE: 'filter_change',
    SHARE_CLICK: 'share_click',
    LOCATION_REQUEST: 'location_request',
  },
} as const

export const ERROR_MESSAGES = {
  // API Errors
  API_CONNECTION_ERROR: 'API接続エラー',
  API_TIMEOUT: 'APIタイムアウトエラー',
  API_RATE_LIMIT: 'APIリクエスト制限に達しました',
  
  // Location Errors  
  NO_LOCATION: 'このイベントは住所が登録されていません。',
  LOCATION_ACCESS_FAILED: '位置情報の取得に失敗しました。',
  LOCATION_NOT_SUPPORTED: '位置情報がサポートされていません。',
  LOCATION_PERMISSION_DENIED: '位置情報へのアクセスが拒否されました。',
  
  // Map Errors
  MAP_LOAD_ERROR: '地図の読み込みに失敗しました。',
  MARKER_CREATE_ERROR: 'マーカーの作成に失敗しました。',
  
  // Image Errors
  IMAGE_LOAD_FAILED: '画像の読み込みに失敗しました',
  IMAGE_NOT_FOUND: '画像が見つかりません',
  
  // General Errors
  COPY_FAILED: 'コピーに失敗しました',
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  UNKNOWN_ERROR: '不明なエラーが発生しました',
} as const

export const SUCCESS_MESSAGES = {
  COPY_SUCCESS: 'URLをコピーしました',
  LOCATION_FOUND: '現在地を取得しました',
  DATA_UPDATED: 'データを更新しました',
  SHARE_SUCCESS: 'シェアしました',
} as const
