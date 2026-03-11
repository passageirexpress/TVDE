import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    const VIVA_API_URL = 'https://api.vivapayments.com';
    const VIVA_ACCOUNTS_URL = 'https://accounts.vivapayments.com';
    
    const clientId = process.env.VIVA_CLIENT_ID;
    const clientSecret = process.env.VIVA_CLIENT_SECRET;
    
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
    
    // Create an order first to get a valid orderCode
    const orderResponse = await axios.post(`${VIVA_API_URL}/checkout/v2/orders`, {
      amount: 100,
      customerTrns: `Test`,
      sourceCode: process.env.VIVA_SOURCE_CODE || 'Default',
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const orderCode = orderResponse.data.orderCode;
    console.log("Order Code:", orderCode);
    
    // Now try to retrieve it
    try {
      const res1 = await axios.get(`${VIVA_API_URL}/checkout/v2/orders/${orderCode}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log("Success with /checkout/v2/orders");
    } catch (e: any) {
      console.log("Failed /checkout/v2/orders:", e.response?.status);
    }
    
    try {
      const res2 = await axios.get(`${VIVA_API_URL}/api/orders/${orderCode}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log("Success with /api/orders:", res2.data.StateId);
    } catch (e: any) {
      console.log("Failed /api/orders:", e.response?.status);
    }
    
  } catch (e: any) {
    console.error(e.response?.data || e.message);
  }
}
test();
