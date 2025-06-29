import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import type { Event } from '../hooks/useEvents'
import { analytics } from '../utils/analytics';

// グローバル型定義を追加
declare global {
  interface Window {
    focusOnEvent?: (event: any) => void;
    focusOnEventWithPopup?: (event: any) => void;
    focusOnUserLocation?: (location: {lat: number, lng: number}) => void;
    showImageModal?: (imageUrl: string, eventTitle: string) => void;
    showAllEventsOnMap?: () => void;
  }
}

interface EventMapProps {
  events: Event[]
  selectedEvent: Event | null
  onEventSelect: (event: Event) => void
  userLocation?: {lat: number, lng: number} | null
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyDAPia8Rfqck7my2z3Wj1NkBqLornWFutk'

// 画像キャッシュとプリロード管理
class ImageCache {
  private cache = new Map<string, HTMLImageElement>()
  private loading = new Set<string>()

  async preloadImage(url: string): Promise<HTMLImageElement> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }

    if (this.loading.has(url)) {
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (this.cache.has(url)) {
            resolve(this.cache.get(url)!)
          } else {
            setTimeout(checkLoading, 50)
          }
        }
        checkLoading()
      })
    }

    this.loading.add(url)

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        this.cache.set(url, img)
        this.loading.delete(url)
        resolve(img)
      }
      
      img.onerror = () => {
        this.loading.delete(url)
        reject(new Error(`Failed to load image: ${url}`))
      }
      
      img.src = url
    })
  }

  getCachedImage(url: string): HTMLImageElement | null {
    return this.cache.get(url) || null
  }

  isLoading(url: string): boolean {
    return this.loading.has(url)
  }
}

const imageCache = new ImageCache()

