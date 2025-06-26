import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export interface Event {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  location?: {
    displayText?: string;
    address?: string;
    geo?: {
      lat: number;
      lng: number;
    };
  };
  organizer?: string;
  url?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🚀 4S API呼び出し開始...')
      
      const response = await axios.get(
        'https://api.4s.link/events?filter%3Atime=upcoming&limit=500&page=1',
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )
      
      console.log('✅ API Response:', response.data)
      
      let eventData: Event[] = []
      
      if (response.data && Array.isArray(response.data)) {
        eventData = response.data
      } else if (response.data.events && Array.isArray(response.data.events)) {
        eventData = response.data.events
      } else if (response.data.data && Array.isArray(response.data.data)) {
        eventData = response.data.data
      }
      
      // 座標があるイベントのみフィルタリング
      const eventsWithLocation = eventData.filter(event => 
        event.location?.lat && event.location?.lng
      )
      
      console.log(`📍 座標付きイベント: ${eventsWithLocation.length}/${eventData.length}件`)
      
      setEvents(eventData) // 全イベントを保存
      
    } catch (err: any) {
      console.error('❌ API Error:', err)
      setError(`API接続エラー: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  // 1時間毎の自動更新
  useEffect(() => {
    fetchEvents()
    
    const interval = setInterval(() => {
      console.log('🔄 1時間毎の自動更新実行')
      fetchEvents()
    }, 60 * 60 * 1000) // 1時間 = 60分 * 60秒 * 1000ms
    
    return () => clearInterval(interval)
  }, [fetchEvents])

  // 座標があるイベントのみ取得
  const eventsWithLocation = events.filter(event => 
    event.location?.geo?.lat && event.location?.geo?.lng
  )

  return {
    events,
    eventsWithLocation,
    loading,
    error,
    selectedEvent,
    setSelectedEvent,
    refetch: fetchEvents
  }
}