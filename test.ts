import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('https://developer.vivawallet.com/apis-for-payments/native-checkout-v2/');
    console.log(res.data.substring(0, 1000));
  } catch (e) {
    console.error(e.message);
  }
}
test();
