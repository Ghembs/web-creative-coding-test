const canvasSketch = require('canvas-sketch');
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [ 1080, 1080 ],
  playbackRate: "throttle",
  fps: 5,
  animate: true,
};

let text = "RESINA";
let indice = 0;
let fontSize = 1200;
let fontFamily = "sans-serif";
let manager;

const typeCanvas = document.createElement("canvas");
const typeContext = typeCanvas.getContext("2d");

const sketch = ({ context, width, height }) => {
  const cell = 20;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const numCells = cols * rows;

  typeCanvas.width = cols;
  typeCanvas.height = rows;
  return ({ context, width, height }) => {
    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, cols, rows);

    fontSize = cols * 1.2;
    typeContext.fillStyle = "white";
    typeContext.font = `${fontSize}px ${fontFamily}`;
    typeContext.textBaseLine = "middle";
    //context.textAlign = "center";

    const metrics = typeContext.measureText(text[indice]);
    //console.log(metrics);

    const mx = metrics.actualBoundingBoxLeft * -1;
    const my = metrics.actualBoundingBoxAscent * -1;
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    const x = (cols - mw) * 0.5 - mx;
    const y = (rows - mh) * 0.5 - my;

    typeContext.save();
    typeContext.translate(x, y);

    typeContext.beginPath();
    //context.rect(mx, my, mw, mh);
    //context.stroke();
    typeContext.fillText(text[indice], 0, 0);
    typeContext.restore();

    const typeData = typeContext.getImageData(0, 0, cols, rows).data;
    //console.log(typeData);

    //context.drawImage(typeCanvas, 0, 0);
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const typeX = col * cell;
      const typeY = row * cell;

      const r = typeData[i*4];
      const g = typeData[i*4+1];
      const b = typeData[i*4+2];
      const a = typeData[i*4+3];

      const glyph = getGlyph(r);

      context.font = `${cell * 2}px ${fontFamily}`;
      if (Math.random() < 0.1) context.font = `${cell * 4}px ${fontFamily}`;

      context.fillStyle = "white";//`rgb(${r}, ${g}, ${b})`;
      context.save();
      context.translate(typeX, typeY);
      //context.fillRect(0,0,cell,cell);
      context.translate(cell*0.5, cell*0.5);
      context.beginPath();
      //context.arc(0, 0, cell*0.5, 0, Math.PI*2);
      //context.fill();
      context.fillText(glyph, 0, 0);
      context.restore();
    }
    indice++;
    indice %= text.length;
    //text = "B";
  };
};

// const onKeyUp = (e) => {
//   text = e.key.toUpperCase();
//   manager.render();
// }

const getGlyph = (val) => {
  if (val < 50) return "";
  if (val < 100) return ".";
  if (val < 150) return "-";
  if (val < 200) return "*";

  const glyphs = "_= /{}[()]%£&!?".split("");
  glyphs.push("Resina")

  //return text;
  return random.pick(glyphs);
}

//document.addEventListener("keyup", onKeyUp);

async function start() {
  //text = "A";

  manager = await canvasSketch(sketch, settings);
}
//canvasSketch(sketch, settings);


start().then(() =>{
  console.log(text[indice]);
});