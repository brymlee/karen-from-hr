require('dotenv').config();
import { Client, TextChannel } from 'discord.js';
import axios from 'axios';

const client = new Client();

client.login(process.env.KAREN_FROM_HR_SECRET_TOKEN);

client.on('ready', async () => {
  console.log(`Connected as ${client.user.tag}`);
  await client.channels.fetch('795699539209879612').then(
    async channel => {
      const textChannel = channel as TextChannel;
      const result = await exchangeRate();
      if(result){
        await textChannel.messages.channel.send(result);
        return;
      } 
      return;
    },
    err => {
      console.log(`Error with karen ${err}`);
    },
  );
  client.destroy();
});

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
