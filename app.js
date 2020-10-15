const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const path = require('path');
app.use('/', express.static('public'))

let broadcaster = null;
io.on('connection', (socket) => {
  socket.on('join', (roomId) => {
    const roomClients = io.sockets.adapter.rooms[roomId] || { length: 0 };
    const numberOfClients = roomClients.length;

    // These events are emitted only to the sender socket.
    if (numberOfClients == 0) {

      socket.join(roomId)
      socket.emit('room_created', roomId)
    } else if (numberOfClients == 1) {

      socket.join(roomId)
      socket.emit('room_joined', roomId)
    } else {
      socket.emit('full_room', roomId)
    }
  })

  // These events are emitted to all the sockets connected to the same room except the sender.
  socket.on('start_call', (roomId) => {
    socket.broadcast.to(roomId).emit('start_call')
  })
  socket.on('webrtc_offer', (event) => {
    socket.broadcast.to(event.roomId).emit('webrtc_offer', event.sdp)
  })
  socket.on('webrtc_answer', (event) => {
    socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp)
  })
  socket.on('webrtc_ice_candidate', (event) => {
    console.log(event);
    socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event)
  })
})


app.use(express.static(__dirname + '/build'));

// START THE SERVER =================================================================
const port = process.env.PORT || 8000

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/build/index.html');
})

server.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})