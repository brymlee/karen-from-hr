require('dotenv').config(); 
import axios from 'axios';

export async function exchangeRate(): Promise<string | undefined> {
  return axios.request({ 
    method: 'get',
    url: `https://v1.nocodeapi.com/brymlee/cx/${process.env.NO_CODE_API_SECRET_TOKEN}/rates`,
    params: { 'target': 'JPY', 'source': 'USD' },
  }).then(res => {
    const { source, date, rates } = res.data as Record<'source' | 'date', string> & Record<'rates', Record<'JPY', number>>;
    const { JPY } = rates;
    const result = `As of ${date}, for every 1 ${source} you will get ${JPY} yen.`;
    return result;
  }, err => {
    const message = `Error getting exchange rate ${err}`;
    console.log(message);
    return undefined;
  });
}
