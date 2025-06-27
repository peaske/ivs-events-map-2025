import { useState, useEffect } from 'react'
import { EventMap } from './components/EventMap'
import { useEvents } from './hooks/useEvents'
import './App.css'

// グローバル型定義
declare global {
  interface Window {
    focusOnEvent?: (event: any) => void;
    focusOnEventWithPopup?: (event: any) => void;
    focusOnUserLocation?: (location: {lat: number, lng: number}) => void;
  }
}

function App() {
  const { 
    events, 
    eventsWithLocation, 
    loading, 
    error, 
    selectedEvent, 
    setSelectedEvent,
    refetch 
  } = useEvents()

  const [showModal, setShowModal] = useState(false)
  const [showBottomModal, setShowBottomModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationError, setLocationError] = useState<string>('')

  const handleEventSelect = (event: any) => {
    setSelectedEvent(event)
    setShowModal(true)
  }

  const handleEventFocus = (event: any) => {
    // 座標があるかチェック
    if (!event.location?.geo?.lat || !event.location?.geo?.lng) {
      setErrorMessage('このイベントは住所が登録されていません。')
      setShowErrorPopup(true)
      return
    }
    
    // 地図にフォーカス（ピンエリアにズーム）
    if (window.focusOnEvent) {
      window.focusOnEvent(event)
    }
    setSelectedEvent(event)
  }

  const handleEventFocusWithPopup = (event: any) => {
    // 座標があるかチェック
    if (!event.location?.geo?.lat || !event.location?.geo?.lng) {
      setErrorMessage('このイベントは住所が登録されていません。')
      setShowErrorPopup(true)
      return
    }
    
    // 地図にフォーカス＋吹き出し表示
    if (window.focusOnEventWithPopup) {
      window.focusOnEventWithPopup(event)
    }
    setSelectedEvent(event)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('位置情報がサポートされていません。')
      setErrorMessage('位置情報がサポートされていません。')
      setShowErrorPopup(true)
      return
    }

    console.log('📍 位置情報取得開始...')

    // まず低精度で高速取得を試行
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const actualLocation = { lat: latitude, lng: longitude }
        setUserLocation(actualLocation)
        
        console.log('✅ 位置情報取得成功:', actualLocation, '精度:', accuracy + 'm')
        
        // 地図を現在地にフォーカス（徒歩圏内ズーム）
        if (window.focusOnUserLocation) {
          window.focusOnUserLocation(actualLocation)
        }
      },
      (error) => {
        console.error('❌ 位置情報取得エラー:', error)
        
        // 高精度モードで再試行
        console.log('🔄 高精度モードで再試行...')
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords
            const actualLocation = { lat: latitude, lng: longitude }
            setUserLocation(actualLocation)
            
            console.log('✅ 高精度位置情報取得成功:', actualLocation, '精度:', accuracy + 'm')
            
            if (window.focusOnUserLocation) {
              window.focusOnUserLocation(actualLocation)
            }
          },
          (error2) => {
            console.error('❌ 高精度位置情報も失敗:', error2)
            let errorMsg = '位置情報の取得に失敗しました。'
            switch (error2.code) {
              case error2.PERMISSION_DENIED:
                errorMsg = 'ブラウザのアドレスバー左側の位置情報アイコンをクリックして「許可」を選択してください。'
                break
              case error2.POSITION_UNAVAILABLE:
                errorMsg = '位置情報が利用できません。GPS機能をオンにしてください。'
                break
              case error2.TIMEOUT:
                errorMsg = '位置情報の取得がタイムアウトしました。WiFi接続を確認してください。'
                break
            }
            setLocationError(errorMsg)
            setErrorMessage(errorMsg)
            setShowErrorPopup(true)
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0 // キャッシュなし
          }
        )
      },
      {
        enableHighAccuracy: false, // まず低精度で高速取得
        timeout: 5000,
        maximumAge: 300000
      }
    )
  }

  // 初回自動位置取得
  useEffect(() => {
    getCurrentLocation()
  }, [])

  const closeErrorPopup = () => {
    setShowErrorPopup(false)
    setErrorMessage('')
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
  }

  const toggleBottomModal = () => {
    setShowBottomModal(!showBottomModal)
  }

  // 現在の日時を取得
  const now = new Date()
  const lastUpdated = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }) + ' ' + now.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* ヘッダーオーバーレイ */}
      <div className="header-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 
          className="app-title"
          onClick={() => window.location.href = 'https://peaske.github.io/ivs-events-map-2025/'}
        >
          IVS Events Map 2025
        </h1>
        
        <p style={{
          margin: '0 0 8px 0',
          fontSize: '12px',
          color: '#666',
          fontWeight: '400'
        }}>
          最終更新: {lastUpdated} (file)
        </p>

        <p style={{
          margin: '0 0 15px 0',
          fontSize: '12px',
          color: '#666',
          fontWeight: '400'
        }}>
          Ⓒ2025 Created by <a href="https://x.com/peaske_en" target="_blank" rel="noopener noreferrer" style={{color: '#666', textDecoration: 'none'}}>@peaske_en</a>
        </p>

        {/* ボタン群 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <button
            onClick={refetch}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#e0e0e0' : '#f5f5f5',
              color: loading ? '#999' : '#333',
              border: '1px solid #ddd',
              borderRadius: '20px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? '最新データ取得中...' : '最新データ取得'}
          </button>

          <button
            onClick={toggleBottomModal}
            style={{
              padding: '8px 16px',
              backgroundColor: showBottomModal ? '#4285f4' : '#f5f5f5',
              color: showBottomModal ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            イベント一覧
          </button>

          <button
            onClick={getCurrentLocation}
            style={{
              padding: '8px 16px',
              backgroundColor: userLocation ? '#34a853' : '#f5f5f5',
              color: userLocation ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            title={userLocation ? '現在地に移動' : '位置情報を取得'}
          >
            📍現在地 {userLocation && '✓'}
          </button>
        </div>

        {/* ステータス表示 */}
        <div style={{
          fontSize: '12px',
          color: '#666',
          fontWeight: '400'
        }}>
          <span style={{ color: 'rgb(52, 168, 83)' }}>●</span> {eventsWithLocation.length}個のイベント表示中
        </div>

        {/* エラー表示 */}
        {error && (
          <div style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            fontSize: '12px',
            border: '1px solid #ffcdd2'
          }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* 地図エリア */}
      <div className="map-wrapper" style={{ 
        position: 'absolute',
        top: 180,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f5f5f5'
      }}>
        <EventMap 
          events={eventsWithLocation}
          selectedEvent={selectedEvent}
          onEventSelect={handleEventSelect}
          userLocation={userLocation}
        />
      </div>

      {/* 底部エリア（イベント一覧テキストまで見える） */}
      <div style={{
        position: 'fixed',
        bottom: showBottomModal ? 0 : '-32.2vh', // 40vh - 7.8vh = 32.2vh隠す（9.5%表示）
        left: 0,
        right: 0,
        height: '40vh',
        backgroundColor: 'white',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        transition: 'bottom 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* ハンドルエリア（常に見える部分 - 少し大きく） */}
        <div 
          style={{
            padding: '16px 20px', // パディングを大きく
            borderBottom: '1px solid #f0f0f0',
            cursor: 'pointer',
            backgroundColor: '#113a24',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            color: 'white',
            minHeight: '60px' // 最小高さ設定
          }}
          onClick={toggleBottomModal}
        >
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: '2px',
            margin: '0 auto 12px auto'
          }} />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600'
            }}>
              イベント一覧
            </h3>
            <div style={{
              fontSize: '14px',
              opacity: 0.9
            }}>
              {showBottomModal ? '▼' : '▲'} {events.length}件
            </div>
          </div>
        </div>

        {/* イベントリストエリア */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0'
        }}>
          {/* 統計サマリー */}
          <div style={{
            padding: '20px',
            backgroundColor: '#fafafa',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4285f4' }}>
                  {events.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>総イベント</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#34a853' }}>
                  {eventsWithLocation.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>地図表示</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea4335' }}>
                  {events.length - eventsWithLocation.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>座標なし</div>
              </div>
            </div>
          </div>

          {/* イベントリスト */}
          <div style={{
            padding: '0'
          }}>
            {events.map((event, index) => (
              <div 
                key={event.id || index}
                style={{
                  padding: '12px 20px', // パディング縮小
                  borderBottom: '1px solid #f5f5f5',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  position: 'relative'
                }}
                onClick={() => {
                  // モーダル閉じる
                  setShowBottomModal(false)
                  // ピンにフォーカス＋吹き出し表示
                  handleEventFocusWithPopup(event)
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9f9f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {/* 座標ステータスインジケーター */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '20px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: event.location?.geo?.lat && event.location?.geo?.lng ? '#34a853' : '#ea4335'
                }} />

                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#333',
                  lineHeight: '1.4',
                  paddingRight: '20px'
                }}>
                  {event.title}
                </h3>
                
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    📅 {new Date(event.startAt).toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                      weekday: 'short'
                    })} {new Date(event.startAt).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {event.location?.displayText && (
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '12px',
                    color: '#888',
                    lineHeight: '1.3'
                  }}>
                    📍 {event.location.displayText}
                  </p>
                )}
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginTop: '8px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backgroundColor: event.location?.geo?.lat && event.location?.geo?.lng ? '#e8f5e8' : '#ffebee',
                    color: event.location?.geo?.lat && event.location?.geo?.lng ? '#2e7d32' : '#c62828',
                    fontWeight: '500'
                  }}>
                    {event.location?.geo?.lat && event.location?.geo?.lng ? '🗺️ 地図表示' : '📍 座標なし'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部ハンドル（スワイプエリア） */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          backgroundColor: 'transparent',
          zIndex: 1999,
          cursor: 'pointer'
        }}
        onClick={toggleBottomModal}
      />

      {/* イベント詳細モーダル */}
      {showModal && selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '20px'
        }} onClick={closeModal}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                padding: '5px',
                lineHeight: 1,
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              ×
            </button>

            <h2 style={{
              margin: '0 30px 20px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#333',
              lineHeight: '1.4'
            }}>
              {selectedEvent.title}
            </h2>

            <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              <div style={{ 
                margin: '15px 0',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                borderLeft: '3px solid #4285f4'
              }}>
                <p style={{ margin: '0', fontWeight: '500' }}>
                  📅 {new Date(selectedEvent.startAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px' }}>
                  🕐 {new Date(selectedEvent.startAt).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} 開始
                </p>
              </div>
              
              {selectedEvent.location?.displayText && (
                <div style={{ 
                  margin: '15px 0',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  borderLeft: '3px solid #34a853'
                }}>
                  <p style={{ margin: '0', fontWeight: '500' }}>
                    📍 {selectedEvent.location.displayText}
                  </p>
                  {selectedEvent.location.address && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#888' }}>
                      {selectedEvent.location.address}
                    </p>
                  )}
                </div>
              )}
              
              {selectedEvent.organizer && (
                <p style={{ margin: '15px 0' }}>
                  <strong>👥 主催:</strong> {selectedEvent.organizer}
                </p>
              )}
              
              {selectedEvent.description && (
                <div style={{ margin: '20px 0' }}>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#333' 
                  }}>
                    📋 イベント詳細
                  </h3>
                  <div style={{ 
                    padding: '15px', 
                    backgroundColor: '#fafafa', 
                    borderRadius: '8px',
                    whiteSpace: 'pre-wrap',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    border: '1px solid #eee'
                  }}>
                    {selectedEvent.description}
                  </div>
                </div>
              )}
              
              {selectedEvent.url && (
                <div style={{ margin: '25px 0 0 0', textAlign: 'center' }}>
                  <a 
                    href={selectedEvent.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '12px 24px',
                      backgroundColor: '#113a24',
                      color: '#f2f2f2',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0d2f1c'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#113a24'
                    }}
                  >
                    🔗 4Sで詳細ページを開く
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* エラーポップアップ */}
      {showErrorPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3500,
          padding: '20px'
        }} onClick={closeErrorPopup}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{
              fontSize: '48px',
              marginBottom: '15px'
            }}>
              📍
            </div>
            
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#333'
            }}>
              住所情報がありません
            </h3>
            
            <p style={{
              margin: '0 0 25px 0',
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.5'
            }}>
              {errorMessage}
            </p>
            
            <button
              onClick={closeErrorPopup}
              style={{
                padding: '10px 24px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App