const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  redisStorage = require('connect-redis')(session),
  redis = require('redis'),
  client = redis.createClient()

const host = '127.0.0.1'
const port = 7000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  session({
    store: new redisStorage({
      host: host,
      port: 6379,
      client: client,
    }),
    secret: 'you secret key',
    saveUninitialized: true,
  })
)

app.post('/ad', (req, res) => {
  if (!req.session.key) req.session.key = req.sessionID

  req.session.key[req.sessionID].showAd = req.body.showAd
  res.sendStatus(200)
})

app.get('/', (req, res) => {
  console.log(req.session.key[req.sessionID].showAd)
  res.sendStatus(200)
})

app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`)
})
