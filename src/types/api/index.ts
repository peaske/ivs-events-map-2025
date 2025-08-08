// 🔒 ENHANCED: 厳密なAPI型定義システム

// 4S API レスポンス型
export interface FourSApiResponse<T> {
  data: T[]
  pagination?: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrevious: boolean
  }
  meta?: {
    timestamp: string
    version: string
    requestId: string
  }
}

// イベント詳細型
export interface EventResponse {
  id: string
  slug?: string
  title: string
  description?: string
  startAt: string
  endAt?: string
  location?: LocationResponse
  organizer?: OrganizerResponse
  mainImageUrl?: string
  images?: ImageResponse[]
  tags?: string[]
  category?: CategoryResponse
  status: EventStatus
  capacity?: number
  attendees?: number
  price?: PriceResponse
  createdAt: string
  updatedAt: string
}

// 位置情報型
export interface LocationResponse {
  displayText?: string
  address?: string
  venue?: string
  geo?: {
    lat: number
    lng: number
  }
  prefecture?: string
  city?: string
  postalCode?: string
}

// 主催者型  
export interface OrganizerResponse {
  id: string
  name: string
  avatar?: string
  description?: string
  website?: string
  social?: {
    twitter?: string
    facebook?: string
    instagram?: string
  }
}

// 画像型
export interface ImageResponse {
  id: string
  url: string
  alt?: string
  caption?: string
  width?: number
  height?: number
  format?: string
}

// カテゴリ型
export interface CategoryResponse {
  id: string
  name: string
  slug: string
  color?: string
  icon?: string
}

// 料金型
export interface PriceResponse {
  amount: number
  currency: 'JPY' | 'USD' | 'EUR'
  type: 'free' | 'paid' | 'donation'
  description?: string
}

// イベント状態型
export type EventStatus = 
  | 'draft'
  | 'published' 
  | 'cancelled'
  | 'postponed'
  | 'completed'

// Google Maps API型
export interface GoogleMapsConfig {
  apiKey: string
  version: string
  libraries: ('maps' | 'geometry' | 'places' | 'drawing')[]
}

export interface MarkerConfig {
  position: google.maps.LatLngLiteral
  title: string
  icon?: google.maps.Icon | google.maps.Symbol
  zIndex?: number
  visible?: boolean
}

export interface MapStyle {
  featureType: string
  elementType: string
  stylers: google.maps.MapTypeStyler[]
}

// エラー型
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
  path: string
}

// バリデーション型
export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

// リクエスト型
export interface EventsQueryParams {
  page?: number
  limit?: number
  filter?: {
    time?: 'upcoming' | 'past' | 'today' | 'this_week' | 'this_month'
    category?: string
    location?: string
    organizer?: string
    status?: EventStatus
  }
  sort?: {
    field: 'startAt' | 'createdAt' | 'title' | 'attendees'
    order: 'asc' | 'desc'
  }
  search?: string
}

// 型ガード関数
export const isEventResponse = (obj: any): obj is EventResponse => {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.startAt === 'string'
}

export const isLocationValid = (location?: LocationResponse): location is Required<Pick<LocationResponse, 'geo'>> & LocationResponse => {
  return Boolean(
    location?.geo?.lat && 
    location?.geo?.lng &&
    typeof location.geo.lat === 'number' &&
    typeof location.geo.lng === 'number'
  )
}

export const isFourSApiResponse = <T>(obj: any): obj is FourSApiResponse<T> => {
  return obj && Array.isArray(obj.data)
}

// ユーティリティ型
export type EventWithValidLocation = EventResponse & {
  location: Required<Pick<LocationResponse, 'geo'>> & LocationResponse
}

export type EventListItem = Pick<EventResponse, 
  'id' | 'title' | 'startAt' | 'endAt' | 'location' | 'mainImageUrl'
> & {
  displayDate: string
  displayTime: string
  hasValidLocation: boolean
}

// 日付フィルター型の強化
export const DATE_FILTERS = ['7/1', '7/2', '7/3', '7/4'] as const
export type DateFilterValue = typeof DATE_FILTERS[number] | 'all'

// マップ状態型
export interface MapState {
  center: google.maps.LatLngLiteral
  zoom: number
  markers: google.maps.Marker[]
  infoWindow: google.maps.InfoWindow | null
  userLocation: google.maps.LatLngLiteral | null
}

// アプリケーション状態型
export interface AppState {
  events: EventResponse[]
  eventsWithLocation: EventWithValidLocation[]
  selectedEvent: EventResponse | null
  loading: boolean
  error: string | null
  dateFilter: DateFilterValue
  showBottomModal: boolean
  showShareModal: boolean
  userLocation: google.maps.LatLngLiteral | null
}
