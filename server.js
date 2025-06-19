const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

// 🔒 Απόλυτο path προς το lines.json
const linesFile = path.join(__dirname, 'lines.json');

// 🗂 Αρχικοποίηση πίνακα για τις γραμμές
let allLines = [];

// ✅ Φόρτωσε τις γραμμές από το αρχείο (αν υπάρχει)
if (fs.existsSync(linesFile)) {
  try {
    const data = fs.readFileSync(linesFile, 'utf8');
    allLines = JSON.parse(data);
    console.log(`✅ Loaded ${allLines.length} lines from lines.json`);
  } catch (err) {
    console.error("❌ Failed to load lines.json:", err);
    allLines = [];
  }
} else {
  console.log("ℹ️ No lines.json found. Starting with empty line list.");
}

// 🎧 WebSocket σύνδεση
io.on('connection', (socket) => {
  console.log('🔌 New user connected');

  // 👉 Στείλε τις παλιές γραμμές στον νέο client
  socket.emit('previousLines', allLines);

  // 👉 Όταν κάποιος σχεδιάσει γραμμή
  socket.on('drawLine', (data) => {
    console.log('✏️ Received new line');

    allLines.push(data);

    // ✍️ Αποθήκευση στο αρχείο
    fs.writeFile(linesFile, JSON.stringify(allLines, null, 2), (err) => {
      if (err) {
        console.error("❌ Error writing to lines.json:", err);
      } else {
        console.log("✅ Line saved to lines.json");
      }
    });

    // 📡 Στείλε τη γραμμή σε όλους εκτός από αυτόν που τη σχεδίασε
    socket.broadcast.emit('drawLine', data);
  });
});

// 🧱 Εξυπηρέτηση στατικών αρχείων από τον φάκελο public
app.use(express.static('public'));

// 🚀 Εκκίνηση server
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
