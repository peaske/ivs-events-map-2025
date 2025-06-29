// src/utils/analytics.ts
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
  
  // シェア機能使用
  trackShare: (shareType: 'qr' | 'facebook' | 'twitter' | 'copy') => {
    trackEvent('share', { share_type: shareType });
  },
  
  // 外部リンククリック
  trackExternalLink: (url: string) => {
    trackEvent('external_link_click', { destination: url });
  }
};