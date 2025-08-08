// 🖥️ REFACTORED: DOM操作専用ユーティリティ

import { BREAKPOINTS } from '../../constants/ui'

/**
 * デバイス判定
 */
export const isMobile = (): boolean => window.innerWidth <= BREAKPOINTS.MOBILE
export const isTablet = (): boolean => window.innerWidth > BREAKPOINTS.MOBILE && window.innerWidth <= BREAKPOINTS.TABLET
export const isDesktop = (): boolean => window.innerWidth > BREAKPOINTS.TABLET

/**
 * レスポンシブ値取得
 */
export const getResponsiveValue = <T>(mobileValue: T, desktopValue: T): T => {
  return isMobile() ? mobileValue : desktopValue
}

export const getResponsiveValueWithTablet = <T>(mobileValue: T, tabletValue: T, desktopValue: T): T => {
  if (isMobile()) return mobileValue
  if (isTablet()) return tabletValue
  return desktopValue
}

/**
 * クリップボード操作
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('コピーに失敗しました:', err)
    // フォールバック処理
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackErr) {
      console.error('フォールバックコピーも失敗:', fallbackErr)
      return false
    }
  }
}

/**
 * スクロール制御
 */
export const disableScroll = (): void => {
  document.body.classList.add('no-scroll')
  document.body.style.overflow = 'hidden'
}

export const enableScroll = (): void => {
  document.body.classList.remove('no-scroll')
  document.body.style.overflow = ''
}

/**
 * 要素の表示/非表示制御
 */
export const showElement = (element: HTMLElement): void => {
  element.style.display = ''
  element.setAttribute('aria-hidden', 'false')
}

export const hideElement = (element: HTMLElement): void => {
  element.style.display = 'none'
  element.setAttribute('aria-hidden', 'true')
}

/**
 * フォーカス管理
 */
export const trapFocus = (container: HTMLElement): void => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  container.addEventListener('keydown', handleTabKey)
  firstElement?.focus()
}

/**
 * 外部クリック検知
 */
export const onClickOutside = (element: HTMLElement, callback: () => void): (() => void) => {
  const handleClick = (event: MouseEvent) => {
    if (!element.contains(event.target as Node)) {
      callback()
    }
  }

  document.addEventListener('mousedown', handleClick)
  
  // クリーンアップ関数を返す
  return () => {
    document.removeEventListener('mousedown', handleClick)
  }
}

/**
 * エスケープキー検知
 */
export const onEscapeKey = (callback: () => void): (() => void) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      callback()
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * 要素のサイズ取得
 */
export const getElementSize = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
  }
}

/**
 * ビューポート内判定
 */
export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * スムーススクロール
 */
export const smoothScrollTo = (targetY: number, duration: number = 500): void => {
  const startY = window.pageYOffset
  const distance = targetY - startY
  const startTime = performance.now()

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  const animateScroll = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeInOutCubic(progress)

    window.scrollTo(0, startY + distance * easedProgress)

    if (progress < 1) {
      requestAnimationFrame(animateScroll)
    }
  }

  requestAnimationFrame(animateScroll)
}

/**
 * 要素への自動スクロール
 */
export const scrollToElement = (element: HTMLElement, offset: number = 0): void => {
  const elementTop = element.offsetTop - offset
  smoothScrollTo(elementTop)
}

/**
 * 画像の遅延読み込み
 */
export const lazyLoadImage = (img: HTMLImageElement, src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

/**
 * CSS変数の動的設定
 */
export const setCSSVariable = (variable: string, value: string): void => {
  document.documentElement.style.setProperty(variable, value)
}

export const getCSSVariable = (variable: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
}

/**
 * デバウンス処理
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
 * スロットル処理
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * リサイズ監視
 */
export const observeResize = (element: HTMLElement, callback: (entry: ResizeObserverEntry) => void): (() => void) => {
  if (!window.ResizeObserver) {
    // フォールバック: window resize
    const handleResize = () => callback({} as ResizeObserverEntry)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }

  const observer = new ResizeObserver(entries => {
    entries.forEach(callback)
  })
  
  observer.observe(element)
  
  return () => observer.disconnect()
}

/**
 * 交差監視（Intersection Observer）
 */
export const observeIntersection = (
  elements: HTMLElement[],
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): (() => void) => {
  const observer = new IntersectionObserver(callback, {
    threshold: 0.1,
    ...options,
  })

  elements.forEach(element => observer.observe(element))
  
  return () => observer.disconnect()
}

/**
 * タッチイベントの検出
 */
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * ブラウザ情報取得
 */
export const getBrowserInfo = () => {
  const ua = navigator.userAgent
  return {
    isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
    isChrome: /Chrome/.test(ua) && !/Edge/.test(ua),
    isFirefox: /Firefox/.test(ua),
    isEdge: /Edge/.test(ua),
    isMobile: isMobile(),
    isTouch: isTouchDevice(),
  }
}
