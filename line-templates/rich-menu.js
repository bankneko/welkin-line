const axios = require('axios')

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.CHANNEL_TOKEN}`
}

const url = `https://api.line.me/v2/bot/richmenu`

const rich_menu = []