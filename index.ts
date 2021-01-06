require('dotenv').config();
import { Client, TextChannel } from 'discord.js';
import axios from 'axios';

const client = new Client();
client.on('message', message => {
  console.log(`Connected as ${client.user.tag}`);
  console.log(message);
  const textChannel = message.channel as TextChannel;
  if(message.content.includes('What is the exchange rate?')){
    axios.request({ 
      method: 'get',
      url: `https://v1.nocodeapi.com/brymlee/cx/${process.env.NO_CODE_API_SECRET_TOKEN}/rates`,
      params: { 'target': 'JPY', 'source': 'USD' },
    }).then(res => {
      const { source, date, rates } = res.data as Record<'source' | 'date', string> & Record<'rates', Record<'JPY', number>>;
      const { JPY } = rates;
      const result = `As of ${date}, for every 1 ${source} you will get ${JPY} yen.`;
      console.log(result);
      message.channel.messages.channel.send(result)
    }, err => {
      console.log(`Error getting exchange rate ${err}`);
    });
  }
});

client.login(process.env.KAREN_FROM_HR_SECRET_TOKEN);