export const EventMap: React.FC<EventMapProps> = ({ 
  events, 
  selectedEvent, 
  onEventSelect,
  userLocation 
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null)
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // イベント画像のプリロード
  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = events
        .filter(event => event.mainImageUrl)
        .map(event => event.mainImageUrl!)
      
      const chunks = []
      for (let i = 0; i < imageUrls.length; i += 5) {
        chunks.push(imageUrls.slice(i, i + 5))
      }

      for (const chunk of chunks) {
        await Promise.allSettled(
          chunk.map(url => imageCache.preloadImage(url))
        )
      }
    }

    if (events.length > 0) {
      preloadImages()
    }
  }, [events])

  // 最適化された画像表示コンポーネント
  const createOptimizedImage = (imageUrl: string, eventTitle: string): string => {
    const cachedImage = imageCache.getCachedImage(imageUrl)
    const isLoading = imageCache.isLoading(imageUrl)
    
    if (cachedImage) {
      return `
        <img 
          src="${imageUrl}" 
          style="
            width: 100%; 
            height: 120px; 
            object-fit: cover; 
            border-radius: 6px;
            border: 1px solid #f0f0f0;
            cursor: pointer;
            transition: opacity 0.2s ease;
            background-color: #f8f9fa;
          " 
          alt="${eventTitle}"
          onclick="
            this.style.opacity = '0.8';
            setTimeout(() => this.style.opacity = '1', 200);
            window.showImageModal('${imageUrl}', '${eventTitle.replace(/'/g, "\\'")}');
          "
          onmouseover="this.style.opacity = '0.9'"
          onmouseout="this.style.opacity = '1'"
        />
      `
    } else if (isLoading) {
      return `
        <div style="
          width: 100%; 
          height: 120px; 
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
          border: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 12px;
        ">
          📸 読み込み中...
        </div>
        <style>
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        </style>
      `
    } else {
      return `
        <div style="
          width: 100%; 
          height: 120px; 
          background-color: #f8f9fa;
          border: 2px dashed #ddd;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 12px;
          cursor: pointer;
        " onclick="
          this.innerHTML = '<div style=\\'font-size: 10px;\\'>📸 読み込み中...</div>';
          imageCache.preloadImage('${imageUrl}').then(() => {
            location.reload();
          });
        ">
          📸 画像を読み込む
        </div>
      `
    }
  }

  // 画像拡大モーダル表示関数
  const showImageModal = (imageUrl: string, eventTitle: string) => {
    const existingModal = document.getElementById('image-modal')
    if (existingModal) {
      existingModal.remove()
    }

    const modal = document.createElement('div')
    modal.id = 'image-modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      cursor: pointer;
    `

    const loadingDiv = document.createElement('div')
    loadingDiv.style.cssText = `
      color: white;
      font-size: 18px;
      text-align: center;
    `
    loadingDiv.innerHTML = '📸 画像を読み込み中...'
    modal.appendChild(loadingDiv)

    const img = document.createElement('img')
    img.alt = eventTitle
    img.style.cssText = `
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      transform: scale(0.8);
      transition: transform 0.3s ease;
      display: none;
    `

    const cachedImage = imageCache.getCachedImage(imageUrl)
    if (cachedImage) {
      img.src = imageUrl
      loadingDiv.style.display = 'none'
      img.style.display = 'block'
    } else {
      imageCache.preloadImage(imageUrl).then(() => {
        img.src = imageUrl
        loadingDiv.style.display = 'none'
        img.style.display = 'block'
      }).catch(() => {
        loadingDiv.innerHTML = '❌ 画像の読み込みに失敗しました'
      })
    }

    const closeButton = document.createElement('button')
    closeButton.innerHTML = 'X'
    closeButton.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
      font-family: system-ui, -apple-system, sans-serif;
      color: #333;
    `

    const closeModal = () => {
      modal.style.opacity = '0'
      img.style.transform = 'scale(0.8)'
      setTimeout(() => {
        modal.remove()
      }, 300)
    }

    modal.addEventListener('click', closeModal)
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation()
      closeModal()
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    modal.appendChild(img)
    modal.appendChild(closeButton)
    document.body.appendChild(modal)

    setTimeout(() => {
      modal.style.opacity = '1'
      img.style.transform = 'scale(1)'
    }, 10)
  }

  // 4S Event URL構築関数
  const build4SEventUrl = (event: any): string | null => {
    if (event.slug) {
      return `https://4s.link/ja/${event.slug}`
    }
    if (event.id) {
      return `https://4s.link/ja/${event.id}`
    }
    return null
  }

  // 強化版InfoWindow HTML生成関数
  const createEnhancedInfoWindow = (event: any): string => {
    const eventDate = new Date(event.startAt)
    const eventUrl = build4SEventUrl(event)
    const isMobileDevice = isMobile()
    
    const imageSection = event.mainImageUrl ? `
      <div style="margin-bottom: 12px;">
        ${createOptimizedImage(event.mainImageUrl, event.title)}
      </div>
    ` : ''
    
    const buttonSection = eventUrl ? `
      <div style="margin-top: 12px; text-align: center;">
        <button 
          onclick="window.open('${eventUrl}', '_blank')"
          style="
            background-color: #38c37b;
            color: white;
            border: none;
            padding: ${isMobileDevice ? '6px 12px' : '8px 16px'};
            border-radius: 6px;
            font-size: ${isMobileDevice ? '11px' : '12px'};
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s ease;
          "
          onmouseover="this.style.backgroundColor='#2ea169'"
          onmouseout="this.style.backgroundColor='#38c37b'"
        >
          4Sで詳細を見る
        </button>
      </div>
    ` : ''

    return `
      <div style="
        background: white; 
        border-radius: 8px; 
        padding: 15px; 
        max-width: ${isMobileDevice ? '250px' : '280px'}; 
        position: relative;
        margin-bottom: 8px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        ${imageSection}
        
        <h3 style="
          margin: 0 0 8px 0; 
          font-size: ${isMobileDevice ? '13px' : '14px'}; 
          font-weight: 600; 
          color: #333;
          line-height: 1.3;
        ">${event.title}</h3>
        
        <p style="
          margin: 4px 0; 
          font-size: ${isMobileDevice ? '11px' : '12px'}; 
          color: #666;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          📅 ${eventDate.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric'
          })} ${eventDate.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        
        ${event.location?.displayText ? `
          <p style="
            margin: 4px 0 0 0; 
            font-size: ${isMobileDevice ? '11px' : '12px'}; 
            color: #666;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            📍 ${event.location.displayText}
          </p>
        ` : ''}
        
        ${buttonSection}
      </div>
    `
  }

  // スムーズな地図移動関数
  const smoothPanTo = (targetLat: number, targetLng: number, zoomLevel: number, duration: number = 1000) => {
    if (!map) return

    const startPos = map.getCenter()!
    const startZoom = map.getZoom()!
    const startTime = Date.now()

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeInOutCubic(progress)

      const currentLat = startPos.lat() + (targetLat - startPos.lat()) * easedProgress
      const currentLng = startPos.lng() + (targetLng - startPos.lng()) * easedProgress
      const currentZoom = startZoom + (zoomLevel - startZoom) * easedProgress

      map.setCenter({ lat: currentLat, lng: currentLng })
      map.setZoom(currentZoom)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  // モバイル判定とオフセット計算
  const isMobile = () => window.innerWidth <= 768
  const getMapOffset = () => {
    if (isMobile()) {
      return { lat: 0.002, lng: 0 }
    }
    return { lat: 0, lng: 0 }
  }

  // Google Maps初期化
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return

      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['maps']
        })

        const google = await loader.load()
        
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 35.6762, lng: 139.6503 },
          zoom: 6,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_LEFT,
            mapTypeIds: [
              google.maps.MapTypeId.ROADMAP,
              google.maps.MapTypeId.SATELLITE
            ]
          },
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          scaleControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          styles: [
            {
              featureType: 'water',
              elementType: 'geometry.fill',
              stylers: [{ color: '#a2daf2' }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry.fill',
              stylers: [{ color: '#abce83' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }]
            }
          ]
        })

        const infoWindowInstance = new google.maps.InfoWindow({
          pixelOffset: new google.maps.Size(0, -10),
          disableAutoPan: false
        })
        
        setMap(mapInstance)
        setInfoWindow(infoWindowInstance)
        
        const style = document.createElement('style')
        style.textContent = `
          .gm-style-iw-c {
            box-shadow: none !important;
            border: 1px solid #e0e0e0 !important;
            border-radius: 8px !important;
            padding: 0 !important;
          }
          .gm-style-iw-d {
            overflow: hidden !important;
          }
          .gm-style-iw-t::after {
            display: none !important;
          }
        `
        document.head.appendChild(style)
        
        console.log('✅ Google Maps初期化完了')
        
      } catch (error) {
        console.error('❌ Google Maps初期化エラー:', error)
      }
    }

    initMap()
  }, [])

  // マーカー更新
  useEffect(() => {
    if (!map || !window.google) return

    markers.forEach(marker => marker.setMap(null))
    setMarkers([])

    const newMarkers = events
      .filter(event => event.location?.geo?.lat && event.location?.geo?.lng)
      .map(event => {
        const marker = new google.maps.Marker({
          position: {
            lat: event.location!.geo!.lat!,
            lng: event.location!.geo!.lng!
          },
          map: map,
          title: event.title,
          icon: {
            path: "M12,2C8.13,2 5,5.13 5,9c0,5.25 7,13 7,13s7,-7.75 7,-13C19,5.13 15.87,2 12,2z",
            fillColor: '#ea4335',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1.2,
            anchor: new google.maps.Point(12, 24)
          }
        })

        marker.addListener('click', () => {
          const offset = getMapOffset()
          const targetLat = event.location!.geo!.lat! + offset.lat
          const targetLng = event.location!.geo!.lng! + offset.lng
          
          const zoomLevel = isMobile() ? 16 : 19
          
          smoothPanTo(targetLat, targetLng, zoomLevel, 800)
          
          if (infoWindow) {
            infoWindow.close()
            infoWindow.setContent(createEnhancedInfoWindow(event))
            infoWindow.open(map, marker)
          }
        })

        return marker
      })

    setMarkers(newMarkers)
    
    console.log(`📍 ${newMarkers.length}個のマーカーを配置`)

    if (newMarkers.length > 0 && isInitialLoad) {
      const bounds = new google.maps.LatLngBounds()
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!)
      })
      map.fitBounds(bounds)
      
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom()! > 15) {
          map.setZoom(15)
        }
      })
      
      setIsInitialLoad(false)
    }

  }, [map, events, onEventSelect, infoWindow])

  // 外部からのイベントフォーカス機能を追加
  useEffect(() => {
    window.showImageModal = showImageModal
    
    window.showAllEventsOnMap = () => {
      if (!map || markers.length === 0) return
      
      const bounds = new google.maps.LatLngBounds()
      markers.forEach(marker => {
        bounds.extend(marker.getPosition()!)
      })
      map.fitBounds(bounds)
      
      if (infoWindow) {
        infoWindow.close()
      }
    }
    
    window.focusOnEvent = (event: any) => {
      if (!map || !event.location?.geo?.lat || !event.location?.geo?.lng) return
      
      const offset = getMapOffset()
      const targetLat = event.location.geo.lat + offset.lat
      const targetLng = event.location.geo.lng + offset.lng
      const zoomLevel = isMobile() ? 15 : 17
      
      smoothPanTo(targetLat, targetLng, zoomLevel, 600)
    }
    
    window.focusOnEventWithPopup = (event: any) => {
      if (!map || !event.location?.geo?.lat || !event.location?.geo?.lng) return
      
      const offset = getMapOffset()
      const targetLat = event.location.geo.lat + offset.lat
      const targetLng = event.location.geo.lng + offset.lng
      const zoomLevel = isMobile() ? 16 : 19
      
      smoothPanTo(targetLat, targetLng, zoomLevel, 800)
      
      setTimeout(() => {
        const targetMarker = markers.find(marker => {
          const position = marker.getPosition()
          return position && 
                 Math.abs(position.lat() - event.location.geo.lat) < 0.0001 &&
                 Math.abs(position.lng() - event.location.geo.lng) < 0.0001
        })
        
        if (targetMarker && infoWindow) {
          infoWindow.setContent(createEnhancedInfoWindow(event))
          infoWindow.open(map, targetMarker)
        }
      }, 600)
    }
    
    window.focusOnUserLocation = (location: {lat: number, lng: number}) => {
      if (!map) return
      
      const offset = getMapOffset()
      const targetLat = location.lat + offset.lat
      const targetLng = location.lng + offset.lng
      
      smoothPanTo(targetLat, targetLng, 15, 700)
    }
  }, [map, markers, infoWindow])

  // 現在地マーカーの更新
  useEffect(() => {
    if (!map || !userLocation || !window.google) return
    
    if (userMarker) {
      userMarker.setMap(null)
    }
    
    try {
      const newUserMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: '現在地',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#1a73e8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 4,
          strokeOpacity: 1
        },
        zIndex: 2000,
        optimized: false
      })
      
      const pulseMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#1a73e8',
          fillOpacity: 0.2,
          strokeColor: '#1a73e8',
          strokeWeight: 1,
          strokeOpacity: 0.6
        },
        zIndex: 1999,
        optimized: false
      })
      
      setUserMarker(newUserMarker)
      
    } catch (error) {
      console.error('❌ マーカー作成エラー:', error)
    }
  }, [map, userLocation])

  // 選択されたイベントにフォーカス
  useEffect(() => {
    if (!map || !selectedEvent || !selectedEvent.location?.geo?.lat || !selectedEvent.location?.geo?.lng) return

    const offset = getMapOffset()
    map.setCenter({
      lat: selectedEvent.location.geo.lat + offset.lat,
      lng: selectedEvent.location.geo.lng + offset.lng
    })
    map.setZoom(isMobile() ? 15 : 17)

  }, [map, selectedEvent])

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5' 
      }}
    />
  )
}