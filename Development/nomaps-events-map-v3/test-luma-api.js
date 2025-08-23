import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const LUMA_API_KEY = process.env.LUMA_API_KEY;
const LUMA_CALENDAR_ID = process.env.LUMA_CALENDAR_ID;

console.log('🧪 Luma API Test Starting...');
console.log(`📅 Calendar ID: ${LUMA_CALENDAR_ID}`);
console.log(`🔑 API Key: ${LUMA_API_KEY ? 'Set' : 'Missing'}`);

async function testLumaAPI() {
  try {
    const response = await axios.get(
      `https://public-api.luma.com/v1/calendar/list-events`,
      {
        params: {
          calendar_id: LUMA_CALENDAR_ID
        },
        headers: {
          'x-luma-api-key': LUMA_API_KEY,
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ API Response Success');
    console.log(`📊 Status: ${response.status}`);
    console.log(`🔢 Events Found: ${response.data?.entries?.length || 0}`);
    
    // レスポンス構造の詳細確認
    console.log('🔍 Response Structure:');
    console.log(JSON.stringify(response.data, null, 2).slice(0, 500) + '...');
    
    if (response.data?.entries?.length > 0) {
      console.log('📝 First Event Sample:');
      const firstEvent = response.data.entries[0];
      console.log(JSON.stringify(firstEvent, null, 2));
    }

  } catch (error) {
    console.log('❌ API Test Failed');
    console.log(`🚨 Error: ${error.message}`);
    console.log(`📡 Response Status: ${error.response?.status || 'N/A'}`);
    console.log(`📄 Response Data:`, error.response?.data || 'N/A');
  }
}

testLumaAPI();