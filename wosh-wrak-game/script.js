const socket = io(); // الاتصال بالسيرفر

let player = {};
let room = {};

socket.on('connect', () => {
  console.log('✅ متصل بالسيرفر!');
});

socket.on('roomCreated', (data) => {
  room = data;
  document.getElementById('login').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  document.getElementById('roomId').textContent = data.code;
});

socket.on('updatePlayers', (players) => {
  document.getElementById('players').innerHTML = players
    .map(p => `<div class="player-card">${p.name}</div>`)
    .join('');
});

socket.on('errorMessage', (message) => {
  alert(message);
});

function joinRoom() {
  const name = document.getElementById('nameInput').value.trim();
  const code = document.getElementById('roomCode').value.trim();

  if (!name) return alert('📝 اكتب اسمك أول!');

  player = { name };
  if (code) {
    socket.emit('joinRoom', { name, code });
  } else {
    socket.emit('createRoom', { name });
  }
}
