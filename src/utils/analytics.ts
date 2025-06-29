// 1. public/index.html に追加するコード（<head>タグ内）
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1TKK950BW8"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-1TKK950BW8', {
    page_title: 'IVS Events Map 2025',
    page_location: window.location.href
  });
</script>

// 2. src/utils/analytics.ts（新規ファイル作成）
// カスタムイベント追跡用のユーティリティ関数

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      app_name: 'IVS Events Map 2025'
    });
  }
};

// よく使うイベント追跡関数
export const analytics = {
  // マップ操作
  trackMapZoom: (zoomLevel: number) => {
    trackEvent('map_zoom', { zoom_level: zoomLevel });
  },
  
  // ピンクリック
  trackPinClick: (eventId: string, eventTitle: string) => {
    trackEvent('pin_click', { 
      event_id: eventId,
      event_title: eventTitle
    });
  },
  
  // イベント詳細表示
  trackEventView: (eventId: string) => {
    trackEvent('event_view', { event_id: eventId });
  },
  
  // イベント一覧表示
  trackEventListOpen: () => {
    trackEvent('event_list_open');
  },
  
  // シェア機能使用（後で実装）
  trackShare: (shareType: 'qr' | 'facebook' | 'twitter' | 'copy') => {
    trackEvent('share', { share_type: shareType });
  },
  
  // 外部リンククリック
  trackExternalLink: (url: string) => {
    trackEvent('external_link_click', { destination: url });
  }
};

// 3. src/components/EventMap.tsx への追加コード例
// 既存のEventMapコンポーネントに以下のimportとイベント追跡を追加

import { analytics } from '../utils/analytics';

// マーカークリック時のイベント追跡例
const handleMarkerClick = (event: Event) => {
  analytics.trackPinClick(event.id, event.title);
  // 既存のマーカークリック処理...
};

// ズーム変更時のイベント追跡例
const handleZoomChanged = () => {
  const zoom = map.getZoom();
  analytics.trackMapZoom(zoom);
};

// 4. .env ファイルに追加（環境変数管理）
VITE_GA_MEASUREMENT_ID=G-1TKK950BW8