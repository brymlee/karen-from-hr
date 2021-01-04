require('dotenv').config();
import { Client } from 'discord.js';

const client = new Client();
client.on('ready', () => {
  console.log(`Connected as ${client.user.tag}`);
  client.channels.fetch('795753554127093800').then(
    channel => {
      console.log(channel);
    },
    err => {
      console.log(`Error fetching discord channel ${err}`);
    }
  );
});

client.login(process.env.KAREN_FROM_HR_SECRET_TOKEN);
