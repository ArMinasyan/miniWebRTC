const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server);
app.use('/', express.static('public'))


io.on('connection', (socket) => {


  socket.on('join', (id) => {
    const roomClients = io.sockets.adapter.rooms[id] || { length: 0 };

    if (roomClients.length > 1) socket.emit('full_room', id);
    else {
      socket.join(id);
      socket.emit('join', id);
    }
  })


  socket.on('offer', event => { socket.broadcast.to(event.id).emit('offer', event.offer) });
  socket.on('answer', event => { socket.broadcast.to(event.id).emit('answer', event.answer) });

  socket.on('end', event => {
    io.to(event.id).emit('end');

    io.in(event.id).clients(function (error, ids) {
      ids.forEach(id => {
        io.sockets.sockets[id].leave(event.id);
      })
    })
  });

  socket.on('candidate', event => { socket.broadcast.to(event.id).emit('candidate', event) })
})


app.use(express.static(__dirname + '/build'));

// START THE SERVER =================================================================
const port = process.env.PORT || 8000

app.post('/login', (req, res) => {

})
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/build/index.html');
})



server.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})