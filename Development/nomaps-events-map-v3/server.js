import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.static('.'));

// index.html with API key injection
app.get('/', (req, res) => {
  let html = readFileSync('index.html', 'utf8');
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  html = html.replace('YOUR_GOOGLE_MAPS_API_KEY', apiKey);
  console.log(`🗺️ Google Maps API key injection: ${apiKey ? 'Success' : 'Failed - No API key'}`);
  res.send(html);
});

// Luma APIからイベント取得 + 住所→緯度経度変換
app.get('/api/events', async (req, res) => {
  try {
    console.log('🔄 Fetching events from Luma API...');
    
    // Luma API呼び出し
    const lumaResponse = await axios.get(
      'https://public-api.luma.com/v1/calendar/list-events',
      {
        params: { calendar_id: process.env.LUMA_CALENDAR_ID },
        headers: { 'x-luma-api-key': process.env.LUMA_API_KEY },
        timeout: 10000
      }
    );

    const events = lumaResponse.data.entries || [];
    console.log(`✅ ${events.length} events from Luma`);
    
    // デバッグ：最初のイベントの構造確認
    if (events.length > 0) {
      console.log('🔍 First event structure:');
      console.log(JSON.stringify(events[0], null, 2));
    }

    // 住所→緯度経度変換（Google Geocoding API）
    const processedEvents = await Promise.all(
      events.slice(0, 10).map(async (entry) => {
        // ネストされたeventオブジェクトにアクセス
        const event = entry.event || entry;
        
        const address = event.geo_address_json?.address || event.geo_address_json?.name || null;
        console.log(`📍 Processing event: ${event.name}, address: ${address}`);
        let coordinates = { lat: 43.0642, lng: 141.3469 }; // 札幌デフォルト
        
        if (address && process.env.GOOGLE_MAPS_API_KEY) {
          try {
            const geoResponse = await axios.get(
              'https://maps.googleapis.com/maps/api/geocode/json',
              {
                params: {
                  address: `${address} 札幌市`,
                  key: process.env.GOOGLE_MAPS_API_KEY
                }
              }
            );
            
            if (geoResponse.data.results[0]) {
              const location = geoResponse.data.results[0].geometry.location;
              coordinates = { lat: location.lat, lng: location.lng };
              console.log(`📍 ${address} → ${coordinates.lat}, ${coordinates.lng}`);
            }
          } catch (geoError) {
            console.log(`⚠️ Geocoding failed for ${address}`);
          }
        }

        return {
          id: event.api_id || event.id,
          name: event.name || 'NoMaps Event',
          description: (event.description || '').substring(0, 200),
          start_at: event.start_at,
          end_at: event.end_at,
          address: address || '札幌市内（住所未設定）',
          coordinates,
          url: event.url || '#',
          timezone: event.timezone || 'Asia/Tokyo'
        };
      })
    );

    res.json({ events: processedEvents });

  } catch (error) {
    console.error('❌ API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📅 Luma Calendar: ${process.env.LUMA_CALENDAR_ID}`);
});