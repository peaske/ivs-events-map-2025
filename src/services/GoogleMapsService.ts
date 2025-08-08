// 🗺️ REFACTORED: Google Maps専用サービス

import { Loader } from '@googlemaps/js-api-loader'
import { MAP_CONFIG, UI_CONFIG } from '../constants'
import { easeInOutCubic, getMapOffset, isMobile, coordsEqual } from '../utils/helpers'

export class GoogleMapsService {
  private map: google.maps.Map | null = null
  private markers: google.maps.Marker[] = []
  private infoWindow: google.maps.InfoWindow | null = null
  private userMarker: google.maps.Marker | null = null

  /**
   * マップ初期化
   */
  async initializeMap(container: HTMLElement): Promise<google.maps.Map> {
    try {
      const loader = new Loader({
        apiKey: MAP_CONFIG.GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['maps']
      })

      const google = await loader.load()
      
      const mapInstance = new google.maps.Map(container, {
        center: MAP_CONFIG.DEFAULT_CENTER,
        zoom: MAP_CONFIG.DEFAULT_ZOOM,
        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        scaleControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        styles: this.getMapStyles()
      })

      const infoWindowInstance = new google.maps.InfoWindow({
        pixelOffset: new google.maps.Size(0, -10),
        disableAutoPan: false
      })
      
      this.map = mapInstance
      this.infoWindow = infoWindowInstance
      
      this.applyInfoWindowStyles()
      
      console.log('✅ Google Maps初期化完了')
      return mapInstance
      
    } catch (error) {
      console.error('❌ Google Maps初期化エラー:', error)
      throw error
    }
  }

