let canvas, context, w, h;
let rows;
let columns;

let cellDim = 30;
let padding = 20;

let sticks = [];

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

class Stick {
    constructor(x, y, w, h) {
        this.pos = new Vector(x, y);
        this.w = w;
        this.h = h;
        this.opacity = 0.5;
        this.angle = 0;
        this.scale = 1;
        this.spin = false;
    }
    draw (context) {
        context.save();
        context.fillStyle = "rgba(255,255,255," + this.opacity + ")";
        context.translate(this.pos.x, this.pos.y);
        context.rotate(this.angle);
        context.scale(this.scale, this.scale);
        context.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        context.restore();
    }
    update() {
        if (!this.spin) {
            let distance = this.pos.distance(mouse.pos);
            this.opacity = Math.max(0.2, 1 - (distance / (w * 0.5))); // todo anche qua trasformare in parametri regolabili
            this.scale = Math.max(0.5, 1 - (distance / (w * 0.5)));
            this.angle = Math.atan2(mouse.pos.y - this.pos.y,
                mouse.pos.x - this.pos.x);
        } else {
            this.opacity = 1;
            this.scale = 1;
            this.angle += 0.3;
        }
    }
}

let mouse = {
    pos : new Vector(w / 2, h / 2),
}

function init () {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");

    resizeReset();
    animationLoop();
}

function resizeReset() {
    canvas.width = w = window.innerWidth;
    canvas.height = h = window.innerHeight;
    columns = Math.floor((w - padding*2) / cellDim);
    rows = Math.round((h - padding*2) / cellDim);

    sticks = [];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            sticks.push(new Stick((j + 0.5) * cellDim + padding, (i+ 0.5) * cellDim + padding,
                cellDim * 0.6, cellDim / 12)); // TODO as usual parametrizzare il tutto
        }
    }
}

function animationLoop() {
    context.clearRect(0, 0, w, h);
    sticks.map((s) => {
        s.update();
        s.draw(context);
    })
    requestAnimationFrame(animationLoop);
}

function updateMouse(e) {
    mouse.pos.x = e.x;
    mouse.pos.y = e.y;
}

function mouseOut(){
    mouse.pos.x = w / 2;
    mouse.pos.y = h / 2;
}

function click(e) {
    let col = Math.floor((e.x - padding) / cellDim);
    let row = Math.floor((e.y - padding) / cellDim);

    console.log(row)
    console.log(col);
    console.log(rows)
    console.log(rows*row + col)

    sticks[columns*row + col].spin = !sticks[columns*row + col].spin;
}

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", resizeReset);
window.addEventListener("mousemove", updateMouse);
window.addEventListener("mouseout", mouseOut);
window.addEventListener("click", click);