const express = require('express')

const mongoose = require('mongoose')
var whatsappMessages = require('./dbMessages')
//admin pwd:admin123
const mongoDB =
  'mongodb+srv://admin:admin123@cluster0.rsuee.mongodb.net/whatsapp-mern?retryWrites=true&w=majority'
mongoose.connect(mongoDB, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const Pusher = require('pusher')
const { response } = require('express')

const pusher = new Pusher({
  appId: '1131967',
  key: 'b6f55728bf3582eb5be4',
  secret: '66fe69222112ce6bbd7b',
  cluster: 'ap2',
  useTLS: true,
})

const db = mongoose.connection
db.once('open', () => {
  console.log('mongo isconnected')

  const messageCollection = db.collection('whatsappmessages')
  const changeStream = messageCollection.watch()

  changeStream.on('change', (change) => {
    console.log('changed is occured', change)
    if (change.operationType === 'insert') {
      const messagedetails = change.fullDocument
      pusher.trigger('message', 'inserted', {
        name: messagedetails.name,
        message: messagedetails.message,
        created_at: messagedetails.createdAt,
        received: messagedetails.received,
      })
    } else {
      console.log('error in triggering event')
    }
  })
})
// pusher.trigger('my-channel', 'my-event', {
//   message: 'hello world',
// })
const app = express()

const port = process.env.PORT || 3000
app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  next()
})

app.get('/message/sync', (request, response) => {
  whatsappMessages.find((error, data) => {
    if (error) {
      response.status(501).send(error)
    } else {
      response.status(200).send(data)
    }
  })
})

app.get('/', (request, response) => {
  response.status(200).send('hello')
})
app.post('/api/v1/messages/new', (request, response) => {
  const dbMessage = request.body
  whatsappMessages.create(dbMessage, (error, data) => {
    if (error) {
      response.status(500).send(error)
    } else {
      response.status(200).send(`new message has been added:${data}`)
    }
  })
})

app.listen(port, console.log(`listening at:${port}`))
