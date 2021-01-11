require('dotenv').config();
import { Client, TextChannel } from 'discord.js';
import { exchangeRate } from './exchange-rate';

const client = new Client();

client.login(process.env.KAREN_FROM_HR_SECRET_TOKEN);

client.on('ready', async () => {
  console.log(`Connected as ${client.user.tag}`);
  await client.channels.fetch('795699539209879612').then(
    async channel => {
      const textChannel = channel as TextChannel;
      const result = (await exchangeRate(true)) as string;
      console.log(result);
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
