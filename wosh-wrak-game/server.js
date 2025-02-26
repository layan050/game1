const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io'); // استيراد socket.io

const app = express();
const server = http.createServer(app);
const io = new Server(server); // تفعيل socket.io على السيرفر
const port = 3000;

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const rooms = {}; // لتخزين الغرف واللاعبين

// أحداث الاتصال عبر socket.io
io.on('connection', (socket) => {
  console.log(`🔌 لاعب جديد اتصل: ${socket.id}`);

  socket.on('createRoom', ({ name }) => {
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    rooms[roomCode] = [{ id: socket.id, name }];
    socket.join(roomCode);
    console.log(`🚪 غرفة جديدة: ${roomCode} أنشأها ${name}`);

    socket.emit('roomCreated', { code: roomCode });
    io.to(roomCode).emit('updatePlayers', rooms[roomCode]);
  });

  socket.on('joinRoom', ({ name, code }) => {
    if (!rooms[code]) {
      socket.emit('errorMessage', '❌ الغرفة غير موجودة!');
      return;
    }

    rooms[code].push({ id: socket.id, name });
    socket.join(code);
    console.log(`👤 ${name} انضم للغرفة ${code}`);

    io.to(code).emit('updatePlayers', rooms[code]);
  });

  socket.on('disconnect', () => {
    for (const code in rooms) {
      rooms[code] = rooms[code].filter(player => player.id !== socket.id);
      io.to(code).emit('updatePlayers', rooms[code]);

      if (rooms[code].length === 0) {
        delete rooms[code];
        console.log(`🗑️ الغرفة ${code} حُذفت`);
      }
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 السيرفر شغال!`);
  });
