import { useState, useEffect } from 'react'
import { EventMap } from './components/EventMap'
import { useEvents } from './hooks/useEvents'
import './App.css'

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
  const [showShareModal, setShowShareModal] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleEventFocusWithPopup = (event: any) => {
    if (!event.location?.geo?.lat || !event.location?.geo?.lng) {
      setErrorMessage('このイベントは住所が登録されていません。')
      setShowErrorPopup(true)
      return
    }
    
    if (window.focusOnEventWithPopup) {
      window.focusOnEventWithPopup(event)
    }
    setSelectedEvent(event)
  }

  const handleShare = () => setShowShareModal(true)

  const handleCopyUrl = async () => {
    const siteUrl = 'https://peaske.github.io/ivs-events-map-2025/'
    try {
      await navigator.clipboard.writeText(siteUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('コピーに失敗しました:', err)
    }
  }

  const handleSocialShare = (platform: 'facebook' | 'twitter') => {
    const siteUrl = 'https://peaske.github.io/ivs-events-map-2025/'
    let shareText = ''
    let shareUrl = ''
    
    if (platform === 'twitter') {
      shareText = `IVS Events Map 2025 〜IVSを持ち歩こう！🚶‍♀️♪〜
#IVS2025 #IVS参加表明 @IVS_Official

${siteUrl}`
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    } else if (platform === 'facebook') {
      shareText = 'IVS 2025のイベント情報をインタラクティブマップで確認できます！'
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(shareText)}`
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('位置情報がサポートされていません。')
      setShowErrorPopup(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const actualLocation = { lat: latitude, lng: longitude }
        setUserLocation(actualLocation)
        
        if (window.focusOnUserLocation) {
          window.focusOnUserLocation(actualLocation)
        }
      },
      (error) => {
        setErrorMessage('位置情報の取得に失敗しました。')
        setShowErrorPopup(true)
      }
    )
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const closeErrorPopup = () => {
    setShowErrorPopup(false)
    setErrorMessage('')
  }

  const toggleBottomModal = () => setShowBottomModal(!showBottomModal)

  // 期限切れイベントを除外する関数
  const filterActiveEvents = (eventsList: any[]) => {
    const now = new Date()
    return eventsList.filter(event => {
      const startTime = new Date(event.startAt)
      const endTime = event.endAt ? new Date(event.endAt) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000) // 終了時間がない場合は2時間後
      return endTime > now
    })
  }

  const activeEvents = filterActiveEvents(events)
  const activeEventsWithLocation = filterActiveEvents(eventsWithLocation)
  const now = new Date()

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ヘッダー（適度サイズ版） */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0, 0, 0, 0.1)', zIndex: 9999, padding: window.innerWidth <= 768 ? '6px 10px' : '8px 15px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: window.innerWidth <= 768 ? '13px' : '20px', fontWeight: 'bold', color: '#333', cursor: 'pointer', textDecoration: 'none' }} onClick={() => window.location.href = 'https://peaske.github.io/ivs-events-map-2025/'}>IVS Events Map 2025</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: window.innerWidth <= 768 ? '4px' : '7px', marginBottom: window.innerWidth <= 768 ? '4px' : '5px', flexWrap: 'wrap' }}>
          <button onClick={refetch} disabled={loading} style={{ padding: window.innerWidth <= 768 ? '4px 7px' : '5px 10px', backgroundColor: loading ? '#e0e0e0' : '#f5f5f5', color: loading ? '#999' : '#333', border: '1px solid #ddd', borderRadius: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: window.innerWidth <= 768 ? '10px' : '11px', fontWeight: '500', whiteSpace: 'nowrap' }}>
            {window.innerWidth <= 768 ? (loading ? '取得中' : '最新') : (loading ? '取得中...' : '最新データ')}
          </button>
          <button onClick={() => {
            if (window.showAllEventsOnMap) {
              window.showAllEventsOnMap()
            }
          }} style={{ padding: window.innerWidth <= 768 ? '4px 7px' : '5px 10px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '14px', cursor: 'pointer', fontSize: window.innerWidth <= 768 ? '10px' : '11px', fontWeight: '500', whiteSpace: 'nowrap' }}>全体マップ</button>
          <button onClick={getCurrentLocation} style={{ padding: window.innerWidth <= 768 ? '4px 7px' : '5px 10px', backgroundColor: userLocation ? '#34a853' : '#f5f5f5', color: userLocation ? 'white' : '#333', border: '1px solid #ddd', borderRadius: '14px', cursor: 'pointer', fontSize: window.innerWidth <= 768 ? '10px' : '11px', fontWeight: '500', whiteSpace: 'nowrap' }}>現在地</button>
          <button onClick={handleShare} title="シェア" style={{ padding: window.innerWidth <= 768 ? '4px 7px' : '5px 10px', backgroundColor: 'transparent', color: '#4285f4', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: window.innerWidth <= 768 ? '10px' : '11px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}>
            📤 シェア
          </button>
        </div>

        <div style={{ fontSize: window.innerWidth <= 768 ? '9px' : '10px', color: '#666', marginBottom: window.innerWidth <= 768 ? '3px' : '4px' }}>
          <span style={{ color: 'rgb(52, 168, 83)' }}>●</span> {activeEventsWithLocation.length}個表示中 | 更新: {now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </div>

        <p style={{ margin: '0', fontSize: window.innerWidth <= 768 ? '8px' : '9px', color: '#666' }}>
          Ⓒ2025 Created by <a href="https://x.com/peaske_en" target="_blank" rel="noopener noreferrer" style={{color: '#666', textDecoration: 'none'}}>@peaske_en</a>
        </p>
      </div>

      {/* 地図エリア */}
      <div style={{ position: 'absolute', top: window.innerWidth <= 768 ? '95px' : '105px', left: 0, right: 0, bottom: 0, backgroundColor: '#f5f5f5' }}>
        <EventMap events={activeEventsWithLocation} selectedEvent={selectedEvent} onEventSelect={setSelectedEvent} userLocation={userLocation} />
      </div>

      {/* 底部エリア */}
      <div style={{ position: 'fixed', bottom: showBottomModal ? 0 : '-32.2vh', left: 0, right: 0, height: '40vh', backgroundColor: 'white', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', transition: 'bottom 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', backgroundColor: '#113a24', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', color: 'white', minHeight: '60px' }} onClick={toggleBottomModal}>
          <div style={{ width: '40px', height: '4px', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '2px', margin: '0 auto 12px auto' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>イベント一覧</h3>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>{showBottomModal ? '▼' : '▲'} {activeEvents.length}件</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          {/* イベント統計表示エリア（スクロール内） */}
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#f8f9fa', 
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: '15px'
          }}>
            {/* 総イベント数 */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff', margin: '0 0 3px 0' }}>
                {events.length}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>総イベント</div>
            </div>
            
            {/* 地図表示数 */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745', margin: '0 0 3px 0' }}>
                {activeEventsWithLocation.length}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>地図表示</div>
            </div>
            
            {/* 座標なし */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545', margin: '0 0 3px 0' }}>
                {activeEvents.length - activeEventsWithLocation.length}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>座標なし</div>
            </div>
          </div>

          {activeEvents.map((event, index) => (
            <div key={event.id || index} style={{ padding: '12px 20px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', position: 'relative' }} onClick={() => handleEventFocusWithPopup(event)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <div style={{ position: 'absolute', top: '12px', right: '20px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: event.location?.geo?.lat && event.location?.geo?.lng ? '#34a853' : '#ea4335' }} />
              
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600', color: '#333', paddingRight: '20px', lineHeight: '1.3' }}>{event.title}</h3>
              
              {/* 開始・終了時間 */}
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>📅</span>
                <span>
                  {new Date(event.startAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })} {new Date(event.startAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  {event.endAt && (
                    <> - {new Date(event.endAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</>
                  )}
                </span>
              </div>
              
              {/* 住所情報 */}
              {event.location?.displayText && (
                <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'flex-start', gap: '4px', lineHeight: '1.4' }}>
                  <span style={{ marginTop: '1px' }}>📍</span>
                  <span style={{ flex: 1, paddingRight: '15px' }}>{event.location.displayText}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* シェアモーダル */}
      {showShareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={(e) => { if (e.target === e.currentTarget) setShowShareModal(false) }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowShareModal(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666', width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#333' }}>シェア</h3>
              <div style={{ margin: '0 auto', display: 'inline-block' }}>
                {/* QRコード画像を動的に生成するAPIを使用 */}
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://peaske.github.io/ivs-events-map-2025/')}`} alt="QRコード" style={{ width: '200px', height: '200px', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="text" value="https://peaske.github.io/ivs-events-map-2025/" readOnly style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#f8f9fa', color: '#333' }} />
                <button onClick={handleCopyUrl} style={{ padding: '12px 16px', backgroundColor: copySuccess ? '#28a745' : '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', minWidth: '80px' }}>{copySuccess ? '✓ 完了' : 'コピー'}</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => handleSocialShare('facebook')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#1877f2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Facebook</button>
              <button onClick={() => handleSocialShare('twitter')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>𝕏</button>
            </div>
          </div>
        </div>
      )}

      {/* エラーポップアップ */}
      {showErrorPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3500, padding: '20px' }} onClick={closeErrorPopup}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📍</div>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600', color: '#333' }}>住所情報がありません</h3>
            <p style={{ margin: '0 0 25px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>{errorMessage}</p>
            <button onClick={closeErrorPopup} style={{ padding: '10px 24px', backgroundColor: '#4285f4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App