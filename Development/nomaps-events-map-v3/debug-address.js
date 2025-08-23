// 住所データ構造確認用スクリプト
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function debugAddressData() {
  try {
    const response = await axios.get(
      'https://public-api.luma.com/v1/calendar/list-events',
      {
        params: { calendar_id: process.env.LUMA_CALENDAR_ID },
        headers: { 'x-luma-api-key': process.env.LUMA_API_KEY },
        timeout: 10000
      }
    );

    const events = response.data.entries || [];
    console.log(`取得したイベント数: ${events.length}`);
    
    // 最初のイベントの住所関連データを詳細に確認
    if (events.length > 0) {
      const firstEvent = events[0];
      console.log('\n=== 最初のイベントの住所データ ===');
      console.log('イベント名:', firstEvent.name);
      console.log('geo_address_json:', JSON.stringify(firstEvent.geo_address_json, null, 2));
      console.log('geo_latitude:', firstEvent.geo_latitude);
      console.log('geo_longitude:', firstEvent.geo_longitude);
      
      // HTMLに見つかった住所を検索
      const targetAddress = "5-chōme-8-1 Kita 8 Jōnishi, Kita Ward, Sapporo, Hokkaido 060-0808, Japan";
      console.log('\n=== 目標住所検索 ===');
      console.log('検索対象:', targetAddress);
      
      // 全フィールドから住所らしきものを探す
      console.log('\n=== 住所関連フィールド確認 ===');
      Object.keys(firstEvent).forEach(key => {
        const value = firstEvent[key];
        if (key.toLowerCase().includes('address') || 
            key.toLowerCase().includes('location') || 
            key.toLowerCase().includes('venue') ||
            key.toLowerCase().includes('geo')) {
          console.log(`${key}:`, value);
          
          // 文字列の場合、目標住所が含まれているかチェック
          if (typeof value === 'string' && value.includes('Hokkaido')) {
            console.log(`*** 候補発見: ${key} に北海道が含まれています ***`);
          }
        }
      });
      
      // 文字列フィールドで Hokkaido を含むものを探す
      console.log('\n=== Hokkaido を含むフィールド検索 ===');
      Object.keys(firstEvent).forEach(key => {
        const value = firstEvent[key];
        if (typeof value === 'string' && value.includes('Hokkaido')) {
          console.log(`${key}: ${value}`);
        }
      });
      
      console.log('\n=== 全フィールド一覧 ===');
      Object.keys(firstEvent).forEach(key => {
        const value = firstEvent[key];
        console.log(`${key}: ${typeof value} - ${JSON.stringify(value).substring(0, 100)}...`);
      });
    }
  } catch (error) {
    console.error('エラー:', error.message);
  }
}

debugAddressData();