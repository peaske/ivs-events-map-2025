// 🎨 REFACTORED: UI設定専用定数

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1440,
  WIDE: 1920,
} as const

export const LAYOUT_CONFIG = {
  HEADER: {
    HEIGHT_MOBILE: 120,
    HEIGHT_DESKTOP: 140,
    TOP_OFFSET_MOBILE: 13,
    TOP_OFFSET_DESKTOP: 19,
    BORDER_RADIUS: 20,
    Z_INDEX: 1000,
  },

  MODAL: {
    BOTTOM_HEIGHT: 40, // vh
    VISIBLE_HEIGHT: 32.2, // vh  
    PEEK_HEIGHT: 7.8, // vh
    BORDER_RADIUS: 16,
    Z_INDEX: 2000,
    TRANSITION_DURATION: 400, // ms
  },

  FILTER_BUTTONS: {
    SIZE_MOBILE: 40,
    SIZE_DESKTOP: 48,
    LEFT_OFFSET: 20,
    GAP: 8,
    Z_INDEX: 1000,
  },

  MAP: {
    Z_INDEX: 1,
    MIN_HEIGHT: '100vh',
  },
} as const

export const TYPOGRAPHY = {
  FONT_FAMILY: 'system-ui, -apple-system, sans-serif',
  
  FONT_SIZES: {
    XS: 10,
    SM: 11, 
    BASE: 12,
    MD: 14,
    LG: 16,
    XL: 18,
    '2XL': 22,
    '3XL': 24,
  },

  FONT_WEIGHTS: {
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
  },

  LINE_HEIGHTS: {
    TIGHT: 1.2,
    NORMAL: 1.4,
    RELAXED: 1.6,
  },
} as const

export const COLORS = {
  PRIMARY: '#1a73e8',
  SUCCESS: '#38c37b',
  SUCCESS_HOVER: '#2ea169',
  ERROR: '#ea4335',
  WARNING: '#fbbc04',

  BACKGROUND: '#ffffff',
  BACKGROUND_SECONDARY: '#f8f9fa',
  BACKGROUND_OVERLAY: 'rgba(0, 0, 0, 0.5)',
  BACKGROUND_OVERLAY_DARK: 'rgba(0, 0, 0, 0.8)',

  BORDER: '#e0e0e0',
  BORDER_LIGHT: '#f0f0f0',

  TEXT_PRIMARY: '#3c4043',
  TEXT_SECONDARY: '#5f6368', 
  TEXT_MUTED: '#666',
  TEXT_INVERSE: '#ffffff',

  SHADOW: 'rgba(0, 0, 0, 0.15)',
  SHADOW_LIGHT: 'rgba(0, 0, 0, 0.05)',
  SHADOW_DARK: 'rgba(0, 0, 0, 0.3)',

  // Map specific colors
  MAP_WATER: '#a2daf2',
  MAP_LANDSCAPE: '#abce83',
  MAP_ROAD: '#ffffff',
} as const

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  '2XL': 24,
  '3XL': 30,
} as const

export const BORDER_RADIUS = {
  SM: 6,
  MD: 8,
  LG: 12,
  XL: 16,
  '2XL': 20,
  FULL: '50%',
} as const

export const SHADOWS = {
  SM: '0 1px 2px rgba(0, 0, 0, 0.05)',
  MD: '0 2px 4px rgba(0, 0, 0, 0.15)',
  LG: '0 4px 8px rgba(0, 0, 0, 0.15)',
  XL: '0 8px 16px rgba(0, 0, 0, 0.15)',
  '2XL': '0 10px 25px rgba(0, 0, 0, 0.3)',
} as const

export const TRANSITIONS = {
  FAST: '0.2s ease',
  NORMAL: '0.3s ease',
  SLOW: '0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
} as const

export const Z_INDEX = {
  MAP: 1,
  HEADER: 1000,
  FILTER_BUTTONS: 1000,
  MODAL: 2000,
  OVERLAY: 3000,
  IMAGE_MODAL: 10000,
} as const

export const MAP_STYLES = {
  DEFAULT_CENTER: { lat: 35.6762, lng: 139.6503 },
  DEFAULT_ZOOM: 6,
  MAX_ZOOM_ON_FIT: 15,
  
  DETAIL_ZOOM: {
    MOBILE: 16,
    DESKTOP: 19,
  },
  
  USER_LOCATION_ZOOM: 15,
  
  MARKER: {
    FILL_COLOR: '#ea4335',
    STROKE_COLOR: '#ffffff',
    STROKE_WEIGHT: 2,
    SCALE: 1.54, // 80% of original
    PATH: "M12,2C8.13,2 5,5.13 5,9c0,5.25 7,13 7,13s7,-7.75 7,-13C19,5.13 15.87,2 12,2z",
  },

  USER_MARKER: {
    SCALE: 12,
    PULSE_SCALE: 20,
    FILL_COLOR: '#1a73e8',
    STROKE_COLOR: '#ffffff',
    STROKE_WEIGHT: 4,
  },

  ANIMATION: {
    PAN_DURATION: 800, // ms
    PAN_DELAY: 600, // ms
  },
} as const

export const RESPONSIVE_CONFIG = {
  MOBILE_HEADER_FONT_SIZE: TYPOGRAPHY.FONT_SIZES.XL,
  DESKTOP_HEADER_FONT_SIZE: TYPOGRAPHY.FONT_SIZES['2XL'],
  
  MOBILE_BUTTON_FONT_SIZE: TYPOGRAPHY.FONT_SIZES.BASE,
  DESKTOP_BUTTON_FONT_SIZE: TYPOGRAPHY.FONT_SIZES.MD,
  
  MOBILE_PADDING: SPACING.MD,
  DESKTOP_PADDING: SPACING.LG,
} as const

export const ANIMATION_KEYFRAMES = {
  FADE_IN: 'fadeIn 0.5s ease',
  SLIDE_UP: 'slideUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  PULSE: 'pulse 2s infinite',
  SHIMMER: 'shimmer 1.5s infinite',
} as const

// レスポンシブヘルパー関数用の設定
export const RESPONSIVE_HELPERS = {
  isMobile: () => window.innerWidth <= BREAKPOINTS.MOBILE,
  isTablet: () => window.innerWidth > BREAKPOINTS.MOBILE && window.innerWidth <= BREAKPOINTS.TABLET,
  isDesktop: () => window.innerWidth > BREAKPOINTS.TABLET,
  
  getHeaderTopOffset: () => window.innerWidth <= BREAKPOINTS.MOBILE 
    ? LAYOUT_CONFIG.HEADER.TOP_OFFSET_MOBILE 
    : LAYOUT_CONFIG.HEADER.TOP_OFFSET_DESKTOP,
    
  getHeaderFontSize: () => window.innerWidth <= BREAKPOINTS.MOBILE
    ? RESPONSIVE_CONFIG.MOBILE_HEADER_FONT_SIZE
    : RESPONSIVE_CONFIG.DESKTOP_HEADER_FONT_SIZE,
} as const
