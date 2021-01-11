require('dotenv').config();
import axios from 'axios';
import { exchangeRate, ExchangeRate } from './exchange-rate';

export type PassPriceDuration = '7 days' | '14 days' | '21 days';
export type PassPriceEntry = Required<Record<'color', 'green pass' | 'standard'> & Record<'age', 'adult' | 'child'> & Record<'duration', PassPriceDuration> & Record<'yen' | 'usd', number>>;
export type PassPrice = PassPriceEntry[];

const stripText = (it: string) => it.replace('<', '').replace('>', '').replace('¥', '').replace(',', '');

const getPriceRowsRegex: () => RegExp = () => /<tr\s+class=m-price-table-body>(.|\n)*?<\/tr>/gm;
const getPriceCellRegex: () => RegExp = () => /<div\s+class="e-title.*?">(.|\n)*?<\/div>/gm;
const getTextRegex: () => RegExp = () => />.*?</m;

function passPriceEntry(
  row: string, 
  index: number, 
  passPriceDuration: PassPriceDuration | undefined, 
  its: Omit<PassPriceEntry, 'usd'>[]
): Omit<PassPriceEntry, 'usd'>[] {
  const priceCellRegex = getPriceCellRegex();
  const getCell = () => Array.from(Array(index + 1).keys())
    .map(_it => priceCellRegex.exec(row))
    .reduce((_accumulator, current) => current);
  if(!passPriceDuration && index > 0){
    return [];
  } else if(index > 4){
    return its;
  } else if(index === 0){
    const cell = getCell(); 
    if(cell.length > 0){
      const text = getTextRegex().exec(cell[0]);
      if(text.length > 0){
        return passPriceEntry(row, index + 1, stripText(text[0]) as PassPriceDuration, its);
      }
    }
    return [];
  }
  const cell = getCell();
  if(cell.length > 0){
    const text = getTextRegex().exec(cell[0]);
    if(text.length > 0){
      return passPriceEntry(row, index + 1, passPriceDuration, its.concat({
        color: index === 1 || index === 2 ? 'green pass' : 'standard',
        age: index % 2 === 1 ? 'adult' : 'child',
        duration: passPriceDuration,
        yen: parseInt(stripText(text[0])),
      }));
    }
  }
  return passPriceEntry(row, index + 1, passPriceDuration, its);
}

async function passPriceRows(
  htmlString: string,
  index: number,
  exchangeRated: Promise<ExchangeRate | undefined>,
  its: Promise<PassPriceEntry[]>,
): Promise<PassPriceEntry[]> {
  if(index > 3){
    return its;
  } 
  const priceRowsRegex = getPriceRowsRegex();
  const row = Array.from(Array(index + 1).keys())
    .map(_it => priceRowsRegex.exec(htmlString))
    .reduce((_accumulator, current) => current);
  const exchange = await exchangeRated;
  if(row.length > 0 && exchange){
    return passPriceRows(
      htmlString,
      index + 1,
      exchangeRated,
      its.then(passPriceEntries => 
        passPriceEntries.concat(
          passPriceEntry(row[0], 0, undefined, [])
            .map(it => ({
              ...it,
              usd: exchange.rates.JPY < 1 ? parseInt((it.yen * exchange.rates.JPY).toFixed(2)) : parseInt((it.yen / exchange.rates.JPY).toFixed(2)),
            }) as PassPriceEntry)
        )
      )
    );
  }
  return its;
}

export const passPriceEntryAsString: (_it: PassPriceEntry) => string = (it: PassPriceEntry) => {
  const { color, age, duration, yen, usd } = it;
  return `The ${color === 'standard' ? 'standard japanese rail pass' : 'green japanese rail pass'} costs ${yen}¥ or ${usd}$ for ${age === 'child' ? 'children' : 'adults'} and for a duration of ${duration}`;
};

export async function japanRailPassPrice(isStringified: boolean): Promise<PassPrice | string>{
  return axios.request({
    method: 'get',
    url: 'https://www.jrailpass.com/prices',
  }).then(res => {
    const result = passPriceRows(res.data as string, 1, exchangeRate(false).then(it => it as ExchangeRate | undefined), new Promise<PassPriceEntry[]>((resolve, _reject) => { resolve([]); }));
    return isStringified 
      ? result.then(passPrice => 
          passPrice
            .map(it => passPriceEntryAsString(it))
            .reduce((accumulator, current) => `${accumulator}\n${current}`)
        ) 
      : result;
  });
}
