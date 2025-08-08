// 📅 REFACTORED: 日付・時間フォーマット専用ユーティリティ

import { DateFilterValue } from '../../types/api'

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
    full: date,
    iso: date.toISOString(),
  }
}

/**
 * 日付範囲のフォーマット
 */
export const formatDateRange = (startDate: string, endDate?: string) => {
  const start = new Date(startDate)
  const startFormatted = formatEventDate(startDate)
  
  if (!endDate) {
    return {
      display: `${startFormatted.date} ${startFormatted.time}`,
      start: startFormatted,
      end: null,
    }
  }
  
  const end = new Date(endDate)
  const endFormatted = formatEventDate(endDate)
  
  // Same day
  if (start.toDateString() === end.toDateString()) {
    return {
      display: `${startFormatted.date} ${startFormatted.time} - ${endFormatted.time}`,
      start: startFormatted,
      end: endFormatted,
    }
  }
  
  // Different days
  return {
    display: `${startFormatted.date} ${startFormatted.time} - ${endFormatted.date} ${endFormatted.time}`,
    start: startFormatted,
    end: endFormatted,
  }
}

/**
 * 相対時間フォーマット（〜分前、〜時間前など）
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMinutes < 1) return 'たった今'
  if (diffMinutes < 60) return `${diffMinutes}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`
  
  return `${Math.floor(diffDays / 365)}年前`
}

/**
 * 有効な日付フィルター取得
 */
export const getValidDateFilters = (): DateFilterValue[] => {
  const now = new Date()
  const japanNow = new Date(now.getTime() + (9 * 60 * 60 * 1000)) // JST
  const currentMonth = japanNow.getMonth() + 1
  const currentDay = japanNow.getDate()
  
  const allDates: DateFilterValue[] = ['7/1', '7/2', '7/3', '7/4']
  
  return allDates.filter(date => {
    if (date === 'all') return true
    
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
export const eventMatchesDateFilter = (event: any, filter: DateFilterValue): boolean => {
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
    
    // 日本時間に変換
    const japanDate = new Date(eventDate.getTime() + (9 * 60 * 60 * 1000))
    const eventMonth = japanDate.getMonth() + 1
    const eventDay = japanDate.getDate()
    
    const [filterMonth, filterDay] = (filter as string).split('/').map(Number)
    
    return eventMonth === filterMonth && eventDay === filterDay
  } catch (error) {
    console.error('日付解析エラー:', error)
    return false
  }
}

/**
 * イベント期限チェック
 */
export const isEventActive = (startAt: string, endAt?: string): boolean => {
  const now = new Date()
  const startTime = new Date(startAt)
  const endTime = endAt 
    ? new Date(endAt) 
    : new Date(startTime.getTime() + 2 * 60 * 60 * 1000) // 2時間後
  
  return endTime > now
}

/**
 * 期限切れイベントフィルター
 */
export const filterActiveEvents = <T extends { startAt: string; endAt?: string }>(eventsList: T[]): T[] => {
  return eventsList.filter(event => isEventActive(event.startAt, event.endAt))
}

/**
 * 日付の妥当性チェック
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * タイムゾーン変換
 */
export const convertToTimezone = (dateString: string, timezone: string = 'Asia/Tokyo'): Date => {
  const date = new Date(dateString)
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }))
}

/**
 * 営業時間内チェック
 */
export const isWithinBusinessHours = (dateString: string, startHour: number = 9, endHour: number = 18): boolean => {
  const date = new Date(dateString)
  const hour = date.getHours()
  return hour >= startHour && hour < endHour
}

/**
 * 日付範囲チェック
 */
export const isDateInRange = (
  dateString: string, 
  rangeStart: string, 
  rangeEnd: string
): boolean => {
  const date = new Date(dateString)
  const start = new Date(rangeStart)
  const end = new Date(rangeEnd)
  
  return date >= start && date <= end
}

/**
 * 月の日数取得
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate()
}

/**
 * 週の開始日取得（月曜日基準）
 */
export const getWeekStart = (date: Date): Date => {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Monday
  return new Date(date.setDate(diff))
}

/**
 * 今日かどうかのチェック
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString)
  const today = new Date()
  
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate()
}
