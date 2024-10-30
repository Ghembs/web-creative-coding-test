const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const tweakpane = require("tweakpane");

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
  playbackRate: "throttle",
  fps: 24,
};

const params = {
  numsSlices: 40,
  lineCap: "butt",
  cell: 20,
  fontsize: 0.6,
  drawLetters: true,
  drawCircle: true,
}

let sticks = [];
let arcs = [];

let text = "RRRREEEESSSSIIIINNNNAAAA";
let indice = 0;
//let fontSize = 1200;
let fontFamily = "sans-serif";
let manager;

const sketch = ({ context, width, height }) => {
  let num = 0;
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.lineCap = params.lineCap;

    if (params.drawCircle){
      const circleDrawer = new CircleDrawer(width, height);
      if (num !== params.numsSlices) {
        num = params.numsSlices;
        circleDrawer.createCircle();
      }

      circleDrawer.drawCircle(context, height);
    }

    if (params.drawLetters){
      const letterDrawer = new LetterDrawer(width, height, params.cell, params.fontsize);
      letterDrawer.draw(context);
    }

    indice++;
    indice %= text.length;
  };
};

async function start() {
  manager = await canvasSketch(sketch, settings);
}
//canvasSketch(sketch, settings);

start();

const createPane = () => {
  const pane = new tweakpane.Pane();

  let tabs = pane.addTab({
    pages: [
      {title : "Cerchio"},
      {title: "Lettere"}
    ]
  });

  tabs.pages[0].addInput(params, "lineCap", {options: {butt: "butt", round: "round", square: "square"}});
  tabs.pages[0].addInput(params, "numsSlices", {min: 20, max: 100, step: 1});
  tabs.pages[0].addInput(params, "drawCircle");

  tabs.pages[1].addInput(params, "cell", {min: 10, max: 50, step: 1});
  tabs.pages[1].addInput(params, "fontsize", {min: 0.3, max: 0.8, step: 0.1});
  tabs.pages[1].addInput(params, "drawLetters");
}

createPane();

// ===================================== testo ===============================================
class LetterDrawer {
  constructor (width, height, cell, fontsize) {
    this.cell = cell;
    this.cols = Math.floor(width / this.cell);
    this.rows = Math.floor(height / this.cell);
    this.numCells = this.cols * this.rows;

    const typeCanvas = document.createElement("canvas");
    this.typeContext = typeCanvas.getContext("2d");

    typeCanvas.width = this.cols;
    typeCanvas.height = this.rows;
    this.typeContext.fillStyle = 'black';
    this.typeContext.fillRect(0, 0, this.cols, this.rows);

    let fontSize = this.cols * fontsize;
    this.typeContext.fillStyle = "white";
    this.typeContext.font = `${fontSize}px ${fontFamily}`;
    this.typeContext.textBaseLine = "middle";
  }

  draw (context) {
    const metrics = this.typeContext.measureText(text[indice]);

    const mx = metrics.actualBoundingBoxLeft * -1;
    const my = metrics.actualBoundingBoxAscent * -1;
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    this.textX = (this.cols - mw) * 0.5 - mx;
    this.textY = (this.rows - mh) * 0.5 - my;

    this.typeContext.save();
    this.typeContext.translate(this.textX, this.textY);

    this.typeContext.beginPath();
    this.typeContext.fillText(text[indice], 0, 0);
    this.typeContext.restore();

    const typeData = this.typeContext.getImageData(0, 0, this.cols, this.rows).data;

    context.fillStyle = 'black';
    for (let i = 0; i < this.numCells; i++) {
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);

      const typeX = col * this.cell;
      const typeY = row * this.cell;

      const r = typeData[i*4];
      const g = typeData[i*4+1];
      const b = typeData[i*4+2];
      const a = typeData[i*4+3];

      const glyph = this.getGlyph(r);

      context.font = `${this.cell * 2}px ${fontFamily}`;
      if (Math.random() < 0.1) context.font = `${this.cell * 2}px ${fontFamily}`;

      //context.fillStyle = "black";//`rgb(${r}, ${g}, ${b})`;
      context.save();
      context.translate(typeX, typeY);
      //context.fillRect(0,0,cell,cell);
      context.translate(this.cell*0.5, this.cell*0.5);
      context.beginPath();
      //context.arc(0, 0, cell*0.5, 0, Math.PI*2);
      //context.fill();
      context.fillText(glyph, 0, 0);
      context.restore();
    }
  }

  getGlyph (val){
    const glyphs = ".-*_= /{}[()]%£&!?".split("");
    glyphs.push("Resina")

    return val > 50? random.pick(glyphs): "";
  }
}

// ================================== Archi e bastoncelli ===========================================
class CircleDrawer {
  constructor(width, height) {
    this.cx = width * 0.5;
    this.cy = height * 0.5;

    this.w = width * 0.005;
    this.h = height * 0.1;

    this.radius = width * 0.45;
    this.slice = math.degToRad(360/params.numsSlices);
  }

  createCircle () {
    sticks = [];
    arcs = [];

    for (let i = 0; i < params.numsSlices; i++) {
      const angle = this.slice * i;

      this.x = this.cx + this.radius * Math.sin(angle);
      this.y = this.cy + this.radius * Math.cos(angle);

      sticks.push(new Stick(this.x, this.y, this.w, this.h, angle));
      arcs.push(new Arc(this.cx, this.cy, angle));
    }
  }

  drawCircle (context, height){
    for (let i = 0; i < params.numsSlices; i++) {
      let stick = sticks[i];
      let arc = arcs[i];
      context.fillStyle = 'black';
      stick.draw(context, this.w, this.h);
      arc.draw(context, this.radius, this.slice);
      stick.update(height);
      arc.update();
    }
  }
}

//canvasSketch(sketch, settings);

class Stick {
  constructor(x, y, w, h, angle) {
    this.x = x;
    this.y = y;
    this.scaleX = random.range(0.1, 2);
    this.scaleY = random.range(0.2, 1);
    this.vel = random.range(-1, 1);
    this.lenX = random.range(0, -w * 0.5);
    this.lenY = random.range(0, -h * 0.5);
    this.angle = angle;
  }

  draw (context, w, h){
    context.save();
    context.translate(this.x, this.y);
    context.rotate(-this.angle);
    context.scale(this.scaleX, this.scaleY);

    context.beginPath();
    context.rect(this.lenX, this.lenY, w, h);
    context.fill();
    context.restore();
  }

  update (height) {
    this.lenY += this.vel;

    if (this.lenY <= -height * 0.15 || this.lenY >= height * 0.05) {
      this.vel *= -1;
    }
  }
}

class Arc {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.start = random.range(-4, 1);
    this.end = random.range(1, 4);
    this.vel = random.range(-0.5, 0.5);
    this.radius = random.range(0.7, 1.3);
    this.lineWidth = random.range(5, 15);
    this.angle = angle;
  }

  draw (context, radius, slice) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(-this.angle);

    context.lineWidth = this.lineWidth;
    context.beginPath();
    context.arc(0, 0, radius * this.radius,
        slice * this.start, slice * this.end);
    context.stroke();
    context.restore();
  }

  update () {
    this.start += this.vel;
    this.end += this.vel;
  }
}