//Μαριάννα Χριστοπούλου
//Βικτώρια Καλαμπαλή
//ΜΕΤΑΒΛΗΤΕΣ
// πίνακας τελειών
let points = [];
//πίνακας επιλεγμένων τελειών
let Clickedpoints = [];
//πίνακας σχεδιασμένων γραμμών
let linesDrawn = [];
// κουμπιά
let button1;
let button2;
let button3;
//επιλεγμένο χρώμα
let currentcolor;
// χρώμα 18-26
let color1;
//χρώμα 27-50
let color2;
//χρώμα 50+
let color3;
// χώρος μεταξύ τελειών
let space = 40;
// επαγγέλματα
let jobdata;
//πίνακας επαγγελμάτων
let jobnames = [];
// σύνδεση με server
let socket;

// εκτέλεση πρίν απο το άνοιγμα να φορτώσει το Json με τα επαγγέλματα
function preload() {
  jobdata = loadJSON('jobs.json'); 
}

// να εκτελέσει μια φορά 
function setup() {
  let canvas = createCanvas(900, 1080);
  //κάνει Link τον καμβά σε ένα id ώστε στο CSS αρχείο να τον κεντράρουμε
  canvas.parent('sketch');
  background(218,214,214);

  stroke(105, 74, 56);
  strokeWeight(10);

  //γέμισε τον πίνακα με τα επαγγέλματα
  jobnames = jobdata.jobs;

  // τροποποιήσεις του στυλ των κουμπιών και δημιουργία 
  button1 = createButton("18-26");
  button1.parent('buttons');
  button2 = createButton("27-50");
  button2.parent('buttons');
  button3 = createButton("50+");
  button3.parent('buttons');

  button1.mouseClicked(fillButton1);
  button1.style("border", "none");
  button1.style("color", "rgb(146,191,177)");
  button1.style("background-color", "rgb(166,28,60)");
  button1.style("font-size", "22px");
  button1.style("padding", "15px");
  button1.style("border-radius", "4px");

  button2.mouseClicked(fillButton2);
  button2.style("border", "none");
  button2.style("color", "rgb(166,28,60)");
  button2.style("background-color", "rgb(146,191,177)");
  button2.style("font-size", "22px");
  button2.style("padding", "15px");
  button2.style("border-radius", "4px");

  button3.mouseClicked(fillButton3);
  button3.style("border", "none");
  button3.style("color", "rgb(105,74,56)");
  button3.style("background-color", "rgb(244,172,69)");
  button3.style("font-size", "22px");
  button3.style("padding", "15px");
  button3.style("border-radius", "4px");

  // ξεκίνα το τρέχων χρώμα να είναι άδειο
  currentcolor = [];
  // ορίσαμε τα χρώματα των κουμπιών που θα δίνουν στις γραμμές 
  color1 = color(166, 28, 60);
  color2 = color(146, 191, 177);
  color3 = color(244, 172, 69);

  // ξεκίνα να μετράς απο το 0
  let counter = 0;
  // Loop που φτιάχνει τις τελείες του πρώτου grid και δίνει σε κάθε μια ένα επάγγελμα 
  for (let i = space + 25; i < width/3; i += space) {
    for (let j = space; j < height - space; j += space) {
      let jobname = jobnames[counter % jobnames.length];
      points.push({ x: i, y: j, name: jobname });
      counter++;
    }
  }

  //μηδενίζει πάλι την μέτρηση των επαγγελμάτων ώστε να ξαναξεκινήσει απο την αρχή
  counter = 0;
  //Loop φτιάχνει το δεύτερο grid με τον ίδιο τρόπο και διαμοιράζει τα επαγγέλματα
  for (let w = (2 * width) / 3 + space; w < width - space ; w += space) {
    for (let q = space; q < height - space; q += space) {
      let jobname = jobnames[counter % jobnames.length];
      points.push({ x: w, y: q, name: jobname });
      counter ++;
    }
  }

  // σύνδεση με τον server
  socket = io();

  // όταν λάβει προηγούμενες γραμμές
  socket.on('previousLines', (data) => {
    for (let l of data) {
      linesDrawn.push({
        x1: l.x1,
        y1: l.y1,
        x2: l.x2,
        y2: l.y2,
        color: color(l.color[0], l.color[1], l.color[2])
      });
    }
  });

  // όταν λάβει νέα γραμμή από άλλον χρήστη
  socket.on('drawLine', (l) => {
    linesDrawn.push({
      x1: l.x1,
      y1: l.y1,
      x2: l.x2,
      y2: l.y2,
      color: color(l.color[0], l.color[1], l.color[2])
    });
  });
}

// λειτουργία που εκτελείται συνεχώς 
function draw() {
  // ξανασχεδιάζει το background ώστε τα επαγγέλματα να φαίνονται μόνο όταν ο χρήστης κάνει Hover με το ποντίκι του απο πάνω
  background(218,214,214);

  // σχεδιάζουμε τις προσχεδιασμένες γραμμές
  //αλλά και την γραμμή που κάνει τώρα ο χρήστης
  for (let l of linesDrawn) {
    stroke(l.color);
    strokeWeight(3);
    line(l.x1, l.y1, l.x2, l.y2);
  }

  // για τον λόγο αυτό ξανασχεδιάζουμε και τις γραμμές
  stroke(105, 74, 56);
  strokeWeight(10);
  for (let p of points) {
    point(p.x, p.y);
  }

  //εάν ο χρήστης επιλέξει με το ποντίκι του 2 τελείες κάνε αποθήκευση
  if (Clickedpoints.length === 2) {
    let newLine = {
      x1: Clickedpoints[0].x,
      y1: Clickedpoints[0].y,
      x2: Clickedpoints[1].x,
      y2: Clickedpoints[1].y,
      color: currentcolor
    };

    linesDrawn.push(newLine);

    // στείλε τη γραμμή στον server
    socket.emit('drawLine', {
      x1: newLine.x1,
      y1: newLine.y1,
      x2: newLine.x2,
      y2: newLine.y2,
      color: [red(currentcolor), green(currentcolor), blue(currentcolor)]
    });

    //μετά απο 2 ξαανάδειασε τον πίνακα
    Clickedpoints = [];
  }

  noStroke();
  fill(0);
  textSize(14);
  textAlign(CENTER, BOTTOM);

  //αν το ποντίκι είναι πάνω σε μια τελεία τότε δείξε το επάγγελμα
  for (let p of points) {
    let d = dist(mouseX, mouseY, p.x, p.y);
    if (d < 10 && p.name !== "") {
      text(p.name, p.x, p.y - 15);
    }
  }
}

//εάν ο χρήστης πατήσει πάνω σε μια τελεία τότε αποθήκευσε τις συντεταγμένες της τελείας αυτής 
function mousePressed() {
  for (let p of points) {
    let d = dist(mouseX, mouseY, p.x, p.y);
    if (d < 10) {
      Clickedpoints.push({ x: p.x, y: p.y });
      if (Clickedpoints.length > 2) {
        Clickedpoints.shift(); 
      }
      return;
    }
  }
}

//αν ο χρήστης πατήσει το συγκεκριμένο κουμπί τότε γέμισε την μεταβλητή με το ανάλογο χρώμα
function fillButton1() {
  currentcolor = color1;
}

function fillButton2() {
  currentcolor = color2;
}

function fillButton3() {
  currentcolor = color3;
}
