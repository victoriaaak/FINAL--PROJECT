var socket;

let points = [];
let Clickedpoints = [];
let linesDrawn = [];

let button1;
let button2;

let currentcolor;

let colorgirl;
let colorboy;

let space = 40;

let jobdata;
let jobnames = [];

function preload() {
  jobdata = loadJSON('jobs.json'); 
}

function setup() {
  let canvas = createCanvas(900, 1080);
  canvas.parent('sketch');
  background(218,214,214);

  socket = io();

  socket.on('drawLine', newLine);


  stroke(105, 74, 56);
  strokeWeight(10);

  jobnames = jobdata.jobs;

  button1 = createButton("ΓΥΝΑΙΚΑ");
  button1.parent('buttons');
  button2 = createButton("ΑΝΔΡΑΣ");
  button2.parent('buttons');

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


  currentcolor = [];

  colorgirl = color(166, 28, 60);
  colorboy = color(146, 191, 177);

  let counter = 0;
  for (let i = space + 25; i < width/3; i += space) {
    for (let j = space; j < height - space; j += space) {
      let jobname = jobnames[counter % jobnames.length];
      points.push({ x: i, y: j, name: jobname });
      counter++;
    }
  }
  counter = 0;
  for (let w = (2 * width) / 3 + space; w < width - space ; w += space) {
    for (let q = space; q <height - space; q += space) {
      let jobname = jobnames[counter % jobnames.length];
      points.push({ x: w, y: q, name: jobname });
      counter ++;
    }
  }
  socket.on('previousLines', function(lines){
    for (let i = 0; i< lines.length; i++){
      newLine(lines[i]);
    }
  });
}

function newLine(data) {
  console.log('Received line:', data);

  let c = color(data.color[0], data.color[1], data.color[2]);

  linesDrawn.push({
    x1: data.x1,
    y1: data.y1,
    x2: data.x2,
    y2: data.y2,
    color: c
  });
}



function draw() {
  background(218,214,214);

  for (let l of linesDrawn) {
    stroke(l.color);
    strokeWeight(3);
    line(l.x1, l.y1, l.x2, l.y2);
  }

  stroke(105, 74, 56);
  strokeWeight(10);
  for (let p of points) {
    point(p.x, p.y);
  }

  if (Clickedpoints.length === 2) {
    linesDrawn.push({
      x1: Clickedpoints[0].x,
      y1: Clickedpoints[0].y,
      x2: Clickedpoints[1].x,
      y2: Clickedpoints[1].y,
      color: currentcolor
    });

    var lineData = {
      x1: Clickedpoints[0].x,
      y1: Clickedpoints[0].y,
      x2: Clickedpoints[1].x,
      y2: Clickedpoints[1].y,
      color: [red(currentcolor), green(currentcolor), blue(currentcolor)]
    };
    console.log('Sending line:', lineData);
    socket.emit('drawLine', lineData);

    Clickedpoints = [];
  }

  noStroke();
  fill(0);
  textSize(14);
  textAlign(CENTER, BOTTOM);
  

  for (let p of points) {
    let d = dist(mouseX, mouseY, p.x, p.y);
    if (d < 10 && p.name !== "") {
      text(p.name, p.x, p.y - 15);
    }
  }
}

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

function fillButton1() {
  currentcolor = colorgirl;
}

function fillButton2() {
  currentcolor = colorboy;
}
