require('dotenv').config();
import { Client, TextChannel } from 'discord.js';
import { exchangeRate } from './exchange-rate';

const client = new Client();

client.login(process.env.KAREN_FROM_HR_SECRET_TOKEN);

client.on('message', message => {
  if(message.channel instanceof TextChannel && message.mentions.users.some(user => user.username.includes('Karen from hr'))){
    const textChannel = message.channel.messages.channel as TextChannel;
    messageResponse(message.content).then(response => {
      textChannel.send(`@${message.author.username} - ${response}`).then(_nothing => {
        textChannel.stopTyping(true);
      }, err => {
        console.log(`Error sending message ${err}`);
      });
    }, err => {
      console.log(`Error getting response to message ${err}`);
    });
  } 
});

async function messageResponse(it: string): Promise<string>{
  if(it.toLowerCase().includes('exchange rate') && it.toLowerCase().includes('?')){
    return exchangeRate();
  }
  return new Promise((resolve, _reject) => resolve('What do you need?'));
}
