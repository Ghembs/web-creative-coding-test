const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random")
const math = require("canvas-sketch-util/math")

const settings = {
  dimensions: [ 1080, 1080 ],
  animate : true
};

const animate = () => {
  requestAnimationFrame(animate);
}
//animate();

const sketch = ({ context, width, height }) => {
  const numDots = 40;
  let dots = [];
  for (let i = 0; i < numDots; i++) {
    let radius = random.range(2, 8);
    let x = random.range(0, width - radius);
    let y = random.range(0, height - radius);
    dots.push(new DotDrawer(x, y, radius));
  }

  return () => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < dots.length; i++) {
      let dot = dots[i];
      dot.draw(context);
      dot.update(width, height);
      for (let j = i+1; j < dots.length; j++) {
        let dot2 = dots[j];
        let dist = dot.pos.distance(dot2.pos);
        context.lineWidth = math.mapRange(dist, 0, 200, 6, 1);

        if (dist <= 200) {
          context.beginPath();
          context.moveTo(dot.pos.x, dot.pos.y);
          context.lineTo(dot2.pos.x, dot2.pos.y);
          context.stroke();
        }
      }
    }
  };
};

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distance (vec) {
    let dx = this.x - vec.x;
    let dy = this.y - vec.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class DotDrawer {
  constructor(x, y, radius) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
    this.radius = radius;
  };

  draw (context) {
    context.beginPath();
    context.save();
    context.lineWidth = 2;
    context.translate(this.pos.x, this.pos.y);
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }



  update (width, height) {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    this.wrap(width, height);
  }

  bounce (width, height) {
    if (this.pos.x - this.radius <= 0 || this.pos.x + this.radius >= width) this.vel.x *= -1;
    if (this.pos.y - this.radius <= 0 || this.pos.y + this.radius >= height) this.vel.y *= -1;
  }

  wrap (width, height) {
    if (this.pos.x <= 0) this.pos.x += width;
    if (this.pos.y <= 0) this.pos.y += height;

    if (this.pos.x >= width) this.pos.x = 0;
    if (this.pos.y >= height) this.pos.y = 0;
  }
}

canvasSketch(sketch, settings);
