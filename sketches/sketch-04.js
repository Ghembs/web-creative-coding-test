const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random")
const math = require("canvas-sketch-util/math")
const tweakpane = require("tweakpane");


const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const params = {
  cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 20,
  Freq: 0.001,
  Amp: 0.2,
  animate: true,
  frame: 0,
  lineCap: "butt"
};

const sketch = () => {
  return ({ context, width, height, frame}) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const rows = params.rows;
    const columns = params.cols;
    const cells = rows * columns;
    const gridW = width * 0.8;
    const gridH = height * 0.8;
    const cellW = gridW / columns;
    const cellH = gridH / rows;
    const marginW = (width - gridW) / 2;
    const marginH = (height - gridH) / 2;

    for (let i = 0; i < cells; i++) {
      let row = Math.floor(i / columns);
      let column = i % columns;
      const cellX = marginW + column * cellW + cellW/2;
      const cellY = marginH + row * cellH + cellH/2;
      const w = cellW * 0.8;
      const h = cellH * 0.8;

      const f = params.animate? frame : params.frame;
      const n = random.noise3D(cellX, cellY, f * 10, params.Freq);
      const angle = n * Math.PI * params.Amp;
      const scale = math.mapRange(n, -1, 1, params.scaleMin, params.scaleMax)

      context.fillStyle = 'black';
      context.save();
      context.translate(cellX, cellY);
      context.rotate(angle);
      context.lineWidth = scale;
      context.lineCap = params.lineCap;
      context.beginPath();
      context.moveTo(w * - 0.5, h * - 0.5);
      context.lineTo(w * 0.5, h * 0.5);
      context.stroke();
      context.restore();
    }
  };
};

const createPane = () => {
  const pane = new tweakpane.Pane();

  //let folder = pane.addFolder({title: "Griglia"});
  let tabs = pane.addTab({
    pages: [
      {title : "Griglia"},
      {title: "Noise"}
    ]
  });
  // folder.addInput(...
  tabs.pages[0].addInput(params, "lineCap", {options: {butt: "butt", round: "round", square: "square"}});
  tabs.pages[0].addInput(params, "cols", {min: 2, max: 100, step:1});
  tabs.pages[0].addInput(params, "rows", {min: 2, max: 100, step:1});
  tabs.pages[0].addInput(params, "scaleMin", {min: 1, max: 20, step:1});
  tabs.pages[0].addInput(params, "scaleMax", {min: 20, max: 100, step:1});

  tabs.pages[1].addInput(params, "Freq", {min: 0.001, max: 0.01, step:0.001});
  tabs.pages[1].addInput(params, "Amp", {min: 0.1, max: 1, step:0.1});
  tabs.pages[1].addInput(params, "animate");
  tabs.pages[1].addInput(params, "frame", {min: 0, max: 999, step:1});
}

createPane();
canvasSketch(sketch, settings);