  /**
   * マップスタイル取得
   */
  private getMapStyles(): google.maps.MapTypeStyle[] {
    return [
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
  }

  /**
   * InfoWindow スタイル適用
   */
  private applyInfoWindowStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      .gm-style-iw-c {
        box-shadow: none !important;
        border: 1px solid ${UI_CONFIG.COLORS.BORDER} !important;
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
  }

  /**
   * マーカー作成
   */
  createMarkers(events: any[], onMarkerClick: (event: any, marker: google.maps.Marker) => void): google.maps.Marker[] {
    if (!this.map || !window.google) return []

    // 既存マーカーをクリア
    this.clearMarkers()

    const eventsWithGeo = events.filter(event => 
      event.location?.geo?.lat && event.location?.geo?.lng
    )

    const newMarkers = eventsWithGeo.map(event => {
      const marker = new google.maps.Marker({
        position: {
          lat: event.location!.geo!.lat!,
          lng: event.location!.geo!.lng!
        },
        map: this.map,
        title: event.title,
        icon: {
          path: "M12,2C8.13,2 5,5.13 5,9c0,5.25 7,13 7,13s7,-7.75 7,-13C19,5.13 15.87,2 12,2z",
          fillColor: MAP_CONFIG.MARKER.FILL_COLOR,
          fillOpacity: 1,
          strokeColor: MAP_CONFIG.MARKER.STROKE_COLOR,
          strokeWeight: MAP_CONFIG.MARKER.STROKE_WEIGHT,
          scale: MAP_CONFIG.MARKER.SCALE,
          anchor: new google.maps.Point(12, 24)
        }
      })

      marker.addListener('click', () => {
        onMarkerClick(event, marker)
      })

      return marker
    })

    this.markers = newMarkers
    console.log(`✅ ${newMarkers.length}個のマーカーを作成完了`)

    return newMarkers
  }

  /**
   * マーカークリア
   */
  clearMarkers(): void {
    this.markers.forEach(marker => {
      marker.setMap(null)
      google.maps.event.clearInstanceListeners(marker)
    })
    this.markers = []
  }

  /**
   * スムーズなパン移動
   */
  smoothPanTo(targetLat: number, targetLng: number, zoomLevel: number, duration: number = 800): void {
    if (!this.map) return

    const startPos = this.map.getCenter()!
    const startZoom = this.map.getZoom()!
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeInOutCubic(progress)

      const currentLat = startPos.lat() + (targetLat - startPos.lat()) * easedProgress
      const currentLng = startPos.lng() + (targetLng - startPos.lng()) * easedProgress
      const currentZoom = startZoom + (zoomLevel - startZoom) * easedProgress

      this.map!.setCenter({ lat: currentLat, lng: currentLng })
      this.map!.setZoom(currentZoom)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  /**
   * 全イベントにフィット
   */
  fitToMarkers(): void {
    if (!this.map || this.markers.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    this.markers.forEach(marker => {
      bounds.extend(marker.getPosition()!)
    })
    
    this.map.fitBounds(bounds)
    
    // 最大ズームレベルを制限
    google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
      if (this.map!.getZoom()! > MAP_CONFIG.MAX_ZOOM_ON_FIT) {
        this.map!.setZoom(MAP_CONFIG.MAX_ZOOM_ON_FIT)
      }
    })
  }

  /**
   * イベントにフォーカス
   */
  focusOnEvent(event: any, showPopup: boolean = false): void {
    if (!this.map || !event.location?.geo?.lat || !event.location?.geo?.lng) return

    const offset = getMapOffset()
    const targetLat = event.location.geo.lat + offset.lat
    const targetLng = event.location.geo.lng + offset.lng
    const zoomLevel = isMobile() ? MAP_CONFIG.DETAIL_ZOOM.MOBILE : MAP_CONFIG.DETAIL_ZOOM.DESKTOP

    this.smoothPanTo(targetLat, targetLng, zoomLevel, 800)

    if (showPopup) {
      setTimeout(() => {
        this.showInfoWindow(event)
      }, 600)
    }
  }

  /**
   * InfoWindow表示
   */
  showInfoWindow(event: any, content?: string): void {
    if (!this.infoWindow || !this.map) return

    const targetMarker = this.markers.find(marker => {
      const position = marker.getPosition()
      return position && coordsEqual(
        { lat: position.lat(), lng: position.lng() },
        event.location.geo,
        0.0001
      )
    })

    if (targetMarker) {
      if (content) {
        this.infoWindow.setContent(content)
      }
      this.infoWindow.open(this.map, targetMarker)
    }
  }

  /**
   * InfoWindow非表示
   */
  hideInfoWindow(): void {
    if (this.infoWindow) {
      this.infoWindow.close()
    }
  }

  /**
   * ユーザー位置マーカー作成
   */
  createUserMarker(location: { lat: number; lng: number }): void {
    if (!this.map || !window.google) return

    // 既存のユーザーマーカーを削除
    if (this.userMarker) {
      this.userMarker.setMap(null)
    }

    try {
      const userMarkerInstance = new google.maps.Marker({
        position: location,
        map: this.map,
        title: '現在地',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: MAP_CONFIG.USER_MARKER.SCALE,
          fillColor: MAP_CONFIG.USER_MARKER.FILL_COLOR,
          fillOpacity: 1,
          strokeColor: MAP_CONFIG.USER_MARKER.STROKE_COLOR,
          strokeWeight: MAP_CONFIG.USER_MARKER.STROKE_WEIGHT,
          strokeOpacity: 1
        },
        zIndex: 2000,
        optimized: false
      })

      // パルスエフェクト
      new google.maps.Marker({
        position: location,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: MAP_CONFIG.USER_MARKER.FILL_COLOR,
          fillOpacity: 0.2,
          strokeColor: MAP_CONFIG.USER_MARKER.FILL_COLOR,
          strokeWeight: 1,
          strokeOpacity: 0.6
        },
        zIndex: 1999,
        optimized: false
      })

      this.userMarker = userMarkerInstance
    } catch (error) {
      console.error('❌ ユーザーマーカー作成エラー:', error)
    }
  }

  /**
   * フィルターによるマーカー表示/非表示
   */
  applyMarkerFilter(events: any[], filterFunction: (event: any) => boolean): void {
    this.markers.forEach(marker => {
      const event = events.find(e => {
        const position = marker.getPosition()
        return position && coordsEqual(
          { lat: position.lat(), lng: position.lng() },
          e.location?.geo || { lat: 0, lng: 0 },
          0.0001
        )
      })

      if (event) {
        marker.setVisible(filterFunction(event))
      } else {
        marker.setVisible(false)
      }
    })

    const visibleCount = this.markers.filter(m => m.getVisible()).length
    console.log(`✅ フィルター適用完了: 全${this.markers.length}個中 ${visibleCount}個表示`)
  }

  /**
   * リソース解放
   */
  destroy(): void {
    this.clearMarkers()
    if (this.userMarker) {
      this.userMarker.setMap(null)
    }
    if (this.infoWindow) {
      this.infoWindow.close()
    }
    this.map = null
    this.infoWindow = null
    this.userMarker = null
  }

  /**
   * ゲッター
   */
  getMap(): google.maps.Map | null {
    return this.map
  }

  getMarkers(): google.maps.Marker[] {
    return this.markers
  }

  getInfoWindow(): google.maps.InfoWindow | null {
    return this.infoWindow
  }
}

export default GoogleMapsService
