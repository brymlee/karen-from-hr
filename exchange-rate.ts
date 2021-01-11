require('dotenv').config(); 
import axios from 'axios';

export type ExchangeRate = Record<'source' | 'date', string> & Record<'rates', Record<'JPY', number>>;

export async function exchangeRate(isStringified: boolean): Promise<ExchangeRate | string | undefined> {
  return axios.request({ 
    method: 'get',
    url: `https://v1.nocodeapi.com/brymlee/cx/${process.env.NO_CODE_API_SECRET_TOKEN}/rates`,
    params: { 'target': 'JPY', 'source': 'USD' },
  }).then(res => {
    const it = res.data as ExchangeRate;
    const { source, date, rates } = it;
    const { JPY } = rates;
    const result = isStringified ? `As of ${date}, for every 1 ${source} you will get ${JPY} yen.` : it;
    return result;
  }, err => {
    const message = `Error getting exchange rate ${err}`;
    console.log(message);
    return undefined;
  });
}
