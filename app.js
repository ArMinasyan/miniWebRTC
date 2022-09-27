const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server);
const socketHandler = require('./socket.handler')
app.use('/', express.static('public'))


io.on('connection', socket => socketHandler(socket, io))

app.use(express.static(__dirname + '/build'));

// START THE SERVER =================================================================
const port = process.env.PORT || 8000

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/build/index.html');
})

server.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})
