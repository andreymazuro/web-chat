var app = require('express')();
var express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.use(express.static('assets'))


users = [];
io.on('connection', function(socket){

    socket.on('setUsername', function(data){
    if(users.indexOf(data) > -1 || data == ''){
      socket.emit('userExists', 'Take another username!');
    }
    else{
      socket.nickname = data
      users.push(data);
      socket.emit('userSet', {username: data});
      io.sockets.emit('usersList', {users:users})
      socket.broadcast.emit('newmsg', {message: data + ' joined chat', user: ''});
    }
  });

  socket.on('msg', function(data){
      //Send message to everyone
      io.sockets.emit('newmsg', data);
  })

  socket.on('disconnect', function() {
      users.map(function(item,index){
      if (item == socket.nickname) {
          users.splice(index,1)
      }
    })
    io.sockets.emit('usersList', {users:users})
    if (socket.nickname != undefined) {
    socket.broadcast.emit('newmsg', {message: socket.nickname + ' left chat', user: '' });
  }
  });

});
var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('listening on localhost:3000');
});
