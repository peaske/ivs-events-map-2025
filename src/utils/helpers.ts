// 🔧 REFACTORED: 共通ユーティリティ関数

import { UI_CONFIG, ERROR_MESSAGES } from '../constants'

/**
 * デバイス判定
 */
export const isMobile = (): boolean => window.innerWidth <= UI_CONFIG.BREAKPOINTS.MOBILE

/**
 * 地図オフセット計算
 */
export const getMapOffset = () => {
  if (isMobile()) {
    return { lat: 0.002, lng: 0 }
  }
  return { lat: 0, lng: 0 }
}

/**
 * レスポンシブ値取得
 */
export const getResponsiveValue = <T>(mobileValue: T, desktopValue: T): T => {
  return isMobile() ? mobileValue : desktopValue
}

/**
 * 日付フォーマット
 */
export const formatEventDate = (dateString: string) => {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    }),
    time: date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    full: date
  }
}

/**
 * 4S Event URL構築
 */
export const build4SEventUrl = (event: any): string | null => {
  if (event.slug) {
    return `https://4s.link/ja/${event.slug}`
  }
  if (event.id) {
    return `https://4s.link/ja/${event.id}`
  }
  return null
}

/**
 * イージング関数
 */
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * クリップボードにコピー
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error(ERROR_MESSAGES.COPY_FAILED, err)
    return false
  }
}

/**
 * ソーシャルシェアURL生成
 */
export const generateShareUrl = (platform: 'facebook' | 'twitter', siteUrl: string, text: string): string => {
  if (platform === 'twitter') {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
  } else if (platform === 'facebook') {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(text)}`
  }
  throw new Error(`Unsupported platform: ${platform}`)
}

/**
 * 期限切れイベントフィルター
 */
export const filterActiveEvents = (eventsList: any[]) => {
  const now = new Date()
  return eventsList.filter(event => {
    const startTime = new Date(event.startAt)
    const endTime = event.endAt 
      ? new Date(event.endAt) 
      : new Date(startTime.getTime() + 2 * 60 * 60 * 1000) // 2時間後
    return endTime > now
  })
}

/**
 * 有効な日付フィルター取得
 */
export const getValidDateFilters = () => {
  const now = new Date()
  const japanNow = new Date(now.getTime() + (9 * 60 * 60 * 1000)) // JST
  const currentMonth = japanNow.getMonth() + 1
  const currentDay = japanNow.getDate()
  
  const allDates = ['7/1', '7/2', '7/3', '7/4'] as const
  
  return allDates.filter(date => {
    const [month, day] = date.split('/').map(Number)
    if (month === currentMonth) {
      return day >= currentDay
    }
    return month > currentMonth
  })
}

/**
 * 日付フィルターマッチング
 */
export const eventMatchesDateFilter = (event: any, filter: string): boolean => {
  if (filter === 'all') return true
  
  try {
    let eventDate: Date
    
    if (typeof event.startAt === 'string') {
      eventDate = new Date(event.startAt)
    } else if (typeof event.startAt === 'number') {
      eventDate = event.startAt > 1000000000000 
        ? new Date(event.startAt) 
        : new Date(event.startAt * 1000)
    } else {
      eventDate = new Date(event.startAt)
    }
    
    const japanDate = new Date(eventDate.getTime() + (9 * 60 * 60 * 1000))
    const eventMonth = japanDate.getMonth() + 1
    const eventDay = japanDate.getDate()
    
    const [filterMonth, filterDay] = filter.split('/').map(Number)
    
    return eventMonth === filterMonth && eventDay === filterDay
  } catch (error) {
    console.error('日付解析エラー:', error)
    return false
  }
}

/**
 * デバウンス関数
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * 数値範囲チェック
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

/**
 * 座標の近似比較
 */
export const coordsEqual = (
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number },
  tolerance: number = 0.0001
): boolean => {
  return (
    Math.abs(coord1.lat - coord2.lat) < tolerance &&
    Math.abs(coord1.lng - coord2.lng) < tolerance
  )
}

/**
 * QRコードURL生成
 */
export const generateQRCodeUrl = (data: string, size: string = '200x200'): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(data)}`
}
