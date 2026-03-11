import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const VIVA_API_URL = 'https://api.vivapayments.com';
    const VIVA_ACCOUNTS_URL = 'https://accounts.vivapayments.com';
    
    const clientId = process.env.VIVA_CLIENT_ID;
    const clientSecret = process.env.VIVA_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.log("No credentials found in .env");
      return;
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenResponse = await axios.post(`${VIVA_ACCOUNTS_URL}/connect/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    const accessToken = tokenResponse.data.access_token;
    
    const dummyOrderCode = '1234567890123456';
    
    try {
      const res1 = await axios.get(`${VIVA_API_URL}/checkout/v2/orders/${dummyOrderCode}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log("Success with /checkout/v2/orders");
    } catch (e: any) {
      console.log("Failed /checkout/v2/orders:", e.response?.status, e.response?.data);
    }
    
    try {
      const res2 = await axios.get(`${VIVA_API_URL}/api/orders/${dummyOrderCode}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log("Success with /api/orders:", res2.data);
    } catch (e: any) {
      console.log("Failed /api/orders (Bearer):", e.response?.status, e.response?.data);
    }
    
    // Test with Basic Auth using Merchant ID and API Key if available
    const merchantId = process.env.VIVA_MERCHANT_ID;
    const apiKey = process.env.VIVA_API_KEY;
    if (merchantId && apiKey) {
      const basicAuth = Buffer.from(`${merchantId}:${apiKey}`).toString('base64');
      try {
        const res3 = await axios.get(`${VIVA_API_URL}/api/orders/${dummyOrderCode}`, {
          headers: { 'Authorization': `Basic ${basicAuth}` }
        });
        console.log("Success with /api/orders (Basic):", res3.data);
      } catch (e: any) {
        console.log("Failed /api/orders (Basic):", e.response?.status, e.response?.data);
      }
    }
    
  } catch (e: any) {
    console.error("General error:", e.response?.data || e.message);
  }
}
test();
