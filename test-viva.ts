import axios from 'axios';

async function test() {
  try {
    const response = await axios.post('https://api.vivapayments.com/nativecheckout/v2/orders', {});
    console.log(response.status);
  } catch (error: any) {
    console.log(error.response?.status);
    console.log(error.response?.data);
  }
}

test();
