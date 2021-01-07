require('dotenv').config();
import axios from 'axios';

axios.request({
  method: 'post',
  url: 'https://api.digitalocean.com/v2/droplets',
  data: {
    'name': process.env.DIGITAL_OCEAN_DROPLET_NAME,
    'region': 'nyc3',
    'size': 's-1vcpu-1gb',
    'image': 'ubuntu-16-04-x64',
    'ssh_keys': [process.env.DIGITAL_OCEAN_DROPLET_SSH_KEY_FINGERPRINT],
    'backups': false,
    'ipv6': true,
    'user_data': null,
    'private_networking': null,
    'volumes': null,
    'tags': ['web'],
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DIGITAL_OCEAN_PERSONAL_ACCESS_TOKEN}`,
  },
}).then(
  _nothing => {
    console.log('Successfully created droplet');
  },
  err => {
    console.log(`Error creating droplet ${err}`);
  }
);
