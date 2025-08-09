import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <header style={{ 
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ 
          margin: '0 0 1rem 0',
          fontSize: '2.5rem',
          color: '#333',
          fontWeight: '600'
        }}>
          IVS Events Map 2025
        </h1>
        
        <p style={{
          margin: '0 0 2rem 0',
          fontSize: '1.2rem',
          color: '#666',
          lineHeight: '1.6'
        }}>
          🎉 GitHub Pages デプロイ成功！<br />
          IVSイベントマップが正常に表示されています
        </p>
        
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => setCount(count + 1)}
            style={{
              padding: '12px 24px',
              fontSize: '1.1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            クリック数: {count}
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{
            padding: '1rem',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: '600', color: '#2d5a2d' }}>デプロイ成功</div>
          </div>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#e8f0ff',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
            <div style={{ fontWeight: '600', color: '#1a4b8c' }}>React動作</div>
          </div>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#fff8e8',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
            <div style={{ fontWeight: '600', color: '#8c6900' }}>URL正常</div>
          </div>
        </div>
        
        <footer style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          Created by @peaske_en | IVS Events Map 2025
        </footer>
      </header>
    </div>
  )
}

export default App