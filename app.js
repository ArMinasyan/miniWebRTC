const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const path = require('path');
app.use('/', express.static('public'))

let broadcaster = null;
io.on('connection', (socket) => {
  socket.on('join', (roomID) => {
    const roomClients = io.sockets.adapter.rooms[roomID] || { length: 0 };
    const numberOfClients = roomClients.length;

    // These events are emitted only to the sender socket.
    if (numberOfClients == 0) {

      socket.join(roomID)
      socket.emit('room_created', roomID)
    } else if (numberOfClients == 1) {

      socket.join(roomID)
      socket.emit('room_joined', roomID)
    } else {
      socket.emit('full_room', roomID)
    }
  })

  // These events are emitted to all the sockets connected to the same room except the sender.
  socket.on('start_call', (roomID) => { socket.broadcast.to(roomID).emit('start_call') });

  socket.on('offer', (event) => { socket.broadcast.to(event.id).emit('offer', event) });

  socket.on('answer', (event) => { socket.broadcast.to(event.id).emit('answer', event) });

})


app.use(express.static(__dirname + '/build'));

// START THE SERVER =================================================================
const port = process.env.PORT || 8000

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/build/index.html');
})

server.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})