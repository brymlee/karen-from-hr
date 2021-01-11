require('dotenv').config();
import { Client, TextChannel } from 'discord.js';
import { japanRailPassPrice } from './japan-rail-pass-price';

const client = new Client();

client.login(process.env.KAREN_FROM_HR_SECRET_TOKEN);

client.on('ready', async () => {
  console.log(`Connected as ${client.user.tag}`);
  await client.channels.fetch('795699539209879612').then(
    async channel => {
      const textChannel = channel as TextChannel;
      const result = await japanRailPassPrice();
      const message = result.map(it => {
        const { color, age, duration, yen, usd } = it;
        return `The ${color === 'standard' ? 'standard japanese rail pass' : 'green japanese rail pass'} costs ${yen}¥ or ${usd}$ for ${age === 'child' ? 'children' : 'adults'} and for a duration of ${duration}`;
      }).reduce((accumulator, current) => `${accumulator}\n${current}`);
      await textChannel.messages.channel.send(message)
        .then(
          _nothing => {}, 
          err => { console.log(`Error sending japan rail pass report ${err}`); },
        );
      return;
    },
    err => {
      console.log(`Error with karen ${err}`);
    },
  );
  client.destroy();
});
