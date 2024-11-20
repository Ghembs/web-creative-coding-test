let width, height, canvas, context;
let fontFamily = "sans-serif";
let num = 0;

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}

const params = {
    // CERCHIO
    numsSlices: 40,
    lineCap: "butt",
    drawCircle: true,
    // PAROLA
    cell: 20,
    fontsize: 0.6,
    drawLetters: true,
    // GENERALI
    "Colore di sfondo": {r: 0, g: 0, b: 0, a: 1},
    "Colore del tratto": {r: 255, g: 255, b: 255, a: 1},
    "Schermo intero": false,
    text : "RRRREEEESSSSIIIINNNNAAAA"
}

class Stick {
    constructor(x, y, w, h, angle) {
        this.x = x;
        this.y = y;
        this.lineWidth = getRndInteger(5, 15);
        this.vel = getRndInteger(-1, 1);
        this.lenX = getRndInteger(0, -w * 0.5);
        this.lenY = getRndInteger(0, -h * 0.5);
        this.angle = angle;
    }

    draw (context, w, h){
        context.save();
        context.translate(this.x, this.y);
        context.rotate(-this.angle);
        context.lineWidth = this.lineWidth;
        context.beginPath();
        context.moveTo(this.lenX, this.lenY);
        context.lineTo(w, h);
        context.stroke();
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
        this.start = getRndInteger(-4, 1);
        this.end = getRndInteger(1, 4);
        this.vel = getRndInteger(-0.5, 0.5);
        this.radius = getRndInteger(0.7, 1.3);
        this.lineWidth = getRndInteger(5, 15);
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

class CircleDrawer {
    constructor(width, height) {
        this.cx = width * 0.5;
        this.cy = height * 0.5;

        this.w = width * 0.005;
        this.h = height * 0.1;

        this.radius = width * 0.45;
        this.slice = degToRad(360/params.numsSlices);
    }

    createCircle () {
        this.sticks = [];
        this.arcs = [];

        for (let i = 0; i < params.numsSlices; i++) {
            const angle = this.slice * i;

            this.x = this.cx + this.radius * Math.sin(angle);
            this.y = this.cy + this.radius * Math.cos(angle);

            this.sticks.push(new Stick(this.x, this.y, this.w, this.h, angle));
            this.arcs.push(new Arc(this.cx, this.cy, angle));
        }
    }

    drawCircle (context, height){
        for (let i = 0; i < params.numsSlices; i++) {
            let stick = this.sticks[i];
            let arc = this.arcs[i];
            context.fillStyle = `rgb(${params["Colore del tratto"].r}, ${params["Colore del tratto"].g}, 
      ${params["Colore del tratto"].b}, ${params["Colore del tratto"].a})`;
            stick.draw(context, this.w, this.h);
            context.strokeStyle = `rgb(${params["Colore del tratto"].r}, ${params["Colore del tratto"].g}, 
      ${params["Colore del tratto"].b}, ${params["Colore del tratto"].a})`;
            arc.draw(context, this.radius, this.slice);
            stick.update(height);
            arc.update();
        }
    }
}

class LetterDrawer {
    constructor (width, height, cell, fontsize, text) {
        this.cell = cell;
        this.text = text;
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
        this.indice = 0;
    }

    draw (context) {
        const metrics = this.typeContext.measureText(this.text[this.indice]);

        const mx = metrics.actualBoundingBoxLeft * -1;
        const my = metrics.actualBoundingBoxAscent * -1;
        const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
        const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

        this.textX = (this.cols - mw) * 0.5 - mx;
        this.textY = (this.rows - mh) * 0.5 - my;

        this.typeContext.save();
        this.typeContext.translate(this.textX, this.textY);

        this.typeContext.beginPath();
        this.typeContext.fillText(this.text[this.indice], 0, 0);
        this.typeContext.restore();

        const typeData = this.typeContext.getImageData(0, 0, this.cols,
            this.rows).data;

        context.fillStyle = `rgba(${params["Colore del tratto"].r}, ${params["Colore del tratto"].g}, 
    ${params["Colore del tratto"].b}, ${params["Colore del tratto"].a})`;
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

    update() {
        this.indice++;
        this.indice %= this.text.length;
    }

    getGlyph (val){
        const glyphs = ".-*_= /{}[()]%£&!?".split("");
        glyphs.push("Resina")

        return val > 50? glyphs[getRndInteger(0, glyphs.length - 1)]: "";
    }
}

function init () {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    resizeReset();
}

function resizeReset() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    animationLoop();
}

function animationLoop() {
    context.fillStyle = `rgb(${params["Colore di sfondo"].r}, ${params["Colore di sfondo"].g}, 
    ${params["Colore di sfondo"].b}, ${params["Colore di sfondo"].a})`;
    context.fillRect(0, 0, width, height);
    context.lineCap = params.lineCap;

    if (params.drawCircle) {
        const circleDrawer = new CircleDrawer(width, height);
        if (num !== params.numsSlices) {
            num = params.numsSlices;
            circleDrawer.createCircle();
        }

        circleDrawer.drawCircle(context, height);
    }

    if (params.drawLetters) {
        const letterDrawer = new LetterDrawer(width, height, params.cell, params.fontsize,
            params.text);
        letterDrawer.draw(context);
    }

    // TODO check arc radius and fix draw animation bug
    //requestAnimationFrame(animationLoop);
}

window.addEventListener("DOMContentLoaded", init);