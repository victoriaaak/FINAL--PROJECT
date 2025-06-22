// καλούμε την library της express
const express = require('express');
// την βαζουμε σε μια μεταβλητή app
const app = express();
const http = require('http');
// καλούμε και την Library της socket.io
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
// ορίζουμε local path για local server
const port = process.env.PORT || 3000;
// ορίζουμε και για live server
const server = http.createServer(app);
const io = new Server(server);

// path για το lines.json αρχείο
const linesFile = path.join(__dirname, 'lines.json');

//αρχικοποίηση γραμμών
let allLines = [];

// φόρτωση γραμμών( αν υπάρχουν)
if (fs.existsSync(linesFile)) {
  try {
    const data = fs.readFileSync(linesFile, 'utf8');
    allLines = JSON.parse(data);
// Εάν υπάρχουν γραμμές να βγάλει μύνημα πως τις πήρε
    console.log(`✅ Loaded ${allLines.length} lines from lines.json`);
  } catch (err) {
// Εάν δεν είχε γραμμές να βγάλει μύνημα πως δεν βρήκε το json
    console.error("❌ Failed to load lines.json:", err);
// και δημιουργεί ένα πίνακα για να αποθηκεύσει τις επόμενες
    allLines = [];
  }
} else {
// αλλιώς αν δεν βρεί json αρχείο να φτιάξει ένα καινούργιο
  console.log("ℹ️ No lines.json found. Starting with empty line list.");
}

// αν έχει καινούργια σύνδεση, γράψε μύνημα
io.on('connection', (socket) => {
  console.log('🔌 New user connected');

// στείλε τις γραμμές στον νέο χρήστη
  socket.emit('previousLines', allLines);

// όταν κάποιος σχεδιάσει μια γραμμή, γράψε μύνημα
  socket.on('drawLine', (data) => {
    console.log('✏️ Received new line');

    allLines.push(data);

    //αποθήκευση της γραμμής στο lines.json
    fs.writeFile(linesFile, JSON.stringify(allLines, null, 2), (err) => {
      if (err) {
// Αν υπάρξει πρόβλημα γράψε μύνημα
        console.error("❌ Error writing to lines.json:", err);
      } else {
//Αν αποθηκευτεί η γραμμή γράψε μύνημα
        console.log("✅ Line saved to lines.json");
      }
    });

    // Στείλε την γραμμή σε όλους εκτός απο αυτόν που την σχεδίασε
    socket.broadcast.emit('drawLine', data);
  });
});

// πάρε τα στατικά αρχεία απο τον φάκελο public
app.use(express.static('public'));

//Ξεκίνα τον σέρβερ
// γράψε μύνημα που τρέχει ο σέρβερ
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
