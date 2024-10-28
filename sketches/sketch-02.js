const canvasSketch = require('canvas-sketch');
const math = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

let sticks = [];
let arcs = [];

const sketch = ({ context, width, height }) => {
  const cx = width * 0.5;
  const cy = height * 0.5;

  const w = width * 0.005;
  const h = height * 0.1;
  let x, y;

  const num = 40;
  const radius = width * 0.3;

  const slice = math.degToRad(360/num);

  for (let i = 0; i < num; i++) {
    const angle = slice * i;

    x = cx + radius * Math.sin(angle);
    y = cy + radius * Math.cos(angle);

    if (sticks.length < num) sticks.push(new Stick(x, y, w, h, angle));
    if (!arcs.length  < num) arcs.push(new Arc(cx, cy, angle));
  }

  return () => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < num; i++) {
      let stick = sticks[i];
      let arc = arcs[i];
      context.fillStyle = 'black';
      stick.draw(context, w, h);
      arc.draw(context, radius, slice);
      stick.update(height);
      arc.update();
    }
  };
};

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
      console.log(this.lenY)
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

canvasSketch(sketch, settings);
